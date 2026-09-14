import { FileSystemRouter, serve } from "bun";
import { appFile, detectFeatures, hasUnocss } from "./features";
import { PORT } from "./port";

/** How long the generated CSS may be cached — the build is deterministic. */
const CSS_CACHE_MAX_AGE_SECONDS = 60;

// Detect opt-in features via file existence (handled via scaffold file deletion)
const { native: nativeEnabled } = await detectFeatures();
// The log line describes which page `/` serves, so it asks about the page itself
// rather than the flag (a surviving config alone does not swap the page).
const unocssEnabled = await hasUnocss();

console.log(
  `🔍 Features: unocss=${unocssEnabled ? "yes" : "no"}, native=${nativeEnabled ? "yes" : "no"}`,
);

const router = new FileSystemRouter({
  style: "nextjs",
  dir: `${import.meta.dir}/pages`,
});

const server = serve({
  port: PORT,

  routes: {
    "/health": () => new Response("OK", { status: 200 }),

    // UnoCSS generated CSS — served always, but returns fallback when unocss not built/disabled
    // Removed via scaffold file deletion (public/uno.css + index-unocss.html)
    "/uno.css": async () => {
      try {
        // Try to serve generated uno.css if exists (built via `munocss build`)
        const unoCssFile = appFile("public/uno.css");
        if (await unoCssFile.exists()) {
          return new Response(await unoCssFile.text(), {
            headers: {
              "Content-Type": "text/css; charset=utf-8",
              "Cache-Control": `public, max-age=${CSS_CACHE_MAX_AGE_SECONDS}`,
            },
          });
        }
      } catch {}
      // Fallback: minimal reset + note — works even when unocss disabled
      return new Response(
        `/* UnoCSS not built — run: bunx unocss --out-file public/uno.css */
/* Using CDN fallback via runtime in index-unocss.html when enabled */`,
        { headers: { "Content-Type": "text/css" } },
      );
    },

    // Native status shortcut — also available via /api/native/status
    // TEMPLATE-ONLY:START(native)
    "/api/native/health": async () => {
      try {
        // @ts-expect-error optional
        const native = await import("@myorg/native").catch(() => null);
        return Response.json({
          native: native ? "available" : "fallback",
          binding: native ? Object.keys(native) : null,
        });
      } catch (e) {
        return Response.json({ native: "error", error: String(e) });
      }
    },
    // TEMPLATE-ONLY:END(native)
  },

  async fetch(req) {
    const url = new URL(req.url);

    // Serve static files from public/ for non-API routes (e.g. /favicon.ico)
    if (!url.pathname.startsWith("/api/") && url.pathname !== "/") {
      try {
        const publicFile = appFile(`public${url.pathname}`);
        if (await publicFile.exists()) {
          const ext = url.pathname.split(".").pop() ?? "";
          const mime: Record<string, string> = {
            css: "text/css",
            js: "application/javascript",
            html: "text/html",
            json: "application/json",
            png: "image/png",
            svg: "image/svg+xml",
          };
          return new Response(publicFile, {
            headers: { "Content-Type": mime[ext] ?? "application/octet-stream" },
          });
        }
      } catch {}
    }

    const match = router.match(req);
    if (!match) {
      return new Response("Not Found", { status: 404 });
    }

    try {
      const mod = await import(match.filePath);
      return await mod.default(req, match.params);
    } catch (error) {
      console.error(`Error executing route ${match.pathname}:`, error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(`🚀 http://localhost:${server.port}`);
console.log(`   / → ${unocssEnabled ? "UnoCSS version" : "plain"} index.html`);
if (nativeEnabled) console.log(`   /api/native → Rust bindings (with JS fallback)`);
