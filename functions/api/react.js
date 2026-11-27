// BCM Likes / Hearts / Comments  ->  /api/react   (Cloudflare Pages Function)
// KV binding: CHAT (parehas sa Prayer chat)      Env var: ADMIN_PASSWORD (para sa pag-delete sa comment)
const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

const ID_RE = /^[A-Za-z0-9_\-\/.]{1,120}$/;
const key = id => 'post:' + id;
const clean = (s, n) =>
  String(s == null ? '' : s).replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').replace(/\n{3,}/g, '\n\n').trim().slice(0, n);

function okPassword(env, pw) {
  if (!pw || typeof pw !== 'string') return false;
  const list = String(env.ADMIN_PASSWORD || '').split(',').map(s => s.trim()).filter(Boolean);
  return list.some(p => p.length === pw.length && p === pw);
}

async function loadPost(env, id) {
  const raw = await env.CHAT.get(key(id));
  let p = {};
  try { p = raw ? JSON.parse(raw) : {}; } catch (e) {}
  return { l: p.l | 0, h: p.h | 0, c: Array.isArray(p.c) ? p.c : [] };
}
const savePost = (env, id, p) => env.CHAT.put(key(id), JSON.stringify(p));

// Spam brake gamit ang Cache API (walay KV write, libre)
async function tooFast(request, bucket, secs) {
  const ip = request.headers.get('CF-Connecting-IP') || 'x';
  const k = new Request('https://bcm.cache/rl/' + bucket + '/' + encodeURIComponent(ip));
  const c = caches.default;
  if (await c.match(k)) return true;
  await c.put(k, new Response('1', { headers: { 'Cache-Control': 'max-age=' + secs } }));
  return false;
}

export async function onRequestGet({ request, env }) {
  if (!env.CHAT) return json({ error: 'Wala pa na-bind ang KV (CHAT) sa Cloudflare.' }, 500);
  const u = new URL(request.url);

  const ids = u.searchParams.get('ids');
  if (ids != null) {
    const list = ids.split(',').filter(x => ID_RE.test(x)).slice(0, 60);
    const posts = {};
    await Promise.all(list.map(async id => {
      const p = await loadPost(env, id);
      posts[id] = { l: p.l, h: p.h, n: p.c.length };
    }));
    return json({ posts });
  }

  const id = u.searchParams.get('post') || '';
  if (!ID_RE.test(id)) return json({ error: 'Bad post' }, 400);
  const p = await loadPost(env, id);
  return json({ l: p.l, h: p.h, comments: p.c });
}

export async function onRequestPost({ request, env }) {
  if (!env.CHAT) return json({ error: 'Wala pa na-bind ang KV (CHAT) sa Cloudflare.' }, 500);
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'Bad request' }, 400); }
  if (!ID_RE.test(String(b.post || ''))) return json({ error: 'Bad post' }, 400);
  const id = String(b.post);

  if (b.action === 'react') {
    const kind = b.kind === 'heart' ? 'h' : b.kind === 'like' ? 'l' : '';
    if (!kind || (b.delta !== 1 && b.delta !== -1)) return json({ error: 'Bad request' }, 400);
    if (await tooFast(request, 'r', 1)) return json({ error: 'Hinay-hinay lang.' }, 429);
    const p = await loadPost(env, id);
    p[kind] = Math.max(0, p[kind] + b.delta);
    await savePost(env, id, p);
    return json({ l: p.l, h: p.h });
  }

  if (b.action === 'comment') {
    if (b.hp) return json({ comments: [] });                       // honeypot (bot)
    if (typeof b.ms === 'number' && b.ms < 1500) return json({ error: 'Hinay-hinay lang, sulayi pag-usab.' }, 429);
    const name = clean(b.name, 40).replace(/\n/g, ' ');
    const text = clean(b.text, 300);
    if (!name) return json({ error: 'Butangi ang pangalan.' }, 400);
    if (!text) return json({ error: 'Walay sulod ang comment.' }, 400);
    if (await tooFast(request, 'c', 10)) return json({ error: 'Hinay-hinay lang, maghulat og 10 segundo.' }, 429);
    const p = await loadPost(env, id);
    p.c.push({ i: crypto.randomUUID().replace(/-/g, '').slice(0, 10), n: name, t: text, d: new Date().toISOString() });
    if (p.c.length > 200) p.c = p.c.slice(-200);
    await savePost(env, id, p);
    return json({ comments: p.c });
  }

  if (b.action === 'delcomment') {
    if (!okPassword(env, b.password)) return json({ error: 'Sayop ang password.' }, 401);
    const p = await loadPost(env, id);
    p.c = p.c.filter(x => x.i !== b.cid);
    await savePost(env, id, p);
    return json({ comments: p.c });
  }

  return json({ error: 'Unknown action' }, 400);
}
