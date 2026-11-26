// Gemini proxy  ->  /api/ai?model=gemini-xxx   (Cloudflare Pages Function)
// Env var (Secret): GEMINI_API_KEY
export async function onRequestPost({ request, env }) {
  const err = (m, s) =>
    new Response(JSON.stringify({ error: { message: m } }), {
      status: s, headers: { 'Content-Type': 'application/json' },
    });

  if (!env.GEMINI_API_KEY) return err('Wala pa na-set ang GEMINI_API_KEY sa Cloudflare.', 500);

  // dawaton ra gikan sa samang website
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host) return err('Forbidden', 403);

  const model = new URL(request.url).searchParams.get('model') || 'gemini-2.5-flash';
  if (!/^gemini-[a-z0-9.\-]+$/i.test(model)) return err('Bad model', 400);

  const raw = await request.text();
  if (raw.length > 20000) return err('Taas kaayo ang prompt.', 413);
  let body;
  try { body = JSON.parse(raw); } catch (e) { return err('Bad request', 400); }
  const text = body && body.contents && body.contents[0] && body.contents[0].parts && body.contents[0].parts[0] && body.contents[0].parts[0].text;
  if (typeof text !== 'string' || !text) return err('Bad request', 400);

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text }] }] }),
    }
  );
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const t = await r.text();
  if (!r.ok) return new Response(t, { status: r.status, headers });

  // kuhaon ang tinuod nga text (laktawan ang "thought" parts)
  let out = '';
  try {
    const j = JSON.parse(t);
    const cand = j.candidates && j.candidates[0];
    const parts = (cand && cand.content && cand.content.parts) || [];
    out = parts.filter(p => typeof p.text === 'string' && !p.thought).map(p => p.text).join('');
    if (!out) {
      const why = (cand && cand.finishReason) || (j.promptFeedback && j.promptFeedback.blockReason) || 'walay sulod';
      return err('Walay text nga gibalik (' + why + ')', 502);
    }
  } catch (e) { return err('Sayop ang tubag sa Gemini.', 502); }
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: out }] } }] }), { status: 200, headers });
}
