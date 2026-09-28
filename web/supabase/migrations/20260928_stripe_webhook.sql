-- VANTCALL — procesamiento de webhooks de Stripe (solo service_role)

create unique index if not exists purchases_stripe_session_uidx on public.purchases (stripe_session_id) where stripe_session_id is not null;
create unique index if not exists entitlements_purchase_uidx on public.entitlements (purchase_id) where purchase_id is not null;
create unique index if not exists tickets_stripe_session_uidx on public.tickets (stripe_session_id) where stripe_session_id is not null;

-- Secreto de firma (whsec_...) guardado en Supabase Vault con el nombre 'stripe_webhook_secret'
create or replace function public.get_stripe_webhook_secret()
returns text language sql stable security definer set search_path = '' as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'stripe_webhook_secret' limit 1
$$;
revoke all on function public.get_stripe_webhook_secret() from public, anon, authenticated;
grant execute on function public.get_stripe_webhook_secret() to service_role;

create or replace function public.process_stripe_event(evt jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  o jsonb := evt->'data'->'object';
  v_tier text;
  v_player uuid;
  v_purchase uuid;
  v_paid boolean;
  v_email text;
  v_season uuid;
  v_count int;
begin
  if evt->>'type' in ('checkout.session.completed', 'checkout.session.async_payment_succeeded') then
    v_paid := o->>'payment_status' in ('paid', 'no_payment_required');
    v_tier := case o->>'payment_link'
      when 'plink_1UKALNEamHVhBbtrYFwMz1fF' then 'basic'
      when 'plink_1UKALOEamHVhBbtrLs2Rg7ek' then 'pro'
      when 'plink_1UKALQEamHVhBbtrH8bQXJlM' then 'elite'
      else case (o->>'amount_total')::int when 900 then 'basic' when 1900 then 'pro' when 3900 then 'elite' else null end
    end;
    if v_tier is null then return jsonb_build_object('status', 'ignored', 'reason', 'unknown product'); end if;

    v_email := lower(coalesce(o->'customer_details'->>'email', o->>'customer_email'));
    if (o->>'client_reference_id') ~* '^[0-9a-f-]{36}$' then
      select id into v_player from players where auth_user_id = (o->>'client_reference_id')::uuid;
    end if;
    if v_player is null and v_email is not null then
      select p.id into v_player from players p join auth.users u on u.id = p.auth_user_id where lower(u.email) = v_email limit 1;
    end if;

    insert into purchases (player_id, product_type, product_id, tier, amount_cents, currency, payment_status,
                           stripe_payment_intent, stripe_session_id, webhook_received, webhook_event_id, paid_at)
    values (v_player, 'plan', o->>'payment_link', v_tier, coalesce((o->>'amount_total')::int, 0), coalesce(o->>'currency', 'eur'),
            case when v_paid then 'paid' else 'pending' end, o->>'payment_intent', o->>'id', true, evt->>'id',
            case when v_paid then now() end)
    on conflict (stripe_session_id) where stripe_session_id is not null do update
      set payment_status = case when excluded.payment_status = 'paid' then 'paid' else purchases.payment_status end,
          paid_at = coalesce(purchases.paid_at, excluded.paid_at),
          player_id = coalesce(purchases.player_id, excluded.player_id),
          stripe_payment_intent = coalesce(purchases.stripe_payment_intent, excluded.stripe_payment_intent),
          webhook_event_id = excluded.webhook_event_id
    returning id into v_purchase;

    if v_paid and v_player is not null then
      insert into entitlements (player_id, entitlement_type, tier, source, purchase_id, is_active)
      values (v_player, 'plan', v_tier, 'stripe', v_purchase, true)
      on conflict (purchase_id) where purchase_id is not null do update set is_active = true;

      select id into v_season from seasons where status = 'active' order by season_number desc limit 1;
      insert into tickets (player_id, tier, season_id, status, stripe_payment_intent, stripe_session_id, amount_cents, currency, payment_method, purchased_at)
      values (v_player, v_tier, v_season, 'active', o->>'payment_intent', o->>'id', coalesce((o->>'amount_total')::int, 0), coalesce(o->>'currency', 'eur'), 'stripe', now())
      on conflict (stripe_session_id) where stripe_session_id is not null do nothing;
    end if;

    if v_paid then
      insert into vant_sync_events (event_type, source, entity_type, entity_id, payload)
      values ('compra_confirmada', 'stripe', 'purchase', v_purchase::text,
              jsonb_build_object('plan', upper(v_tier), 'importe', coalesce((o->>'amount_total')::int, 0), 'vinculada', v_player is not null));
      insert into audit_logs (actor_type, actor_id, action, target_type, target_id, metadata)
      values ('stripe', evt->>'id', 'purchase.paid', 'purchase', v_purchase::text,
              jsonb_build_object('tier', v_tier, 'player_id', v_player, 'email', v_email, 'session', o->>'id'));
    end if;
    return jsonb_build_object('status', case when v_paid then 'paid' else 'pending' end, 'tier', v_tier, 'linked', v_player is not null);

  elsif evt->>'type' = 'charge.refunded' then
    if coalesce((o->>'refunded')::boolean, false) is not true then
      return jsonb_build_object('status', 'partial_refund_ignored');
    end if;
    update purchases set payment_status = 'refunded' where stripe_payment_intent = o->>'payment_intent';
    get diagnostics v_count = row_count;
    update entitlements set is_active = false
      where purchase_id in (select id from purchases where stripe_payment_intent = o->>'payment_intent');
    update tickets set status = 'refunded' where stripe_payment_intent = o->>'payment_intent';
    insert into audit_logs (actor_type, actor_id, action, target_type, target_id, metadata)
    values ('stripe', evt->>'id', 'purchase.refunded', 'payment_intent', o->>'payment_intent', '{}'::jsonb);
    return jsonb_build_object('status', 'refunded', 'purchases', v_count);
  end if;
  return jsonb_build_object('status', 'ignored');
end $$;
revoke all on function public.process_stripe_event(jsonb) from public, anon, authenticated;
grant execute on function public.process_stripe_event(jsonb) to service_role;

-- Vincular compras hechas antes de crear la cuenta (mismo correo) al registrarse
create or replace function public.claim_pending_purchases()
returns trigger language plpgsql security definer set search_path = public as $$
declare r record;
begin
  if new.auth_user_id is null then return new; end if;
  for r in
    select pu.id, pu.tier, pu.stripe_session_id, pu.stripe_payment_intent, pu.amount_cents, pu.currency
    from purchases pu
    join audit_logs a on a.target_id = pu.id::text and a.action = 'purchase.paid'
    join auth.users u on lower(u.email) = lower(a.metadata->>'email')
    where pu.player_id is null and pu.payment_status = 'paid' and u.id = new.auth_user_id
  loop
    update purchases set player_id = new.id where id = r.id;
    insert into entitlements (player_id, entitlement_type, tier, source, purchase_id, is_active)
    values (new.id, 'plan', r.tier, 'stripe', r.id, true) on conflict (purchase_id) where purchase_id is not null do nothing;
    insert into tickets (player_id, tier, status, stripe_payment_intent, stripe_session_id, amount_cents, currency, payment_method, purchased_at)
    values (new.id, r.tier, 'active', r.stripe_payment_intent, r.stripe_session_id, r.amount_cents, r.currency, 'stripe', now())
    on conflict (stripe_session_id) where stripe_session_id is not null do nothing;
  end loop;
  return new;
end $$;
revoke all on function public.claim_pending_purchases() from public, anon, authenticated;
drop trigger if exists trg_claim_pending_purchases on public.players;
create trigger trg_claim_pending_purchases after insert on public.players
  for each row execute function public.claim_pending_purchases();
