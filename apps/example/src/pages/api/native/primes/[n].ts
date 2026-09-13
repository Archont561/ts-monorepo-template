// TEMPLATE-ONLY:START(native)
export default async function handlePrimes(
  _req: Request,
  params: Record<string, string>,
): Promise<Response> {
  const n = Number(params.n ?? "100");
  if (!Number.isFinite(n) || n < 1 || n > 10000) {
    return Response.json({ error: "n must be 1-10000" }, { status: 400 });
  }

  // Try native primes_up_to if available
  let result: number[];
  let source: string;

  try {
    // @ts-expect-error — optional
    const native = await import("@myorg/native");
    if (native.primes_up_to) {
      result = native.primes_up_to(n);
      source = "rust";
    } else {
      throw new Error("primes_up_to not in native");
    }
  } catch {
    // JS fallback sieve
    result = primesFallback(n);
    source = "js-fallback";
  }

  return Response.json({
    n,
    count: result.length,
    primes: result.slice(0, 100),
    truncated: result.length > 100,
    source,
  });
}

function primesFallback(n: number): number[] {
  const sieve = new Array(n + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i * i <= n; i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) sieve[j] = false;
    }
  }
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) if (sieve[i]) primes.push(i);
  return primes;
}
// TEMPLATE-ONLY:END(native)
