"""Local dev server + image proxy for the AI image generator.

Why this exists: some local networks / security software in China block the
HTTPS handshake to Zhipu's image CDN (*.ufileos.com), so the browser can't
load generated images. Running this proxy side-steps the issue by fetching
images from the Python runtime (where the TLS stack works) and streaming
them back to the browser as a same-origin response.

Usage:
    python server.py              # default port 8000
    python server.py 8080         # custom port
"""

from __future__ import annotations

import http.server
import socketserver
import ssl
import sys
import urllib.parse
import urllib.request
from pathlib import Path

DEFAULT_PORT = 8000
ROOT = Path(__file__).resolve().parent

# Only proxy to these hosts. Keeps the proxy from being abused as a general
# SSRF tool even though it only listens on localhost.
ALLOWED_HOST_SUFFIXES = (
    ".ufileos.com",       # Zhipu image CDN (UCloud object storage)
    ".bigmodel.cn",       # Zhipu API host
    ".zhipuai.cn",        # Legacy Zhipu host
    ".aliyuncs.com",      # Alternative CDN sometimes used
)

REQUEST_TIMEOUT = 30


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):  # noqa: N802 — stdlib naming
        if self.path.startswith("/proxy?") or self.path == "/proxy":
            self.handle_proxy()
            return
        super().do_GET()

    def handle_proxy(self) -> None:
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        target = (params.get("url") or [""])[0]

        if not target:
            self.send_error(400, "Missing url parameter")
            return

        parsed = urllib.parse.urlparse(target)
        if parsed.scheme not in ("http", "https"):
            self.send_error(400, "Invalid URL scheme")
            return
        if not any(parsed.hostname and parsed.hostname.endswith(s) for s in ALLOWED_HOST_SUFFIXES):
            self.send_error(403, f"Host not in allowlist: {parsed.hostname}")
            return

        try:
            req = urllib.request.Request(
                target,
                headers={
                    "User-Agent": "Mozilla/5.0 (local-proxy) AIImageGen/1.0",
                    "Accept": "*/*",
                },
            )
            ctx = ssl.create_default_context()
            with urllib.request.urlopen(req, context=ctx, timeout=REQUEST_TIMEOUT) as resp:
                content_type = resp.headers.get("Content-Type", "application/octet-stream")
                self.send_response(resp.status)
                self.send_header("Content-Type", content_type)
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Cache-Control", "public, max-age=3600")
                self.end_headers()
                while True:
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
        except urllib.error.HTTPError as e:
            self.send_error(e.code, f"Upstream HTTP error: {e.reason}")
        except urllib.error.URLError as e:
            self.send_error(502, f"Upstream unreachable: {e.reason}")
        except Exception as e:  # noqa: BLE001
            self.send_error(502, f"Proxy error: {e}")

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write(f"[server] {fmt % args}\n")


class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def main() -> None:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    with ThreadedServer(("127.0.0.1", port), Handler) as httpd:
        print(f"Server running at http://localhost:{port}")
        print(f"  Static root : {ROOT}")
        print(f"  Proxy route : /proxy?url=<encoded-url>")
        print(f"  Allowed hosts: {', '.join(ALLOWED_HOST_SUFFIXES)}")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down.")


if __name__ == "__main__":
    main()
