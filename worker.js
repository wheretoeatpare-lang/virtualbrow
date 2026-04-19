// ════════════════════════════════════════════════════════
//  VirBro — Cloudflare Worker
//  • GET  /*          → serves index.html (static asset)
//  • GET  /proxy?url= → built-in web proxy (replaces corsproxy.io)
// ════════════════════════════════════════════════════════

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ── CORS preflight ──
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // ── Built-in proxy — replaces corsproxy.io ──
    if (url.pathname === '/proxy') {
      const target = url.searchParams.get('url');
      if (!target) {
        return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      try {
        const targetUrl = new URL(target);
        const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
        if (blocked.some(b => targetUrl.hostname === b) ||
            targetUrl.hostname.startsWith('192.168.') ||
            targetUrl.hostname.startsWith('10.')) {
          return new Response(JSON.stringify({ error: 'Blocked target' }), {
            status: 403,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
          });
        }
        const proxyResp = await fetch(targetUrl.toString(), {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          redirect: 'follow',
        });
        const respHeaders = new Headers(proxyResp.headers);
        respHeaders.delete('x-frame-options');
        respHeaders.delete('X-Frame-Options');
        respHeaders.delete('content-security-policy');
        respHeaders.delete('Content-Security-Policy');
        respHeaders.set('Access-Control-Allow-Origin', '*');
        return new Response(proxyResp.body, {
          status: proxyResp.status,
          headers: respHeaders,
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── All other routes → serve static assets (index.html) ──
    return env.ASSETS.fetch(request);
  },
};
