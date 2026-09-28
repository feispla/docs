// ============================================
// VANTCALL Esports — Auth real (Supabase) + Checkout (Stripe Payment Links)
// ============================================
(function () {
  'use strict';

  const SUPABASE_URL = 'https://oanhvbplkljhjxutiinm.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_4xpSIMMgNUsqDyZNo7u2-w_Kc6D1ons';

  const PLANS = {
    basic: { name: 'VANT BASIC', price: 9, link: 'https://buy.stripe.com/aFaaEX7Ff9FufJ4gQlebu01' },
    pro:   { name: 'VANT PRO',   price: 19, link: 'https://buy.stripe.com/4gMeVd3oZ2d2eF0eIdebu02' },
    elite: { name: 'VANT ELITE', price: 39, link: 'https://buy.stripe.com/aFa4gz7Ff6ti68u7fLebu03' },
  };
  const PLAN_RANK = { free: 0, basic: 1, pro: 2, elite: 3 };

  const lib = window.supabase;
  const sb = lib && lib.createClient
    ? lib.createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

  let session = null;
  // Estado transitorio en memoria (flags de navegación de esta carga de página)
  const mem = new Map();
  const flags = { getItem: (k) => (mem.has(k) ? mem.get(k) : null), setItem: (k, v) => mem.set(k, String(v)), removeItem: (k) => mem.delete(k) };
  let profile = null;
  let providers = null;

  // ---------- utilidades ----------
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const baseUrl = () => window.location.origin + window.location.pathname;
  const go = (route) => { if (window.location.hash !== '#/' + route) window.location.hash = '#/' + route; else if (typeof router === 'function') router(); };

  const ERRORS = [
    [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
    [/email not confirmed/i, 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada (y spam).'],
    [/user already registered|already been registered/i, 'Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.'],
    [/password should be at least|weak password/i, 'La contraseña es demasiado débil. Usa al menos 8 caracteres.'],
    [/rate limit|too many|security purposes/i, 'Demasiados intentos. Espera un minuto y vuelve a probar.'],
    [/provider is not enabled|unsupported provider/i, 'El inicio con Discord aún no está activado.'],
    [/same.*password|different from the old/i, 'La nueva contraseña debe ser distinta a la anterior.'],
    [/invalid email|unable to validate email/i, 'El correo no es válido.'],
    [/failed to fetch|network/i, 'Sin conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.'],
  ];
  const humanError = (e) => {
    const msg = (e && (e.message || e.error_description || e.msg)) || String(e);
    for (const [re, txt] of ERRORS) if (re.test(msg)) return txt;
    return 'No se pudo completar la operación: ' + msg;
  };

  function showMsg(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.className = 'auth-msg auth-msg-' + (kind || 'info');
    el.hidden = !text;
  }

  function setBusy(form, busy, label) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (busy) { btn.dataset.label = btn.textContent; btn.textContent = label || 'Procesando…'; btn.disabled = true; }
    else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
  }

  async function logEvent(type, data) {
    if (!sb || !session) return;
    try { await sb.rpc('log_web_event', { event_type: type, data: data || {} }); } catch (_) { /* no bloquear la UI */ }
  }

  async function loadProfile() {
    if (!sb || !session) { profile = null; return null; }
    const { data } = await sb.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    profile = data || null;
    return profile;
  }

  async function loadProviders() {
    if (providers) return providers;
    try {
      const r = await fetch(SUPABASE_URL + '/auth/v1/settings', { headers: { apikey: SUPABASE_KEY } });
      const j = await r.json();
      providers = j.external || {};
    } catch (_) { providers = {}; }
    return providers;
  }

  function displayName() {
    if (!session) return '';
    const u = session.user;
    return (profile && (profile.username || profile.discord_username)) || (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || u.email.split('@')[0];
  }

  function updateHeader() {
    const link = document.getElementById('auth-link');
    const label = document.getElementById('auth-link-label');
    if (!link || !label) return;
    if (session) {
      const plan = profile && profile.plan && profile.plan !== 'free' ? ' · ' + profile.plan.toUpperCase() : '';
      label.textContent = displayName() + plan;
      link.setAttribute('href', '#/cuenta');
      link.setAttribute('aria-label', 'Mi cuenta');
    } else {
      label.textContent = 'Login';
      link.setAttribute('href', '#/login');
      link.setAttribute('aria-label', 'Iniciar sesión');
    }
  }

  // ---------- iconos ----------
  const ICON_DISCORD = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>';

  // ---------- páginas ----------
  const PAGES = {
    'login': {
      title: 'Iniciar sesión — VANTCALL Esports', group: 'Plataforma',
      content: `
      <div class="login-page">
        <h1>Iniciar sesión</h1>
        <p class="login-sub">Accede a VANTCALL con Discord o con tu correo</p>
        <div class="auth-msg" data-auth-msg role="status" aria-live="polite" hidden></div>
        <div class="login-methods">
          <button type="button" class="login-btn login-btn-discord" data-oauth="discord">${ICON_DISCORD} Continuar con Discord</button>
        </div>
        <div class="login-divider"><span>o con correo</span></div>
        <form class="login-form" data-form="login" novalidate>
          <div class="login-form-group">
            <label class="login-form-label" for="li-email">Correo electrónico</label>
            <input id="li-email" name="email" type="email" class="login-form-input" placeholder="tu@correo.com" autocomplete="email" required>
          </div>
          <div class="login-form-group">
            <label class="login-form-label" for="li-pass">Contraseña</label>
            <input id="li-pass" name="password" type="password" class="login-form-input" placeholder="••••••••" autocomplete="current-password" required>
          </div>
          <div class="login-form-actions">
            <span></span>
            <a href="#/recuperar">¿Olvidaste tu contraseña?</a>
          </div>
          <button type="submit" class="btn btn-primary login-submit">Iniciar sesión</button>
        </form>
        <p class="login-note">Al continuar aceptas los términos de servicio y la política de privacidad de VANTCALL. Tu sesión se gestiona con Supabase Auth.</p>
        <p class="login-switch">¿No tienes cuenta? <a href="#/registro">Regístrate gratis</a></p>
      </div>`,
    },

    'registro': {
      title: 'Registro — VANTCALL Esports', group: 'Plataforma',
      content: `
      <div class="login-page">
        <h1>Crear cuenta</h1>
        <p class="login-sub">Únete a VANTCALL y empieza a competir</p>
        <div class="auth-msg" data-auth-msg role="status" aria-live="polite" hidden></div>
        <div class="login-methods">
          <button type="button" class="login-btn login-btn-discord" data-oauth="discord">${ICON_DISCORD} Registrarse con Discord</button>
        </div>
        <div class="login-divider"><span>o con correo</span></div>
        <form class="login-form" data-form="registro" novalidate>
          <div class="login-form-group">
            <label class="login-form-label" for="rg-user">Nombre de usuario</label>
            <input id="rg-user" name="username" type="text" class="login-form-input" placeholder="Tu nombre de jugador" minlength="3" maxlength="24" pattern="[A-Za-z0-9_.\\-]{3,24}" autocomplete="nickname" required>
          </div>
          <div class="login-form-group">
            <label class="login-form-label" for="rg-email">Correo electrónico</label>
            <input id="rg-email" name="email" type="email" class="login-form-input" placeholder="tu@correo.com" autocomplete="email" required>
          </div>
          <div class="login-form-group">
            <label class="login-form-label" for="rg-pass">Contraseña</label>
            <input id="rg-pass" name="password" type="password" class="login-form-input" placeholder="Mínimo 8 caracteres" minlength="8" autocomplete="new-password" required>
          </div>
          <div class="login-form-group">
            <label class="login-form-label" for="rg-pass2">Confirmar contraseña</label>
            <input id="rg-pass2" name="password2" type="password" class="login-form-input" placeholder="Repite tu contraseña" autocomplete="new-password" required>
          </div>
          <button type="submit" class="btn btn-primary login-submit">Crear cuenta</button>
        </form>
        <p class="login-note">Recibirás un correo de verificación para activar tu cuenta.</p>
        <p class="login-switch">¿Ya tienes cuenta? <a href="#/login">Inicia sesión</a></p>
      </div>`,
    },

    'recuperar': {
      title: 'Recuperar contraseña — VANTCALL Esports', group: 'Plataforma',
      content: `
      <div class="login-page">
        <h1>Recuperar contraseña</h1>
        <p class="login-sub">Introduce tu correo y te enviaremos un enlace de restablecimiento</p>
        <div class="auth-msg" data-auth-msg role="status" aria-live="polite" hidden></div>
        <form class="login-form" data-form="recuperar" novalidate>
          <div class="login-form-group">
            <label class="login-form-label" for="rc-email">Correo electrónico</label>
            <input id="rc-email" name="email" type="email" class="login-form-input" placeholder="tu@correo.com" autocomplete="email" required>
          </div>
          <button type="submit" class="btn btn-primary login-submit">Enviar enlace</button>
        </form>
        <p class="login-note">Abre el enlace en este mismo navegador. Si no lo recibes en unos minutos, revisa la carpeta de spam.</p>
        <p class="login-switch"><a href="#/login">Volver a iniciar sesión</a></p>
      </div>`,
    },

    'nueva-contrasena': {
      title: 'Nueva contraseña — VANTCALL Esports', group: 'Plataforma',
      content: `
      <div class="login-page">
        <h1>Nueva contraseña</h1>
        <p class="login-sub">Elige una contraseña nueva para tu cuenta</p>
        <div class="auth-msg" data-auth-msg role="status" aria-live="polite" hidden></div>
        <form class="login-form" data-form="nueva-contrasena" novalidate>
          <div class="login-form-group">
            <label class="login-form-label" for="nc-pass">Nueva contraseña</label>
            <input id="nc-pass" name="password" type="password" class="login-form-input" minlength="8" autocomplete="new-password" required>
          </div>
          <div class="login-form-group">
            <label class="login-form-label" for="nc-pass2">Repite la contraseña</label>
            <input id="nc-pass2" name="password2" type="password" class="login-form-input" minlength="8" autocomplete="new-password" required>
          </div>
          <button type="submit" class="btn btn-primary login-submit">Guardar contraseña</button>
        </form>
      </div>`,
    },

    'cuenta': {
      title: 'Mi cuenta — VANTCALL Esports', group: 'Plataforma',
      content: `<div class="login-page account-page" data-account><p class="login-sub">Cargando tu cuenta…</p></div>`,
    },

    'checkout/exito': {
      title: 'Pago recibido — VANTCALL Esports', group: 'Plataforma',
      content: `
      <div class="login-page">
        <h1>Pago recibido</h1>
        <p class="login-sub">Gracias por apoyar VANTCALL.</p>
        <div class="auth-msg auth-msg-info" data-auth-msg role="status" aria-live="polite">Confirmando el pago con Stripe…</div>
        <p class="login-switch"><a href="#/cuenta" class="btn btn-primary">Ver mi cuenta</a></p>
      </div>`,
    },
  };

  function checkoutPage(key) {
    const p = PLANS[key];
    return {
      title: 'Checkout — ' + p.name, group: 'Plataforma',
      content: `
      <h1>Checkout — ${p.name}</h1>
      <p class="breadcrumb"><a href="#/precios">Precios</a> <span>/</span> Checkout</p>
      <div class="checkout-box">
        <div class="checkout-summary">
          <h3>Resumen del pedido</h3>
          <div class="checkout-line"><span>${p.name} — Pago único</span><span>€${p.price.toFixed(2)}</span></div>
          <div class="checkout-line"><span>IVA</span><span>Incluido</span></div>
          <div class="checkout-line checkout-total"><span>Total</span><span>€${p.price.toFixed(2)}</span></div>
        </div>
        <div class="checkout-actions">
          <div class="auth-msg" data-auth-msg role="status" aria-live="polite" hidden></div>
          <p data-checkout-note>Serás redirigido a la pasarela segura de Stripe. El plan se activa en tu cuenta cuando Stripe confirma el pago.</p>
          <button type="button" class="btn btn-primary checkout-pay-btn" data-checkout="${key}">Pagar con Stripe</button>
          <a href="#/precios" class="btn btn-secondary">Volver</a>
        </div>
      </div>`,
    };
  }
  Object.keys(PLANS).forEach((k) => { PAGES['checkout/' + k] = checkoutPage(k); });

  if (typeof DOC_CONTENT === 'object') Object.assign(DOC_CONTENT, PAGES);

  // ---------- acciones ----------
  async function oauthDiscord(msgEl) {
    if (!sb) return showMsg(msgEl, 'No se pudo cargar el sistema de inicio de sesión. Recarga la página.', 'error');
    const prov = await loadProviders();
    if (!prov.discord) return showMsg(msgEl, 'El inicio con Discord se está activando. Mientras tanto usa tu correo.', 'warning');
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: baseUrl() + '?next=cuenta', scopes: 'identify email' },
    });
    if (error) showMsg(msgEl, humanError(error), 'error');
  }

  const HANDLERS = {
    async login(form, msg) {
      const email = form.email.value.trim(), password = form.password.value;
      if (!email || !password) return showMsg(msg, 'Introduce tu correo y tu contraseña.', 'error');
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) return showMsg(msg, humanError(error), 'error');
      showMsg(msg, 'Sesión iniciada.', 'success');
      const next = flags.getItem('vant_next');
      flags.removeItem('vant_next');
      go(next || 'cuenta');
    },
    async registro(form, msg) {
      const username = form.username.value.trim(), email = form.email.value.trim();
      const password = form.password.value, password2 = form.password2.value;
      if (!/^[A-Za-z0-9_.\-]{3,24}$/.test(username)) return showMsg(msg, 'El usuario debe tener 3-24 caracteres: letras, números, punto, guion o guion bajo.', 'error');
      if (!email) return showMsg(msg, 'Introduce tu correo.', 'error');
      if (password.length < 8) return showMsg(msg, 'La contraseña debe tener al menos 8 caracteres.', 'error');
      if (password !== password2) return showMsg(msg, 'Las contraseñas no coinciden.', 'error');
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { data: { username }, emailRedirectTo: baseUrl() + '?next=cuenta' },
      });
      if (error) return showMsg(msg, humanError(error), 'error');
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return showMsg(msg, 'Ya existe una cuenta con este correo. Inicia sesión o recupera tu contraseña.', 'error');
      }
      form.reset();
      if (data.session) { showMsg(msg, 'Cuenta creada.', 'success'); return go('cuenta'); }
      showMsg(msg, 'Cuenta creada. Te hemos enviado un correo a ' + email + ' para confirmarla. Abre el enlace en este navegador.', 'success');
    },
    async recuperar(form, msg) {
      const email = form.email.value.trim();
      if (!email) return showMsg(msg, 'Introduce tu correo.', 'error');
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: baseUrl() + '?next=nueva-contrasena' });
      if (error) return showMsg(msg, humanError(error), 'error');
      showMsg(msg, 'Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña.', 'success');
    },
    async 'nueva-contrasena'(form, msg) {
      if (!session) return showMsg(msg, 'El enlace ha caducado o se abrió en otro navegador. Solicita uno nuevo en Recuperar contraseña.', 'error');
      const password = form.password.value, password2 = form.password2.value;
      if (password.length < 8) return showMsg(msg, 'La contraseña debe tener al menos 8 caracteres.', 'error');
      if (password !== password2) return showMsg(msg, 'Las contraseñas no coinciden.', 'error');
      const { error } = await sb.auth.updateUser({ password });
      if (error) return showMsg(msg, humanError(error), 'error');
      form.reset();
      showMsg(msg, 'Contraseña actualizada. Ya puedes usarla para iniciar sesión.', 'success');
    },
    async perfil(form, msg) {
      const username = form.username.value.trim();
      if (!/^[A-Za-z0-9_.\-]{3,24}$/.test(username)) return showMsg(msg, 'El usuario debe tener 3-24 caracteres válidos.', 'error');
      const { error } = await sb.from('profiles').update({ username }).eq('id', session.user.id);
      if (error) return showMsg(msg, /duplicate|unique/i.test(error.message) ? 'Ese nombre de usuario ya está en uso.' : humanError(error), 'error');
      await loadProfile(); updateHeader();
      showMsg(msg, 'Perfil actualizado.', 'success');
    },
  };

  async function startCheckout(key, msgEl, btn) {
    const plan = PLANS[key];
    if (!plan) return;
    if (!sb) return showMsg(msgEl, 'No se pudo cargar el sistema de pagos. Recarga la página.', 'error');
    if (!session) {
      flags.setItem('vant_next', 'checkout/' + key);
      showMsg(msgEl, 'Inicia sesión para que el plan quede asociado a tu cuenta. Redirigiendo…', 'info');
      setTimeout(() => go('login'), 900);
      return;
    }
    const current = (profile && profile.plan) || 'free';
    if (PLAN_RANK[current] >= PLAN_RANK[key]) return showMsg(msgEl, 'Ya tienes el plan ' + current.toUpperCase() + ', que incluye este.', 'info');
    btn.disabled = true; btn.textContent = 'Abriendo Stripe…';
    await logEvent('checkout_iniciado', { plan: key.toUpperCase(), precio: '€' + plan.price });
    const url = new URL(plan.link);
    url.searchParams.set('client_reference_id', session.user.id);
    if (session.user.email) url.searchParams.set('prefilled_email', session.user.email);
    url.searchParams.set('locale', 'es');
    try { window.top.location.href = url.toString(); } catch (_) { window.location.href = url.toString(); }
  }

  function renderAccount(root) {
    if (!session) {
      root.innerHTML = `<h1>Mi cuenta</h1><p class="login-sub">Necesitas iniciar sesión.</p><p class="login-switch"><a href="#/login" class="btn btn-primary">Iniciar sesión</a></p>`;
      return;
    }
    const u = session.user;
    const plan = (profile && profile.plan) || 'free';
    const prov = (profile && profile.provider) || (u.app_metadata && u.app_metadata.provider) || 'email';
    root.innerHTML = `
      <h1>Mi cuenta</h1>
      <p class="login-sub">Hola, ${esc(displayName())}</p>
      <div class="account-grid">
        <div class="account-item"><span>Correo</span><strong>${esc(u.email)}</strong></div>
        <div class="account-item"><span>Acceso</span><strong>${prov === 'discord' ? 'Discord' : 'Correo'}</strong></div>
        <div class="account-item"><span>Plan</span><strong class="account-plan account-plan-${esc(plan)}">${esc(plan.toUpperCase())}</strong></div>
        ${profile && profile.discord_username ? `<div class="account-item"><span>Discord</span><strong>${esc(profile.discord_username)}</strong></div>` : ''}
      </div>
      <div class="auth-msg" data-auth-msg role="status" aria-live="polite" hidden></div>
      <form class="login-form" data-form="perfil" novalidate>
        <div class="login-form-group">
          <label class="login-form-label" for="pf-user">Nombre de usuario</label>
          <input id="pf-user" name="username" class="login-form-input" value="${esc((profile && profile.username) || '')}" minlength="3" maxlength="24" required>
        </div>
        <button type="submit" class="btn btn-secondary login-submit">Guardar perfil</button>
      </form>
      <h2 class="account-h2">Compras</h2>
      <div data-purchases><p class="login-note">Cargando…</p></div>
      <div class="account-actions">
        ${plan !== 'elite' ? '<a href="#/precios" class="btn btn-primary">Mejorar plan</a>' : ''}
        <button type="button" class="btn btn-secondary" data-logout>Cerrar sesión</button>
      </div>`;
    sb.from('purchases').select('plan, amount_cents, currency, status, created_at').order('created_at', { ascending: false }).then(({ data }) => {
      const box = root.querySelector('[data-purchases]');
      if (!box) return;
      if (!data || !data.length) { box.innerHTML = '<p class="login-note">Aún no tienes compras.</p>'; return; }
      box.innerHTML = '<ul class="account-purchases">' + data.map((p) => `<li><span>${esc(String(p.plan).toUpperCase())}</span><span>${(p.amount_cents / 100).toFixed(2)} ${esc(String(p.currency).toUpperCase())}</span><span>${esc(p.status === 'paid' ? 'Pagado' : p.status === 'refunded' ? 'Reembolsado' : p.status)}</span><span>${new Date(p.created_at).toLocaleDateString('es-ES')}</span></li>`).join('') + '</ul>';
    });
  }

  async function pollPlan(msgEl) {
    for (let i = 0; i < 10; i++) {
      await loadProfile();
      if (profile && profile.plan && profile.plan !== 'free') {
        updateHeader();
        return showMsg(msgEl, 'Pago confirmado. Tu plan ' + profile.plan.toUpperCase() + ' ya está activo.', 'success');
      }
      await new Promise((r) => setTimeout(r, 3000));
    }
    showMsg(msgEl, 'Stripe ha recibido tu pago. La activación puede tardar unos minutos; si no aparece, escríbenos a feispla@hotmail.com.', 'info');
  }

  // ---------- enlazado tras cada render ----------
  function afterRender(pageId) {
    const main = document.getElementById('main');
    if (!main) return;
    const msg = main.querySelector('[data-auth-msg]');

    if (!sb && main.querySelector('[data-form],[data-oauth],[data-checkout]')) {
      showMsg(msg, 'No se pudo cargar el sistema de inicio de sesión. Recarga la página.', 'error');
    }

    if ((pageId === 'login' || pageId === 'registro') && session) {
      showMsg(msg, 'Ya tienes la sesión iniciada como ' + displayName() + '.', 'info');
    }
    const flash = flags.getItem('vant_flash');
    if (flash && msg) { const f = JSON.parse(flash); flags.removeItem('vant_flash'); showMsg(msg, f.text, f.kind); }

    main.querySelectorAll('[data-oauth="discord"]').forEach((b) => b.addEventListener('click', () => oauthDiscord(msg)));

    main.querySelectorAll('form[data-form]').forEach((form) => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const h = HANDLERS[form.dataset.form];
        if (!h || !sb) return;
        showMsg(msg, '', 'info');
        setBusy(form, true);
        try { await h(form, msg); } catch (err) { showMsg(msg, humanError(err), 'error'); }
        finally { setBusy(form, false); }
      });
    });

    main.querySelectorAll('[data-checkout]').forEach((b) => b.addEventListener('click', () => startCheckout(b.dataset.checkout, msg, b)));

    if (pageId === 'cuenta') {
      const root = main.querySelector('[data-account]');
      renderAccount(root);
      const lo = root.querySelector('[data-logout]');
      if (lo) lo.addEventListener('click', async () => {
        await logEvent('cierre_sesion', {});
        await sb.auth.signOut();
        go('inicio');
      });
      const pf = root.querySelector('form[data-form="perfil"]');
      if (pf) {
        const m = root.querySelector('[data-auth-msg]');
        pf.addEventListener('submit', async (e) => {
          e.preventDefault(); setBusy(pf, true);
          try { await HANDLERS.perfil(pf, m); } catch (err) { showMsg(m, humanError(err), 'error'); } finally { setBusy(pf, false); }
        });
      }
    }

    if (pageId === 'precios' && session && !flags.getItem('vant_vp')) {
      flags.setItem('vant_vp', '1');
      logEvent('visita_precios', {});
    }
    if (pageId === 'checkout/exito') {
      if (session) pollPlan(msg);
      else showMsg(msg, 'Stripe ha recibido tu pago. Inicia sesión para ver tu plan activo.', 'info');
    }
  }

  window.VantAuth = { afterRender, client: sb };

  // ---------- arranque ----------
  async function boot() {
    if (!sb) { updateHeader(); return; }
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    const authErr = params.get('error_description');

    // detectSessionInUrl intercambia ?code= automáticamente (PKCE)
    const { data } = await sb.auth.getSession();
    session = data.session;
    if (session) await loadProfile();
    updateHeader();

    if (next || authErr || params.get('code')) {
      if (authErr) {
        flags.setItem('vant_flash', JSON.stringify({ text: /expired|invalid/i.test(authErr) ? 'El enlace ha caducado o ya se usó. Solicita uno nuevo.' : humanError({ message: authErr }), kind: 'error' }));
      } else if (!session && params.get('code')) {
        flags.setItem('vant_flash', JSON.stringify({ text: 'Correo confirmado. Inicia sesión con tu contraseña (el enlace se abrió en otro navegador).', kind: 'info' }));
      }
      const target = session ? (next || 'cuenta') : (next === 'nueva-contrasena' ? 'recuperar' : 'login');
      window.history.replaceState(null, '', baseUrl() + '#/' + target);
      if (typeof router === 'function') router();
    } else if (typeof router === 'function') {
      const cur = window.location.hash.replace('#/', '').split('?')[0];
      if (['cuenta', 'login', 'registro', 'checkout/exito', 'nueva-contrasena'].includes(cur)) router();
    }

    sb.auth.onAuthStateChange(async (event, s) => {
      const prev = session;
      session = s;
      if (event === 'PASSWORD_RECOVERY') { go('nueva-contrasena'); return; }
      if (event === 'SIGNED_OUT' || (s && (!prev || prev.user.id !== s.user.id))) {
        if (s) await loadProfile(); else profile = null;
        updateHeader();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
