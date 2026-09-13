import { handleApiIndex, handleGreet, handleHtml, handleShout } from "@src/routes";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": handleHtml,
    "/api": handleApiIndex,
    "/api/greet/:name": (req) => handleGreet(req.params.name),
    "/api/shout/:name": (req) => handleShout(req.params.name),
  },
  fetch() {
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 http://localhost:${server.port}`);
