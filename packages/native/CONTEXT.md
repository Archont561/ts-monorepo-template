# CONTEXT.md — packages/native

> Snapshot of this workspace's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Virtual workspace, `resolver = "3"`, members: `crates/native` (cdylib binding) and `crates/shared` (pure Rust, no npm package).
- `crates/native` is a thin layer — every `#[napi]` fn delegates to `shared` (`shared.workspace = true`).
- `crates/package.json` (`@myorg/native-crates`) is the bridge node: the single Turbo package for all pure crates, running `mnative build/test --pure`. Root `workspaces` includes `packages/native/crates`; the binding's `package.json` depends on the bridge via `workspace:*`.
- `[workspace.package]`: edition 2024, version 0.1.0, MIT, repository `Archont561/ts-monorepo-template`.
- Shared dependencies: `napi` 3 (feature `napi4`), `napi-derive` 3, `napi-build` 2, `shared = { path = "crates/shared" }`. Lints: `unsafe_code = "forbid"`, `clippy.all = "warn"`. `[profile.release]`: lto, codegen-units 1, strip.
- Turbo: `@myorg/native#build` is **cached** (`*.node`, `index.js`, `index.d.ts`; inputs glob `../../crates/**` + workspace manifests); the bridge tasks are **never cached** (cargo owns `target/`); `build:wasm` stays uncached.
- Toolchain: stable with `rustfmt`, `clippy`, and the `wasm32-wasip1-threads` target.
- `Cargo.lock` is gitignored — these are cdylib libraries, not binaries.

## Decisions as outcomes

- **Workspace under `packages/`** — the repo root stays free of Rust, so the native config is removable as one directory.
- **One bridge package for all pure crates** — pure crates stay out of the npm namespace (no package churn when they move), while Turbo still orders pure Rust before the napi builds that consume it. The guide's per-crate npm packages were collapsed into this single node deliberately.
- **Cargo graph mirrored as `workspace:*`** — Turbo cannot see `[dependencies]` in Cargo.toml; the bridge edge is the one ordering fact it needs, and `mnative sync` keeps it honest.
- **napi builds cached, cargo tasks not** — napi outputs are stable local artifacts with well-defined inputs; cargo's incremental state is its own cache and the toolchain belongs in its key. Over-invalidating is cheap, a stale `.node` is not.
- **`unsafe_code = "deny"` inherited, not per-crate** — a new crate is safe before anyone reviews it. It has to be `deny` and not `forbid`: `#[napi]` expands to `unsafe` code wrapped in its own `#[allow(unsafe_code)]`, and `forbid` cannot be overruled, so every `#[napi]` attribute died with E0453 and cascaded into E0425. `deny` still makes any `unsafe` we write a hard error.
- **`emnapi` lives in the root `devDependencies`, not beside `@napi-rs/cli`** — the wasm build has `@napi-rs/cli` require it, and the CLI's realpath is inside `node_modules/.bun/…`, so the only `node_modules` its resolution walk reaches is the repo root's. Declaring it in `packages/tooling` (where the CLI is a devDependency) leaves it unresolvable; it is an *optional* peer there, so nothing installs it automatically.
- **The three emnapi packages are pinned to one exact version, and it must be the version the rest of the tree already forces** — `@napi-rs/cli` refuses to build wasm on a mismatch (`emnapi version mismatch: …`). `@emnapi/core` and `@emnapi/runtime` are pinned exactly to `1.11.2` by `@napi-rs/lzma-wasm32-wasi`, `@napi-rs/tar-wasm32-wasi` and `@oxc-resolver/binding-wasm32-wasi`, so a `^` range on `emnapi` resolves higher and the build dies. Bump all three together, and check the links inside `node_modules/.bun/@napi-rs+cli@*/node_modules/` — the store keeps one directory per peer-set hash, so a stale one can look like the fix did not apply.
- **Clippy pedantic off** — `#[napi]` generates code that trips it; CI runs `-D warnings` instead.

## Open

- The matrix in `native.yml` now reaches the `Build bindings` step on every target: the container jobs were blocked by a missing `unzip` (which `setup-bun` needs) and by Bun having no musl build, and both are fixed. What stopped all of them there was `unsafe_code = "forbid"`, now `deny`. No target has yet produced a binary, so the matrix is still unproven end to end — the `assemble` fan-in and the generated per-platform packages have never run.
- `x86_64-apple-darwin` maps to the `macos-13` runner; a run on it was cancelled manually, so that target's status is unknown. GitHub has been retiring the Intel macOS runners — worth confirming `macos-13` is still available before relying on it.
- Publish ordering across `npm/native` and its generated per-platform packages is out of scope.

## Recent changes

| Commit | What |
| :--- | :--- |
| this change | pure `shared` crate + thin `native` binding, bridge node `crates/package.json`, `mnative sync` + `--pure`, cacheable napi builds with Cargo-graph inputs, `[profile.release]` |
| `0834b0a` | virtual workspace with one crate per package, replacing the single-crate layout |
| `71616ab` | layout, CI matrix and Docker build documented |
