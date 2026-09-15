import { appFile } from "@/src/features";

export default async function handleHtml(): Promise<Response> {
  const html = await appFile("public/index.html").text();
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
