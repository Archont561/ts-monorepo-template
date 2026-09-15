import { serve } from "bun";
import { appFile, detectFeatures } from "./features";
import handleGreet from "./pages/api/greet/[name]";
import handleApiIndex from "./pages/api/index";
// TEMPLATE-ONLY:START(native)
import handleNativeAdd from "./pages/api/native/add";
import handleNativeFibonacci from "./pages/api/native/fibonacci/[n]";
import handleNativeIndex from "./pages/api/native/index";
import handleNativePrimes from "./pages/api/native/primes/[n]";
import handleNativeReverse from "./pages/api/native/reverse";
import handleNativeStatus from "./pages/api/native/status";
// TEMPLATE-ONLY:END(native)
import handleShout from "./pages/api/shout/[name]";
import handleHtml from "./pages/index";
import { PORT } from "./port";

// Detect opt-in features via file existence (handled via scaffold file deletion)
const { native: nativeEnabled } = await detectFeatures();

console.log(`🔍 Features: native=${nativeEnabled ? "yes" : "no"}`);

export const server = serve({
  port: PORT,

  routes: {
    // Static HTML page
    "/": () => handleHtml(),

    // Health check endpoint
    "/health": new Response("OK", { status: 200 }),

    // API index
    "/api": () => handleApiIndex(),

    // Dynamic greeting route
    "/api/greet/:name": (req) => handleGreet(req, req.params),

    // Dynamic shouting route
    "/api/shout/:name": (req) => handleShout(req, req.params),

    // Native Node-API routes
    // TEMPLATE-ONLY:START(native)
    "/api/native": () => handleNativeIndex(),
    "/api/native/status": () => handleNativeStatus(),
    "/api/native/add": (req) => handleNativeAdd(req),
    "/api/native/fibonacci/:n": (req) => handleNativeFibonacci(req, req.params),
    "/api/native/primes/:n": (req) => handleNativePrimes(req, req.params),
    "/api/native/reverse": (req) => handleNativeReverse(req),
    "/api/native/health": async () => {
      try {
        // @ts-expect-error optional
        const nativeMod = await import("@myorg/native").catch(() => null);
        return Response.json({
          native: nativeMod ? "available" : "fallback",
          binding: nativeMod ? Object.keys(nativeMod) : null,
        });
      } catch (e) {
        return Response.json({ native: "error", error: String(e) });
      }
    },
    // TEMPLATE-ONLY:END(native)

    // Favicon
    "/favicon.ico": appFile("public/favicon.ico"),

    // Wildcard route for all unmatched API routes
    "/api/*": Response.json({ message: "Not found" }, { status: 404 }),
  },

  async fetch(req) {
    const url = new URL(req.url);

    // Serve static files from public/ for non-API routes
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

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 http://localhost:${server.port}`);
if (nativeEnabled) console.log(`   /api/native → Rust bindings (with JS fallback)`);
