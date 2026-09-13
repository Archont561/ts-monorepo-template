import { file } from "bun";

export default async function handleHtml(): Promise<Response> {
  const html = await file(new URL("../../public/index.html", import.meta.url)).text();
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
