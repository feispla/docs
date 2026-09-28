# VANTCALL Esports — Web (rama master)

Web estática conectada a Supabase (proyecto `qtetsgwwsvqzquxssudj`) y Stripe.

## Archivos
- `index.html` — layout, navegación y carga de scripts.
- `vendor/supabase-2.57.4.min.js` — supabase-js alojado localmente.
- `db.js` — cliente Supabase compartido (`window.VantDB`) y consultas: estadísticas, temporada activa, reglas ranked, leaderboard, torneos, eventos, partidas, jugadores.
- `app.js` — router y páginas: inicio, calendario, ranked, torneos (+ detalle `#/torneo/<slug>`), jugadores (+ perfil `#/jugador/<username>`), precios.
- `auth.js` — login con correo y Discord, registro, recuperación de contraseña, vinculación de Discord, cuenta (perfil, torneos, compras, soporte) y checkout con Stripe Payment Links.
- `supabase/migrations/` — SQL aplicado: enlace Auth ↔ jugadores, triggers, RLS endurecido, vista `leaderboard`, RPC `log_web_event` (escribe en `vant_sync_events` para el bot).

## Pendiente en Supabase / Stripe
- Añadir `https://vantcall-esports1.pplx.app` a Authentication → URL Configuration (Site URL y Redirect URLs).
- Para "Vincular Discord" en cuentas de correo: activar "Allow manual linking".
- Webhook de Stripe (Edge Function + `STRIPE_WEBHOOK_SECRET`) para registrar compras y activar `entitlements`.
- El bot de Discord debe usar la service_role key para escribir en tablas sin políticas públicas.
