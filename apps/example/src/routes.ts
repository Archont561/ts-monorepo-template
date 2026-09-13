import { formatUppercase, greetUser, type UserProfile } from "@myorg/external";

export async function handleHtml(): Promise<Response> {
  const html = await Bun.file(new URL("../public/index.html", import.meta.url)).text();
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export function handleApiIndex(): Response {
  return Response.json({
    message: "Bun Monorepo Example",
    endpoints: ["/api/greet/:name", "/api/shout/:name"],
  });
}

export function handleGreet(name: string): Response {
  const user: UserProfile = {
    id: crypto.randomUUID(),
    name,
  };
  return Response.json({ greeting: greetUser(user) });
}

export function handleShout(name: string): Response {
  return Response.json({ shouted: formatUppercase(`Hello, ${name}!`) });
}
