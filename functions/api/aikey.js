// Gihatag ang Gemini key sa browser (aron ang Google makakita sa location sa tiggamit, dili sa Cloudflare).
// Env var (Secret): GEMINI_API_KEY
export async function onRequestGet({ request, env }) {
  const h = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  if (!env.GEMINI_API_KEY) return new Response(JSON.stringify({ error: 'Wala pa na-set ang GEMINI_API_KEY.' }), { status: 500, headers: h });
  const origin = request.headers.get('Origin');
  if (origin && new URL(origin).host !== new URL(request.url).host)
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: h });
  return new Response(JSON.stringify({ key: env.GEMINI_API_KEY }), { headers: h });
}
