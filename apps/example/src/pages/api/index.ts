import { file } from "bun";

export default async function handleApiIndex(): Promise<Response> {
  const endpoints = ["/health", "/api/greet/:name", "/api/shout/:name"];

  // TEMPLATE-ONLY:START(native)
  // Add native endpoints when native config enabled
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

  // TEMPLATE-ONLY:START(unocss)
  try {
    const unoConfig = file(new URL("../../../../uno.config.ts", import.meta.url));
    if (await unoConfig.exists()) {
      endpoints.push("/uno.css");
    }
  } catch {}
  // TEMPLATE-ONLY:END(unocss)

  return Response.json({
    message: "Bun Monorepo Example",
    endpoints,
    features: {
      // TEMPLATE-ONLY:START(unocss)
      unocss: true,
      // TEMPLATE-ONLY:END(unocss)
      // TEMPLATE-ONLY:START(native)
      native: true,
      // TEMPLATE-ONLY:END(native)
    },
  });
}
