# @myorg/native-config

> Opt-in Cargo + NAPI-RS native bindings with Rust — native speed, WASM fallback, platform-specific binaries + conditional example routes.

## What it provides

- A `select` scaffold prompt (`none` / `publish` / `docker`) that decides whether a generated project ships native bindings
- **Cargo-first handling**: root `Cargo.toml` workspace with `resolver = "2"`, `workspace.dependencies`, profiles `dev` / `release` (lto, codegen-units=1, strip) / `ci`
- `@napi-rs/cli` as shared devDependency for projects that opt in
- Setup script `src/setup.ts` that scaffolds `packages/native/` + root workspace + ensures example native routes
- Template files for Rust crate (`Cargo.toml` with `workspace = true`, `src/lib.rs`, `build.rs`, `package.json` napi config + `cargo:*` scripts)
- Integration with `packages/external` via `native.ts` wrapper with JS fallback
- Example app `apps/example/src/pages/api/native/**` — conditional routes that are deleted when native disabled
- CI: `rust-toolchain` + `rust-cache` + `cargo fmt --check` + `cargo clippy -- -D warnings` + `cargo check` + `cargo test --workspace`

> [!IMPORTANT]
> Opt-in — choose `Set up native Node-API bindings?` during `bun create Archont561/ts-monorepo-template`.

## Cargo Guide (Agent-Ready)

### What Cargo is

Cargo is official Rust package manager, build system, test runner, doc generator, publish tool — all in one. Manages crates, drives `rustc`, runs tests.

### Key files

| File | Purpose |
|---|---|
| `Cargo.toml` | Manifest: metadata, dependencies, features, profiles |
| `Cargo.lock` | Pinned versions (commit for binaries, gitignore for libraries) |
| `src/lib.rs` | Library crate entry (cdylib for napi) |
| `build.rs` | Build script (napi_build::setup) |
| `rust-toolchain.toml` | Toolchain, components (rustfmt, clippy), targets (wasm32-wasip1-threads) |
| `.cargo/config.toml` | Optional build config |

### Workspace (Monorepo)

Root `Cargo.toml`:

```toml
[workspace]
members = ["packages/native"]
resolver = "2"

[workspace.dependencies]
napi = { version = "3.0.0", features = ["napi4"] }
napi-derive = "3.0.0"
napi-build = "2"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = "symbols"

[profile.dev]
opt-level = 0
debug = true

[profile.ci]
inherits = "dev"
opt-level = 1
```

Member `packages/native/Cargo.toml`:

```toml
[package]
name = "native"
version = "0.1.0"
edition = "2021" # always 2021

[lib]
crate-type = ["cdylib"]

[dependencies]
napi = { workspace = true }
napi-derive = { workspace = true }

[build-dependencies]
napi-build = { workspace = true }
```

### Core Cargo Commands

```bash
cargo check --workspace          # fast type-check, no codegen (inner loop)
cargo clippy -- -D warnings      # lint, deny warnings (CI)
cargo fmt --all -- --check       # format check
cargo fmt --all                  # format write
cargo test --workspace           # all tests
cargo test my_fn                 # filter
cargo build --workspace --release # optimized (lto, strip)
cargo tree                       # dep tree
cargo tree -d                    # duplicates
cargo doc --no-deps --workspace  # docs
cargo update -p serde            # update one crate
```

### Build Profiles

```toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = "symbols"

[profile.ci]
inherits = "dev"
opt-level = 1
```

### Features

```toml
[features]
default = []
json = ["dep:serde_json"]
```

Use `#[cfg(feature = "json")]` to gate.

### CI Checklist (GitHub Actions)

```yaml
- uses: dtolnay/rust-toolchain@stable
  with:
    components: clippy, rustfmt
    targets: wasm32-wasip1-threads
- uses: Swatinem/rust-cache@v2
- run: cargo fmt --all -- --check
- run: cargo clippy --workspace -- -D warnings
- run: cargo check --workspace
- run: cargo test --workspace
- run: cargo build --workspace --release
```

### Agent Checklist

- ✅ Always `edition = "2021"` and `resolver = "2"` in workspace roots
- ✅ Use `cargo check` in inner dev loops (fastest)
- ✅ Commit `Cargo.lock` for binaries, gitignore for libraries (native is cdylib lib → ignore)
- ✅ Use `[workspace.dependencies]` to centralise versions
- ✅ Use `cargo clippy -- -D warnings` and `cargo fmt --check` in CI
- ✅ Use `cargo nextest` for faster parallel tests in CI
- ✅ Use `lto = true` + `codegen-units = 1` + `strip = "symbols"` in release

## Architecture

```mermaid
graph TD
    A[bun create] --> B{native?}
    B -->|none| C[prune native<br/>Cargo.toml + packages/native + *.node + api/native/**<br/>via glob+regex+extraRemovals]
    B -->|publish| D[setup.ts<br/>root Cargo.toml workspace + packages/native/]
    B -->|docker| E[setup.ts + Docker]
    D --> F[Rust src/lib.rs<br/>#[napi] add, fibonacci, Counter, primes_up_to]
    F --> G[cargo check → napi build --platform<br/>*.node]
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
| `none` | No native bindings (default) | Removes `Cargo.toml`, `packages/native/`, `rust-toolchain.toml`, `*.node`, `apps/example/src/pages/api/native/**` via glob+regex+extraRemovals |
| `publish` | Publish with prebuilt binaries | Keeps + runs `setup.ts` → root workspace + `packages/native/` + example routes + CI matrix |
| `docker` | Build in Docker | Keeps + Docker cross-compilation |

### Data-driven removals

When `none` selected:

| Field | Patterns | Purpose |
| :--- | :--- | :--- |
| `extraRemovals` | `packages/native`, `Cargo.toml`, `Cargo.lock`, `rust-toolchain.toml`, `.cargo`, `apps/example/src/pages/api/native` | Exact paths |
| `filePatternsToRemove` | `**/*.node`, `**/*.napi.*`, `**/*.wasi.cjs`, `Cargo.toml`, `Cargo.lock`, `rust-toolchain.toml`, `.cargo/**`, `**/native/**`, `**/api/native/**` | Glob via `Bun.Glob` |
| `fileRegexesToRemove` | `\.node$`, `napi`, `rust-toolchain`, `Cargo\.toml`, `api/native` | Regex |
| `appDepsToRemove` | `@myorg/native` | Remove from example |

When `publish`/`docker` selected, `setup: configs/native/src/setup.ts` runs to scaffold root `Cargo.toml` workspace + `packages/native/` + ensure example routes exist.

## Usage

```bash
bun create Archont561/ts-monorepo-template my-app   # choose "Set up native Node-API bindings?"
cd my-app

# Cargo-first inner loop (fast)
cargo check --workspace          # type-check only, no codegen
cargo clippy --workspace -- -D warnings
cargo fmt --all -- --check
cargo test --workspace

# Build native for current host (cargo check + napi build)
bun run build:native
# or
bun --filter @myorg/native run build
# or cargo directly:
cargo build --workspace --release

# WASM fallback
rustup target add wasm32-wasip1-threads
bun run build:wasm

# Test
bun run test:native
cargo test --workspace

# Example app with native routes
bun run dev
# → http://localhost:3000/api/native/add?a=5&b=7
# → http://localhost:3000/api/native/fibonacci/35
# → http://localhost:3000/api/native/status
```

<details>
<summary>After enabling — package structure</summary>

```
Cargo.toml                # Workspace root (resolver=2, workspace.dependencies, profiles)
rust-toolchain.toml       # stable + rustfmt, clippy, wasm32-wasip1-threads
.cargo/config.toml        # optional build config
packages/native/
  Cargo.toml          # Rust crate (cdylib, workspace=true deps, edition 2021)
  build.rs            # napi-build setup
  src/
    lib.rs            # Rust with #[napi] — add, fibonacci, Counter, primes_up_to
  package.json        # napi config + cargo:* scripts (check, clippy, fmt, test, build)
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
- `cargo-zigbuild` for easy cross-compilation via Zig linker

```bash
cargo install cargo-zigbuild
cargo zigbuild --target aarch64-unknown-linux-gnu --release
```

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

Full CI checklist:

```yaml
- uses: dtolnay/rust-toolchain@stable
  with:
    components: clippy, rustfmt
- uses: Swatinem/rust-cache@v2
- run: cargo fmt --all -- --check
- run: cargo clippy --workspace -- -D warnings
- run: cargo test --workspace
- run: cargo build --workspace --release
```

See [PLAN.md](./PLAN.md) for full integration plan.

## References

- [napi-rs](https://napi.rs)
- [Cargo Book](https://doc.rust-lang.org/cargo/)
- [PLAN.md](./PLAN.md)
- [AGENT.md](./AGENT.md)
- [packages/native/README.md](../../packages/native/README.md)
- [Example README](../../apps/example/README.md)
