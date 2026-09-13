// TEMPLATE-ONLY:START(native)
export default function handleNativeIndex(): Response {
  return Response.json({
    message: "Native bindings (Rust via napi-rs) with JS fallback",
    endpoints: [
      "/api/native/add?a=1&b=2",
      "/api/native/fibonacci/:n",
      "/api/native/primes/:n",
      "/api/native/reverse?text=hello",
      "/api/native/status",
    ],
    note: "Uses @myorg/external native wrapper — Rust when .node available, JS fallback otherwise",
  });
}
// TEMPLATE-ONLY:END(native)
