/**
 * Cloudflare Worker: image proxy for the AI image generator.
 *
 * Fetches an image from an allowlisted upstream host and streams it back
 * with CORS headers, so browsers on networks that can't complete the TLS
 * handshake to the origin (e.g. Zhipu's CDN on some ISPs in China) can
 * still display generated images.
 *
 * Route: GET /proxy?url=<encoded-image-url>
 */

// Only proxy to hosts ending with one of these suffixes. Prevents the worker
// from being abused as a generic open proxy.
const ALLOWED_HOST_SUFFIXES = [
  '.ufileos.com',      // Zhipu image CDN (UCloud)
  '.bigmodel.cn',      // Zhipu API
  '.zhipuai.cn',       // Legacy Zhipu host
  '.aliyuncs.com',     // Occasional alternative CDN
] as const;

const UPSTREAM_TIMEOUT_MS = 30_000;

function corsHeaders(extra: Record<string, string> = {}): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...extra,
  };
}

function isAllowedHost(host: string | null): boolean {
  if (!host) return false;
  return ALLOWED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix));
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Health check: GET / returns a small status page
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(
        JSON.stringify({
          service: 'ai-image-proxy',
          status: 'ok',
          route: '/proxy?url=<encoded>',
          allowedHosts: ALLOWED_HOST_SUFFIXES,
        }),
        {
          status: 200,
          headers: corsHeaders({ 'Content-Type': 'application/json' }),
        }
      );
    }

    if (url.pathname !== '/proxy') {
      return new Response('Not Found', { status: 404, headers: corsHeaders() });
    }
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders(),
      });
    }

    const target = url.searchParams.get('url');
    if (!target) {
      return new Response('Missing url parameter', {
        status: 400,
        headers: corsHeaders(),
      });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(target);
    } catch {
      return new Response('Invalid url', {
        status: 400,
        headers: corsHeaders(),
      });
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
      return new Response('Invalid scheme', {
        status: 400,
        headers: corsHeaders(),
      });
    }
    if (!isAllowedHost(targetUrl.hostname)) {
      return new Response(`Host not allowed: ${targetUrl.hostname}`, {
        status: 403,
        headers: corsHeaders(),
      });
    }

    // Fetch upstream with a timeout so a hung origin can't pin the Worker.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const upstream = await fetch(targetUrl.toString(), {
        method: 'GET',
        headers: {
          'User-Agent': 'ai-image-proxy/1.0 (+cloudflare-workers)',
          Accept: '*/*',
        },
        signal: controller.signal,
        // Cloudflare-specific: cache GET images at the edge.
        cf: {
          cacheTtl: 3600,
          cacheEverything: true,
        },
      });

      // Pass through the body; copy content-type and add CORS + cache headers.
      const headers = new Headers(corsHeaders());
      const ct = upstream.headers.get('content-type');
      if (ct) headers.set('Content-Type', ct);
      headers.set('Cache-Control', 'public, max-age=3600');

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown';
      return new Response(`Upstream fetch failed: ${message}`, {
        status: 502,
        headers: corsHeaders(),
      });
    } finally {
      clearTimeout(timeout);
    }
  },
};
