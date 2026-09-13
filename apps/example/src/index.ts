import { FileSystemRouter, serve } from "bun";

const router = new FileSystemRouter({
  style: "nextjs",
  dir: `${import.meta.dir}/pages`,
});

const server = serve({
  port: 3000,

  // Tier 1: Fixed fast-path routes (handled by Bun's native C++ router)
  routes: {
    "/health": () => new Response("OK", { status: 200 }),
  },

  // Tier 2: Dynamic file-based routing fallback
  async fetch(req) {
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
