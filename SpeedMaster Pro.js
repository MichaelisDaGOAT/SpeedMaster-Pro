(() => {
  document.getElementById('__smp')?.remove();

  let speed = 1;
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
        padding: 16px 18px 14px; user-select: none;
      }
      #__smp h2 { margin: 0 0 12px; font-size: 15px; font-weight: 700; display:flex; justify-content:space-between; align-items:center; }
      #__smp label { display:block; font-size:12px; color:#555; margin-bottom:4px; }
      #__smp .row { display:flex; align-items:center; gap:8px; margin-bottom:4px; }
      #__smp input[type=range] { flex:1; accent-color:#1a73e8; }
      #__smp input[type=number] { width:65px; border:1px solid #ccc; border-radius:6px; padding:3px 6px; font-size:13px; text-align:center; }
      #__smp .speed-label { font-size:20px; font-weight:700; color:#1a73e8; margin:4px 0 10px; }
      #__smp .presets { display:flex; gap:5px; flex-wrap:wrap; margin-bottom:10px; }
      #__smp .presets button { flex:1; min-width:40px; padding:4px; border-radius:6px; border:1px solid #ddd; background:#f5f5f5; cursor:pointer; font-size:12px; font-weight:600; }
      #__smp .presets button:hover { background:#1a73e8; color:#fff; border-color:#1a73e8; }
      #__smp .section { border:1px solid #e0e0e0; border-radius:8px; padding:10px 12px; margin-bottom:12px; }
      #__smp .section h3 { margin:0 0 8px; font-size:12px; color:#555; font-weight:600; }
      #__smp .cb-row { display:flex; align-items:center; gap:7px; margin-bottom:5px; font-size:13px; }
      #__smp .cb-row:last-child { margin-bottom:0; }
      #__smp .cb-row input { accent-color:#1a73e8; width:15px; height:15px; }
      #__smp .btns { display:flex; gap:8px; margin-bottom:10px; }
      #__smp button { flex:1; padding:7px; border-radius:7px; border:1px solid #ccc; background:#f5f5f5; cursor:pointer; font-size:13px; font-weight:600; transition: background .15s; }
      #__smp button:hover { background:#e8e8e8; }
      #__smp button#__smp_apply { background:#1a73e8; color:#fff; border-color:#1a73e8; }
      #__smp button#__smp_apply:hover { background:#1558b0; }
      #__smp .note { font-size:11px; color:#888; line-height:1.4; }
      #__smp .close-btn { background:none; border:none; cursor:pointer; font-size:16px; color:#888; padding:0; flex:0; }
    </style>
    <h2>⚡ SpeedMaster Pro <button class="close-btn" id="__smp_close">✕</button></h2>
    <label>Speed</label>
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
      <button id="__smp_apply">Apply</button>
      <button id="__smp_reset">Reset</button>
    </div>
    <div class="note">Paste on MSN index page FIRST, then navigate to the game. Higher speeds may cause instability.</div>
  `;
  document.body.appendChild(ui);

  const byId = id => document.getElementById(id);
  const range = byId('__smp_range');
  const num   = byId('__smp_num');
  const lbl   = byId('__smp_lbl');

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
      let styleEl = document.getElementById('__smp_css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = '__smp_css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `*, *::before, *::after { animation-duration: calc(var(--smp-d,1s) / ${speed}) !important; animation-delay: calc(var(--smp-delay,0s) / ${speed}) !important; transition-duration: calc(var(--smp-t,0.3s) / ${speed}) !important; }`;
    } else {
      document.getElementById('__smp_css')?.remove();
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
    } else if (!opts.timers && _timerActive) {
      window.__smpRestoreTimers?.();
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
    } else if (!opts.raf && _rafActive) {
      window.__smpRestoreRAF?.();
    }

    lbl.textContent = speed + '×';
    lbl.style.color = speed !== 1 ? '#e53935' : '#1a73e8';
    console.log(`[SpeedMaster Pro] ${speed}× applied`);
  }

  function resetSpeed() {
    syncUI(1);
    document.querySelectorAll('video, audio').forEach(el => {
      try { el.playbackRate = 1; } catch(e) {}
    });
    document.getElementById('__smp_css')?.remove();
    window.__smpRestoreTimers?.();
    window.__smpRestoreRAF?.();
    window.__smpObserver?.disconnect();
    delete window.__smpObserver;
    lbl.style.color = '#1a73e8';
    console.log('[SpeedMaster Pro] Reset to 1×');
  }

  byId('__smp_apply').addEventListener('click', applySpeed);
  byId('__smp_reset').addEventListener('click', resetSpeed);
  byId('__smp_close').addEventListener('click', () => { resetSpeed(); ui.remove(); });

  console.log('[SpeedMaster Pro] Loaded ✓ — max 1000× enabled!');
})();
