(() => {
  document.getElementById('__smp')?.remove();

  let speed = 1;
  let isActive = false;
  let opts = { media: true, css: true, timers: true, raf: true };
  let _origRAF, _origDate, _rafActive = false, _timerActive = false;
  let _startReal;

  const ui = document.createElement('div');
  ui.id = '__smp';
  ui.innerHTML = `
    <style>
      #__smp {
        position: fixed; top: 18px; right: 18px; z-index: 2147483647;
        background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,.22);
        font: 14px/1.5 system-ui, sans-serif; color: #111; width: 300px;
        padding: 16px 18px 14px; user-select: none; cursor: move;
      }
      #__smp h2 { margin: 0 0 12px; font-size: 15px; font-weight: 700; display:flex; justify-content:space-between; align-items:center; pointer-events: none; }
      #__smp label { display:block; font-size:12px; color:#555; margin-bottom:4px; pointer-events: none; }
      #__smp .row { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
      #__smp input, #__smp button, #__smp .section { pointer-events: auto; cursor: default; }
      #__smp input[type=range] { flex:1; accent-color:#1a73e8; cursor: pointer; }
      #__smp input[type=number] { width:65px; border:1px solid #ccc; border-radius:6px; padding:3px 6px; font-size:13px; text-align:center; }
      #__smp .speed-label { font-size:20px; font-weight:700; color:#1a73e8; margin:4px 0 10px; pointer-events: none; }
      #__smp .presets { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:10px; }
      #__smp .presets button { flex:1; min-width:40px; padding:4px; border-radius:6px; border:1px solid #ddd; background:#f5f5f5; cursor:pointer; font-size:12px; font-weight:600; }
      #__smp .presets button:hover { background:#1a73e8; color:#fff; border-color:#1a73e8; }
      #__smp .section { border:1px solid #e0e0e0; border-radius:8px; padding:10px 12px; margin-bottom:12px; }
      #__smp .section h3 { margin:0 0 8px; font-size:12px; color:#555; font-weight:600; }
      #__smp .cb-row { display:flex; align-items:center; gap:7px; margin-bottom:5px; font-size:13px; }
      #__smp .cb-row:last-child { margin-bottom:0; }
      #__smp .cb-row input { accent-color:#1a73e8; width:15px; height:15px; cursor: pointer; }
      #__smp .btns { display:flex; gap:8px; margin-bottom:10px; }
      #__smp button { flex:1; padding:7px; border-radius:7px; border:1px solid #ccc; background:#f5f5f5; cursor:pointer; font-size:13px; font-weight:600; transition: background .15s; }
      #__smp button:hover { background:#e8e8e8; }
      #__smp button#__smp_apply { background:#1a73e8; color:#fff; border-color:#1a73e8; }
      #__smp button#__smp_apply:hover { background:#1558b0; }
      #__smp .status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; background: #ccc; margin-right: 5px; }
      #__smp .status-on { background: #4caf50; box-shadow: 0 0 5px #4caf50; }
      #__smp .note { font-size:11px; color:#888; line-height:1.4; pointer-events: none; }
      #__smp .close-btn { background:none; border:none; cursor:pointer; font-size:16px; color:#888; padding:0; flex:0; pointer-events: auto !important; }
      #__smp .ac-btn-on { background:#4caf50 !important; color:#fff !important; border-color:#4caf50 !important; }
    </style>
    <h2>
      <span><span id="__smp_dot" class="status-dot"></span>⚡ SpeedMaster Pro</span>
      <button class="close-btn" id="__smp_close">✕</button>
    </h2>
    <label>Speed (Press 'N' to Toggle)</label>
    <div class="row">
      <input type="range" id="__smp_range" min="0.1" max="1000" step="0.1" value="1">
      <input type="number" id="__smp_num" min="0.1" max="1000" step="0.1" value="1">
    </div>
    <div class="speed-label" id="__smp_lbl">1×</div>
    <div class="presets">
      <button data-v="1">1×</button>
      <button data-v="2">2×</button>
      <button data-v="5">5×</button>
      <button data-v="10">10×</button>
      <button data-v="50">50×</button>
      <button data-v="100">100×</button>
      <button data-v="500">500×</button>
      <button data-v="1000">1000×</button>
    </div>
    <div class="section">
      <h3>What to speed up</h3>
      <div class="cb-row"><input type="checkbox" id="cb_media" checked> <label for="cb_media">Video/Audio</label></div>
      <div class="cb-row"><input type="checkbox" id="cb_css" checked> <label for="cb_css">CSS Animations</label></div>
      <div class="cb-row"><input type="checkbox" id="cb_timers" checked> <label for="cb_timers">Timers (setTimeout/setInterval)</label></div>
      <div class="cb-row"><input type="checkbox" id="cb_raf" checked> <label for="cb_raf">Games (rAF + time)</label></div>
    </div>
    <div class="btns">
      <button id="__smp_apply">Apply / Turn ON</button>
      <button id="__smp_reset">Reset / Turn OFF</button>
    </div>
    <div class="btns">
      <button id="__smp_ac">🖱 Auto-Clicker OFF</button>
    </div>
    <div class="note">Press <b>N</b> to toggle speed. Auto-clicker is independent.</div>
  `;
  document.body.appendChild(ui);

  // --- DRAG LOGIC ---
  let isDragging = false, offsetX, offsetY;
  ui.addEventListener('mousedown', (e) => {
    if (e.target !== ui && e.target.tagName !== 'H2' && e.target.className !== 'speed-label' && e.target.tagName !== 'SPAN') return;
    isDragging = true;
    offsetX = e.clientX - ui.getBoundingClientRect().left;
    offsetY = e.clientY - ui.getBoundingClientRect().top;
    ui.style.right = 'auto';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    ui.style.left = (e.clientX - offsetX) + 'px';
    ui.style.top = (e.clientY - offsetY) + 'px';
  });
  document.addEventListener('mouseup', () => isDragging = false);

  const byId = id => document.getElementById(id);
  const range = byId('__smp_range');
  const num   = byId('__smp_num');
  const lbl   = byId('__smp_lbl');
  const dot   = byId('__smp_dot');

  function syncUI(v) {
    speed = Math.min(1000, Math.max(0.1, parseFloat(v) || 1));
    range.value = speed;
    num.value   = speed;
    lbl.textContent = speed + '×';
  }
  range.addEventListener('input', () => syncUI(range.value));
  num.addEventListener('input',   () => syncUI(num.value));

  document.querySelectorAll('#__smp .presets button').forEach(btn => {
    btn.addEventListener('click', () => { syncUI(btn.dataset.v); applySpeed(); });
  });

  function applySpeed() {
    isActive = true;
    dot.classList.add('status-on');
    opts = {
      media:  byId('cb_media').checked,
      css:    byId('cb_css').checked,
      timers: byId('cb_timers').checked,
      raf:    byId('cb_raf').checked,
    };

    if (opts.media) {
      document.querySelectorAll('video, audio').forEach(el => {
        try { el.playbackRate = Math.min(speed, 16); } catch(e) {}
      });
      if (!window.__smpObserver) {
        window.__smpObserver = new MutationObserver(muts => {
          muts.forEach(m => m.addedNodes.forEach(n => {
            if (n.tagName === 'VIDEO' || n.tagName === 'AUDIO') {
              try { n.playbackRate = Math.min(speed, 16); } catch(e) {}
            }
          }));
        });
        window.__smpObserver.observe(document.body, { childList: true, subtree: true });
      }
    }

    if (opts.css) {
      let styleEl = document.getElementById('__smp_css') || document.createElement('style');
      styleEl.id = '__smp_css';
      styleEl.textContent = `*, *::before, *::after { animation-duration: calc(var(--smp-d,1s) / ${speed}) !important; animation-delay: calc(var(--smp-delay,0s) / ${speed}) !important; transition-duration: calc(var(--smp-t,0.3s) / ${speed}) !important; }`;
      document.head.appendChild(styleEl);
    }

    if (opts.timers && !_timerActive) {
      _timerActive = true;
      const _origSTO = window.setTimeout;
      const _origSI  = window.setInterval;
      window.setTimeout  = (fn, ms, ...a) => _origSTO(fn, (ms || 0) / speed, ...a);
      window.setInterval = (fn, ms, ...a) => _origSI(fn,  (ms || 0) / speed, ...a);
      window.__smpRestoreTimers = () => {
        window.setTimeout  = _origSTO;
        window.setInterval = _origSI;
        _timerActive = false;
      };
    }

    if (opts.raf && !_rafActive) {
      _rafActive = true;
      _startReal = performance.now();
      _origRAF   = window.requestAnimationFrame;
      _origDate  = Date.now;
      let _virt  = _startReal;

      window.requestAnimationFrame = cb => _origRAF(realTs => {
        _virt += (realTs - _startReal) * speed;
        _startReal = realTs;
        cb(_virt);
      });
      Date.now = () => Math.floor(_origDate() * speed);

      window.__smpRestoreRAF = () => {
        window.requestAnimationFrame = _origRAF;
        Date.now = _origDate;
        _rafActive = false;
      };
    }

    lbl.style.color = speed !== 1 ? '#e53935' : '#1a73e8';
    console.log(`[SpeedMaster Pro] ON - ${speed}×`);
  }

  function resetSpeed() {
    isActive = false;
    dot.classList.remove('status-on');
    document.querySelectorAll('video, audio').forEach(el => {
      try { el.playbackRate = 1; } catch(e) {}
    });
    document.getElementById('__smp_css')?.remove();
    window.__smpRestoreTimers?.();
    window.__smpRestoreRAF?.();
    window.__smpObserver?.disconnect();
    delete window.__smpObserver;
    lbl.style.color = '#1a73e8';
    console.log('[SpeedMaster Pro] OFF - Speed kept at ' + speed + '×');
  }

  // --- KEYBOARD TOGGLE (N key = speed only, does NOT affect auto-clicker) ---
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.toLowerCase() === 'n') {
      if (isActive) resetSpeed();
      else applySpeed();
    }
  });

  byId('__smp_apply').addEventListener('click', applySpeed);
  byId('__smp_reset').addEventListener('click', resetSpeed);
  byId('__smp_close').addEventListener('click', () => {
    resetSpeed();
    stopAC();
    ui.remove();
  });

  // --- AUTO-CLICKER (completely independent of N key / speed) ---
  let acActive = false;
  let acTimer = null;

  function startAC() {
    acActive = true;
    byId('__smp_ac').textContent = '🖱 Auto-Clicker ON';
    byId('__smp_ac').classList.add('ac-btn-on');

    acTimer = setInterval(() => {
      // Try canvas first, fall back to document center
      const target = document.querySelector('canvas') ||
                     document.querySelector('#unity-canvas') ||
                     document.elementFromPoint(window.innerWidth/2, window.innerHeight/2);
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      ['mousedown', 'mouseup', 'click'].forEach(type => {
        target.dispatchEvent(new MouseEvent(type, {
          bubbles: true, cancelable: true,
          view: window,
          clientX: cx, clientY: cy,
          screenX: cx, screenY: cy,
          button: 0, buttons: 1
        }));
      });
    }, 10); // 10ms = 100 clicks/sec
    console.log('[SpeedMaster Pro] Auto-Clicker ON — 100 CPS');
  }

  function stopAC() {
    acActive = false;
    clearInterval(acTimer);
    acTimer = null;
    byId('__smp_ac').textContent = '🖱 Auto-Clicker OFF';
    byId('__smp_ac').classList.remove('ac-btn-on');
    console.log('[SpeedMaster Pro] Auto-Clicker OFF');
  }

  byId('__smp_ac').addEventListener('click', () => acActive ? stopAC() : startAC());

  console.log('[SpeedMaster Pro] Loaded ✓ — N = speed toggle, Auto-Clicker button is independent!');
})();
