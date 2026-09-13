import { file } from "bun";

export default async function handleApiIndex(): Promise<Response> {
  const endpoints = ["/health", "/api/greet/:name", "/api/shout/:name"];

  // Native endpoints — file existence check, file deleted via scaffold when native disabled
  // TEMPLATE-ONLY:START(native)
  try {
    const nativeIndex = file(new URL("./native/index.ts", import.meta.url));
    if (await nativeIndex.exists()) {
      endpoints.push(
        "/api/native",
        "/api/native/add?a=1&b=2",
        "/api/native/fibonacci/:n",
        "/api/native/status",
      );
    }
  } catch {}
  // TEMPLATE-ONLY:END(native)

  // UnoCSS endpoint — file existence check, file deleted via scaffold when unocss disabled
  try {
    const unoConfig = file(new URL("../../../../configs/unocss/uno.config.ts", import.meta.url));
    if (await unoConfig.exists()) {
      endpoints.push("/uno.css");
    }
  } catch {}

  // Also check if uno.css route exists in public (alternative detection)
  try {
    const unocssHtml = file(new URL("../../../public/index-unocss.html", import.meta.url));
    if (await unocssHtml.exists()) {
      if (!endpoints.includes("/uno.css")) endpoints.push("/uno.css");
    }
  } catch {}

  // Fallback: check if index.html contains UnoCSS (when setup already moved file)
  try {
    const indexHtml = file(new URL("../../../public/index.html", import.meta.url));
    const html = await indexHtml.text();
    if (html.includes("UnoCSS") && !endpoints.includes("/uno.css")) {
      endpoints.push("/uno.css");
    }
  } catch {}

  return Response.json({
    message: "Bun Monorepo Example",
    endpoints,
    features: {
      unocss: endpoints.includes("/uno.css"),
      // TEMPLATE-ONLY:START(native)
      native: endpoints.some((e) => e.includes("/api/native")),
      // TEMPLATE-ONLY:END(native)
    },
  });
}
