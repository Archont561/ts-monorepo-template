# @myorg/native

> Native Rust bindings via napi-rs — with WASM fallback and platform-specific binaries.

## What it provides

- Rust crate (`Cargo.toml`, `cdylib`) with `#[napi]` macros
- `add`, `fibonacci`, `reverse_string`, `Counter` class, `primes_up_to`, async `fetch_data_simulated`
- napi-rs build: native `.node` + WASI `.wasi.cjs` fallback
- Platform-specific npm packages via `napi create-npm-dirs` + `artifacts` + `pre-publish`

> [!IMPORTANT]
> Opt-in — selected during `bun create Archont561/ts-monorepo-template` via `Set up native Node-API bindings?`

## Architecture

```mermaid
graph TD
    A[Rust src/lib.rs<br/>#[napi]] --> B[napi build --platform]
    B --> C[*.node<br/>native binary]
    B --> D[index.js<br/>loader]
    A --> E[napi build --target wasm32-wasip1-threads]
    E --> F[*.wasi.cjs<br/>WASM fallback]
    C --> G[@myorg/external<br/>tries native]
    F --> G
    G --> H[JS fallback if no native]

    style A fill:#dea584,stroke:#fff,color:#000
    style C fill:#f6f8fa,stroke:#dea584
    style G fill:#0969DA,color:#fff
```

## Build

```bash
# Native for current host
bun run build:native
# or
bun --filter @myorg/native run build

# Debug
bun --filter @myorg/native run build:debug

# WASM fallback (requires Rust WASI target)
rustup target add wasm32-wasip1-threads
bun run build:wasm
# or
bun --filter @myorg/native run build:wasm
```

Output:

- `native.<platform>.node` (e.g. `native.darwin-arm64.node`)
- `index.js` — loader that picks correct `.node`
- `index.d.ts` — TypeScript types (generated)
- `native.wasi.cjs` + workers — WASM fallback

## Usage in Bun

```ts
import { add, fibonacci, Counter } from "@myorg/native";

console.log(add(1, 2)); // 3 — Rust speed
console.log(fibonacci(40)); // Fast

const counter = new Counter(0);
counter.increment(); // 1
```

With fallback (in `external`):

```ts
// packages/external/src/native.ts
let native: any = null;
try {
  native = await import("@myorg/native");
} catch {
  console.warn("Native not available, using JS fallback");
}

export function add(a: number, b: number) {
  return native ? native.add(a, b) : a + b;
}
```

> [!WARNING]
> Import addon only from server modules — browser bundle cannot load `.node`.

## WASM

> [!CAUTION]
> Bun + WASM has open incompatibility (napi-rs#2965). Test separately before shipping to Bun users.

```bash
rustup target add wasm32-wasip1-threads
bun run build:wasm
```

Generates `native.wasi.cjs` + browser/worker files. Use cases:

- Portable fallback when no prebuilt native matches host
- Browser, StackBlitz, WebContainer demo

Config in `package.json` `napi.wasm`:

```json
{
  "wasm": {
    "initialMemory": 16,
    "maximumMemory": 65536,
    "browser": { "fs": false, "asyncInit": true }
  }
}
```

## Platform Packages (Publish)

```bash
napi create-npm-dirs   # Create npm/ per-target dirs
# In CI per target:
napi build --release --target <target>
# Collect:
napi artifacts
# Publish:
napi pre-publish
npm publish --access public
```

Root `package.json` gets `optionalDependencies` for each platform.

> [!IMPORTANT]
> Use npm scope (`@myorg/native`) — required for per-target model. Non-scoped triggers spam detection.

## Cross-Compilation

- `--use-napi-cross`: Linux glibc on Linux x64/arm64
- `--cross-compile` (`-x`): Windows MSVC from non-Windows, musl

Integrates `cargo-zigbuild` and `cargo-xwin`.

## CI Matrix

```yaml
strategy:
  matrix:
    include:
      - host: ubuntu-latest
        target: x86_64-unknown-linux-gnu
        build: napi build --release --target x86_64-unknown-linux-gnu --use-napi-cross
      - host: macos-latest
        target: aarch64-apple-darwin
        build: napi build --release --target aarch64-apple-darwin
      - host: windows-latest
        target: x86_64-pc-windows-msvc
        build: napi build --release --target x86_64-pc-windows-msvc
      - host: ubuntu-latest
        target: wasm32-wasip1-threads
        build: napi build --release --target wasm32-wasip1-threads
```

## Debugging

```bash
DEBUG="napi:*" napi build
NAPI_RS_ENFORCE_VERSION_CHECK=1 bun run build
```

Common missing binary causes:

- `--no-optional` omitted optional deps
- Lockfile generated on another platform
- Deployment copied only JS, discarded `.node`

## References

- [napi-rs](https://napi.rs)
- [PLAN.md](../../configs/native/PLAN.md)
- [Native AGENT](../../configs/native/AGENT.md)
