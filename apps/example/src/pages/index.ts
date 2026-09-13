import { file } from "bun";

export default async function handleHtml(): Promise<Response> {
  // When unocss enabled, index.html is replaced with index-unocss.html content via setup.ts
  // When disabled, index-unocss.html is deleted and plain index.html remains
  // TEMPLATE-ONLY:START(unocss)
  // Try UnoCSS version first if it exists (dev mode without setup replacement)
  try {
    const unocssHtml = file(new URL("../../public/index-unocss.html", import.meta.url));
    if (await unocssHtml.exists()) {
      // In dev with unocss enabled, serve unocss version directly
      // In scaffolded project with unocss enabled, index.html already IS unocss version
      // This fallback handles both cases
      const html = await unocssHtml.text();
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  } catch {}
  // TEMPLATE-ONLY:END(unocss)

  const html = await file(new URL("../../public/index.html", import.meta.url)).text();
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
