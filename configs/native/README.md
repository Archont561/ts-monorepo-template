# @myorg/native

> Opt-in NAPI-RS native bindings with Rust — native speed, WASM fallback, platform-specific binaries + conditional example routes.

## What it provides

- A `select` scaffold prompt (`none` / `publish` / `docker`) that decides whether a generated project ships native bindings
- `@napi-rs/cli` as shared devDependency for projects that opt in
- Setup script `src/setup.ts` that scaffolds `packages/native/` when enabled + ensures example native routes
- Template files for Rust crate (`Cargo.toml`, `src/lib.rs`, `build.rs`, `package.json` napi config)
- Integration with `packages/external` via `native.ts` wrapper with JS fallback
- Example app `apps/example/src/pages/api/native/**` — conditional routes that are deleted when native disabled

> [!IMPORTANT]
> Opt-in — choose `Set up native Node-API bindings?` during `bun create Archont561/ts-monorepo-template`.

## Architecture

```mermaid
graph TD
    A[bun create] --> B{native?}
    B -->|none| C[prune native<br/>packages/native + *.node + api/native/**<br/>via glob+regex+extraRemovals]
    B -->|publish| D[setup.ts<br/>scaffold packages/native/ + example routes]
    B -->|docker| E[setup.ts + Docker]
    D --> F[Rust src/lib.rs<br/>#[napi] add, fibonacci, Counter, primes_up_to]
    F --> G[napi build --platform<br/>*.node]
    F --> H[napi build --target wasm32-wasip1-threads<br/>*.wasi.cjs]
    G --> I[@myorg/external<br/>native.ts with fallback]
    H --> I
    I --> J[example/api/native/**<br/>add, fibonacci, primes, status]
    J --> K[npm publish<br/>platform packages]

    style B fill:#0969DA,color:#fff
    style F fill:#dea584,stroke:#fff,color:#000
    style I fill:#0969DA,color:#fff
    style J fill:#f6f8fa,stroke:#0969DA
```

### Scaffold options

| Option | Description | Result |
| :--- | :--- | :--- |
| `none` | No native bindings (default) | Removes `packages/native/`, `*.node`, `rust-toolchain.toml`, `apps/example/src/pages/api/native/**` via glob+regex+extraRemovals |
| `publish` | Publish with prebuilt binaries | Keeps + runs `setup.ts` → `packages/native/` + example routes + CI matrix |
| `docker` | Build in Docker | Keeps + Docker cross-compilation |

### Data-driven removals

When `none` selected:

| Field | Patterns | Purpose |
| :--- | :--- | :--- |
| `extraRemovals` | `packages/native`, `rust-toolchain.toml`, `.cargo`, `apps/example/src/pages/api/native` | Exact paths |
| `filePatternsToRemove` | `**/*.node`, `**/*.napi.*`, `**/*.wasi.cjs`, `rust-toolchain.toml`, `.cargo/**`, `**/native/**`, `**/api/native/**` | Glob via `Bun.Glob` |
| `fileRegexesToRemove` | `\.node$`, `napi`, `rust-toolchain`, `api/native` | Regex |
| `appDepsToRemove` | `@myorg/native` | Remove from example |

When `publish`/`docker` selected, `setup: configs/native/src/setup.ts` runs to scaffold `packages/native/` + ensure example routes exist.

### Example conditional routes

```
apps/example/src/pages/api/native/
  index.ts              # list endpoints — TEMPLATE-ONLY:START(native)
  add.ts                # ?a=1&b=2 — uses external addSync with fallback
  status.ts             # native availability + benchmark
  fibonacci/[n].ts      # fibonacci benchmark
  primes/[n].ts         # primes sieve (Rust or JS)
  reverse.ts            # reverse string

apps/example/src/index.ts
  routes: {
    "/api/native/health": ... // TEMPLATE-ONLY:START(native)
  }

apps/example/src/pages/api/index.ts
  endpoints includes /api/native/** when native enabled — TEMPLATE-ONLY:START(native)
```

Bundle handling:
- `src/index.ts` has native health route inside `// TEMPLATE-ONLY:START(native)` — stripped when disabled
- `src/pages/api/index.ts` conditionally lists native endpoints
- `external/src/native.ts` always kept (fallback), but `packages/native` removed when disabled

## Usage

```bash
bun create Archont561/ts-monorepo-template my-app   # choose "Set up native Node-API bindings?"
cd my-app

# Build native for current host
bun run build:native
# or
bun --filter @myorg/native run build

# WASM fallback
rustup target add wasm32-wasip1-threads
bun run build:wasm

# Test
bun run test:native

# Example app with native routes
bun run dev
# → http://localhost:3000/api/native/add?a=5&b=7
# → http://localhost:3000/api/native/fibonacci/35
# → http://localhost:3000/api/native/status
```

<details>
<summary>After enabling — package structure</summary>

```
packages/native/
  Cargo.toml          # Rust crate (cdylib)
  build.rs            # napi-build setup
  src/
    lib.rs            # Rust with #[napi] — add, fibonacci, Counter, primes_up_to
  package.json        # napi config (targets, binaryName, wasm)
  tsconfig.json       # extends @myorg/ts/library.json
  README.md           # docs
  index.js            # generated loader (auto picks .node)
  index.d.ts          # generated types
  *.node              # native binaries (gitignored, per-platform)
  npm/                # per-platform optional packages (generated via create-npm-dirs)

apps/example/src/pages/api/native/
  index.ts, add.ts, status.ts, fibonacci/[n].ts, primes/[n].ts, reverse.ts
```

</details>

<details>
<summary>Using in external (with fallback)</summary>

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

- Import addon only from server modules — browser cannot load `.node`
- `external` re-exports `add`, `fibonacci`, etc. with fallback
- Example routes use `addSync`, `fibonacciSync` which fallback to JS when .node missing

</details>

## NAPI Config (Monorepo-Adapted)

```json
{
  "napi": {
    "binaryName": "native",
    "packageName": "@myorg/native",
    "targets": [
      "x86_64-apple-darwin",
      "aarch64-apple-darwin",
      "x86_64-pc-windows-msvc",
      "x86_64-unknown-linux-gnu",
      "aarch64-unknown-linux-gnu",
      "x86_64-unknown-linux-musl",
      "wasm32-wasip1-threads"
    ],
    "wasm": {
      "initialMemory": 16,
      "maximumMemory": 65536,
      "browser": { "fs": false, "asyncInit": true }
    }
  }
}
```

## WASM Fallback

> [!CAUTION]
> Bun + WASM has open incompatibility (napi-rs#2965). Test separately before shipping to Bun users.

```bash
rustup target add wasm32-wasip1-threads
bun run build:wasm
```

## Platform Packages (Publish)

```bash
napi create-npm-dirs   # npm/ per-target
# In CI per target:
napi build --release --target <target>
napi artifacts
napi pre-publish
npm publish --access public
```

## Cross-Compilation

- `--use-napi-cross`: Linux glibc on Linux x64/arm64
- `--cross-compile` (`-x`): Windows MSVC from non-Windows, musl

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
```

See [PLAN.md](./PLAN.md) for full integration plan.

## References

- [napi-rs](https://napi.rs)
- [PLAN.md](./PLAN.md)
- [AGENT.md](./AGENT.md)
- [packages/native/README.md](../../packages/native/README.md)
- [Example README](../../apps/example/README.md)
