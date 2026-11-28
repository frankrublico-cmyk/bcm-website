/* BCM Posts & Videos feed. Put <div id="bcm-feed"></div> + <script src="bcm-media.js"></script> on any page. */
(function () {
  var API = '/api/media';
  var root = document.getElementById('bcm-feed');
  if (!root) return;

  var css = document.createElement('style');
  css.textContent = [
    '#bcm-feed{margin:30px 0;text-align:left}',
    '.bf-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;align-items:start}',
    '.bf-card{background:rgba(11,15,23,.9);border:1px solid rgba(255,77,77,.25);border-radius:12px;overflow:hidden;box-shadow:0 4px 18px rgba(0,0,0,.55);position:relative}',
    '.bf-media{width:100%;background:#000;display:block;position:relative}',
    '.bf-media.land{aspect-ratio:16/9}.bf-media.port{aspect-ratio:4/5}.bf-media.sq{aspect-ratio:1/1}',
    '.bf-media img,.bf-media video{width:100%;height:100%;object-fit:contain;display:block;cursor:zoom-in}',
    '.bf-media video{cursor:auto}',
    '.bf-cap{padding:12px 14px;color:#e2e8f0;font-size:15px;line-height:1.5;white-space:pre-wrap;word-break:break-word}',
    '.bf-del{position:absolute;top:8px;right:8px;z-index:3;background:#b00020;color:#fff;border:0;border-radius:8px;padding:8px 12px;font-weight:700;cursor:pointer;box-shadow:0 0 10px rgba(0,0,0,.6)}',
    '.bf-empty,.bf-msg{color:#a0aec0;text-align:center;padding:24px}',
    '.bf-admin-link{display:block;margin:26px auto 0;background:none;border:1px solid rgba(255,255,255,.2);color:#a0aec0;border-radius:20px;padding:6px 16px;cursor:pointer;font-size:13px}',
    '.bf-panel{background:rgba(26,0,0,.85);border:2px solid #ff4d4d;border-radius:12px;padding:18px;margin-bottom:22px}',
    '.bf-panel h3{margin:0 0 12px;color:#ff4d4d;font-family:Orbitron,sans-serif;font-size:16px}',
    '.bf-panel input[type=text],.bf-panel textarea{width:100%;box-sizing:border-box;padding:10px;border-radius:8px;border:1px solid #475569;background:#0d111a;color:#fff;font-size:15px;margin:8px 0;font-family:inherit}',
    '.bf-panel input[type=file]{width:100%;color:#e2e8f0;margin:6px 0}',
    '.bf-btn{background:linear-gradient(135deg,#d4af37,#b8901c);color:#000;border:0;border-radius:8px;padding:11px 20px;font-weight:800;cursor:pointer;margin-right:8px}',
    '.bf-btn.alt{background:#1e293b;color:#fff}',
    '.bf-btn:disabled{opacity:.5;cursor:wait}',
    '.bf-bar{height:12px;background:#1e293b;border-radius:8px;overflow:hidden;margin-top:10px;display:none}',
    '.bf-bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,#00d2ff,#39ff14);transition:width .2s}',
    '.bf-status{margin-top:8px;font-size:14px;color:#cbd5e1}',
    '.bf-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:2;background:rgba(0,0,0,.55);color:#fff;border:0;border-radius:50%;width:38px;height:38px;font-size:22px;line-height:1;cursor:pointer}',
    '.bf-nav.prev{left:8px}.bf-nav.next{right:8px}',
    '.bf-count{position:absolute;top:8px;left:8px;z-index:2;background:rgba(0,0,0,.6);color:#fff;border-radius:12px;padding:3px 10px;font-size:12px;font-weight:700}',
    '.bf-dots{display:flex;justify-content:center;gap:6px;padding:8px 0 0}',
    '.bf-dots i{width:7px;height:7px;border-radius:50%;background:#475569;display:block}',
    '.bf-dots i.on{background:#d4af37}',
    '.bf-sel{margin:6px 0;font-size:13px;color:#cbd5e1}',
    '.bf-lb{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:5000;display:flex;align-items:center;justify-content:center;cursor:zoom-out}',
    '.bf-lb img{max-width:96vw;max-height:94vh;object-fit:contain}'
  ].join('');
  css.textContent += `
.bf-media{overflow:hidden}
.bf-sl{position:absolute;inset:0;opacity:0;pointer-events:none}
.bf-sl.on{opacity:1;pointer-events:auto;z-index:1;animation:bfIn0 .9s ease-out both}
.bf-sl.out{opacity:0;transition:opacity .9s;z-index:0}
.fx1 .bf-sl.on{animation-name:bfIn1}
.fx2 .bf-sl.on{animation-name:bfIn2}
.fx3 .bf-sl.on{animation-name:bfIn3}
@keyframes bfIn0{from{opacity:0}to{opacity:1}}
@keyframes bfIn1{from{opacity:0;transform:scale(1.35)}to{opacity:1;transform:none}}
@keyframes bfIn2{from{opacity:0;transform:translateX(14%)}to{opacity:1;transform:none}}
@keyframes bfIn3{from{opacity:0;transform:translateX(-14%) scale(1.12) rotate(-2deg)}to{opacity:1;transform:none}}
.bf-sl.on img{animation:bfKB0 9s ease-out both}
.kb1 .bf-sl.on img{animation-name:bfKB1}
@keyframes bfKB0{from{transform:scale(1)}to{transform:scale(1.09)}}
@keyframes bfKB1{from{transform:scale(1.09) translateX(2%)}to{transform:scale(1)}}
.bf-media::after{content:'';position:absolute;inset:0;z-index:3;pointer-events:none;background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.38) 50%,transparent 62%);transform:translateX(-120%)}
.bf-media.shine::after{animation:bfShine .9s ease-out}
@keyframes bfShine{from{transform:translateX(-120%)}to{transform:translateX(120%)}}
.bf-sparks{position:absolute;inset:0;z-index:3;pointer-events:none}
.bf-sparks span{position:absolute;color:#ffe08a;opacity:0;text-shadow:0 0 6px #ffd24d;animation:bfTw 2.6s ease-in-out infinite}
@keyframes bfTw{0%,100%{opacity:0;transform:scale(.4) rotate(0)}50%{opacity:1;transform:scale(1.1) rotate(45deg)}}
.bf-card{animation:bfBorder 4s ease-in-out infinite alternate}
@keyframes bfBorder{from{border-color:rgba(255,77,77,.3)}to{border-color:rgba(0,210,255,.6)}}
.bf-prog{position:absolute;left:0;bottom:0;width:100%;height:3px;z-index:4;background:linear-gradient(90deg,#00d2ff,#39ff14,#d4af37);transform-origin:left;transform:scaleX(0);pointer-events:none}
.bf-prog.run{animation:bfProg linear forwards}
@keyframes bfProg{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.bf-card:not(.vis) *,.bf-card:not(.vis){animation-play-state:paused}
.lite .bf-sl.on,.lite .bf-sl.on img,.lite .bf-card{animation:none}
.lite .bf-sparks,.lite .bf-media::after{display:none}
.noreact .bf-act,.noreact .bf-cm{display:none}
.bf-act{position:relative;display:flex;gap:8px;flex-wrap:wrap;padding:8px 12px 10px}
.bf-pill{background:#111827;border:1px solid #334155;color:#e2e8f0;border-radius:20px;padding:6px 12px;cursor:pointer;font-size:14px;display:inline-flex;gap:6px;align-items:center;font-family:inherit}
.bf-pill.on{border-color:#ff4d4d;background:rgba(255,77,77,.18)}
.bf-pill b{font-weight:700;min-width:8px}
.bf-float{position:absolute;pointer-events:none;font-size:20px;z-index:6;animation:bfFloat 1s ease-out forwards}
@keyframes bfFloat{from{opacity:1;transform:translate(0,0) scale(.8)}to{opacity:0;transform:translate(var(--dx),-80px) scale(1.4)}}
.bf-cm{padding:0 12px 12px;border-top:1px solid rgba(255,255,255,.08)}
.bf-cm-list{max-height:240px;overflow-y:auto;margin:8px 0}
.bf-cm-row{padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)}
.bf-cm-h{display:flex;gap:8px;align-items:center;font-size:13px;color:#a0aec0}
.bf-cm-h b{color:#d4af37}
.bf-cm-t{color:#e2e8f0;font-size:14px;white-space:pre-wrap;word-break:break-word;margin-top:2px}
.bf-cm-empty{color:#a0aec0;font-size:13px;padding:6px 0}
.bf-cm-x{margin-left:auto;background:#b00020;color:#fff;border:0;border-radius:6px;padding:2px 8px;font-size:12px;cursor:pointer}
.bf-cm input[type=text],.bf-cm textarea{width:100%;box-sizing:border-box;padding:8px;border-radius:8px;border:1px solid #475569;background:#0d111a;color:#fff;font-size:14px;margin:4px 0;font-family:inherit}
.bf-hp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}
`;
  css.textContent += `
.bf-more{background:none;border:0;color:#60a5fa;font:inherit;font-weight:700;cursor:pointer;padding:0}
.fx4 .bf-sl.on{animation-name:bfIn4}
.fx5 .bf-sl.on{animation-name:bfIn5}
.fx6 .bf-sl.on{animation-name:bfIn6}
.fx7 .bf-sl.on{animation-name:bfIn7}
@keyframes bfIn4{from{opacity:1;clip-path:circle(0% at 50% 50%)}to{opacity:1;clip-path:circle(80% at 50% 50%)}}
@keyframes bfIn5{from{opacity:1;clip-path:inset(0 100% 0 0)}to{opacity:1;clip-path:inset(0 0 0 0)}}
@keyframes bfIn6{from{opacity:0;transform:perspective(900px) rotateY(55deg) scale(.88)}to{opacity:1;transform:none}}
@keyframes bfIn7{from{opacity:0;transform:scale(.6) rotate(8deg);filter:brightness(2.4) saturate(1.6)}to{opacity:1;transform:none;filter:none}}
.bf-media::before{content:'';position:absolute;inset:0;z-index:3;pointer-events:none;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,.6) 100%)}
.bf-grain{position:absolute;inset:-50%;z-index:3;pointer-events:none;opacity:.09;mix-blend-mode:overlay;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");animation:bfGrain .6s steps(4) infinite}
@keyframes bfGrain{0%{transform:translate(0,0)}25%{transform:translate(-6%,4%)}50%{transform:translate(5%,-5%)}75%{transform:translate(-4%,-3%)}100%{transform:translate(0,0)}}
.bf-leak{position:absolute;inset:0;z-index:3;pointer-events:none;opacity:0;mix-blend-mode:screen;background:radial-gradient(circle at 15% 25%,rgba(255,150,40,.75),transparent 50%),radial-gradient(circle at 90% 80%,rgba(255,60,120,.55),transparent 45%)}
.bf-media.shine .bf-leak{animation:bfLeak 1.1s ease-out}
@keyframes bfLeak{0%{opacity:0}30%{opacity:1}100%{opacity:0}}
.bf-pz{position:absolute;right:10px;bottom:12px;z-index:5;background:rgba(0,0,0,.55);color:#fff;border:0;border-radius:50%;width:34px;height:34px;font-size:14px;cursor:pointer}
.bf-sl{will-change:transform,opacity}
.eco .bf-grain,.eco .bf-leak,.eco .bf-sparks,.eco .bf-media::after{display:none}
.eco .bf-media::before{display:none}
.lite .bf-grain,.lite .bf-leak,.lite .bf-media::before{display:none}
`;
  document.head.appendChild(css);

  var pw = '';
  try { pw = sessionStorage.getItem('bcm_admin') || ''; } catch (e) {}
  var admin = false;
  var allItems = [];

  // **bold** ug *italic* (luwas, walay innerHTML)
  function rich(p, t) {
    var re = /\*\*([^*]+?)\*\*|\*([^*\n]+?)\*/g, i = 0, m;
    while ((m = re.exec(t))) {
      if (m.index > i) p.appendChild(document.createTextNode(t.slice(i, m.index)));
      p.appendChild(el(m[1] != null ? 'strong' : 'em', '', m[1] != null ? m[1] : m[2]));
      i = re.lastIndex;
    }
    if (i < t.length) p.appendChild(document.createTextNode(t.slice(i)));
  }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function api(body, url) {
    return fetch(url || API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Error'); return j; }); });
  }

  function optimized(it) {
    var u = it.url;
    if (it.type === 'image') return u.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
    return u.replace('/upload/', '/upload/q_auto/').replace(/\.[a-z0-9]+$/i, '.mp4');
  }
  function poster(it) {
    return it.url.replace('/upload/', '/upload/so_0,w_800,q_auto/').replace(/\.[a-z0-9]+$/i, '.jpg');
  }

  var IV = 4500;                                   // segundos kada slide (ms)
  var lite = false;
  try { lite = localStorage.getItem('bcm_fx') === 'off'; } catch (e) {}
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) lite = true;
  if (lite) root.classList.add('lite');
  var eco = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  if (eco && !lite) root.classList.add('eco');

  var io = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.target._vis) e.target._vis(e.isIntersecting); }); }, { threshold: 0.35 })
    : null;

  function rapi(body) { return api(body, '/api/react'); }
  function rget(q) {
    return fetch('/api/react' + q).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Error'); return j; }); });
  }
  function myR() { try { return JSON.parse(localStorage.getItem('bcm_my_react') || '{}'); } catch (e) { return {}; } }
  function saveMy(o) { try { localStorage.setItem('bcm_my_react', JSON.stringify(o)); } catch (e) {} }
  function when(d) {
    try { return new Date(d).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; }
  }

  function openLightbox(it) {
    var lb = el('div', 'bf-lb'); var big = document.createElement('img');
    big.src = it.url.replace('/upload/', '/upload/f_auto,q_auto,w_2000/'); lb.appendChild(big);
    lb.onclick = function () { lb.remove(); }; document.body.appendChild(lb);
  }

  /* ---------- comments panel ---------- */
  function commentPanel(pid, setCount) {
    var box = el('div', 'bf-cm');
    var list = el('div', 'bf-cm-list');
    var nm = document.createElement('input'); nm.type = 'text'; nm.maxLength = 40; nm.placeholder = 'Imong pangalan';
    try { nm.value = localStorage.getItem('bcm_name') || ''; } catch (e) {}
    var tx = document.createElement('textarea'); tx.rows = 2; tx.maxLength = 300; tx.placeholder = 'Isulat ang imong comment...';
    var hp = document.createElement('input'); hp.type = 'text'; hp.className = 'bf-hp'; hp.tabIndex = -1; hp.autocomplete = 'off';
    var send = el('button', 'bf-btn', 'POST');
    var st = el('div', 'bf-status', '');
    var opened = Date.now();

    function render(arr) {
      list.textContent = '';
      if (!arr.length) list.appendChild(el('div', 'bf-cm-empty', 'Wala pay comment. Ikaw na ang una!'));
      arr.forEach(function (cm) {
        var r = el('div', 'bf-cm-row'), h = el('div', 'bf-cm-h');
        h.appendChild(el('b', '', cm.n)); h.appendChild(el('span', '', when(cm.d)));
        if (admin) {
          var x = el('button', 'bf-cm-x', '🗑');
          x.onclick = function () {
            if (!confirm('I-delete ning comment?')) return;
            rapi({ action: 'delcomment', post: pid, cid: cm.i, password: pw }).then(function (d) { render(d.comments || []); }).catch(function (e) { alert(e.message); });
          };
          h.appendChild(x);
        }
        r.appendChild(h); r.appendChild(el('div', 'bf-cm-t', cm.t)); list.appendChild(r);
      });
      list.scrollTop = list.scrollHeight;
      setCount(arr.length);
    }
    box.refresh = function () {
      rget('?post=' + encodeURIComponent(pid)).then(function (d) { render(d.comments || []); })
        .catch(function () { list.textContent = 'Dili ma-load ang comments karon.'; });
    };
    send.onclick = function () {
      var name = nm.value.trim(), text = tx.value.trim();
      if (!name) { st.textContent = 'Butangi ang imong pangalan.'; return; }
      if (!text) { st.textContent = 'Isulat una ang comment.'; return; }
      send.disabled = true; st.textContent = 'Gipadala...';
      rapi({ action: 'comment', post: pid, name: name, text: text, hp: hp.value, ms: Date.now() - opened }).then(function (d) {
        try { localStorage.setItem('bcm_name', name); } catch (e) {}
        tx.value = ''; st.textContent = '✅ Na-post na!'; render(d.comments || []);
        setTimeout(function () { send.disabled = false; st.textContent = ''; }, 5000);
      }).catch(function (e) { st.textContent = '❌ ' + e.message; send.disabled = false; });
    };
    [list, nm, tx, hp, send, st].forEach(function (n) { box.appendChild(n); });
    return box;
  }

  /* ---------- like / heart / comment bar ---------- */
  function actionBar(pid, card) {
    var bar = el('div', 'bf-act');
    var cnt = { like: 0, heart: 0, com: 0 };
    var btn = {};
    function paint() {
      var mine = myR()[pid] || {};
      btn.like.nm.textContent = cnt.like; btn.heart.nm.textContent = cnt.heart; btn.com.nm.textContent = cnt.com;
      btn.like.b.classList.toggle('on', !!mine.like); btn.heart.b.classList.toggle('on', !!mine.heart);
    }
    function pill(kind, icon) {
      var b = el('button', 'bf-pill'); b.appendChild(el('span', '', icon));
      var n = el('b', '', '0'); b.appendChild(n); bar.appendChild(b);
      btn[kind] = { b: b, nm: n }; return b;
    }
    function burst(from) {
      if (lite) return;
      for (var i = 0; i < 6; i++) {
        var f = el('span', 'bf-float', '❤️');
        f.style.left = (from.offsetLeft + 10 + Math.random() * 20) + 'px'; f.style.top = from.offsetTop + 'px';
        f.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
        f.style.animationDelay = (i * 0.07) + 's';
        bar.appendChild(f); setTimeout(function (n) { n.remove(); }.bind(null, f), 1400);
      }
    }
    function toggle(kind) {
      var my = myR(); my[pid] = my[pid] || {};
      var on = !my[pid][kind]; my[pid][kind] = on ? 1 : 0; saveMy(my);
      cnt[kind] = Math.max(0, cnt[kind] + (on ? 1 : -1)); paint();
      if (on && kind === 'heart') burst(btn.heart.b);
      rapi({ action: 'react', post: pid, kind: kind, delta: on ? 1 : -1 }).then(function (d) {
        cnt.like = d.l; cnt.heart = d.h; paint();
      }).catch(function () {
        var m2 = myR(); m2[pid] = m2[pid] || {}; m2[pid][kind] = on ? 0 : 1; saveMy(m2);
        cnt[kind] = Math.max(0, cnt[kind] + (on ? -1 : 1)); paint();
      });
    }
    pill('like', '👍').onclick = function () { toggle('like'); };
    pill('heart', '❤️').onclick = function () { toggle('heart'); };
    var panel = null;
    pill('com', '💬').onclick = function () {
      if (panel) { panel.remove(); panel = null; return; }
      panel = commentPanel(pid, function (n) { cnt.com = n; paint(); });
      card.insertBefore(panel, bar.nextSibling); panel.refresh();
    };
    var sh = el('button', 'bf-pill'); sh.appendChild(el('span', '', '↗')); sh.appendChild(el('b', '', 'Share')); bar.appendChild(sh);
    sh.onclick = function () {
      var url = location.origin + location.pathname + '#post-' + pid;
      var txt = (card._cap || 'Breaking Chain Ministry').replace(/\*+/g, '').slice(0, 200);
      if (navigator.share) { navigator.share({ title: 'Breaking Chain Ministry', text: txt, url: url }).catch(function () {}); return; }
      window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), 'fbshare', 'width=620,height=520');
    };
    paint();
    card._set = function (d) { cnt.like = d.l || 0; cnt.heart = d.h || 0; cnt.com = d.n || 0; paint(); };
    return bar;
  }

  /* ---------- post card (single = 1, album = slideshow) ---------- */
  function card(group) {
    var first = group[0], n = group.length;
    var pid = first.group || first.id;
    var cap = '';
    group.forEach(function (g) { if (!cap && g.caption) cap = g.caption; });

    var c = el('div', 'bf-card');
    c._pid = pid; c.id = 'post-' + pid;
    var ratio = first.w && first.h ? first.w / first.h : 16 / 9;
    var base = 'bf-media ' + (ratio < 0.9 ? 'port' : ratio > 1.2 ? 'land' : 'sq');
    var m = el('div', base);
    c.appendChild(m);

    var slides = [], cur = null, fxN = -1, timer = null, hold = false, paused = false, vis = !io, vidPlaying = false;
    var prog = null, cntEl = null, dots = null;

    function mediaEl(it) {
      if (it.type === 'video') {
        var v = document.createElement('video');
        v.controls = true; v.preload = 'none'; v.playsInline = true; v.poster = poster(it); v.src = optimized(it);
        v.onplay = function () { vidPlaying = true; tick(); };
        v.onpause = function () { vidPlaying = false; tick(); };
        v.onended = function () { vidPlaying = false; if (n > 1) show(cur + 1); };
        return v;
      }
      var im = document.createElement('img');
      im.loading = 'lazy'; im.alt = cap || 'BCM'; im.src = optimized(it);
      im.onclick = function () { openLightbox(it); };
      return im;
    }
    function getSlide(i) {
      i = (i + n) % n;
      if (!slides[i]) { var s = el('div', 'bf-sl'); s.appendChild(mediaEl(group[i])); m.appendChild(s); slides[i] = s; }
      return slides[i];
    }
    function stopProg() { if (prog) prog.classList.remove('run'); }
    function startProg() {
      if (!prog) return;
      prog.classList.remove('run'); void prog.offsetWidth;
      prog.style.animationDuration = IV + 'ms'; prog.classList.add('run');
    }
    function tick() {
      clearTimeout(timer);
      if (n < 2 || hold || paused || !vis || vidPlaying || !c.isConnected || group[cur].type === 'video') { stopProg(); return; }
      startProg();
      timer = setTimeout(function () { show(cur + 1); }, IV);
    }
    function show(i) {
      var ni = (i + n) % n, firstShow = cur === null;
      var next = getSlide(ni);
      if (!firstShow && ni !== cur) {
        var pv = slides[cur]; pv.classList.remove('on'); pv.classList.add('out');
        setTimeout(function () { pv.classList.remove('out'); }, 950);
        var pvv = pv.querySelector('video'); if (pvv) pvv.pause();
      }
      fxN++;
      m.className = base + ' fx' + (fxN % 8) + ' kb' + (fxN % 2);
      next.classList.remove('out'); next.classList.add('on');
      cur = ni;
      if (!lite && !firstShow && n > 1) { m.classList.add('shine'); setTimeout(function () { m.classList.remove('shine'); }, 900); }
      if (n > 1) {
        getSlide(ni + 1);
        cntEl.textContent = (cur + 1) + ' / ' + n;
        [].forEach.call(dots.children, function (d, k) { d.className = k === cur ? 'on' : ''; });
      }
      tick();
    }

    if (!lite) {
      var sp = el('div', 'bf-sparks');
      [[8, 12], [86, 18], [20, 70], [72, 62], [48, 8], [92, 80], [34, 40]].forEach(function (p, k) {
        var s = el('span', '', '✦');
        s.style.left = p[0] + '%'; s.style.top = p[1] + '%'; s.style.fontSize = (10 + (k % 3) * 4) + 'px';
        s.style.animationDelay = (k * 0.45) + 's'; sp.appendChild(s);
      });
      m.appendChild(sp);
      if (n > 1) { m.appendChild(el('div', 'bf-grain')); m.appendChild(el('div', 'bf-leak')); }
    }
    if (n > 1) {
      cntEl = el('span', 'bf-count'); m.appendChild(cntEl);
      var pv2 = el('button', 'bf-nav prev', '‹'), nx = el('button', 'bf-nav next', '›');
      pv2.onclick = function () { show(cur - 1); }; nx.onclick = function () { show(cur + 1); };
      m.appendChild(pv2); m.appendChild(nx);
      var pz = el('button', 'bf-pz', '⏸');
      pz.onclick = function () { paused = !paused; pz.textContent = paused ? '▶' : '⏸'; tick(); };
      m.appendChild(pz);
      prog = el('div', 'bf-prog'); m.appendChild(prog);
      var sx = null;
      m.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; hold = true; clearTimeout(timer); stopProg(); }, { passive: true });
      m.addEventListener('touchend', function (e) {
        hold = false;
        if (sx != null) { var dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 40) { show(cur + (dx < 0 ? 1 : -1)); return; } }
        tick();
      });
      m.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hold = true; tick(); } });
      m.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hold = false; tick(); } });
      dots = el('div', 'bf-dots');
      group.forEach(function () { dots.appendChild(document.createElement('i')); });
    }
    show(0);
    if (dots) c.appendChild(dots);
    c._cap = cap;
    if (cap) {
      var cp = el('div', 'bf-cap'), LIM = 220, long = cap.length > LIM || cap.split('\n').length > 4, cut = cap;
      if (long) {
        cut = cap.slice(0, LIM); var sp2 = cut.lastIndexOf(' '); if (sp2 > 120) cut = cut.slice(0, sp2);
        if ((cut.match(/\*/g) || []).length % 2) cut = cut.slice(0, cut.lastIndexOf('*'));
      }
      var open2 = false, mb = long ? el('button', 'bf-more', 'See more') : null;
      var fill = function () {
        cp.textContent = ''; rich(cp, open2 || !long ? cap : cut + '… ');
        if (mb) { mb.textContent = open2 ? 'See less' : 'See more'; cp.appendChild(document.createTextNode(' ')); cp.appendChild(mb); }
      };
      if (mb) mb.onclick = function () { open2 = !open2; fill(); };
      fill(); c.appendChild(cp);
    }
    c.appendChild(actionBar(pid, c));

    c._vis = function (v) { vis = v; c.classList.toggle('vis', v); tick(); };
    if (!io) { c.classList.add('vis'); setTimeout(tick, 0); } else io.observe(c);

    if (admin) {
      var d = el('button', 'bf-del', '🗑 Delete');
      d.onclick = function () {
        var what = n > 1 ? 'ning album (' + n + ' ka litrato/video)' : (first.type === 'video' ? 'ning video' : 'ning litrato');
        if (!confirm('I-delete ' + what + '? Dili na ni mabalik.')) return;
        d.disabled = true; d.textContent = '...';
        Promise.all(group.map(function (g) { return api({ action: 'delete', password: pw, id: g.id, type: g.type }); }))
          .then(function () { c.remove(); })
          .catch(function (e) { alert('Wala ma-delete: ' + e.message); d.disabled = false; d.textContent = '🗑 Delete'; });
      };
      c.appendChild(d);
    }
    return c;
  }

  function loadReactions(cards) {
    var chunks = [];
    for (var i = 0; i < cards.length; i += 50) chunks.push(cards.slice(i, i + 50));
    Promise.all(chunks.map(function (ch) {
      return rget('?ids=' + encodeURIComponent(ch.map(function (c) { return c._pid; }).join(','))).then(function (d) {
        ch.forEach(function (c) { c._set(d.posts[c._pid] || {}); });
      });
    })).catch(function () { root.classList.add('noreact'); });   // wala pa ang KV -> tagoa ang like/comment
  }

  // Ibutang sa usa ka card ang tanang items nga parehas og group; ang walay group, single ra
  function buildGroups(items) {
    var seen = {}, out = [];
    items.forEach(function (it) {
      if (!it.group) { out.push([it]); return; }
      if (seen[it.group]) return;
      var g = items.filter(function (x) { return x.group === it.group; })
        .sort(function (a, b) { return (a.idx || 0) - (b.idx || 0); });
      seen[it.group] = 1; out.push(g);
    });
    return out;
  }

  function shrinkImage(file) {
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)/.test(file.type)) return resolve(file);
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 2400, s = Math.min(1, max / Math.max(img.width, img.height));
        if (s === 1 && file.size < 4 * 1024 * 1024) { URL.revokeObjectURL(url); return resolve(file); }
        var cv = document.createElement('canvas'); cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob(function (b) { URL.revokeObjectURL(url); resolve(b || file); }, 'image/jpeg', 0.88);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function uploadPanel() {
    var p = el('div', 'bf-panel');
    p.appendChild(el('h3', '', '⬆ UPLOAD PHOTOS / VIDEO'));
    var f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*,video/*'; f.multiple = true;
    var sel = el('div', 'bf-sel', '');
    f.onchange = function () { sel.textContent = f.files.length ? f.files.length + ' ka file ang napili (usa ka album)' : ''; };
    var cap = document.createElement('textarea'); cap.rows = 2; cap.placeholder = 'Caption / posting para sa tibuok album (optional)';
    var go = el('button', 'bf-btn', 'UPLOAD');
    var out = el('button', 'bf-btn alt', 'Logout');
    var wipe = el('button', 'bf-btn', '🗑 Delete All');
    wipe.style.background = '#b00020'; wipe.style.color = '#fff';
    wipe.onclick = function () {
      if (!allItems.length) { st.textContent = 'Wala nay ma-delete.'; return; }
      if (!confirm('I-delete ANG TANANG ' + allItems.length + ' ka litrato/video? Dili na ni mabalik.')) return;
      var t = prompt('Para makasiguro, i-type ang DELETE:');
      if (t !== 'DELETE') { st.textContent = 'Wala ma-delete (wala na-type ang DELETE).'; return; }
      wipe.disabled = true; go.disabled = true; bar.style.display = 'block'; fill.style.width = '0';
      var list = allItems.slice(), done = 0, failed = 0;
      (function nextBatch() {
        if (done + failed >= list.length) {
          st.textContent = failed ? '⚠ ' + done + ' ang na-delete, ' + failed + ' ang wala. Sulayi balik.' : '✅ Na-delete na tanan.';
          wipe.disabled = false; go.disabled = false;
          return setTimeout(function () { bar.style.display = 'none'; load(); }, 800);
        }
        var batch = list.slice(done + failed, done + failed + 5);
        Promise.all(batch.map(function (g) {
          return api({ action: 'delete', password: pw, id: g.id, type: g.type })
            .then(function () { done++; }, function () { failed++; });
        })).then(function () {
          fill.style.width = Math.round((done + failed) / list.length * 100) + '%';
          st.textContent = 'Nag-delete... ' + (done + failed) + ' sa ' + list.length;
          nextBatch();
        });
      })();
    };
    var bar = el('div', 'bf-bar'); var fill = document.createElement('i'); bar.appendChild(fill);
    var st = el('div', 'bf-status', 'Pwede ka mopili ug daghang litrato sa usa ka higayon (hangtod 50). Taas nga caption pwede (hangtod 5000 ka letra, naay "See more"). Usa ra ang caption ug usa ra ka post. Video hangtod 100 MB.');
    out.onclick = function () { try { sessionStorage.removeItem('bcm_admin'); } catch (e) {} pw = ''; admin = false; load(); };

    function uploadOne(file, gid, idx, onPct) {
      return Promise.all([shrinkImage(file), api({ action: 'sign', password: pw, caption: cap.value, group: gid, idx: idx })]).then(function (r) {
        var blob = r[0], s = r[1];
        var fd = new FormData();
        fd.append('file', blob, file.name);
        ['api_key', 'timestamp', 'signature', 'folder', 'tags', 'context'].forEach(function (k) { fd.append(k, s[k]); });
        return new Promise(function (res, rej) {
          var x = new XMLHttpRequest();
          x.open('POST', 'https://api.cloudinary.com/v1_1/' + s.cloud_name + '/auto/upload');
          x.upload.onprogress = function (e) { if (e.lengthComputable) onPct(e.loaded / e.total); };
          x.onload = function () { x.status < 300 ? res() : rej(new Error('Upload failed (' + x.status + ') ' + x.responseText.slice(0, 120))); };
          x.onerror = function () { rej(new Error('Walay koneksyon')); };
          x.send(fd);
        });
      });
    }

    go.onclick = function () {
      var files = [].slice.call(f.files || []);
      if (!files.length) { st.textContent = 'Pili una ug file.'; return; }
      if (files.length > 50) { st.textContent = 'Sobra sa 50 ka file. Bahina sa duha ka post.'; return; }
      for (var i = 0; i < files.length; i++) {
        if (/^video\//.test(files[i].type) && files[i].size > 100 * 1024 * 1024) { st.textContent = '"' + files[i].name + '" sobra sa 100 MB. I-compress una.'; return; }
      }
      var gid = 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      go.disabled = true; f.disabled = true; bar.style.display = 'block'; fill.style.width = '0';
      var n = files.length, k = 0;
      (function next() {
        if (k >= n) {
          st.textContent = '✅ Na-upload na ang ' + n + ' ka file!'; f.value = ''; sel.textContent = ''; cap.value = ''; go.disabled = false; f.disabled = false;
          return setTimeout(function () { bar.style.display = 'none'; load(); }, 800);
        }
        uploadOne(files[k], gid, k, function (frac) {
          var pc = Math.round((k + frac) / n * 100); fill.style.width = pc + '%';
          st.textContent = 'Nag-upload ' + (k + 1) + ' sa ' + n + '... ' + pc + '%';
        }).then(function () { k++; next(); })
          .catch(function (e) { st.textContent = '❌ ' + e.message + ' (' + k + ' sa ' + n + ' ang na-upload na)'; go.disabled = false; f.disabled = false; });
      })();
    };
    [f, sel, cap, go, out, wipe, bar, st].forEach(function (n) { p.appendChild(n); });
    return p;
  }

  function load() {
    if (io) io.disconnect();
    root.textContent = '';
    root.appendChild(el('h2', '', 'LATEST POSTS & VIDEOS'));
    if (admin) root.appendChild(uploadPanel());
    var grid = el('div', 'bf-grid'); var msg = el('div', 'bf-msg', 'Nag-load...');
    root.appendChild(msg);
    fetch(API + '?t=' + (admin ? Date.now() : Math.floor(Date.now() / 30000)))
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Error'); return j; }); })
      .then(function (d) {
        msg.remove(); allItems = d.items || [];
        if (!d.items.length) { root.appendChild(el('div', 'bf-empty', 'Wala pay posts.')); }
        else { var cards = buildGroups(d.items).map(function (g) { var cd = card(g); grid.appendChild(cd); return cd; }); root.appendChild(grid); loadReactions(cards);
          if (location.hash.indexOf('#post-') === 0) setTimeout(function () { var t = document.getElementById(decodeURIComponent(location.hash.slice(1))); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 500); }
      })
      .catch(function (e) { msg.textContent = 'Dili ma-load ang posts karon. (' + e.message + ')'; });
    if (!admin) {
      var a = el('button', 'bf-admin-link', '🔒 Admin');
      a.onclick = function () {
        var p = prompt('Admin password:'); if (!p) return;
        api({ action: 'check', password: p }).then(function () {
          pw = p; admin = true; try { sessionStorage.setItem('bcm_admin', p); } catch (e) {} load();
        }).catch(function (e) { alert(e.message); });
      };
      root.appendChild(a);
    }
  }

  if (pw) {
    api({ action: 'check', password: pw }).then(function () { admin = true; load(); }).catch(function () { pw = ''; load(); });
  } else { load(); }
})();
