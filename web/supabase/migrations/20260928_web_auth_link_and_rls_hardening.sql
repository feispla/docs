-- VANTCALL web v2 — enlace Auth ↔ jugadores + endurecimiento de RLS
-- Proyecto: qtetsgwwsvqzquxssudj (VantsDEMOPRUEBA)

-- 1) Columnas nuevas ---------------------------------------------------------
alter table public.players add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;
alter table public.players add column if not exists main_game text check (main_game in ('valorant','cs2','lol'));
alter table public.players add column if not exists country text;
alter table public.player_discord_accounts add column if not exists avatar_url text;

-- 2) Helper: jugador de la sesión actual ------------------------------------
create or replace function public.current_player_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.players where auth_user_id = auth.uid()
$$;
revoke all on function public.current_player_id() from public, anon;
grant execute on function public.current_player_id() to authenticated;

-- 3) Alta automática del jugador al registrarse (correo o Discord) ----------
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  base text;
  uname text;
  n int := 0;
  pid uuid;
begin
  base := lower(regexp_replace(coalesce(meta->>'username', meta->'custom_claims'->>'global_name', meta->>'full_name', meta->>'name', split_part(new.email, '@', 1), 'jugador'), '[^A-Za-z0-9_.-]', '', 'g'));
  if length(base) < 3 then base := base || 'player'; end if;
  base := left(base, 16);
  uname := base;
  while exists (select 1 from public.players where username = uname) loop
    n := n + 1;
    uname := left(base, 16 - length(n::text) - 1) || '_' || n;
  end loop;

  insert into public.players (username, display_name, avatar_url, auth_user_id)
  values (uname, coalesce(meta->'custom_claims'->>'global_name', meta->>'full_name', meta->>'username', uname), meta->>'avatar_url', new.id)
  returning id into pid;

  insert into public.profiles (player_id) values (pid);

  if coalesce(new.raw_app_meta_data->>'provider', '') = 'discord' and coalesce(meta->>'provider_id', meta->>'sub') is not null then
    insert into public.player_discord_accounts (player_id, discord_id, discord_username, avatar_url)
    values (pid, coalesce(meta->>'provider_id', meta->>'sub'), coalesce(meta->>'full_name', meta->>'name'), meta->>'avatar_url')
    on conflict (discord_id) do update set player_id = excluded.player_id, discord_username = excluded.discord_username, avatar_url = excluded.avatar_url;
  end if;

  insert into public.vant_sync_events (event_type, source, entity_type, entity_id, payload)
  values ('registro', 'web', 'player', pid::text, jsonb_build_object('username', uname, 'proveedor', coalesce(new.raw_app_meta_data->>'provider', 'email')));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- Vincular Discord a una cuenta de correo existente (linkIdentity)
create or replace function public.handle_new_identity()
returns trigger language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if new.provider <> 'discord' then return new; end if;
  select id into pid from public.players where auth_user_id = new.user_id;
  if pid is null then return new; end if;
  insert into public.player_discord_accounts (player_id, discord_id, discord_username, avatar_url)
  values (pid, coalesce(new.identity_data->>'provider_id', new.identity_data->>'sub', new.provider_id), coalesce(new.identity_data->>'full_name', new.identity_data->>'name'), new.identity_data->>'avatar_url')
  on conflict (discord_id) do update set player_id = excluded.player_id, discord_username = excluded.discord_username, avatar_url = excluded.avatar_url;
  update public.players set avatar_url = coalesce(avatar_url, new.identity_data->>'avatar_url') where id = pid;
  return new;
end $$;

drop trigger if exists on_auth_identity_created on auth.identities;
create trigger on_auth_identity_created after insert on auth.identities
  for each row execute function public.handle_new_identity();

revoke all on function public.handle_new_auth_user() from public, anon, authenticated;
revoke all on function public.handle_new_identity() from public, anon, authenticated;

-- 4) Contadores de inscripciones / asistentes -------------------------------
create or replace function public.sync_participant_counts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'tournament_entries' then
    update public.tournaments t set current_participants = (select count(*) from public.tournament_entries e where e.tournament_id = t.id and e.status not in ('withdrawn','disqualified'))
    where t.id = coalesce(new.tournament_id, old.tournament_id);
  else
    update public.events ev set current_attendees = (select count(*) from public.event_rsvps r where r.event_id = ev.id and r.status = 'going')
    where ev.id = coalesce(new.event_id, old.event_id);
  end if;
  return null;
end $$;
revoke all on function public.sync_participant_counts() from public, anon, authenticated;
drop trigger if exists trg_entries_count on public.tournament_entries;
create trigger trg_entries_count after insert or delete or update of status on public.tournament_entries for each row execute function public.sync_participant_counts();
drop trigger if exists trg_rsvps_count on public.event_rsvps;
create trigger trg_rsvps_count after insert or delete or update of status on public.event_rsvps for each row execute function public.sync_participant_counts();
create unique index if not exists event_rsvps_event_player_uidx on public.event_rsvps (event_id, player_id);

-- 5) Eventos web → cola del bot (vant_sync_events) --------------------------
create or replace function public.log_web_event(event_type text, data jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if event_type not in ('inicio_sesion','cierre_sesion','visita_precios','checkout_iniciado','inscripcion_torneo','rsvp_evento','ticket_soporte') then
    raise exception 'invalid event type';
  end if;
  if pg_column_size(data) > 2048 then raise exception 'payload too large'; end if;
  insert into public.vant_sync_events (event_type, source, entity_type, entity_id, payload)
  values (event_type, 'web', 'player', public.current_player_id()::text, coalesce(data, '{}'::jsonb));
end $$;
revoke all on function public.log_web_event(text, jsonb) from public, anon;
grant execute on function public.log_web_event(text, jsonb) to authenticated;

-- 6) RLS: eliminar TODAS las políticas permisivas actuales ------------------
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- Lectura pública de datos competitivos
create policy "public read" on public.players for select using (true);
create policy "public read" on public.seasons for select using (true);
create policy "public read" on public.season_player_stats for select using (true);
create policy "public read" on public.ranked_matches for select using (true);
create policy "public read" on public.ranked_rules for select using (true);
create policy "public read" on public.ranked_history for select using (true);
create policy "public read" on public.tournaments for select using (status <> 'draft');
create policy "public read" on public.tournament_entries for select using (true);
create policy "public read" on public.tournament_matches for select using (true);
create policy "public read" on public.events for select using (true);
create policy "public or own" on public.profiles for select using (visibility = 'public' or player_id = public.current_player_id());

-- Datos propios
create policy "own update" on public.players for update to authenticated using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());
create policy "own update" on public.profiles for update to authenticated using (player_id = public.current_player_id()) with check (player_id = public.current_player_id());
create policy "own read" on public.player_discord_accounts for select to authenticated using (player_id = public.current_player_id());
create policy "own read" on public.purchases for select to authenticated using (player_id = public.current_player_id());
create policy "own read" on public.tickets for select to authenticated using (player_id = public.current_player_id());
create policy "own read" on public.entitlements for select to authenticated using (player_id = public.current_player_id());
create policy "own read" on public.event_rsvps for select to authenticated using (player_id = public.current_player_id());
create policy "own insert" on public.event_rsvps for insert to authenticated with check (player_id = public.current_player_id());
create policy "own delete" on public.event_rsvps for delete to authenticated using (player_id = public.current_player_id());
create policy "own insert" on public.tournament_entries for insert to authenticated
  with check (player_id = public.current_player_id() and status = 'registered'
    and exists (select 1 from public.tournaments t where t.id = tournament_id and t.status in ('registration','open','upcoming')
      and (t.registration_closes_at is null or t.registration_closes_at > now())
      and t.current_participants < t.max_participants));
create policy "own delete" on public.tournament_entries for delete to authenticated
  using (player_id = public.current_player_id() and exists (select 1 from public.tournaments t where t.id = tournament_id and t.status in ('registration','open','upcoming')));
create policy "own read" on public.support_tickets for select to authenticated using (player_id = public.current_player_id());
create policy "own insert" on public.support_tickets for insert to authenticated
  with check (player_id = public.current_player_id() and status = 'open' and priority = 'normal' and assigned_to is null);
create policy "own read" on public.support_ticket_messages for select to authenticated
  using (not is_internal and exists (select 1 from public.support_tickets s where s.id = ticket_id and s.player_id = public.current_player_id()));
create policy "own insert" on public.support_ticket_messages for insert to authenticated
  with check (sender_type = 'user' and not is_internal and sender_id = public.current_player_id()
    and exists (select 1 from public.support_tickets s where s.id = ticket_id and s.player_id = public.current_player_id()));
-- Sin políticas (solo service_role / bot): bot_admins, ranked_queue, audit_logs, vant_sync_events, postulaciones, postulaciones_auditoria

-- Permisos de columna: el usuario solo edita campos de perfil
revoke insert, update, delete on all tables in schema public from anon;
revoke update on public.players from authenticated;
grant update (display_name, region, main_game, country, summoner_name) on public.players to authenticated;
revoke update on public.profiles from authenticated;
grant update (bio, visibility) on public.profiles to authenticated;

-- 7) Vista leaderboard -------------------------------------------------------
create or replace view public.leaderboard with (security_invoker = true) as
select s.season_id, p.id as player_id, p.username, p.display_name, p.avatar_url,
       s.mmr, s.rank, s.wins, s.losses, s.placement_done,
       row_number() over (partition by s.season_id order by s.mmr desc, s.wins desc) as position
from public.season_player_stats s
join public.players p on p.id = s.player_id;
grant select on public.leaderboard to anon, authenticated;
