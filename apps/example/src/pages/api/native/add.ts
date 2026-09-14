// TEMPLATE-ONLY:START(native)
import { addFallback, addSync, isNativeAvailable } from "@myorg/external";

export default async function handleNativeAdd(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const a = Number(url.searchParams.get("a") ?? "1");
  const b = Number(url.searchParams.get("b") ?? "2");

  const result = addSync(a, b);
  const fallback = addFallback(a, b);

  return Response.json({
    a,
    b,
    result,
    fallback,
    match: result === fallback,
    native: isNativeAvailable() ? "rust" : "js-fallback",
    isNativeAvailable: isNativeAvailable(),
  });
}
// TEMPLATE-ONLY:END(native)
