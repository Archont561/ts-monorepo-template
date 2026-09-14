/**
 * Native bindings wrapper with JS fallback.
 * Tries to load @myorg/native (Rust + napi-rs), falls back to JS implementation if unavailable.
 *
 * Import only from server modules — browser cannot load .node.
 */

// JS fallbacks (pure TS, always available)
export function addFallback(a: number, b: number): number {
  return a + b;
}

export function fibonacciFallback(n: number): number {
  if (n <= 1) return n;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}

export function reverseStringFallback(s: string): string {
  return s.split("").reverse().join("");
}

// Native bindings (optional, loaded dynamically)
let nativeBinding: {
  add: (a: number, b: number) => number;
  fibonacci: (n: number) => number;
  reverse_string: (s: string) => string;
  Counter: new (
    initial?: number,
  ) => {
    increment: () => number;
    decrement: () => number;
    get_count: () => number;
  };
  primes_up_to: (n: number) => number[];
} | null = null;

let nativeLoadAttempted = false;

async function loadNative(): Promise<typeof nativeBinding> {
  if (nativeLoadAttempted) return nativeBinding;
  nativeLoadAttempted = true;

  try {
    // Dynamic import to avoid bundling .node into browser
    // @ts-expect-error — optional dependency, may not exist when native=none
    const mod = await import("@myorg/native").catch(() => null);
    if (mod) {
      nativeBinding = mod;
      console.log("✅ Native bindings loaded (Rust speed)");
    }
  } catch {
    console.warn("⚠️ Native bindings not available, using JS fallback");
  }

  return nativeBinding;
}

// Eager load in Bun/Node (not in browser)
if (typeof process !== "undefined" && process.versions?.bun) {
  loadNative().catch(() => {});
}

// Public API with fallback
export async function add(a: number, b: number): Promise<number> {
  const native = await loadNative();
  if (native) return native.add(a, b);
  return addFallback(a, b);
}

export function addSync(a: number, b: number): number {
  if (nativeBinding) return nativeBinding.add(a, b);
  return addFallback(a, b);
}

export async function fibonacci(n: number): Promise<number> {
  const native = await loadNative();
  if (native) return native.fibonacci(n);
  return fibonacciFallback(n);
}

export function fibonacciSync(n: number): number {
  if (nativeBinding) return nativeBinding.fibonacci(n);
  return fibonacciFallback(n);
}

export async function reverseString(s: string): Promise<string> {
  const native = await loadNative();
  if (native) return native.reverse_string(s);
  return reverseStringFallback(s);
}

export function isNativeAvailable(): boolean {
  return nativeBinding !== null;
}

export async function getNativeBinding() {
  return loadNative();
}
