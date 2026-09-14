# Rust + napi-rs Integration Plan for Bun Monorepo

> How to integrate native Rust speed into TypeScript packages with WASM fallback and platform-specific binaries.
>
> Historical design record — `packages/native` has since become a **virtual Cargo
> workspace** (`crates/*` + `npm/*`, see [README.md](./README.md) and
> [AGENT.md](./AGENT.md)). Sections below are updated where the layout changed;
> the rationale (why opt-in, why no root `Cargo.toml`, why WASM fallback) still
> holds.

## 1. What napi-rs is

- **napi-rs** is a framework for building compiled Node.js (and Bun-compatible) addons in Rust via Node-API
- `@napi-rs/cli` is the modern approach — write Rust, compile to N-API binaries with automated cross-compilation
- Used by Rspack, Hugging Face, Rollup, Microsoft, Clerk, etc.
- **Bun is best-effort** in upstream CI — not in blocking native-addon matrix, validate specific use case

## 2. Prerequisites

- Rust toolchain (`rustup`)
- Node.js 22.13+ or 24+ for build CLI (but we use Bun)
- `@napi-rs/cli` installed (provided by `@myorg/native` config)

```bash
rustup --version
bun --version
```

## 3. Monorepo Structure (virtual Cargo workspace in packages/native)

```
my-monorepo/
  packages/
    external/         # Public TS lib, may import from native with fallback
      src/
        index.ts      # Re-exports, optionally imports from @myorg/native
        native.ts     # Native import with fallback
    internal/         # Private TS impl
    native/           # Rust + napi-rs (opt-in, only when selected)
      Cargo.toml      # virtual workspace — resolver 3, members = crates/*, NO [package]
      rust-toolchain.toml # stable + rustfmt, clippy, wasm32-wasip1-threads
      .cargo/config.toml  # optional build config (WASI linker)
      .gitignore      # generated loaders, binaries, npm per-platform dirs
      crates/
        native/       # one crate per Rust unit
          Cargo.toml  # inherits from the workspace, crate-type = ["cdylib"]
          build.rs    # napi-build
          src/
            lib.rs    # Rust code with #[napi] macros
      npm/
        native/       # one npm package per binding crate
          package.json # napi config (targets, binaryName) + mnative --only scripts
          tsconfig.json
          index.js    # generated JS loader (auto picks .node)
          index.d.ts  # generated TS types
          *.node      # native binaries (per-platform, gitignored)
          native-*/   # per-platform optional packages (generated in CI)
  configs/
    native/           # Opt-in config, provides @napi-rs/cli + mnative CLI
      package.json    # scaffold metadata (none/publish/docker) + bin: mnative
      src/
        cli.ts        # mnative CLI (cargo workspace-wide + napi per package)
        discover.ts   # crates/packages discovery from disk
        templates.ts  # generated file bodies
        setup.ts      # Setup script that scaffolds packages/native when enabled
      native.base.yml # native.yml skeleton (matrix → build → assemble)
      native.steps.yml
      ci.steps.yml
  apps/
    example/          # Demo app, can import from external which may use native
```

### Dependency Rules

| Rule | Description |
| :--- | :--- |
| `external → native` | Optional, with fallback to WASM or JS impl |
| `native` | Private, never inlined by Bunup (native) |
| `external` | Published, may have `optionalDependencies` for platform packages |
| `apps → external` | Only public import, never direct native |

```mermaid
graph TD
    A["apps/example"] --> B["packages/external<br/>public TS"]
    B --> C{Native available?}
    C -->|yes| D["packages/native<br/>Rust + napi-rs<br/>*.node"]
    C -->|no| E["packages/internal<br/>JS fallback"]
    C -->|wasm| F["packages/native<br/>WASI<br/>wasm32-wasip1-threads"]
    D --> G["npm publish<br/>platform packages"]
    F --> G

    style D fill:#dea584,stroke:#fff,color:#000
    style B fill:#0969DA,color:#fff
```

## 4. Scaffold Metadata (Data-Driven)

Current `configs/native/package.json` scaffold:

```json
{
  "scaffold": {
    "default": "none",
    "flag": "native",
    "prompt": "Set up native Node-API (NAPI-RS) bindings?",
    "type": "select",
    "options": [
      { "value": "none", "label": "None - skip native bindings" },
      { "value": "publish", "label": "Publish a native npm package" },
      { "value": "docker", "label": "Build native bindings in Docker" }
    ],
    "removals": {
      "none": {
        "filePatternsToRemove": ["**/*.node", "**/native/**", "**/*.napi.*"],
        "fileRegexesToRemove": ["native", "\\.node$", "napi"]
      },
      "publish": {},
      "docker": {}
    },
    "setup": "configs/native/src/setup.ts"
  }
}
```

- `none`: Removes all native artifacts (default)
- `publish`: Keeps `packages/native` + adds CI jobs + platform packages
- `docker`: Keeps + adds Docker-based cross-compilation

### Setup Script

`configs/native/src/setup.ts` should:

1. Create `packages/native/` if not exists
2. Write the virtual workspace manifest, then one crate (`crates/<name>/Cargo.toml`, `build.rs`, `src/lib.rs`) and one npm package (`npm/<name>/package.json`) per binding
3. Replace `@myorg` scope with user's scope
4. Migrate the old single-crate layout (`src/`, `build.rs`, `package.json` at the workspace root) if it is still there
5. Add `packages/native/npm/*` to the root `workspaces`, and `build:native`, `build:wasm`, `test:native` to the root scripts

Per-platform dirs (`npm/<name>-<platform>/`) are generated later in CI by
`mnative create-npm-dirs` — setup never writes them.

## 5. Write Rust with #[napi]

```rust
// packages/native/crates/native/src/lib.rs
use napi_derive::napi;

#[napi]
pub fn add(a: i32, b: i32) -> i32 {
  a + b
}

#[napi]
pub fn fibonacci(n: u32) -> u32 {
  match n {
    0 => 0,
    1 => 1,
    _ => fibonacci(n - 1) + fibonacci(n - 2),
  }
}

#[napi]
pub async fn fetch_data(url: String) -> napi::Result<String> {
  Ok(format!("fetched: {}", url))
}

#[napi]
pub struct Counter {
  count: i32,
}

#[napi]
impl Counter {
  #[napi(constructor)]
  pub fn new(initial: Option<i32>) -> Self {
    Self { count: initial.unwrap_or(0) }
  }

  #[napi]
  pub fn increment(&mut self) -> i32 {
    self.count += 1;
    self.count
  }

  #[napi]
  pub fn get_count(&self) -> i32 {
    self.count
  }
}
```

- `#[napi]` handles JS↔Rust conversion and async bridging (async → Promise)
- Structs with `#[napi]` become JS classes

## 6. package.json napi Config (Monorepo-Adapted)

```json
{
  "name": "@myorg/native",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "index.js",
  "types": "index.d.ts",
  "files": ["index.js", "index.d.ts", "*.node", "*.wasi.cjs"],
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
      "browser": { "fs": false, "asyncInit": true, "errorEvent": true }
    }
  },
  "scripts": {
    "build": "napi build --release --platform",
    "build:debug": "napi build",
    "build:wasm": "napi build --release --target wasm32-wasip1-threads",
    "create-npm-dirs": "napi create-npm-dirs",
    "artifacts": "napi artifacts",
    "prepublish": "napi pre-publish",
    "test": "bun test"
  },
  "devDependencies": {
    "@napi-rs/cli": "^3.9.1"
  }
}
```

- `binaryName`: base name for `.node` files (e.g. `native.darwin-arm64.node`)
- `targets`: what to package (not what one `napi build` compiles — need CI matrix)
- `wasm`: WASI memory settings (64 KiB per page), browser options
- `files`: include `.node` + `.wasi.cjs` in npm publish

## 7. Build Locally

```bash
# Native for current host — one `napi build` per npm package
bun run build:native        # → mnative napi:build
# or just this package
bun --filter @myorg/native run build   # → mnative napi:build --only native

# Debug (faster)
bun --filter @myorg/native run build:debug

# Cargo, over the whole workspace
mnative check               # cargo check --workspace
mnative clippy              # clippy --workspace --all-targets -- -D warnings
mnative test                # cargo test --workspace

# WASM fallback
rustup target add wasm32-wasip1-threads
bun run build:wasm          # → mnative napi:build:wasm
```

Output: `native.darwin-arm64.node` inside `packages/native/npm/native/`, plus the
`index.js` loader that picks it up and the generated `index.d.ts`.

Adding a second binding is one command — crate + npm package + workspace member:

```bash
mnative add parser          # crates/parser + npm/parser
mnative add shared --pure   # crate only, no Node-API surface
mnative list                # what builds into what
```

## 8. Using in Bun (with Fallback)

```ts
// packages/external/src/native.ts
let native: { add: (a: number, b: number) => number } | null = null;

try {
  // Try native first (server only)
  native = await import("@myorg/native");
} catch {
  // Fallback to JS or WASM
  console.warn("Native bindings not available, using JS fallback");
}

export function add(a: number, b: number): number {
  if (native) {
    return native.add(a, b); // Rust speed
  }
  // JS fallback
  return a + b;
}

// For WASM
import { add as wasmAdd } from "@myorg/native/wasm" // if built

export async function addWasm(a: number, b: number): Promise<number> {
  try {
    const { add } = await import("@myorg/native");
    return add(a, b);
  } catch {
    // WASM fallback
    return wasmAdd(a, b);
  }
}
```

> [!WARNING]
> Import addon only from server modules — browser bundle cannot load `.node`.

```mermaid
sequenceDiagram
    participant App as apps/example
    participant Ext as "@myorg/external"
    participant Nat as "@myorg/native<br/>*.node"
    participant Fallback as JS/WASM fallback

    App->>Ext: import { add }
    Ext->>Nat: try import
    alt native available
        Nat-->>Ext: Rust fn
        Ext-->>App: native result (fast)
    else native missing
        Ext->>Fallback: JS impl
        Fallback-->>App: fallback result
    end
```

## 9. WASM Target

```bash
rustup target add wasm32-wasip1-threads
bun run build:wasm
```

Generates `<binaryName>.wasi.cjs` + browser/worker files.

> [!CAUTION]
> Bun + WASM has open incompatibility (napi-rs#2965). Mark runtime unsupported or provide separately tested loader until resolved.

### When to use WASM

- Portable fallback when no prebuilt native matches host
- Browser, StackBlitz, WebContainer demo of same Rust API

## 10. Platform-Specific Packages (Publish Model)

Published cross-platform package uses separate optional npm package per target. Each has `os`, `cpu`, `libc` fields so package manager installs only right binary.

Root `package.json` has `optionalDependencies` for each platform.

### Publish Flow

```bash
# 1. Create per-target directories (npm/<name>-<platform>/)
mnative create-npm-dirs

# 2. (In CI) Build per-target, collect artifacts
mnative artifacts --dir packages/native/npm/.artifacts

# 3. Publish platform packages + root
napi pre-publish
# Updates package metadata, publishes platform packages, creates GitHub release
# Then
npm publish --access public
```

`native.yml` does steps 1–2: one `build` job per target uploads `bindings-<target>`,
the `assemble` job downloads them all and runs the two `mnative` commands. The
generated directories are a CI artifact, never committed.

> [!IMPORTANT]
> Publishing is not atomic. Run ordinary CI path successfully before release. Never publish locally-built binary as multi-platform — always use `napi artifacts` + `pre-publish` from CI.

### Scope Recommendation

Use npm scope (`@your-scope/pkg`) — required for per-target model. Non-scoped triggers npm spam detection for platform packages (`snappy-darwin-x64` etc.). Publish platform packages under scope to avoid.

## 11. Cross-Compilation

NAPI-RS v3: `napi build --use-napi-cross` flag

- `--use-napi-cross`: Linux glibc targets on Linux x64/arm64 host
- `--cross-compile` (`-x`): Windows MSVC from non-Windows, musl targets

Integrates `cargo-zigbuild` and `cargo-xwin` for many targets on single machine.

## 12. CI Matrix (GitHub Actions)

Split in two: `ci.steps.yml` verifies on every push, and `native.base.yml` +
`native.steps.yml` generate `.github/workflows/native.yml` — its own workflow,
because a seven-target matrix does not belong in the verify job.

```yaml
# configs/native/ci.steps.yml (host target only)
- name: Build native bindings
  run: mnative napi:build

# configs/native/native.base.yml (one job per target)
jobs:
  matrix:
    # mnative matrix --gha prints every target the packages declare, with its
    # runner and (for Linux) the nodejs-rust container image
    steps:
      - run: mnative matrix --gha >> "$GITHUB_OUTPUT"
  build:
    needs: matrix
    strategy:
      matrix: ${{ fromJSON(needs.matrix.outputs.targets) }}
    container: ${{ matrix.container }}
    steps:
      - run: mnative napi:build --target ${{ matrix.target }}
      - uses: actions/upload-artifact@v4
        with:
          name: bindings-${{ matrix.target }}
          path: packages/native/npm/*/*.node
  assemble:
    needs: [matrix, build]
    steps:
      - run: mnative create-npm-dirs
      - run: mnative artifacts --dir packages/native/npm/.artifacts

# Publish job (release flow — out of scope for the matrix itself)
- run: napi pre-publish --skip-optional-publish
- run: npm publish --access public
```

The matrix is data, not YAML: edit `NATIVE_TARGETS` in `configs/native/index.ts`
and every workflow follows. `mnative matrix` also filters out targets no package
declares in `napi.targets`, so trimming a package trims CI.

> [!WARNING]
> Do not publish a binary built on your dev machine as if it supported other OS.

### Turbo Integration

```json
// configs/turbo/turbo.base.json
{
  "tasks": {
    "build:native": { "dependsOn": ["^build"], "outputs": ["*.node", "index.js"] },
    "build:wasm": { "dependsOn": ["build:native"], "outputs": ["*.wasi.cjs"] }
  }
}
```

## 13. Debugging

```bash
DEBUG="napi:*" napi build
```

Common missing binary causes:

- Install used `--no-optional` or omitted optional deps
- Lockfile generated on another platform didn't include current target
- Deployment copied only JS and discarded `.node` files

```bash
NAPI_RS_ENFORCE_VERSION_CHECK=1 bun run build
```

## 14. Bun Monorepo Integration Checklist

- [ ] Add `configs/native` as always-on or opt-in (currently opt-in `none` default)
- [ ] Create `packages/native/` with Cargo.toml, src/lib.rs, package.json (napi config)
- [ ] Add `rust-toolchain.toml` for pinned Rust version
- [ ] Add `.cargo/config.toml` for cross-compilation helpers
- [ ] Update root `package.json` scripts: `build:native`, `build:wasm`, `test:native`
- [ ] Update `configs/turbo/turbo.base.json`: `build:native`, `build:wasm` tasks
- [ ] Update `configs/bun-config/bunfig.toml`: ignore `**/*.node`, `**/target/**`
- [ ] Update `packages/external/src/native.ts`: import with fallback
- [ ] Update `apps/example`: demo native vs fallback
- [ ] Update CI: matrix for native targets + WASM
- [ ] Update `configs/native/src/setup.ts`: scaffold `packages/native` when enabled
- [ ] Add `napi` to `bunfig.toml` coverage ignores
- [ ] Document in `configs/native/README.md` and `AGENT.md`
- [ ] Test locally: `bun run build:native` + `bun run test`
- [ ] Test WASM separately (Bun WASI caveat)

## 15. Example Implementation (This Repo)

We have:

- `packages/native/` — example native workspace (opt-in, removed when `none`)
  - `Cargo.toml` — virtual workspace: `resolver = "3"`, `members = ["crates/native"]`
  - `crates/native/` — cdylib crate with napi-derive (`add`, `fibonacci`, `Counter`, …)
  - `npm/native/` — the npm package built from it (napi targets + wasm config)
  - `npm/native/index.js`/`index.d.ts` — generated loaders (gitignored, built)
  - `npm/native-<platform>/` — per-platform dirs (generated via `mnative create-npm-dirs`)

- `configs/native/` — config package
  - `package.json` scaffold with `none`/`publish`/`docker` + `filePatternsToRemove` + `setup`
  - `src/setup.ts` — scaffolds the `packages/native` workspace when enabled
  - `src/discover.ts` + `src/templates.ts` — discovery and generated file bodies
  - `native.base.yml`/`native.steps.yml` — the native build-matrix workflow
  - `README.md`/`AGENT.md` — docs

- Integration with `external`:
  - `packages/external/src/native.ts` — tries native, falls back to JS
  - `packages/external/src/index.ts` — re-exports `add` from native wrapper

## 16. Agent Checklist (from guide)

- [x] Use `@napi-rs/cli` (v3+) — scaffold with `napi new`
- [x] Use npm scope (`@myorg/native`) — required for per-target publish
- [x] Declare all targets in `napi.targets` — but add real CI job for each
- [x] Build native `.node` locally with `napi build --release --platform`
- [x] Add `wasm32-wasip1-threads` for WASM fallback — but test separately
- [x] Use `--use-napi-cross` for Linux cross-compilation from CI
- [x] Never publish locally-built binary as multi-platform — use `artifacts` + `pre-publish` from CI
- [x] Keep addon packages external to Bun/Vite/bundler server bundles
- [x] Confirm Bun WASI compatibility against napi-rs#2965 before shipping WASM to Bun users

## 17. References

- [napi-rs](https://napi.rs)
- [@napi-rs/cli](https://www.npmjs.com/package/@napi-rs/cli)
- [napi-rs GitHub](https://github.com/napi-rs/napi-rs)
- [Bun + napi-rs issue #2965](https://github.com/napi-rs/napi-rs/issues/2965)
- [This repo's native README](./README.md)
- [This repo's native AGENT](./AGENT.md)
