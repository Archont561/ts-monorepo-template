import { FileSystemRouter, file, serve } from "bun";

// Detect opt-in features via file existence / env
// Unocss detection now via file existence only (handled via scaffold file deletion)
const hasUnocss =
  (await file(new URL("../../public/index-unocss.html", import.meta.url))
    .exists()
    .catch(() => false)) ||
  (await file(new URL("../../public/index.html", import.meta.url))
    .text()
    .then((t) => t.includes("unocss") || t.includes("UnoCSS"))
    .catch(() => false));
const hasNative = await file(new URL("./pages/api/native/index.ts", import.meta.url))
  .exists()
  .catch(() => false);

console.log(`🔍 Features: unocss=${hasUnocss ? "yes" : "no"}, native=${hasNative ? "yes" : "no"}`);

const router = new FileSystemRouter({
  style: "nextjs",
  dir: `${import.meta.dir}/pages`,
});

const server = serve({
  port: 3000,

  routes: {
    "/health": () => new Response("OK", { status: 200 }),

    // UnoCSS generated CSS — served always, but returns fallback when unocss not built/disabled
    // Removed via scaffold file deletion (public/uno.css + index-unocss.html)
    "/uno.css": async () => {
      try {
        // Try to serve generated uno.css if exists (built via `bunx unocss`)
        const unoCssFile = file(new URL("../../public/uno.css", import.meta.url));
        if (await unoCssFile.exists()) {
          return new Response(await unoCssFile.text(), {
            headers: {
              "Content-Type": "text/css; charset=utf-8",
              "Cache-Control": "public, max-age=60",
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
        const publicFile = file(new URL(`../../public${url.pathname}`, import.meta.url));
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
console.log(`   / → ${hasUnocss ? "UnoCSS version" : "plain"} index.html`);
if (hasNative) console.log(`   /api/native → Rust bindings (with JS fallback)`);
