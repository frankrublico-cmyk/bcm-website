/* BCM FX (lightweight). <script src="bcm-fx.js" defer></script>  (data-lite = minimal). Effects can be switched off with the ✨ button. */
(function () {
  var script = document.currentScript;
  var LITE = script && script.hasAttribute('data-lite');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  var small = Math.min(innerWidth, innerHeight) < 600;
  var weak = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  var off = false; try { off = localStorage.getItem('bcm_fx') === 'off'; } catch (e) {}
  var isHome = /(^|\/)(index\.html)?$/i.test(location.pathname);

  /* ---- performance fixes for ALL pages (always on): remove the expensive stuff ---- */
  var base = document.createElement('style');
  base.textContent = [
    '*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
    '.bg-overlay{filter:none!important}',
    '.aninipot-container,.box-aninipot-container{display:none!important}',
    '@keyframes gamingRGB{0%{color:#ff3333}20%{color:#33ff33}40%{color:#5577ff}60%{color:#cc33ff}80%{color:#ffff33}100%{color:#ff3333}}',
    'nav a::before,.victory-btn::before,.tg-btn::before{animation:none!important}',
    'nav,#topNav{position:sticky;top:0;z-index:500}',
    '#fx-prog{position:fixed;top:0;left:0;height:3px;width:100%;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#00d2ff,#39ff14,#d4af37,#ff4d4d,#ff007f);z-index:9999;pointer-events:none}',
    '#fx-wipe{position:fixed;inset:0;z-index:99999;pointer-events:none;background:linear-gradient(115deg,#06080c 0 40%,#ff4d4d 49%,#d4af37 51%,#06080c 60% 100%);transform:translateX(-110%)}',
    '#fx-wipe.out{transition:transform .3s cubic-bezier(.7,0,.3,1);transform:translateX(0)}',
    '#fx-wipe.in{transform:translateX(0);animation:fxwin .4s cubic-bezier(.7,0,.3,1) forwards}',
    '@keyframes fxwin{to{transform:translateX(110%)}}',
    '#fx-toggle{position:fixed;left:12px;bottom:12px;z-index:9000;background:rgba(13,17,26,.92);color:#d4af37;border:1px solid rgba(212,175,55,.5);border-radius:20px;padding:7px 13px;font-size:12px;font-weight:700;cursor:pointer;font-family:Outfit,sans-serif}'
  ].join('\n');
  document.head.appendChild(base);

  function mk(tag, id) { var e = document.createElement(tag); if (id) e.id = id; return e; }

  /* ---- scroll progress (cheap: transform only) ---- */
  var prog = mk('div', 'fx-prog'); document.body.appendChild(prog);
  var ticking = false;
  addEventListener('scroll', function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
      ticking = false;
    });
  }, { passive: true });

  /* ---- page wipe ---- */
  var wipe = mk('div', 'fx-wipe'); document.body.appendChild(wipe);
  if (!reduce && !off) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash)) return;
      e.preventDefault(); wipe.className = 'out';
      setTimeout(function () { location.href = a.href; }, 300);
    });
    wipe.className = 'in'; setTimeout(function () { wipe.className = ''; }, 420);
    addEventListener('pageshow', function (e) { if (e.persisted) wipe.className = ''; });
  }

  if (LITE) return;

  /* ---- ON/OFF button ---- */
  var tg = mk('button', 'fx-toggle'); tg.textContent = off ? '✨ Effects: OFF' : '✨ Effects: ON';
  tg.onclick = function () { try { localStorage.setItem('bcm_fx', off ? 'on' : 'off'); } catch (e) {} location.reload(); };
  document.body.appendChild(tg);
  if (off || reduce) return;

  var fx = document.createElement('style');
  fx.textContent = [
    '.fx-rev{opacity:0;transform:translateY(26px);transition:opacity .6s ease,transform .6s cubic-bezier(.2,.8,.2,1);transition-delay:var(--fx-d,0s)}',
    '.fx-rev.fx-in{opacity:1;transform:none}',
    '.fx-border{box-shadow:0 0 0 1px rgba(212,175,55,.35),0 0 18px rgba(255,77,77,.25)!important}',
    'h1.fx-glitch{position:relative}',
    'h1.fx-glitch::before,h1.fx-glitch::after{content:attr(data-text);position:absolute;left:0;top:0;width:100%;opacity:0;pointer-events:none}',
    'h1.fx-glitch.go::before{opacity:.85;color:#00d2ff;animation:fxg1 .4s steps(2) 1;clip-path:inset(0 0 55% 0)}',
    'h1.fx-glitch.go::after{opacity:.85;color:#ff007f;animation:fxg2 .4s steps(2) 1;clip-path:inset(50% 0 0 0)}',
    '@keyframes fxg1{0%{transform:translate(-6px,-2px)}50%{transform:translate(5px,2px)}100%{transform:translate(0)}}',
    '@keyframes fxg2{0%{transform:translate(6px,2px)}50%{transform:translate(-5px,-2px)}100%{transform:translate(0)}}',
    '#fx-canvas{position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none}',
    '#fx-splash{position:fixed;inset:0;z-index:100000;background:#06080c;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;transition:opacity .6s ease,visibility .6s}',
    '#fx-splash.hide{opacity:0;visibility:hidden}',
    '#fx-splash .lg{position:relative;width:140px;height:140px;display:flex;align-items:center;justify-content:center}',
    '#fx-splash img{width:120px;height:auto;position:relative;z-index:2;animation:fxpop .9s cubic-bezier(.2,1.4,.3,1) both}',
    '#fx-splash .rg{position:absolute;inset:0;border-radius:50%;border:3px solid #ff4d4d;animation:fxring 1.5s ease-out infinite}',
    '#fx-splash .rg.b{animation-delay:.5s;border-color:#d4af37}',
    '#fx-splash .tx{font-family:Orbitron,sans-serif;font-weight:900;letter-spacing:5px;color:#d4af37;font-size:clamp(13px,3.6vw,20px);text-align:center}',
    '#fx-splash .ln{width:min(260px,60vw);height:4px;background:#1e293b;border-radius:4px;overflow:hidden}',
    '#fx-splash .ln i{display:block;height:100%;width:0;background:linear-gradient(90deg,#00d2ff,#39ff14,#d4af37,#ff4d4d);animation:fxload 1.3s ease-in-out forwards}',
    '@keyframes fxpop{0%{transform:scale(.2) rotate(-25deg);opacity:0}100%{transform:none;opacity:1}}',
    '@keyframes fxring{0%{transform:scale(.6);opacity:.9}100%{transform:scale(2.3);opacity:0}}',
    '@keyframes fxload{to{width:100%}}'
  ].join('\n');
  document.head.appendChild(fx);

  /* ---- splash (Home, once per session) ---- */
  if (isHome) {
    var seen = false; try { seen = sessionStorage.getItem('bcm_splash'); } catch (e) {}
    if (!seen) {
      var sp = mk('div', 'fx-splash');
      sp.innerHTML = '<div class="lg"><span class="rg"></span><span class="rg b"></span><img src="bcm.png" alt=""></div><div class="tx">BREAKING CHAIN MINISTRY</div><div class="ln"><i></i></div>';
      document.body.appendChild(sp);
      var close = function () { sp.classList.add('hide'); setTimeout(function () { sp.remove(); }, 700); };
      sp.addEventListener('click', close); setTimeout(close, 1500);
      try { sessionStorage.setItem('bcm_splash', '1'); } catch (e) {}
    }
  }

  /* ---- reveal on scroll (opacity + transform only) ---- */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (en.isIntersecting) { var t = en.target; t.classList.add('fx-in'); io.unobserve(t); setTimeout(function () { t.classList.remove('fx-rev', 'fx-in'); }, 900); }
    });
  }, { threshold: 0.1 }) : null;
  function decorate() {
    var n = 0;
    document.querySelectorAll('.list-item,.schedule-item,.verse,.contact,.slideshow-frame,.bf-card,.logo-container,.victory-btn').forEach(function (el) {
      if (el.dataset.fx) return; el.dataset.fx = 1;
      if (io) { el.classList.add('fx-rev'); el.style.setProperty('--fx-d', (n++ % 3) * 0.07 + 's'); io.observe(el); }
      if (/list-item|schedule-item|verse|contact/.test(el.className)) el.classList.add('fx-border');
    });
  }
  decorate();
  var feed = document.getElementById('bcm-feed');
  if (feed) { var tm; new MutationObserver(function () { clearTimeout(tm); tm = setTimeout(decorate, 100); }).observe(feed, { childList: true, subtree: true }); }

  var h1 = document.querySelector('h1');
  if (h1) {
    h1.classList.add('fx-glitch'); h1.setAttribute('data-text', h1.textContent);
    setInterval(function () { if (document.hidden) return; h1.classList.add('go'); setTimeout(function () { h1.classList.remove('go'); }, 400); }, 6000);
  }

  /* ---- embers canvas: pre-rendered sprites (no shadowBlur), auto-disables if the device is slow ---- */
  if (weak) return;
  var cv = mk('canvas', 'fx-canvas'); document.body.appendChild(cv);
  var cx = cv.getContext('2d'), W = 0, H = 0, P = [], S = [];
  var COLORS = ['255,77,77', '212,175,55', '0,210,255', '57,255,20', '157,0,255'];
  var sprites = COLORS.map(function (c) {
    var s = document.createElement('canvas'); s.width = s.height = 32; var g = s.getContext('2d');
    var gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    gr.addColorStop(0, 'rgba(' + c + ',1)'); gr.addColorStop(.35, 'rgba(' + c + ',.55)'); gr.addColorStop(1, 'rgba(' + c + ',0)');
    g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return s;
  });
  var N = small ? 12 : 22;
  function size() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
  size(); addEventListener('resize', size);
  function ember(init) {
    return { x: Math.random() * W, y: init ? Math.random() * H : H + 10, d: Math.random() * 14 + 8,
      vy: Math.random() * .5 + .25, vx: (Math.random() - .5) * .3, i: Math.random() * sprites.length | 0, a: Math.random() * .5 + .4, ph: Math.random() * 6.28 };
  }
  for (var i = 0; i < N; i++) P.push(ember(true));
  addEventListener('pointerdown', function (e) {
    for (var k = 0; k < (small ? 8 : 14); k++) {
      var an = Math.random() * 6.28, sp = Math.random() * 4 + 1.5;
      S.push({ x: e.clientX, y: e.clientY, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 1, i: Math.random() * sprites.length | 0 });
    }
  }, { passive: true });
  var running = true, last = 0, frames = 0, slow = 0, t0 = 0;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) requestAnimationFrame(loop); });
  function stop() { running = false; cv.remove(); }
  function loop(t) {
    if (!running) return;
    var dt = t - last;
    if (dt < 33) { requestAnimationFrame(loop); return; } /* ~30fps cap */
    /* adaptive: if the first ~2 seconds are slow, switch the canvas off for good */
    if (frames > 8 && frames < 70) { if (dt > 60) slow++; if (slow > 14) { stop(); return; } }
    frames++; last = t;
    cx.clearRect(0, 0, W, H);
    for (var i = 0; i < P.length; i++) {
      var p = P[i]; p.y -= p.vy; p.x += p.vx + Math.sin(t / 900 + p.ph) * .3;
      if (p.y < -20) { P[i] = ember(false); continue; }
      cx.globalAlpha = p.a * (.65 + .35 * Math.sin(t / 500 + p.ph));
      cx.drawImage(sprites[p.i], p.x, p.y, p.d, p.d);
    }
    for (var j = S.length - 1; j >= 0; j--) {
      var s = S[j]; s.x += s.vx; s.y += s.vy; s.vy += .08; s.vx *= .97; s.life -= .035;
      if (s.life <= 0) { S.splice(j, 1); continue; }
      cx.globalAlpha = s.life; cx.drawImage(sprites[s.i], s.x, s.y, 18 * s.life + 4, 18 * s.life + 4);
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
