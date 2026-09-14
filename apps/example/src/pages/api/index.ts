import { detectFeatures } from "../../features";

export default async function handleApiIndex(): Promise<Response> {
  const features = await detectFeatures();
  const endpoints = ["/health", "/api/greet/:name", "/api/shout/:name"];

  // Native endpoints — the routes are deleted by the scaffolder when native is
  // declined, so the flag comes from file existence at runtime.
  // TEMPLATE-ONLY:START(native)
  if (features.native) {
    endpoints.push(
      "/api/native",
      "/api/native/add?a=1&b=2",
      "/api/native/fibonacci/:n",
      "/api/native/primes/:n",
      "/api/native/reverse?text=hello",
      "/api/native/status",
    );
  }
  // TEMPLATE-ONLY:END(native)

  // UnoCSS endpoint — either the config package or a UnoCSS page surviving
  // scaffolding means `munocss build` output is served at /uno.css.
  if (features.unocss) {
    endpoints.push("/uno.css");
  }

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
