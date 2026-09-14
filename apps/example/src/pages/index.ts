import { appFile } from "../features";

export default async function handleHtml(): Promise<Response> {
  // When unocss enabled, index.html is replaced with index-unocss.html via setup.ts (mv)
  // When disabled, index-unocss.html is deleted via scaffold config, plain index.html remains
  // Handled via file deletion + runtime existence check
  try {
    const unocssHtml = appFile("public/index-unocss.html");
    if (await unocssHtml.exists()) {
      // Dev mode: unocss enabled but setup not yet run — serve unocss version directly
      const html = await unocssHtml.text();
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  } catch {}

  const html = await appFile("public/index.html").text();
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
