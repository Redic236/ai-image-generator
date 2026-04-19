/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Cloudflare Worker URL used to proxy image CDN requests.
   *  Example: https://ai-image-proxy.yourname.workers.dev
   *  Leave empty to fall back to direct CDN loading (useful offline). */
  readonly VITE_PROXY_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
