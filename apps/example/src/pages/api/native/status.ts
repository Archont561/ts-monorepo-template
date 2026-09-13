// TEMPLATE-ONLY:START(native)
import { fibonacciFallback, isNativeAvailable } from "@myorg/external";

export default async function handleNativeStatus(): Promise<Response> {
  // Try dynamic import of native binding
  let nativeBinding: unknown = null;
  let nativeError: string | null = null;
  try {
    // @ts-expect-error — optional
    const mod = await import("@myorg/native");
    nativeBinding = Object.keys(mod);
  } catch (e) {
    nativeError = e instanceof Error ? e.message : String(e);
  }

  // Benchmark fallback vs native (if available)
  const n = 35;
  const start = performance.now();
  const fib = fibonacciFallback(n);
  const fallbackMs = performance.now() - start;

  return Response.json({
    isNativeAvailable: isNativeAvailable(),
    nativeBinding,
    nativeError,
    benchmark: {
      n,
      fallback: {
        result: fib,
        ms: Number(fallbackMs.toFixed(2)),
      },
    },
    env: {
      bun: typeof process !== "undefined" ? process.versions?.bun : undefined,
      platform: typeof process !== "undefined" ? process.platform : undefined,
      arch: typeof process !== "undefined" ? process.arch : undefined,
    },
  });
}
// TEMPLATE-ONLY:END(native)
