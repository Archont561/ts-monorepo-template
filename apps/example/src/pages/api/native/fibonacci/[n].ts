// TEMPLATE-ONLY:START(native)
import { fibonacciFallback, fibonacciSync, isNativeAvailable } from "@myorg/external";

export default function handleFibonacci(_req: Request, params: Record<string, string>): Response {
  const n = Number(params.n ?? "10");
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    return Response.json({ error: "n must be 0-100" }, { status: 400 });
  }

  const start = performance.now();
  const result = fibonacciSync(n);
  const ms = performance.now() - start;

  const startFallback = performance.now();
  const fallback = fibonacciFallback(n);
  const fallbackMs = performance.now() - startFallback;

  return Response.json({
    n,
    result,
    fallback,
    match: result === fallback,
    performance: {
      resultMs: Number(ms.toFixed(3)),
      fallbackMs: Number(fallbackMs.toFixed(3)),
    },
    native: isNativeAvailable() ? "rust" : "js-fallback",
  });
}
// TEMPLATE-ONLY:END(native)
