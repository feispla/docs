// ============================================
// VANTCALL Esports — App & Router
// ============================================

// ============================================
// CALENDAR DATA (VALORANT Esports style)
// ============================================

const SEASON_EVENTS = [
  { region: 'TODAS LAS REGIONES', name: 'Apertura', dates: '15 ENE - 15 FEB', active: false },
  { region: 'INTERNACIONAL', name: 'Masters Santiago', dates: '28 FEB - 16 MAR', active: false },
  { region: 'TODAS LAS REGIONES', name: 'Fase 1', dates: '11 ABR - 24 MAY', active: false },
  { region: 'INTERNACIONAL', name: 'Masters London', dates: '6 JUN - 21 JUN', active: false },
  { region: 'TODAS LAS REGIONES', name: 'Fase 2', dates: '30 JUN - 6 SEPT', active: false },
  { region: 'INTERNACIONAL', name: 'Champions Shanghai', dates: '24 SEPT - 18 OCT', active: true },
];

const CALENDAR_FILTERS = ['TODAS', 'VCT AMERICAS', 'VCT PACIFIC', 'VCT EMEA', 'VCT CHINA', 'GAME CHANGERS'];

const MATCH_DAYS = [
  {
    date: 'viernes 25 sept',
    isToday: false,
    matches: [
      { time: '18:00', team1: { tag: 'NS', name: 'NOVA ESPORTS' }, team2: { tag: 'NRG', name: 'NRG ESPORTS' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
      { time: '21:00', team1: { tag: 'KC', name: 'KARMINE CORP' }, team2: { tag: 'XLG', name: 'XLG' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
    ]
  },
  {
    date: 'sábado 26 sept',
    isToday: false,
    matches: [
      { time: '18:00', team1: { tag: 'GE', name: 'GIANTS' }, team2: { tag: 'VIT', name: 'VITALITY' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
      { time: '21:00', team1: { tag: 'LOUD', name: 'LOUD' }, team2: { tag: 'EDG', name: 'EDWARD GAMING' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
    ]
  },
  {
    date: 'domingo 27 sept',
    isToday: true,
    matches: [
      { time: '18:00', team1: { tag: '100T', name: '100 THIEVES' }, team2: { tag: 'T1', name: 'T1' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
      { time: '21:00', team1: { tag: 'JDG', name: 'JD GAMING' }, team2: { tag: 'FUT', name: 'FUT ESPORTS' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
    ]
  },
  {
    date: 'martes 29 sept',
    isToday: false,
    matches: [
      { time: '18:00', team1: { tag: 'TBD', name: 'POR DETERMINAR' }, team2: { tag: 'TBD', name: 'POR DETERMINAR' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
      { time: '21:00', team1: { tag: 'TBD', name: 'POR DETERMINAR' }, team2: { tag: 'TBD', name: 'POR DETERMINAR' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
    ]
  },
  {
    date: 'miércoles 30 sept',
    isToday: false,
    matches: [
      { time: '18:00', team1: { tag: 'TBD', name: 'POR DETERMINAR' }, team2: { tag: 'TBD', name: 'POR DETERMINAR' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
      { time: '21:00', team1: { tag: 'TBD', name: 'POR DETERMINAR' }, team2: { tag: 'TBD', name: 'POR DETERMINAR' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
    ]
  },
  {
    date: 'jueves 1 oct',
    isToday: false,
    matches: [
      { time: '18:00', team1: { tag: 'TBD', name: 'POR DETERMINAR' }, team2: { tag: 'TBD', name: 'POR DETERMINAR' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
      { time: '21:00', team1: { tag: 'TBD', name: 'POR DETERMINAR' }, team2: { tag: 'TBD', name: 'POR DETERMINAR' }, score1: null, score2: null, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'upcoming' },
    ]
  },
];

const PAST_RESULTS = [
  {
    date: 'jueves 24 sept',
    isToday: false,
    matches: [
      { time: '18:00', team1: { tag: 'FLY', name: 'FLYQUEST' }, team2: { tag: 'MVSK', name: 'MVSK' }, score1: 2, score2: 0, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'finished' },
      { time: '21:00', team1: { tag: 'C9', name: 'CLOUD9' }, team2: { tag: 'SWIM', name: 'SWIM' }, score1: 2, score2: 0, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'finished' },
    ]
  },
  {
    date: 'miércoles 23 sept',
    isToday: false,
    matches: [
      { time: '18:00', team1: { tag: '100T', name: '100 THIEVES' }, team2: { tag: 'LOUD', name: 'LOUD' }, score1: 3, score2: 2, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'finished' },
      { time: '21:00', team1: { tag: 'TLV', name: 'TEAM LIQUID' }, team2: { tag: 'EG', name: 'EVIL GENIUSES' }, score1: 3, score2: 1, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'finished' },
    ]
  },
  {
    date: 'martes 22 sept',
    isToday: false,
    matches: [
      { time: '18:00', team1: { tag: 'GEN', name: 'GEN.G' }, team2: { tag: 'FL', name: 'FUNPLUS' }, score1: 3, score2: 2, comp: 'Champions', phase: 'Grupos', format: 'MEJOR DE 3', status: 'finished' },
      { time: '21:00', team1: { tag: 'HER', name: 'HERETICS' }, team2: { tag: 'SRG', name: 'SURGE' }, score1: 2, score2: 0, comp: 'Game Changers', phase: 'Playoffs', format: 'MEJOR DE 3', status: 'finished' },
    ]
  },
];

const POWER_RANKINGS = [
  { pos: 1, tag: 'GEN', name: 'GEN.G', points: 1850, region: 'PACIFIC' },
  { pos: 2, tag: '100T', name: '100 THIEVES', points: 1720, region: 'AMERICAS' },
  { pos: 3, tag: 'LOUD', name: 'LOUD', points: 1680, region: 'AMERICAS' },
  { pos: 4, tag: 'EDG', name: 'EDWARD GAMING', points: 1610, region: 'CHINA' },
  { pos: 5, tag: 'NRG', name: 'NRG ESPORTS', points: 1540, region: 'AMERICAS' },
  { pos: 6, tag: 'T1', name: 'T1', points: 1490, region: 'PACIFIC' },
  { pos: 7, tag: 'VIT', name: 'VITALITY', points: 1430, region: 'EMEA' },
  { pos: 8, tag: 'FLY', name: 'FLYQUEST', points: 1380, region: 'AMERICAS' },
  { pos: 9, tag: 'KC', name: 'KARMINE CORP', points: 1320, region: 'EMEA' },
  { pos: 10, tag: 'JDG', name: 'JD GAMING', points: 1270, region: 'CHINA' },
];

// ============================================
// PAGE CONTENT
// ============================================

const DOC_CONTENT = {
  // ---- INICIO (HOME) ----
  'inicio': {
    title: 'VANTCALL Esports — Calendario Competitivo',
    group: 'Inicio',
    isHome: true,
    content: `
      <section class="valorant-hero">
        <div class="hero-badge"><span class="live-dot"></span> CHAMPIONS SHANGHAI · EN VIVO</div>
        <h1>VANTCALL</h1>
        <p class="hero-tagline">El calendario competitivo definitivo. Ranked, torneos, eventos y la elite del esports en una sola plataforma.</p>
        <div class="hero-cta">
          <a href="#/login" class="btn btn-primary btn-lg">JUGAR GRATIS</a>
          <a href="#/calendario" class="btn btn-secondary btn-lg">VER CALENDARIO</a>
        </div>
      </section>

      <!-- Season Strip -->
      <div class="season-strip">
        ${SEASON_EVENTS.map(e => `
          <div class="season-event${e.active ? ' active' : ''}">
            <div class="season-event-region">${e.region}</div>
            <div class="season-event-name">${e.name}</div>
            <div class="season-event-dates">${e.dates}</div>
          </div>
        `).join('')}
      </div>

      <!-- Calendar Section -->
      <section class="calendar-section">
        <div class="calendar-header">
          <div class="calendar-title">
            <h2>CALENDARIO</h2>
          </div>
          <div class="calendar-filters">
            ${CALENDAR_FILTERS.map((f, i) => `
              <button class="calendar-filter${i === 0 ? ' active' : ''}" data-filter="${f}">${f}</button>
            `).join('')}
          </div>
        </div>

        ${renderMatchDays(MATCH_DAYS, 'upcoming')}
      </section>

      <!-- Power Rankings -->
      <section class="power-rankings">
        <div class="rankings-header">
          <h2>GLOBAL POWER RANKINGS</h2>
        </div>
        <div class="rankings-list">
          ${POWER_RANKINGS.map(t => `
            <div class="ranking-row">
              <div class="ranking-pos${t.pos === 1 ? ' top1' : t.pos === 2 ? ' top2' : t.pos === 3 ? ' top3' : ''}">${String(t.pos).padStart(2, '0')}</div>
              <div class="ranking-team">
                <div class="ranking-team-logo">${t.tag}</div>
                <div class="ranking-team-name">${t.name}</div>
              </div>
              <div class="ranking-points">${t.points} pts</div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- News Section -->
      <section class="valorant-section">
        <div class="section-header">
          <h2>NOVEDADES</h2>
        </div>
        <div class="news-list">
          <a href="#/calendario" class="news-item">
            <div class="news-num">01</div>
            <div class="news-content">
              <div class="news-meta"><span class="news-cat">Champions</span></div>
              <h3>Champions Shanghai 2026 — Fase de grupos</h3>
              <p>Los mejores 16 equipos del mundo se enfrentan en Shanghai. Sigue todos los partidos en el calendario.</p>
            </div>
          </a>
          <a href="#/torneos" class="news-item">
            <div class="news-num">02</div>
            <div class="news-content">
              <div class="news-meta"><span class="news-cat">Torneos</span></div>
              <h3>VANT Open — Inscripciones abiertas</h3>
              <p>Torneo público para jugadores BASIC+. Inscríbete desde la web o con /torneo registrar en Discord.</p>
            </div>
          </a>
          <a href="#/precios" class="news-item">
            <div class="news-num">03</div>
            <div class="news-content">
              <div class="news-meta"><span class="news-cat">Plataforma</span></div>
              <h3>Planes BASIC, PRO y ELITE disponibles</h3>
              <p>Pago único con Stripe. El plan se activa en tu cuenta en cuanto Stripe confirma el pago.</p>
            </div>
          </a>
        </div>
      </section>

      <!-- Banner -->
      <section class="valorant-banner">
        <div class="banner-content">
          <h2>VANT CHAMPIONSHIP</h2>
          <p>El torneo competitivo definitivo de VANTCALL. Llega a la cima y demuestra tu nivel.</p>
          <a href="#/torneos" class="btn btn-primary btn-lg">VER AHORA</a>
        </div>
      </section>

      <!-- Feature Blocks -->
      <section class="valorant-section">
        <div class="section-header">
          <h2>SOMOS VANTCALL</h2>
        </div>

        <div class="feature-block">
          <div class="feature-block-num">01</div>
          <h3>DESAFÍA LOS LÍMITES</h3>
          <p>Sistema ranked con MMR, placement, temporadas y leaderboard. Entra a la cola, gana partidas y escala posiciones. Todos los comandos se sincronizan entre la web y el bot de Discord en tiempo real.</p>
          <a href="#/ranked" class="btn btn-secondary">DESCUBRE EL RANKED</a>
        </div>

        <div class="feature-block">
          <div class="feature-block-num">02</div>
          <h3>TUS AGENTES</h3>
          <p>Perfiles de jugador vinculados a Discord con estadísticas competitivas, historial de partidas y verificación de identidad. Compara jugadores y consulta el directorio completo.</p>
          <a href="#/jugadores" class="btn btn-secondary">VER JUGADORES</a>
        </div>

        <div class="feature-block">
          <div class="feature-block-num">03</div>
          <h3>TUS TORNEOS</h3>
          <p>Torneos públicos y privados con inscripción, bracket en tiempo real y resultados. VANT Open, Pro Series y Elite Invitational según tu plan.</p>
          <a href="#/torneos" class="btn btn-secondary">VER TORNEOS</a>
        </div>

        <div class="feature-block">
          <div class="feature-block-num">04</div>
          <h3>CALENDARIO EN VIVO</h3>
          <p>Sigue todos los partidos del circuito competitivo en tiempo real. Horarios, resultados, bracket y Power Rankings actualizados al instante.</p>
          <a href="#/calendario" class="btn btn-secondary">VER CALENDARIO</a>
        </div>
      </section>

      <!-- Pricing Preview -->
      <section class="valorant-section valorant-pricing">
        <div class="section-header">
          <h2>PLANES</h2>
        </div>
        <div class="pricing-grid">
          <div class="pricing-card pricing-tier-1">
            <div class="pricing-tier-tag">T1 · DISPONIBLE</div>
            <h3 class="pricing-tier-name">VANT BASIC</h3>
            <p class="pricing-desc">Acceso comunitario, 1 entrada a torneos abiertos y perfil Ranked.</p>
            <div class="pricing-price-line">
              <span class="pricing-price-num">€9</span>
              <span class="pricing-price-type">PAGO ÚNICO</span>
            </div>
            <ul class="pricing-features">
              <li>Ticket BASIC de por vida en esta temporada</li>
              <li>Inscripción a VANT Open</li>
              <li>Perfil Ranked (Bronze-Gold)</li>
              <li>Soporte estándar</li>
            </ul>
            <a href="#/checkout/basic" class="btn btn-secondary pricing-btn">COMPRAR</a>
          </div>
          <div class="pricing-card pricing-tier-2 pricing-featured">
            <div class="pricing-badge">MÁS POPULAR</div>
            <div class="pricing-tier-tag">T2 · DISPONIBLE</div>
            <h3 class="pricing-tier-name">VANT PRO</h3>
            <p class="pricing-desc">Ranked completo, Pro Series y prioridad de tryouts.</p>
            <div class="pricing-price-line">
              <span class="pricing-price-num">€19</span>
              <span class="pricing-price-type">PAGO ÚNICO</span>
            </div>
            <ul class="pricing-features">
              <li>Todo BASIC</li>
              <li>VANT Pro Series</li>
              <li>Sala privada / scrims</li>
              <li>Prioridad en tryouts</li>
              <li>Rol Operator equivalente</li>
            </ul>
            <a href="#/checkout/pro" class="btn btn-primary pricing-btn">COMPRAR</a>
          </div>
          <div class="pricing-card pricing-tier-3 pricing-elite">
            <div class="pricing-badge pricing-badge-elite">ELITE</div>
            <div class="pricing-tier-tag">T3 · DISPONIBLE</div>
            <h3 class="pricing-tier-name">VANT ELITE</h3>
            <p class="pricing-desc">Elite Invitational, cupo Command y marca visible en Ranked.</p>
            <div class="pricing-price-line">
              <span class="pricing-price-num">€39</span>
              <span class="pricing-price-type">PAGO ÚNICO</span>
            </div>
            <ul class="pricing-features">
              <li>Todo PRO</li>
              <li>VANT Elite Invitational</li>
              <li>Badge Elite en perfil</li>
              <li>Canal Command</li>
              <li>Revisión de verificación prioritaria</li>
            </ul>
            <a href="#/checkout/elite" class="btn btn-secondary pricing-btn">COMPRAR</a>
          </div>
        </div>
        <p class="pricing-note" style="text-align:center; margin-top: var(--space-6);">El pago se confirma por webhook de Stripe, no por el redirect del navegador. PayPal aparece en Checkout si está activo en tu cuenta Stripe.</p>
      </section>

      <!-- Login Methods -->
      <section class="valorant-section">
        <div class="section-header">
          <h2>INICIO DE SESIÓN</h2>
        </div>
        <div class="login-methods-home">
          <a href="#/login" class="login-method-card">
            <div class="login-method-icon discord-icon">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            </div>
            <h3>Discord</h3>
            <p>Acceso con cuenta de Discord vía OAuth 2.0</p>
          </a>
          <a href="#/registro" class="login-method-card">
            <div class="login-method-icon google-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            </div>
            <h3>Correo</h3>
            <p>Registro con correo y contraseña, verificación por email</p>
          </a>
          <a href="#/precios" class="login-method-card">
            <div class="login-method-icon github-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            </div>
            <h3>Planes</h3>
            <p>BASIC, PRO y ELITE se asignan a tu cuenta al pagar con Stripe</p>
          </a>
        </div>
      </section>
    `
  },

  // ---- CALENDARIO ----
  'calendario': {
    title: 'Calendario — VANTCALL Esports',
    group: 'Plataforma',
    content: `
      <h1>Calendario Competitivo</h1>
      <p class="breadcrumb"><a href="#/inicio">VANTCALL</a> <span>/</span> Calendario</p>

      <div class="season-strip" style="border-radius: var(--radius-lg); margin-bottom: var(--space-8);">
        ${SEASON_EVENTS.map(e => `
          <div class="season-event${e.active ? ' active' : ''}">
            <div class="season-event-region">${e.region}</div>
            <div class="season-event-name">${e.name}</div>
            <div class="season-event-dates">${e.dates}</div>
          </div>
        `).join('')}
      </div>

      <div class="calendar-header" style="margin-bottom: var(--space-6);">
        <div class="calendar-title">
          <h2 style="border:none; margin:0; padding:0;">PRÓXIMOS PARTIDOS</h2>
        </div>
        <div class="calendar-filters">
          ${CALENDAR_FILTERS.map((f, i) => `
            <button class="calendar-filter${i === 0 ? ' active' : ''}" data-filter="${f}">${f}</button>
          `).join('')}
        </div>
      </div>

      ${renderMatchDays(MATCH_DAYS, 'upcoming')}

      <h2 style="margin-top: var(--space-16);">RESULTADOS RECIENTES</h2>

      ${renderMatchDays(PAST_RESULTS, 'finished')}
    `
  },

  // ---- RANKED ----
  'ranked': {
    title: 'Ranked — VANTCALL Esports',
    group: 'Plataforma',
    content: `
      <h1>Ranked</h1>
      <p class="breadcrumb"><a href="#/inicio">VANTCALL</a> <span>/</span> Ranked</p>

      <div class="dash-grid">
        <div class="dash-card"><div class="label">Temporada</div><div class="value">T1</div><div class="sub">Activa</div></div>
        <div class="dash-card"><div class="label">Jugadores en cola</div><div class="value">0</div><div class="sub">Esperando</div></div>
        <div class="dash-card"><div class="label">Partidas hoy</div><div class="value">0</div><div class="sub">Registradas</div></div>
        <div class="dash-card"><div class="label">MMR medio</div><div class="value">—</div><div class="sub">Sin datos</div></div>
      </div>

      <h2>Estado del sistema</h2>
      <p>El sistema Ranked está sincronizado entre la web y el bot de Discord. Todos los comandos ejecutados en Discord se reflejan en la plataforma web en tiempo real.</p>

      <div class="bot-panel">
        <div class="bot-status">
          <div class="dot"></div>
          <div><div class="text">Bot conectado</div><div class="sub">Supabase · sincronización activa</div></div>
        </div>
        <h3>Comandos — Ranked</h3>
        <div class="bot-commands">
          <div class="bot-cmd"><code>/ranked entrar</code><span class="desc">Unirse a la cola</span></div>
          <div class="bot-cmd"><code>/ranked placement</code><span class="desc">Partidas de calibración</span></div>
          <div class="bot-cmd"><code>/ranked perfil</code><span class="desc">Perfil competitivo</span></div>
          <div class="bot-cmd"><code>/ranked estado</code><span class="desc">Estado de la cola</span></div>
          <div class="bot-cmd"><code>/ranked leaderboard</code><span class="desc">Clasificación global</span></div>
          <div class="bot-cmd"><code>/ranked historial</code><span class="desc">Historial de partidas</span></div>
          <div class="bot-cmd"><code>/ranked partida</code><span class="desc">Partida actual</span></div>
          <div class="bot-cmd"><code>/ranked cancelar</code><span class="desc">Salir de la cola</span></div>
          <div class="bot-cmd"><code>/ranked resultado</code><span class="desc">Reportar resultado</span></div>
          <div class="bot-cmd"><code>/ranked reglas</code><span class="desc">Reglas vigentes</span></div>
        </div>
      </div>

      <h2>Tablas de Supabase</h2>
      <ul>
        <li><code>seasons</code> — Temporadas activas y cerradas</li>
        <li><code>season_player_stats</code> — MMR, rangos, wins y losses por jugador</li>
        <li><code>ranked_matches</code> — Partidas registradas</li>
        <li><code>ranked_queue</code> — Cola de emparejamiento</li>
        <li><code>ranked_rules</code> — Reglas configurables</li>
        <li><code>ranked_history</code> — Historial completo de MMR</li>
      </ul>
    `
  },

  // ---- JUGADORES ----
  'jugadores': {
    title: 'Jugadores — VANTCALL Esports',
    group: 'Plataforma',
    content: `
      <h1>Jugadores</h1>
      <p class="breadcrumb"><a href="#/inicio">VANTCALL</a> <span>/</span> Jugadores</p>

      <p>Directorio de jugadores de VANTCALL. Los perfiles están vinculados a cuentas de Discord y sincronizados con Supabase.</p>

      <div class="bot-panel">
        <div class="bot-status">
          <div class="dot"></div>
          <div><div class="text">Bot conectado</div><div class="sub">Perfiles sincronizados</div></div>
        </div>
        <h3>Comandos — Jugadores</h3>
        <div class="bot-commands">
          <div class="bot-cmd"><code>/jugador perfil</code><span class="desc">Ver perfil de un jugador</span></div>
          <div class="bot-cmd"><code>/jugador buscar</code><span class="desc">Buscar por nombre</span></div>
          <div class="bot-cmd"><code>/jugador estadisticas</code><span class="desc">Stats competitivas</span></div>
          <div class="bot-cmd"><code>/jugador comparar</code><span class="desc">Comparar dos jugadores</span></div>
          <div class="bot-cmd"><code>/jugador verificar</code><span class="desc">Verificación de identidad</span></div>
          <div class="bot-cmd"><code>/jugador desconectar</code><span class="desc">Desvincular jugador</span></div>
          <div class="bot-cmd"><code>/jugadores activos</code><span class="desc">Jugadores en línea</span></div>
        </div>
      </div>

      <h2>Tablas de Supabase</h2>
      <ul>
        <li><code>players</code> — Datos de jugadores</li>
        <li><code>player_discord_accounts</code> — Vinculación con Discord</li>
        <li><code>profiles</code> — Perfiles públicos y privados</li>
        <li><code>bot_admins</code> — Administradores del bot</li>
      </ul>
    `
  },

  // ---- TORNEOS ----
  'torneos': {
    title: 'Torneos — VANTCALL Esports',
    group: 'Plataforma',
    content: `
      <h1>Torneos</h1>
      <p class="breadcrumb"><a href="#/inicio">VANTCALL</a> <span>/</span> Torneos</p>

      <p>Torneos públicos y privados de VANTCALL. La inscripción, bracket y resultados se sincronizan entre la web y el bot de Discord.</p>

      <div class="dash-grid">
        <div class="dash-card"><div class="label">VANT Open</div><div class="value">Inscripción</div><div class="sub">BASIC+</div></div>
        <div class="dash-card"><div class="label">Pro Series</div><div class="value">Activo</div><div class="sub">PRO+</div></div>
        <div class="dash-card"><div class="label">Elite Invitational</div><div class="value">Próximamente</div><div class="sub">ELITE</div></div>
      </div>

      <div class="bot-panel">
        <div class="bot-status">
          <div class="dot"></div>
          <div><div class="text">Bot conectado</div><div class="sub">Torneos sincronizados</div></div>
        </div>
        <h3>Comandos — Torneos</h3>
        <div class="bot-commands">
          <div class="bot-cmd"><code>/torneo lista</code><span class="desc">Torneos disponibles</span></div>
          <div class="bot-cmd"><code>/torneo ver</code><span class="desc">Ficha del torneo</span></div>
          <div class="bot-cmd"><code>/torneo registrar</code><span class="desc">Inscribirse</span></div>
          <div class="bot-cmd"><code>/torneo cancelar</code><span class="desc">Cancelar inscripción</span></div>
          <div class="bot-cmd"><code>/torneo participantes</code><span class="desc">Lista de inscritos</span></div>
          <div class="bot-cmd"><code>/torneo bracket</code><span class="desc">Bracket actual</span></div>
          <div class="bot-cmd"><code>/torneo partida</code><span class="desc">Info de partida</span></div>
          <div class="bot-cmd"><code>/torneo resultado</code><span class="desc">Reportar resultado</span></div>
        </div>
      </div>

      <h2>Tablas de Supabase</h2>
      <ul>
        <li><code>tournaments</code> — Torneos públicos y privados</li>
        <li><code>tournament_entries</code> — Inscripciones</li>
        <li><code>tournament_matches</code> — Partidas del bracket</li>
      </ul>
    `
  },

  // ---- PRECIOS (Enhanced Monetization) ----
  'precios': {
    title: 'Planes y Precios — VANTCALL Esports',
    group: 'Plataforma',
    content: `
      <div class="pricing-header-block">
        <div class="pricing-tag">TICKETS · MONETIZACIÓN</div>
        <h1>VANT BASIC · PRO · ELITE</h1>
        <p class="pricing-note">El pago se confirma por webhook de Stripe, no por el redirect del navegador. PayPal aparece en Checkout si está activo en tu cuenta Stripe.</p>
        <p class="pricing-note-dim">Precios con IVA incluido. Necesitas iniciar sesión para comprar: el plan se asigna a tu cuenta automáticamente.</p>
      </div>

      <div class="pricing-grid">
        <div class="pricing-card pricing-tier-1">
          <div class="pricing-tier-tag">T1 · DISPONIBLE</div>
          <h3 class="pricing-tier-name">VANT BASIC</h3>
          <p class="pricing-desc">Acceso comunitario, 1 entrada a torneos abiertos y perfil Ranked.</p>
          <div class="pricing-price-line">
            <span class="pricing-price-num">€9</span>
            <span class="pricing-price-type">PAGO ÚNICO</span>
          </div>
          <ul class="pricing-features">
            <li>Ticket BASIC de por vida en esta temporada</li>
            <li>Inscripción a VANT Open</li>
            <li>Perfil Ranked (Bronze-Gold)</li>
            <li>Soporte estándar</li>
          </ul>
          <a href="#/checkout/basic" class="btn btn-secondary pricing-btn">COMPRAR</a>
        </div>

        <div class="pricing-card pricing-tier-2 pricing-featured">
          <div class="pricing-badge">MÁS POPULAR</div>
          <div class="pricing-tier-tag">T2 · DISPONIBLE</div>
          <h3 class="pricing-tier-name">VANT PRO</h3>
          <p class="pricing-desc">Ranked completo, Pro Series y prioridad de tryouts.</p>
          <div class="pricing-price-line">
            <span class="pricing-price-num">€19</span>
            <span class="pricing-price-type">PAGO ÚNICO</span>
          </div>
          <ul class="pricing-features">
            <li>Todo BASIC</li>
            <li>VANT Pro Series</li>
            <li>Sala privada / scrims</li>
            <li>Prioridad en tryouts</li>
            <li>Rol Operator equivalente</li>
          </ul>
          <a href="#/checkout/pro" class="btn btn-primary pricing-btn">COMPRAR</a>
        </div>

        <div class="pricing-card pricing-tier-3 pricing-elite">
          <div class="pricing-badge pricing-badge-elite">ELITE</div>
          <div class="pricing-tier-tag">T3 · DISPONIBLE</div>
          <h3 class="pricing-tier-name">VANT ELITE</h3>
          <p class="pricing-desc">Elite Invitational, cupo Command y marca visible en Ranked.</p>
          <div class="pricing-price-line">
            <span class="pricing-price-num">€39</span>
            <span class="pricing-price-type">PAGO ÚNICO</span>
          </div>
          <ul class="pricing-features">
            <li>Todo PRO</li>
            <li>VANT Elite Invitational</li>
            <li>Badge Elite en perfil</li>
            <li>Canal Command</li>
            <li>Revisión de verificación prioritaria</li>
          </ul>
          <a href="#/checkout/elite" class="btn btn-secondary pricing-btn">COMPRAR</a>
        </div>
      </div>

      <h2 style="margin-top: var(--space-20);">COMPARATIVA DE PLANES</h2>

      <div class="pricing-comparison">
        <table>
          <thead>
            <tr>
              <th>Característica</th>
              <th>BASIC</th>
              <th>PRO</th>
              <th>ELITE</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Perfil Ranked</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
            <tr><td>VANT Open</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
            <tr><td>VANT Pro Series</td><td class="cross">—</td><td class="check">✓</td><td class="check">✓</td></tr>
            <tr><td>Elite Invitational</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td></tr>
            <tr><td>Sala privada / scrims</td><td class="cross">—</td><td class="check">✓</td><td class="check">✓</td></tr>
            <tr><td>Prioridad en tryouts</td><td class="cross">—</td><td class="check">✓</td><td class="check">✓</td></tr>
            <tr><td>Badge Elite en perfil</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td></tr>
            <tr><td>Canal Command</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td></tr>
            <tr><td>Soporte prioritario</td><td class="cross">—</td><td class="check">✓</td><td class="check">✓</td></tr>
            <tr><td>Verificación prioritaria</td><td class="cross">—</td><td class="cross">—</td><td class="check">✓</td></tr>
          </tbody>
        </table>
      </div>

      <p class="pricing-footer-note">Pagos procesados por Stripe. ¿Dudas con tu compra? Escribe a <a href="mailto:feispla@hotmail.com" class="pricing-link">feispla@hotmail.com</a></p>
    `
  },

};

// ============================================
// RENDER HELPERS
// ============================================

function renderMatchDays(days, type) {
  return days.map(day => `
    <div class="match-day">
      <div class="match-day-header">
        <span class="match-day-date">${day.date}</span>
        ${day.isToday ? '<span class="match-day-badge">HOY</span>' : ''}
      </div>
      ${day.matches.map(m => renderMatchCard(m, type)).join('')}
    </div>
  `).join('');
}

function renderMatchCard(match, type) {
  const isTBD = match.team1.tag === 'TBD';
  const isFinished = type === 'finished' && match.score1 !== null;
  const hasScore = match.score1 !== null && match.score2 !== null;
  const team1Win = hasScore && match.score1 > match.score2;
  const team2Win = hasScore && match.score2 > match.score1;

  return `
    <div class="match-card">
      <div class="match-time${match.status === 'live' ? ' live' : ''}">
        ${match.status === 'live' ? '<span class="live-indicator">LIVE</span>' : match.time}
      </div>
      <div class="match-team">
        <div class="match-team-logo">${match.team1.tag}</div>
        <span class="match-team-name${isTBD ? ' tbd' : ''}">${match.team1.name}</span>
      </div>
      <div class="match-score">
        ${hasScore ? `
          <span class="match-score-num${team1Win ? ' winner' : ''}">${match.score1}</span>
          <span class="match-score-sep">:</span>
          <span class="match-score-num${team2Win ? ' winner' : ''}">${match.score2}</span>
        ` : `
          <span class="match-score-sep">VS</span>
        `}
      </div>
      <div class="match-team right">
        <span class="match-team-name${isTBD ? ' tbd' : ''}">${match.team2.name}</span>
        <div class="match-team-logo">${match.team2.tag}</div>
      </div>
      <div class="match-format">
        <span class="match-comp">${match.comp}</span>
        <span class="match-phase">${match.phase}</span>
        <span class="match-format-tag">${match.format}</span>
      </div>
    </div>
  `;
}

// ============================================
// ROUTER
// ============================================

function renderPage(pageId) {
  const page = DOC_CONTENT[pageId];
  if (!page) {
    renderPage('inicio');
    return;
  }

  const main = document.getElementById('main');
  document.title = page.title;

  main.innerHTML = `
    <div class="content-wrapper${page.isHome ? ' content-wrapper-home' : ''}">
      <div class="content${page.isHome ? ' content-home' : ''}">${page.content}</div>
    </div>
  `;

  // Update active nav items
  document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#/${pageId}`);
  });

  // Close mobile nav
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav) mobileNav.classList.remove('show');

  // Init calendar filters if present
  initCalendarFilters();

  // Auth / checkout bindings (auth.js)
  if (window.VantAuth) window.VantAuth.afterRender(pageId);
}

function initCalendarFilters() {
  document.querySelectorAll('.calendar-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.calendar-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Season event clicks
  document.querySelectorAll('.season-event').forEach(evt => {
    evt.addEventListener('click', () => {
      document.querySelectorAll('.season-event').forEach(e => e.classList.remove('active'));
      evt.classList.add('active');
    });
  });
}

// Router
function router() {
  const hash = window.location.hash.replace('#/', '').split('?')[0];
  const pageId = hash || 'inicio';
  renderPage(pageId);
}

// Theme toggle
function initTheme() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);
  updateThemeIcon(toggle, theme);

  toggle && toggle.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    updateThemeIcon(toggle, theme);
  });
}

function updateThemeIcon(toggle, theme) {
  if (!toggle) return;
  toggle.setAttribute('aria-label', 'Cambiar a modo ' + (theme === 'dark' ? 'claro' : 'oscuro'));
  toggle.innerHTML = theme === 'dark'
    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
}

// Mobile menu
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (!menuToggle || !mobileNav) return;
  menuToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('show');
  });
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.remove('show'));
  });
}

// Init
function init() {
  initTheme();
  initMobileMenu();
  router();
}

document.addEventListener('DOMContentLoaded', init);
window.addEventListener('hashchange', router);
