# CONTEXT.md — @myorg/native-config

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in `select`: `none` (default) / `publish` / `docker`. This repo runs in `publish` mode.
- One crate, one package: `packages/native/crates/native` (cdylib) → `packages/native/npm/native`.
- `mnative` is the only interface: `discover.ts` reads crates and packages off disk, so the CLI keeps no manifest of its own.
- CI: `ci.steps.yml` verifies (fmt/clippy/check/test/napi:build/typecheck); `native.base.yml` + `native.steps.yml` generate `native.yml` — a `matrix` job fed by `mnative matrix --gha`, one `build` job per target, and an `assemble` job that runs `create-npm-dirs` + `artifacts`.
- Matrix today: both macOS targets, `x86_64-pc-windows-msvc`, glibc + aarch64 + musl Linux, and `wasm32-wasip1-threads`.

## Decisions as outcomes

- **Virtual workspace under `packages/`** — the root stays free of `Cargo.toml`, so `none` deletes exactly one directory.
- **Per-platform npm packages are CI output** — `napi create-npm-dirs` writes them in the assemble job; nothing of the sort is committed.
- **`unsafe_code = "forbid"` in `[workspace.lints]`** — inherited, so a new crate is safe by default rather than by review.
- **Cargo workspace-wide, napi per package** — one check over all Rust, one build per Node package.

## Open

- `native.yml` has never run on GitHub Actions: the runner/container mapping, WASI SDK download and artifact fan-in are unverified.
- Empty `container:` values for the darwin/windows/WASI entries may fail workflow validation — they need to be omitted rather than blank.
- The musl job runs on `lts-alpine`, where Bun's prebuilt binary needs `libstdc++` and `libgcc`; `native.steps.yml` does not install them yet.
- Publish ordering across `npm/native` and its generated per-platform packages is deliberately out of scope.
- The WASM fallback is portable but has a known Bun caveat (napi-rs#2965).

## Recent changes

| Commit | What |
| :--- | :--- |
| `71616ab` | documented the workspace layout, CI matrix and Docker build |
| `a8ea08c` | build-matrix workflow driven by `mnative matrix`; `native.steps.yml` aggregated |
| `0834b0a` | workspace with one crate per package, replacing the single-crate layout |
