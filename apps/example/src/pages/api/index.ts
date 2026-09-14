import { detectFeatures } from "../../features";
// TEMPLATE-ONLY:START(native)
import { native } from "../../features/native";
// TEMPLATE-ONLY:END(native)
import { unocss } from "../../features/unocss";

export default async function handleApiIndex(): Promise<Response> {
  const features = await detectFeatures();
  const endpoints = ["/health", "/api/greet/:name", "/api/shout/:name"];

  // Native endpoints — the routes are deleted by the scaffolder when native is
  // declined, so the flag comes from file existence at runtime.
  // TEMPLATE-ONLY:START(native)
  if (features.native) {
    endpoints.push(...native.endpoints());
  }
  // TEMPLATE-ONLY:END(native)

  // UnoCSS endpoint — either the config package or a UnoCSS page surviving
  // scaffolding means `munocss build` output is served at /uno.css.
  if (features.unocss) {
    endpoints.push(...unocss.endpoints());
  }

  return Response.json({
    message: "Bun Monorepo Example",
    endpoints,
    features: {
      unocss: features.unocss,
      // TEMPLATE-ONLY:START(native)
      native: features.native,
      // TEMPLATE-ONLY:END(native)
    },
  });
}
