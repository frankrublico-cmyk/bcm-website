/* BCM Prayer Request chat. Needs <div id="bcm-chat"></div>. */
(function () {
  var root = document.getElementById('bcm-chat');
  if (!root) return;
  var API = '/api/chat';

  var css = document.createElement('style');
  css.textContent = [
    '#bcm-chat{max-width:620px;margin:0 auto;text-align:left}',
    '.bc-box{background:rgba(11,15,23,.9);border:1px solid rgba(0,210,255,.35);border-radius:14px;padding:18px;box-shadow:0 0 22px rgba(0,210,255,.18)}',
    '.bc-box h3{margin:0 0 10px;font-family:Orbitron,sans-serif;color:#d4af37;font-size:17px}',
    '.bc-box input[type=text],.bc-box textarea{width:100%;box-sizing:border-box;padding:12px;border-radius:10px;border:1px solid #475569;background:#0d111a;color:#fff;font-size:16px;margin:6px 0;font-family:inherit}',
    '.bc-hp{position:absolute;left:-9999px;opacity:0;height:0;width:0}',
    '.bc-btn{background:linear-gradient(135deg,#d4af37,#b8901c);color:#000;border:0;border-radius:10px;padding:12px 22px;font-weight:800;cursor:pointer;margin:6px 8px 0 0;font-size:15px}',
    '.bc-btn.alt{background:#1e293b;color:#fff}.bc-btn.red{background:#b00020;color:#fff}',
    '.bc-btn:disabled{opacity:.5;cursor:wait}',
    '.bc-msgs{display:flex;flex-direction:column;gap:10px;max-height:380px;overflow:auto;padding:6px 2px;margin-bottom:8px}',
    '.bc-m{max-width:86%;padding:10px 14px;border-radius:14px;line-height:1.5;white-space:pre-wrap;word-break:break-word;font-size:15px}',
    '.bc-m small{display:block;opacity:.65;font-size:11px;margin-top:4px}',
    '.bc-m.v{align-self:flex-end;background:#0b5cff;color:#fff;border-bottom-right-radius:4px}',
    '.bc-m.a{align-self:flex-start;background:#2a2f3d;color:#fff;border:1px solid #d4af37;border-bottom-left-radius:4px}',
    '.bc-m.a b{color:#d4af37;display:block;font-size:12px;margin-bottom:2px}',
    '.bc-note{color:#a0aec0;font-size:13px;margin-top:8px}',
    '.bc-err{color:#ff6b6b;font-size:14px;margin-top:6px}',
    '.bc-admin{display:block;margin:26px auto 0;background:none;border:1px solid rgba(255,255,255,.2);color:#a0aec0;border-radius:20px;padding:7px 18px;cursor:pointer;font-size:13px}',
    '.bc-th{padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:10px;margin:8px 0;cursor:pointer;background:rgba(255,255,255,.03)}',
    '.bc-th:hover{border-color:#d4af37}',
    '.bc-th b{color:#fff}.bc-th span{color:#a0aec0;font-size:13px;display:block;margin-top:3px}',
    '.bc-new{background:#ff4d4d;color:#fff;border-radius:10px;font-size:11px;padding:2px 8px;margin-left:8px;font-weight:700}'
  ].join('');
  document.head.appendChild(css);

  var t0 = Date.now();
  var timer = null;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function api(body) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .catch(function () { throw new Error(location.protocol === 'file:' ? 'Mo-work ra ang chat inig na-deploy na sa Netlify (dili sa file sa kompyuter).' : 'Dili maabot ang server. Sulayi pag-usab.'); })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Error'); return j; }); });
  }
  function fmt(iso) { try { return new Date(iso).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; } }
  function clear() { clearInterval(timer); timer = null; root.textContent = ''; }
  function newToken() {
    var a = new Uint8Array(16); crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (x) { return ('0' + x.toString(16)).slice(-2); }).join('');
  }
  function bubbles(msgs, adminView, name) {
    var w = el('div', 'bc-msgs');
    msgs.forEach(function (m) {
      var mine = adminView ? m.r === 'a' : m.r === 'v';
      var b = el('div', 'bc-m ' + (adminView ? (m.r === 'a' ? 'v' : 'a') : m.r));
      if (!adminView && m.r === 'a') b.appendChild(el('b', '', '🙏 BCM Admin'));
      if (adminView && m.r === 'v') b.appendChild(el('b', '', name || 'Bisita'));
      b.appendChild(document.createTextNode(m.t));
      b.appendChild(el('small', '', fmt(m.at)));
      w.appendChild(b);
    });
    setTimeout(function () { w.scrollTop = w.scrollHeight; }, 0);
    return w;
  }

  /* ---------------- visitor ---------------- */
  function visitor() {
    clear();
    var token = ''; try { token = localStorage.getItem('bcm_chat_token') || ''; } catch (e) {}
    var box = el('div', 'bc-box'); root.appendChild(box);
    if (token) {
      box.appendChild(el('h3', '', '🙏 Imong Prayer Request'));
      var holder = el('div'); box.appendChild(holder);
      var err = el('div', 'bc-err'); box.appendChild(err);
      var ta = document.createElement('textarea'); ta.rows = 2; ta.maxLength = 600; ta.placeholder = 'Dugang nga mensahe...';
      var send = el('button', 'bc-btn', 'SEND');
      var ref = el('button', 'bc-btn alt', '↻ Refresh');
      var fresh = el('button', 'bc-btn alt', 'Bag-ong request');
      var load = function () {
        api({ action: 'get', token: token }).then(function (d) {
          holder.textContent = '';
          if (!d.thread.msgs.length) holder.appendChild(el('div', 'bc-note', 'Wala pay mensahe.'));
          else holder.appendChild(bubbles(d.thread.msgs, false));
        }).catch(function (e) { err.textContent = e.message; });
      };
      send.onclick = function () {
        if (!ta.value.trim()) return;
        send.disabled = true; err.textContent = '';
        api({ action: 'send', token: token, text: ta.value, ms: Date.now() - t0 }).then(function () { ta.value = ''; send.disabled = false; load(); })
          .catch(function (e) { err.textContent = e.message; send.disabled = false; });
      };
      ref.onclick = load;
      fresh.onclick = function () { if (confirm('Magsugod ug bag-ong chat? Dili na nimo makita kining karaan sa kini nga browser.')) { try { localStorage.removeItem('bcm_chat_token'); } catch (e) {} visitor(); } };
      [ta, send, ref, fresh].forEach(function (n) { box.appendChild(n); });
      box.appendChild(el('div', 'bc-note', 'Makita nimo dinhi ang tubag sa admin inig balik nimo sa website gamit niining phone o browser.'));
      load();
      timer = setInterval(function () { if (!document.hidden) load(); }, 30000);
    } else {
      box.appendChild(el('h3', '', '🙏 Ipadala ang Imong Prayer Request'));
      var nm = document.createElement('input'); nm.type = 'text'; nm.maxLength = 60; nm.placeholder = 'Imong pangalan'; nm.autocomplete = 'name';
      var rq = document.createElement('textarea'); rq.rows = 5; rq.maxLength = 600; rq.placeholder = 'Isulat dinhi ang imong prayer request...';
      var hp = document.createElement('input'); hp.type = 'text'; hp.className = 'bc-hp'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true');
      var go = el('button', 'bc-btn', '🙏 SEND PRAYER REQUEST');
      var er = el('div', 'bc-err');
      go.onclick = function () {
        if (!nm.value.trim() || !rq.value.trim()) { er.textContent = 'Palihug butangi ang pangalan ug ang request.'; return; }
        go.disabled = true; er.textContent = '';
        var tk = newToken();
        api({ action: 'send', token: tk, name: nm.value, text: rq.value, hp: hp.value, ms: Date.now() - t0 }).then(function () {
          try { localStorage.setItem('bcm_chat_token', tk); } catch (e) {}
          visitor();
        }).catch(function (e) { er.textContent = e.message; go.disabled = false; });
      };
      [nm, rq, hp, go, er].forEach(function (n) { box.appendChild(n); });
      box.appendChild(el('div', 'bc-note', 'Ang imong request makita ra sa admin sa BCM.'));
    }
    var ad = el('button', 'bc-admin', '🔒 Admin Chat'); ad.onclick = function () { location.href = 'Prayer-Admin.html'; }; root.appendChild(ad);
  }

  visitor();
})();
