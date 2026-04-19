/**
 * Route remote image URLs through the Cloudflare Worker when VITE_PROXY_URL
 * is set. Returns the raw URL otherwise, so the app stays functional even
 * before the Worker is deployed.
 */
export function proxied(url: string | null | undefined): string {
  if (!url) return '';
  if (!/^https?:/i.test(url)) return url;

  const proxyBase = import.meta.env.VITE_PROXY_URL?.trim();
  if (!proxyBase) return url;

  try {
    const u = new URL(url);
    if (u.origin === window.location.origin) return url;
  } catch {
    return url;
  }
  return `${proxyBase.replace(/\/$/, '')}/proxy?url=${encodeURIComponent(url)}`;
}
