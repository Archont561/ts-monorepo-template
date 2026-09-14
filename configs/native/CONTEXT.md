# CONTEXT.md — @myorg/native-config

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in `select`: `none` (default) / `publish` / `docker`. This repo runs in `publish` mode.
- Two crates, one package: `packages/native/crates/native` (cdylib binding, thin `#[napi]` wrappers) + `packages/native/crates/shared` (pure Rust, the logic) → `packages/native/npm/native`.
- Bridge node: `packages/native/crates/package.json` (`@myorg/native-crates`) is the single Turbo package for every pure crate — scripts run `mnative <cmd> --pure`; root `workspaces` carries `packages/native/crates`; bindings with Cargo path deps carry `@myorg/native-crates: workspace:*` (mirrored by `mnative sync`).
- `mnative` is the only interface: `discover.ts` reads crates and packages off disk (path deps in both spellings — `{ path = … }` and `x.workspace = true` resolved against `[workspace.dependencies]`), so the CLI keeps no manifest of its own.
- Turbo caching: `@myorg/native#build` cached (`*.node`, `index.js`, `index.d.ts`; inputs reach `../../crates/**` + workspace manifests); bridge and wasm tasks uncached.
- CI: `ci.steps.yml` verifies (fmt/clippy/check/test/napi:build/typecheck); `native.base.yml` + `native.steps.yml` generate `native.yml` — a `matrix` job fed by `mnative matrix --gha`, one `build` job per target, and an `assemble` job that runs `create-npm-dirs` + `artifacts`.
- Matrix today: both macOS targets, `x86_64-pc-windows-msvc`, glibc + aarch64 + musl Linux, and `wasm32-wasip1-threads`.

## Decisions as outcomes

- **Virtual workspace under `packages/`** — the root stays free of `Cargo.toml`, so `none` deletes exactly one directory.
- **One bridge package, not one per pure crate** — pure crates stay out of the npm namespace while Turbo still orders them before the napi builds; `mnative sync` mirrors the Cargo graph into the `workspace:*` edge.
- **napi builds cached, cargo tasks not** — napi outputs are stable artifacts with Cargo-graph inputs; cargo's `target/` and toolchain belong in cargo's own caching, not Turbo's.
- **Per-platform npm packages are CI output** — `napi create-npm-dirs` writes them in the assemble job; nothing of the sort is committed.
- **`unsafe_code = "forbid"` in `[workspace.lints]`** — inherited, so a new crate is safe by default rather than by review.
- **Cargo workspace-wide, napi per package** — one check over all Rust, one build per Node package.

## Open

- The Rust layer (thin binding + `shared`) has not been compiled in this sandbox — no rustup possible (network-blocked); verify with `mnative check && mnative test && mnative napi:build` on a machine with rustup.
- `native.yml` has never run on GitHub Actions: the runner/container mapping, WASI SDK download and artifact fan-in are unverified.
- Empty `container:` values for the darwin/windows/WASI entries may fail workflow validation — they need to be omitted rather than blank.
- The musl job runs on `lts-alpine`, where Bun's prebuilt binary needs `libstdc++` and `libgcc`; `native.steps.yml` does not install them yet.
- Publish ordering across `npm/native` and its generated per-platform packages is deliberately out of scope.
- The WASM fallback is portable but has a known Bun caveat (napi-rs#2965).

## Recent changes

| Commit | What |
| :--- | :--- |
| this change | pure `shared` crate + thin binding, bridge node + `mnative sync` + `--pure`, cacheable napi builds, `[profile.release]`/`[profile.ci]` emitted for real |
| `71616ab` | documented the workspace layout, CI matrix and Docker build |
| `a8ea08c` | build-matrix workflow driven by `mnative matrix`; `native.steps.yml` aggregated |
| `0834b0a` | workspace with one crate per package, replacing the single-crate layout |
