export default function handleApiIndex(): Response {
  return Response.json({
    message: "Bun Monorepo Example",
    endpoints: ["/health", "/api/greet/:name", "/api/shout/:name"],
  });
}
