(() => {
  document.getElementById('__smp')?.remove();

  // ── Core speed state ──────────────────────────────────────────────────────
  let speed = 1;
  let lastReal = null;
  let offset = 0;
  const _raf     = window.requestAnimationFrame.bind(window);
  const _perfNow = performance.now.bind(performance);
  const _dateNow = Date.now.bind(Date);
  const _sto     = window.setTimeout.bind(window);
  const _si      = window.setInterval.bind(window);
  let isApplied  = false;

  // ── i18n ──────────────────────────────────────────────────────────────────
  const LANGS = {
    en: { name:'🇬🇧 English', speed:'Speed', apply:'Apply', reset:'Reset', tab_speed:'Speed', tab_theme:'Theme', tab_lang:'Language', active:'ACTIVE', inactive:'INACTIVE', presets:'Presets', note:'Paste on MSN index page first, then load game.' },
    ru: { name:'🇷🇺 Русский', speed:'Скорость', apply:'Применить', reset:'Сброс', tab_speed:'Скорость', tab_theme:'Тема', tab_lang:'Язык', active:'АКТИВНО', inactive:'НЕАКТИВНО', presets:'Пресеты', note:'Вставьте на главной странице MSN, затем загрузите игру.' },
    es: { name:'🇪🇸 Español', speed:'Velocidad', apply:'Aplicar', reset:'Restablecer', tab_speed:'Velocidad', tab_theme:'Tema', tab_lang:'Idioma', active:'ACTIVO', inactive:'INACTIVO', presets:'Presets', note:'Pega en la página de MSN primero, luego carga el juego.' },
    fr: { name:'🇫🇷 Français', speed:'Vitesse', apply:'Appliquer', reset:'Réinitialiser', tab_speed:'Vitesse', tab_theme:'Thème', tab_lang:'Langue', active:'ACTIF', inactive:'INACTIF', presets:'Préréglages', note:'Colle sur la page MSN d\'abord, puis charge le jeu.' },
    de: { name:'🇩🇪 Deutsch', speed:'Geschw.', apply:'Anwenden', reset:'Zurücksetzen', tab_speed:'Geschw.', tab_theme:'Design', tab_lang:'Sprache', active:'AKTIV', inactive:'INAKTIV', presets:'Voreinstellungen', note:'Zuerst auf der MSN-Seite einfügen, dann das Spiel laden.' },
    pt: { name:'🇧🇷 Português', speed:'Velocidade', apply:'Aplicar', reset:'Redefinir', tab_speed:'Velocidade', tab_theme:'Tema', tab_lang:'Idioma', active:'ATIVO', inactive:'INATIVO', presets:'Presets', note:'Cole na página MSN primeiro, depois carregue o jogo.' },
    zh: { name:'🇨🇳 中文', speed:'速度', apply:'应用', reset:'重置', tab_speed:'速度', tab_theme:'主题', tab_lang:'语言', active:'已激活', inactive:'未激活', presets:'预设', note:'先在MSN首页粘贴，然后加载游戏。' },
    ar: { name:'🇸🇦 العربية', speed:'السرعة', apply:'تطبيق', reset:'إعادة', tab_speed:'السرعة', tab_theme:'المظهر', tab_lang:'اللغة', active:'نشط', inactive:'غير نشط', presets:'إعدادات', note:'الصق في صفحة MSN أولاً ثم قم بتحميل اللعبة.' },
  };
  let lang = 'en';

  // ── Themes ────────────────────────────────────────────────────────────────
  const THEMES = {
    midnight: { name:'🌙 Midnight', bg:'#0d1117', surface:'#161b22', border:'#30363d', accent:'#58a6ff', text:'#e6edf3', sub:'#8b949e', active:'#238636', activeText:'#56d364' },
    neon:     { name:'⚡ Neon',     bg:'#0a0a0f', surface:'#12121a', border:'#2a2a3e', accent:'#ff2d78', text:'#f0f0ff', sub:'#888aaa', active:'#7c3aed', activeText:'#a78bfa' },
    fire:     { name:'🔥 Fire',     bg:'#1a0800', surface:'#2d1200', border:'#7c2d12', accent:'#f97316', text:'#fef3c7', sub:'#d97706', active:'#dc2626', activeText:'#fca5a5' },
    forest:   { name:'🌿 Forest',   bg:'#0a1a0a', surface:'#122212', border:'#1a4a1a', accent:'#4ade80', text:'#f0fdf4', sub:'#86efac', active:'#16a34a', activeText:'#bbf7d0' },
    ocean:    { name:'🌊 Ocean',    bg:'#030f1a', surface:'#061a2e', border:'#0c4a6e', accent:'#38bdf8', text:'#f0f9ff', sub:'#7dd3fc', active:'#0369a1', activeText:'#bae6fd' },
    sakura:   { name:'🌸 Sakura',   bg:'#1a0a12', surface:'#2a1020', border:'#7c2d6a', accent:'#f472b6', text:'#fdf2f8', sub:'#f9a8d4', active:'#be185d', activeText:'#fbcfe8' },
    ice:      { name:'🧊 Ice',      bg:'#f8fafc', surface:'#ffffff', border:'#e2e8f0', accent:'#3b82f6', text:'#0f172a', sub:'#64748b', active:'#1d4ed8', activeText:'#dbeafe' },
    gold:     { name:'👑 Gold',     bg:'#1a1400', surface:'#2a2000', border:'#7c6a00', accent:'#fbbf24', text:'#fffbeb', sub:'#d97706', active:'#b45309', activeText:'#fde68a' },
  };
  let theme = 'midnight';

  // ── Current tab ───────────────────────────────────────────────────────────
  let activeTab = 'speed';

  // ── Build widget ──────────────────────────────────────────────────────────
  const wrap = document.createElement('div');
  wrap.id = '__smp';
  document.body.appendChild(wrap);

  function getT() { return LANGS[lang]; }
  function getTh() { return THEMES[theme]; }

  function render() {
    const t = getT();
    const th = getTh();
    wrap.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap');
      #__smp {
        position:fixed; top:18px; right:18px; z-index:2147483647;
        font-family:'JetBrains Mono',monospace;
        background:${th.bg}; border:1px solid ${th.border};
        border-radius:14px; box-shadow:0 16px 48px rgba(0,0,0,.6);
        color:${th.text}; width:var(--smp-w,280px); min-width:200px; max-width:500px;
        overflow:hidden; resize:both; user-select:none;
      }
      #__smp * { box-sizing:border-box; }
      #__smp .header {
        background:${th.surface}; border-bottom:1px solid ${th.border};
        padding:10px 12px 0; cursor:move;
      }
      #__smp .title-row {
        display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;
      }
      #__smp .title { font-size:12px; font-weight:700; color:${th.accent}; letter-spacing:2px; }
      #__smp .status-pill {
        font-size:9px; font-weight:700; padding:3px 8px; border-radius:99px; letter-spacing:1px;
        background:${isApplied ? th.active : th.border};
        color:${isApplied ? th.activeText : th.sub};
      }
      #__smp .close-btn { background:none; border:none; cursor:pointer; color:${th.sub}; font-size:14px; padding:0; line-height:1; }
      #__smp .tabs { display:flex; gap:2px; }
      #__smp .tab {
        flex:1; padding:6px 4px; font-size:10px; font-weight:700; letter-spacing:1px;
        border:none; background:none; cursor:pointer; color:${th.sub};
        border-bottom:2px solid transparent; transition:all .15s;
        font-family:'JetBrains Mono',monospace;
      }
      #__smp .tab.active { color:${th.accent}; border-bottom-color:${th.accent}; }
      #__smp .tab:hover { color:${th.text}; }
      #__smp .body { padding:14px; }
      #__smp .speed-display {
        text-align:center; font-size:42px; font-weight:700;
        color:${th.accent}; line-height:1; margin-bottom:12px; letter-spacing:-2px;
      }
      #__smp .speed-display span { font-size:18px; color:${th.sub}; }
      #__smp input[type=range] {
        width:100%; accent-color:${th.accent}; cursor:pointer; margin-bottom:8px;
      }
      #__smp .num-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
      #__smp .num-label { font-size:11px; color:${th.sub}; }
      #__smp input[type=number] {
        flex:1; background:${th.surface}; border:1px solid ${th.border}; border-radius:6px;
        padding:4px 8px; font-size:13px; color:${th.text}; text-align:center;
        font-family:'JetBrains Mono',monospace;
      }
      #__smp .presets-label { font-size:10px; color:${th.sub}; letter-spacing:1px; margin-bottom:6px; }
      #__smp .presets { display:flex; flex-wrap:wrap; gap:4px; margin-bottom:12px; }
      #__smp .preset-btn {
        padding:4px 8px; border-radius:5px; border:1px solid ${th.border};
        background:${th.surface}; color:${th.sub}; cursor:pointer; font-size:11px;
        font-weight:700; transition:all .15s; font-family:'JetBrains Mono',monospace;
      }
      #__smp .preset-btn:hover { background:${th.accent}; color:${th.bg}; border-color:${th.accent}; }
      #__smp .action-btns { display:flex; gap:6px; }
      #__smp .btn-apply {
        flex:2; padding:8px; border-radius:7px; border:none;
        background:${th.accent}; color:${th.bg}; cursor:pointer;
        font-size:12px; font-weight:700; letter-spacing:1px;
        font-family:'JetBrains Mono',monospace; transition:opacity .15s;
      }
      #__smp .btn-apply:hover { opacity:.85; }
      #__smp .btn-reset {
        flex:1; padding:8px; border-radius:7px; border:1px solid ${th.border};
        background:${th.surface}; color:${th.sub}; cursor:pointer;
        font-size:12px; font-weight:700; font-family:'JetBrains Mono',monospace;
      }
      #__smp .btn-reset:hover { border-color:${th.accent}; color:${th.text}; }
      #__smp .theme-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
      #__smp .theme-card {
        padding:8px 10px; border-radius:8px; border:1px solid ${th.border};
        background:${th.surface}; cursor:pointer; font-size:11px; font-weight:700;
        color:${th.sub}; transition:all .15s; font-family:'JetBrains Mono',monospace;
      }
      #__smp .theme-card:hover, #__smp .theme-card.active { border-color:${th.accent}; color:${th.text}; }
      #__smp .lang-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
      #__smp .lang-card {
        padding:7px 10px; border-radius:8px; border:1px solid ${th.border};
        background:${th.surface}; cursor:pointer; font-size:11px; font-weight:700;
        color:${th.sub}; transition:all .15s; font-family:'JetBrains Mono',monospace;
      }
      #__smp .lang-card:hover, #__smp .lang-card.active { border-color:${th.accent}; color:${th.text}; }
      #__smp .note { font-size:10px; color:${th.sub}; margin-top:12px; line-height:1.5; border-top:1px solid ${th.border}; padding-top:10px; }
      #__smp .resize-hint { font-size:9px; color:${th.border}; text-align:right; margin-top:6px; }
    </style>

    <div class="header" id="__smp_drag">
      <div class="title-row">
        <div class="title">⚡ SPEEDMASTER</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="status-pill">${isApplied ? t.active : t.inactive}</div>
          <button class="close-btn" id="__smp_close">✕</button>
        </div>
      </div>
      <div class="tabs">
        <button class="tab ${activeTab==='speed'?'active':''}" data-tab="speed">${t.tab_speed}</button>
        <button class="tab ${activeTab==='theme'?'active':''}" data-tab="theme">${t.tab_theme}</button>
        <button class="tab ${activeTab==='lang'?'active':''}" data-tab="lang">${t.tab_lang}</button>
      </div>
    </div>

    <div class="body">
      ${activeTab === 'speed' ? `
        <div class="speed-display" id="__smp_big">${speed}<span>×</span></div>
        <input type="range" id="__smp_range" min="0.1" max="1000" step="0.1" value="${speed}">
        <div class="num-row">
          <span class="num-label">${t.speed}:</span>
          <input type="number" id="__smp_num" min="0.1" max="1000" step="0.1" value="${speed}">
        </div>
        <div class="presets-label">${t.presets}</div>
        <div class="presets">
          ${[0.5,1,2,3,5,10,16,50,100,500,1000].map(v=>`<button class="preset-btn" data-v="${v}">${v}×</button>`).join('')}
        </div>
        <div class="action-btns">
          <button class="btn-apply" id="__smp_apply">${t.apply}</button>
          <button class="btn-reset" id="__smp_reset">${t.reset}</button>
        </div>
        <div class="note">${t.note}</div>
      ` : ''}
      ${activeTab === 'theme' ? `
        <div class="presets-label" style="margin-bottom:10px;">COLOR MODE</div>
        <div class="theme-grid">
          ${Object.entries(THEMES).map(([k,v])=>`
            <div class="theme-card ${theme===k?'active':''}" data-theme="${k}">${v.name}</div>
          `).join('')}
        </div>
        <div class="resize-hint">↔ drag corner to resize</div>
      ` : ''}
      ${activeTab === 'lang' ? `
        <div class="presets-label" style="margin-bottom:10px;">LANGUAGE</div>
        <div class="lang-grid">
          ${Object.entries(LANGS).map(([k,v])=>`
            <div class="lang-card ${lang===k?'active':''}" data-lang="${k}">${v.name}</div>
          `).join('')}
        </div>
      ` : ''}
    </div>
    `;

    bindEvents();
    makeDraggable();
  }

  // ── Speed logic ───────────────────────────────────────────────────────────
  function applySpeed(s) {
    speed = Math.min(1000, Math.max(0.1, parseFloat(s) || 1));
    lastReal = null;
    offset = 0;
    isApplied = true;

    window.requestAnimationFrame = cb => _raf(ts => {
      if (lastReal === null) lastReal = ts;
      offset += (ts - lastReal) * (speed - 1);
      lastReal = ts;
      cb(ts + offset);
    });
    performance.now = () => _perfNow() + offset;
    const t0real = _dateNow();
    Date.now = () => t0real + Math.floor((_dateNow() - t0real) * speed);
    window.setTimeout  = (fn, ms, ...a) => _sto(fn, (ms||0)/speed, ...a);
    window.setInterval = (fn, ms, ...a) => _si(fn,  (ms||0)/speed, ...a);
    document.querySelectorAll('video,audio').forEach(el => {
      try { el.playbackRate = Math.min(speed, 16); } catch(e) {}
    });
    console.log(`[SpeedMaster] ${speed}× applied`);
    render();
  }

  function doReset() {
    window.requestAnimationFrame = _raf;
    performance.now = _perfNow;
    Date.now = _dateNow;
    window.setTimeout = _sto;
    window.setInterval = _si;
    document.querySelectorAll('video,audio').forEach(el => {
      try { el.playbackRate = 1; } catch(e) {}
    });
    speed = 1; lastReal = null; offset = 0; isApplied = false;
    console.log('[SpeedMaster] Reset');
    render();
  }

  // ── Bind events ───────────────────────────────────────────────────────────
  function bindEvents() {
    // Tabs
    wrap.querySelectorAll('.tab').forEach(t => {
      t.addEventListener('click', () => { activeTab = t.dataset.tab; render(); });
    });

    // Close
    wrap.querySelector('#__smp_close')?.addEventListener('click', () => {
      doReset(); wrap.remove();
    });

    if (activeTab === 'speed') {
      const rangeEl = wrap.querySelector('#__smp_range');
      const numEl   = wrap.querySelector('#__smp_num');
      const bigEl   = wrap.querySelector('#__smp_big');

      function syncVal(v) {
        speed = Math.min(1000, Math.max(0.1, parseFloat(v)||1));
        if (rangeEl) rangeEl.value = Math.min(1000, speed);
        if (numEl)   numEl.value   = speed;
        if (bigEl)   bigEl.innerHTML = speed + '<span>×</span>';
      }

      rangeEl?.addEventListener('input', () => syncVal(rangeEl.value));
      numEl?.addEventListener('input',   () => syncVal(numEl.value));

      wrap.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => applySpeed(parseFloat(btn.dataset.v)));
      });

      wrap.querySelector('#__smp_apply')?.addEventListener('click', () => applySpeed(speed));
      wrap.querySelector('#__smp_reset')?.addEventListener('click', doReset);
    }

    if (activeTab === 'theme') {
      wrap.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => { theme = card.dataset.theme; render(); });
      });
    }

    if (activeTab === 'lang') {
      wrap.querySelectorAll('.lang-card').forEach(card => {
        card.addEventListener('click', () => { lang = card.dataset.lang; render(); });
      });
    }
  }

  // ── Draggable ─────────────────────────────────────────────────────────────
  function makeDraggable() {
    const handle = wrap.querySelector('#__smp_drag');
    if (!handle) return;
    let ox=0, oy=0, startX=0, startY=0;

    handle.addEventListener('mousedown', e => {
      if (e.target.closest('button, .tab')) return;
      e.preventDefault();
      const rect = wrap.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      ox = rect.left; oy = rect.top;
      wrap.style.right = 'auto';

      function move(e) {
        wrap.style.left = (ox + e.clientX - startX) + 'px';
        wrap.style.top  = (oy + e.clientY - startY) + 'px';
      }
      function up() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }

  render();
  console.log('[SpeedMaster Pro+] Ready! Tabs · Themes · Languages · Draggable · Resizable');
})();
