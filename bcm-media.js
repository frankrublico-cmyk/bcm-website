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
    '.bf-lb{position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:5000;display:flex;align-items:center;justify-content:center;cursor:zoom-out}',
    '.bf-lb img{max-width:96vw;max-height:94vh;object-fit:contain}'
  ].join('');
  document.head.appendChild(css);

  var pw = '';
  try { pw = sessionStorage.getItem('bcm_admin') || ''; } catch (e) {}
  var admin = false;

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  function api(body) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
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

  function card(it) {
    var c = el('div', 'bf-card');
    var ratio = it.w && it.h ? it.w / it.h : 16 / 9;
    var m = el('div', 'bf-media ' + (ratio < 0.9 ? 'port' : ratio > 1.2 ? 'land' : 'sq'));
    if (it.type === 'video') {
      var v = document.createElement('video');
      v.controls = true; v.preload = 'none'; v.playsInline = true; v.poster = poster(it); v.src = optimized(it);
      m.appendChild(v);
    } else {
      var im = document.createElement('img');
      im.loading = 'lazy'; im.alt = it.caption || 'BCM'; im.src = optimized(it);
      im.onclick = function () {
        var lb = el('div', 'bf-lb'); var big = document.createElement('img');
        big.src = it.url.replace('/upload/', '/upload/f_auto,q_auto,w_2000/'); lb.appendChild(big);
        lb.onclick = function () { lb.remove(); }; document.body.appendChild(lb);
      };
      m.appendChild(im);
    }
    c.appendChild(m);
    if (it.caption) c.appendChild(el('div', 'bf-cap', it.caption));
    if (admin) {
      var d = el('button', 'bf-del', '🗑 Delete');
      d.onclick = function () {
        if (!confirm('I-delete ning ' + (it.type === 'video' ? 'video' : 'litrato') + '? Dili na ni mabalik.')) return;
        d.disabled = true; d.textContent = '...';
        api({ action: 'delete', password: pw, id: it.id, type: it.type })
          .then(function () { c.remove(); })
          .catch(function (e) { alert('Wala ma-delete: ' + e.message); d.disabled = false; d.textContent = '🗑 Delete'; });
      };
      c.appendChild(d);
    }
    return c;
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
    p.appendChild(el('h3', '', '⬆ UPLOAD PHOTO / VIDEO'));
    var f = document.createElement('input'); f.type = 'file'; f.accept = 'image/*,video/*';
    var cap = document.createElement('textarea'); cap.rows = 2; cap.placeholder = 'Caption / posting (optional)';
    var go = el('button', 'bf-btn', 'UPLOAD');
    var out = el('button', 'bf-btn alt', 'Logout');
    var bar = el('div', 'bf-bar'); var fill = document.createElement('i'); bar.appendChild(fill);
    var st = el('div', 'bf-status', 'Widescreen (16:9) ug portrait (4:5) maayo. Video hangtod 100 MB.');
    out.onclick = function () { try { sessionStorage.removeItem('bcm_admin'); } catch (e) {} pw = ''; admin = false; load(); };
    go.onclick = function () {
      var file = f.files && f.files[0];
      if (!file) { st.textContent = 'Pili una ug file.'; return; }
      var isVid = /^video\//.test(file.type);
      if (isVid && file.size > 100 * 1024 * 1024) { st.textContent = 'Sobra sa 100 MB ang video. I-compress una.'; return; }
      go.disabled = true; st.textContent = 'Gihana-hana...'; bar.style.display = 'block'; fill.style.width = '0';
      Promise.all([shrinkImage(file), api({ action: 'sign', password: pw, caption: cap.value })]).then(function (r) {
        var blob = r[0], s = r[1];
        var fd = new FormData();
        fd.append('file', blob, file.name);
        ['api_key', 'timestamp', 'signature', 'folder', 'tags', 'context'].forEach(function (k) { fd.append(k, s[k]); });
        return new Promise(function (res, rej) {
          var x = new XMLHttpRequest();
          x.open('POST', 'https://api.cloudinary.com/v1_1/' + s.cloud_name + '/auto/upload');
          x.upload.onprogress = function (e) {
            if (e.lengthComputable) { var pc = Math.round(e.loaded / e.total * 100); fill.style.width = pc + '%'; st.textContent = 'Nag-upload... ' + pc + '%'; }
          };
          x.onload = function () { x.status < 300 ? res() : rej(new Error('Upload failed (' + x.status + ') ' + x.responseText.slice(0, 120))); };
          x.onerror = function () { rej(new Error('Walay koneksyon')); };
          x.send(fd);
        });
      }).then(function () {
        st.textContent = '✅ Na-upload na!'; f.value = ''; cap.value = ''; go.disabled = false;
        setTimeout(function () { bar.style.display = 'none'; load(); }, 800);
      }).catch(function (e) { st.textContent = '❌ ' + e.message; go.disabled = false; });
    };
    [f, cap, go, out, bar, st].forEach(function (n) { p.appendChild(n); });
    return p;
  }

  function load() {
    root.textContent = '';
    root.appendChild(el('h2', '', 'LATEST POSTS & VIDEOS'));
    if (admin) root.appendChild(uploadPanel());
    var grid = el('div', 'bf-grid'); var msg = el('div', 'bf-msg', 'Nag-load...');
    root.appendChild(msg);
    fetch(API + '?t=' + (admin ? Date.now() : Math.floor(Date.now() / 30000)))
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Error'); return j; }); })
      .then(function (d) {
        msg.remove();
        if (!d.items.length) { root.appendChild(el('div', 'bf-empty', 'Wala pay posts.')); }
        else { d.items.forEach(function (it) { grid.appendChild(card(it)); }); root.appendChild(grid); }
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
