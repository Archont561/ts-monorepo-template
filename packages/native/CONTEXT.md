# CONTEXT.md — packages/native

> Snapshot of this workspace's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Virtual workspace, `resolver = "3"`, one member: `crates/native`.
- `[workspace.package]`: edition 2024, version 0.1.0, MIT, repository `Archont561/ts-monorepo-template`.
- Shared dependencies: `napi` 3 (feature `napi4`), `napi-derive` 3, `napi-build` 2. Lints: `unsafe_code = "forbid"`, `clippy.all = "warn"`.
- Toolchain: stable with `rustfmt`, `clippy`, and the `wasm32-wasip1-threads` target.
- `Cargo.lock` is gitignored — these are cdylib libraries, not binaries.

## Decisions as outcomes

- **Workspace under `packages/`** — the repo root stays free of Rust, so the native config is removable as one directory.
- **`unsafe_code = "forbid"` inherited, not per-crate** — a new crate is safe before anyone reviews it.
- **Clippy pedantic off** — `#[napi]` generates code that trips it; CI runs `-D warnings` instead.

## Open

- No CI build has produced a prebuilt binary for any target yet, so the matrix in `native.yml` is unproven.
- Publish ordering across `npm/native` and its generated per-platform packages is out of scope.

## Recent changes

| Commit | What |
| :--- | :--- |
| `0834b0a` | virtual workspace with one crate per package, replacing the single-crate layout |
| `71616ab` | layout, CI matrix and Docker build documented |
