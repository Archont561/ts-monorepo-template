import { detectFeatures } from "../../features";
// TEMPLATE-ONLY:START(native)
import { native } from "../../features/native";
// TEMPLATE-ONLY:END(native)

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

  return Response.json({
    message: "Bun Monorepo Example",
    endpoints,
    features: {
      // TEMPLATE-ONLY:START(native)
      native: features.native,
      // TEMPLATE-ONLY:END(native)
    },
  });
}
