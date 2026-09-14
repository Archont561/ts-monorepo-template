# CONTEXT.md — @myorg/native

> Snapshot of this package's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Version `0.0.0`, `private: true`. It ships through generated per-platform packages, not through this manifest.
- Crate: `packages/native/crates/native` (`cdylib`, `#[napi]`) — a thin wrapper; the logic lives in the pure crate `packages/native/crates/shared`.
- Depends on `@myorg/native-crates` (`workspace:*`) — the bridge package that stands for every pure Rust crate in the Turbo graph, mirrored from the Cargo path dep by `mnative sync`.
- `turbo.json`: `build` is Turbo-cached (`*.node`, `index.js`, `index.d.ts`; inputs reach `../../crates/**` + workspace manifests); `build:wasm` is not.
- Targets declared: both macOS, `x86_64-pc-windows-msvc`, glibc + aarch64 + musl Linux, and `wasm32-wasip1-threads`.
- Versioned by Changesets — one of only two packages not in `.changeset/config.json`'s ignore list.
- Dev dependencies: `@myorg/bun-config`, `@myorg/bunup`, `@myorg/native-config`, `@myorg/native-crates`, `@myorg/ts`, `@napi-rs/cli`.

## Decisions as outcomes

- **Private root package, generated platform packages** — `napi create-npm-dirs` writes `native-<platform>` packages in CI from the targets declared here.
- **WASM target declared but secondary** — the fallback matters for portability, not for browsers.

## Open

- `native.yml` has never run on GitHub Actions, so no prebuilt binary has ever been produced for these targets.
- Bun + WASM has a known incompatibility (napi-rs#2965); the WASM path is untested here.
- Publish ordering across this package and its generated per-platform packages is out of scope for now.

## Recent changes

| Commit | What |
| :--- | :--- |
| this change | thin binding over the new pure `shared` crate; `@myorg/native-crates` bridge dep; napi build Turbo-cached with Cargo-graph inputs |
| `71616ab` | documented the workspace layout, CI matrix and Docker build |
| `a8ea08c` | build-matrix workflow driven by `mnative matrix` |
| `0834b0a` | workspace with one crate per package, replacing the single-crate layout |
