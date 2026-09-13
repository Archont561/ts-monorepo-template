# @myorg/native

> Opt-in NAPI-RS native bindings with Rust — native speed, WASM fallback, platform-specific binaries.

## What it provides

- A `select` scaffold prompt (`none` / `publish` / `docker`) that decides whether a generated project ships native bindings
- `@napi-rs/cli` as shared devDependency for projects that opt in
- Setup script `src/setup.ts` that scaffolds `packages/native/` when enabled
- Template files for Rust crate (`Cargo.toml`, `src/lib.rs`, `build.rs`, `package.json` napi config)
- Integration with `packages/external` via `native.ts` wrapper with JS fallback

> [!IMPORTANT]
> Opt-in — choose `Set up native Node-API bindings?` during `bun create Archont561/ts-monorepo-template`.

## Architecture

```mermaid
graph TD
    A[bun create] --> B{native?}
    B -->|none| C[prune native<br/>filePatterns + regex]
    B -->|publish| D[setup.ts<br/>scaffold packages/native/]
    B -->|docker| E[setup.ts + Docker]
    D --> F[Rust src/lib.rs<br/>#[napi] add, fibonacci, Counter]
    F --> G[napi build --platform<br/>*.node]
    F --> H[napi build --target wasm32-wasip1-threads<br/>*.wasi.cjs]
    G --> I[@myorg/external<br/>native.ts with fallback]
    H --> I
    I --> J[npm publish<br/>platform packages]

    style B fill:#0969DA,color:#fff
    style F fill:#dea584,stroke:#fff,color:#000
    style I fill:#0969DA,color:#fff
```

### Scaffold options

| Option | Description | Result |
| :--- | :--- | :--- |
| `none` | No native bindings (default) | Removes `packages/native/`, `*.node`, `rust-toolchain.toml` via glob + regex |
| `publish` | Publish with prebuilt binaries | Keeps + runs `setup.ts` → `packages/native/` + CI matrix |
| `docker` | Build in Docker | Keeps + Docker cross-compilation |

### Data-driven removals

When `none` selected:

| Field | Patterns | Purpose |
| :--- | :--- | :--- |
| `filePatternsToRemove` | `**/*.node`, `**/native/**`, `**/*.napi.*`, `rust-toolchain.toml`, `.cargo/**` | Glob removal via `Bun.Glob` |
| `fileRegexesToRemove` | `native`, `\.node$`, `napi`, `rust-toolchain` | Regex removal |

When `publish`/`docker` selected, `setup: configs/native/src/setup.ts` runs to scaffold `packages/native/`.

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

- Portable fallback when no prebuilt native matches host
- Browser, StackBlitz, WebContainer demo

## Platform Packages (Publish)

```bash
napi create-npm-dirs   # npm/ per-target
# CI per target:
napi build --release --target <target>
napi artifacts
napi pre-publish
npm publish --access public
```

Root gets `optionalDependencies` for each platform. Use npm scope (`@myorg/native`) — non-scoped triggers spam detection.

## Cross-Compilation

- `--use-napi-cross`: Linux glibc on Linux x64/arm64
- `--cross-compile` (`-x`): Windows MSVC from non-Windows, musl
- Integrates `cargo-zigbuild` and `cargo-xwin`

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

See [PLAN.md](./PLAN.md) for full integration plan and checklist.

## References

- [napi-rs](https://napi.rs)
- [@napi-rs/cli](https://www.npmjs.com/package/@napi-rs/cli)
- [PLAN.md](./PLAN.md) — full integration plan
- [AGENT.md](./AGENT.md) — agent reference
- [packages/native/README.md](../../packages/native/README.md)
