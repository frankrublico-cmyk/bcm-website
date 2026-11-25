// BCM Prayer Request chat  ->  /api/chat   (Cloudflare Pages Function)
// Env vars: CHAT_ADMIN_PASSWORD      KV binding: CHAT
const KEY = 'threads';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

function okPassword(env, pw) {
  if (!pw || typeof pw !== 'string') return false;
  const list = String(env.CHAT_ADMIN_PASSWORD || '').split(',').map(s => s.trim()).filter(Boolean);
  return list.some(p => p.length === pw.length && p === pw);
}
const validToken = t => typeof t === 'string' && /^[a-f0-9]{32}$/.test(t);
const clean = (s, n) => String(s == null ? '' : s).trim().slice(0, n);

async function readAll(env) {
  const raw = await env.CHAT.get(KEY);
  try { return raw ? JSON.parse(raw) : {}; } catch (e) { return {}; }
}
const writeAll = (env, all) => env.CHAT.put(KEY, JSON.stringify(all));

export async function onRequestPost({ request, env }) {
  if (!env.CHAT) return json({ error: 'Wala pa na-bind ang KV (CHAT) sa Cloudflare.' }, 500);
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'Bad request' }, 400); }
  const now = new Date().toISOString();

  /* ---------- visitor ---------- */
  if (b.action === 'send') {
    if (b.hp) return json({ ok: true });                       // honeypot (bot)
    if (!validToken(b.token)) return json({ error: 'Bad token' }, 400);
    if (typeof b.ms === 'number' && b.ms < 1500) return json({ error: 'Hinay-hinay lang, sulayi pag-usab.' }, 429);
    const text = clean(b.text, 600);
    if (!text) return json({ error: 'Walay sulod ang mensahe.' }, 400);
    const all = await readAll(env);
    let t = all[b.token];
    if (!t) {
      const name = clean(b.name, 60);
      if (!name) return json({ error: 'Butangi ang pangalan.' }, 400);
      if (Object.keys(all).length >= 2000) return json({ error: 'Puno na ang inbox.' }, 507);
      t = all[b.token] = { token: b.token, name, msgs: [], updated: now };
    }
    if (t.msgs.length >= 200) return json({ error: 'Daghan na kaayo ang mensahe.' }, 429);
    t.msgs.push({ r: 'v', t: text, at: now });
    t.updated = now;
    await writeAll(env, all);
    return json({ ok: true });
  }

  if (b.action === 'get') {
    if (!validToken(b.token)) return json({ error: 'Bad token' }, 400);
    const all = await readAll(env);
    const t = all[b.token];
    return json({ thread: t ? { name: t.name, msgs: t.msgs } : { name: '', msgs: [] } });
  }

  /* ---------- admin ---------- */
  if (!okPassword(env, b.password)) return json({ error: 'Sayop ang password.' }, 401);

  if (b.action === 'list') {
    const all = await readAll(env);
    const threads = Object.values(all).sort((a, c) => (a.updated < c.updated ? 1 : -1));
    return json({ threads });
  }

  if (b.action === 'reply') {
    if (!validToken(b.token)) return json({ error: 'Bad token' }, 400);
    const text = clean(b.text, 1000);
    if (!text) return json({ error: 'Walay sulod ang reply.' }, 400);
    const all = await readAll(env);
    const t = all[b.token];
    if (!t) return json({ error: 'Wala na ang chat.' }, 404);
    t.msgs.push({ r: 'a', t: text, at: now });
    t.updated = now;
    await writeAll(env, all);
    return json({ thread: t });
  }

  if (b.action === 'delete') {
    if (!validToken(b.token)) return json({ error: 'Bad token' }, 400);
    const all = await readAll(env);
    delete all[b.token];
    await writeAll(env, all);
    return json({ ok: true });
  }

  return json({ error: 'Unknown action' }, 400);
}
