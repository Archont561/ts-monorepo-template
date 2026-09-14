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
- **`unsafe_code = "forbid"` inherited, not per-crate** — a new crate is safe before anyone reviews it.
- **Clippy pedantic off** — `#[napi]` generates code that trips it; CI runs `-D warnings` instead.

## Open

- No CI build has produced a prebuilt binary for any target yet, so the matrix in `native.yml` is unproven. The Rust layer (thin binding + `shared`) has not been compiled in this sandbox — verify with `mnative check && mnative test && mnative napi:build` on a machine with rustup.
- Publish ordering across `npm/native` and its generated per-platform packages is out of scope.

## Recent changes

| Commit | What |
| :--- | :--- |
| this change | pure `shared` crate + thin `native` binding, bridge node `crates/package.json`, `mnative sync` + `--pure`, cacheable napi builds with Cargo-graph inputs, `[profile.release]` |
| `0834b0a` | virtual workspace with one crate per package, replacing the single-crate layout |
| `71616ab` | layout, CI matrix and Docker build documented |
