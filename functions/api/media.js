// BCM Posts & Videos  ->  /api/media   (Cloudflare Pages Function)
// Env vars: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, ADMIN_PASSWORD
const TAG = 'bcm-post';
const FOLDER = 'bcm';

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });

function okPassword(env, pw) {
  if (!pw || typeof pw !== 'string') return false;
  const list = String(env.ADMIN_PASSWORD || '').split(',').map(s => s.trim()).filter(Boolean);
  return list.some(p => p.length === pw.length && p === pw);
}

async function sha1hex(str) {
  const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const basic = env => 'Basic ' + btoa(env.CLOUDINARY_API_KEY + ':' + env.CLOUDINARY_API_SECRET);

function decCap(c) { try { return decodeURIComponent(c); } catch (e) { return c; } }

const STUB = 250;   // unsa ka taas ang caption nga diretso sa Cloudinary; ang taas nga bahin naa sa KV

async function listType(env, type) {
  const url = `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/${type}/tags/${TAG}?max_results=500&context=true`;
  const r = await fetch(url, { headers: { Authorization: basic(env) } });
  if (!r.ok) throw new Error('Cloudinary list error ' + r.status);
  const j = await r.json();
  return (j.resources || []).map(x => ({
    id: x.public_id,
    type,
    url: x.secure_url,
    w: x.width,
    h: x.height,
    caption: decCap((x.context && x.context.custom && x.context.custom.caption) || ''),
    group: (x.context && x.context.custom && x.context.custom.group) || '',
    more: !!(x.context && x.context.custom && x.context.custom.more),
    idx: Number((x.context && x.context.custom && x.context.custom.idx) || 0),
    created: x.created_at,
  }));
}

export async function onRequestGet({ request, env }) {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET)
    return json({ error: 'Wala pa na-set ang Cloudinary variables sa Cloudflare.' }, 500);

  const t = Number(new URL(request.url).searchParams.get('t') || 0);
  const fresh = t > 1e11;                       // admin refresh = skip cache
  const cache = caches.default;
  const key = new Request('https://bcm.cache/media-list');
  if (!fresh) {
    const hit = await cache.match(key);
    if (hit) return hit;
  }
  try {
    const [imgs, vids] = await Promise.all([listType(env, 'image'), listType(env, 'video')]);
    const items = imgs.concat(vids).sort((a, b) => (a.created < b.created ? 1 : -1));
    // Taas nga caption: kuhaon ang bug-os gikan sa KV (usa ra matag group)
    if (env.CHAT) {
      const gs = [...new Set(items.filter(i => i.more && i.group).map(i => i.group))];
      const full = {};
      await Promise.all(gs.map(async g => { try { const v = await env.CHAT.get('cap:' + g); if (v) full[g] = v; } catch (e) {} }));
      items.forEach(i => { if (i.more && full[i.group]) i.caption = full[i.group]; delete i.more; });
    } else items.forEach(i => { delete i.more; });
    const res = json({ items }, 200, { 'Cache-Control': 'public, max-age=30' });
    if (!fresh) await cache.put(key, res.clone());
    return res;
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch (e) { return json({ error: 'Bad request' }, 400); }
  if (!okPassword(env, b.password)) return json({ error: 'Sayop ang password.' }, 401);

  if (b.action === 'check') return json({ ok: true });

  if (b.action === 'sign') {
    // Caption gi-encode (safe sa Cloudinary context); gi-decode balik sa listType
    const rawCap = String(b.caption || '').replace(/\r/g, '').trim().slice(0, 5000);
    // Album: ang tanang litrato sa usa ka post parehas og group id; idx = han-ay sa slider
    const group = /^[a-z0-9]{6,24}$/.test(String(b.group || '')) ? String(b.group) : '';
    const idx = Number.isInteger(b.idx) && b.idx >= 0 && b.idx < 100 ? b.idx : 0;
    const ctx = [];
    const long = rawCap.length > STUB && group && env.CHAT;
    const caption = encodeURIComponent((long ? rawCap : rawCap.slice(0, STUB)).replace(/\s+/g, ' ').slice(0, STUB));
    if (long && idx === 0) await env.CHAT.put('cap:' + group, rawCap);
    if (caption) ctx.push('caption=' + caption);
    if (long) ctx.push('more=1');
    if (group) ctx.push('group=' + group, 'idx=' + idx);
    const params = {
      context: ctx.join('|'),
      folder: FOLDER,
      tags: TAG,
      timestamp: String(Math.floor(Date.now() / 1000)),
    };
    if (!params.context) delete params.context;
    const toSign = Object.keys(params).sort().map(k => k + '=' + params[k]).join('&');
    const signature = await sha1hex(toSign + env.CLOUDINARY_API_SECRET);
    return json({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      signature,
      folder: FOLDER,
      tags: TAG,
      context: params.context || '',
      timestamp: params.timestamp,
    });
  }

  if (b.action === 'delete') {
    const type = b.type === 'video' ? 'video' : 'image';
    const r = await fetch(
      `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/resources/${type}/upload?public_ids[]=${encodeURIComponent(b.id)}&invalidate=true`,
      { method: 'DELETE', headers: { Authorization: basic(env) } }
    );
    if (!r.ok) return json({ error: 'Cloudinary delete error ' + r.status }, 502);
    await caches.default.delete(new Request('https://bcm.cache/media-list'));
    return json({ ok: true });
  }

  return json({ error: 'Unknown action' }, 400);
}
