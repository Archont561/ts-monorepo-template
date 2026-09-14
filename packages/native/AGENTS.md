# AGENTS.md — packages/native

> The Cargo workspace. Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- `Cargo.toml` here is the workspace root and must stay virtual — no `[package]` section. The repo root never gets a `Cargo.toml`.
- Never hand-edit `members`. `mnative add <name>` creates the crate, its npm package, and re-syncs and sorts `members`.
- One npm package per binding crate; a pure-Rust crate (`--pure`) gets no npm package of its own — it is represented in the Turbo graph by the bridge node `crates/package.json`.
- Binding crates stay **thin**: `#[napi]` wrappers that delegate to pure crates. Logic lives in pure crates so it is testable without a Node runtime.
- A Cargo path dep from a binding to a pure crate must be mirrored as `@<scope>/native-crates: workspace:*` in the binding's `package.json` — run `mnative sync` after editing Cargo deps instead of hand-editing both sides.
- Never hand-edit `crates/package.json` or `crates/turbo.json` — they are generated (`mnative sync` / `mnative add --pure` / setup rewrite them).
- Every crate declares `[lints] workspace = true` so `unsafe_code = "forbid"` is inherited, and inherits `version`, `edition`, `license` and `repository` from `[workspace.package]` instead of restating them.
- `crate-type = ["cdylib"]` belongs on binding crates only.
- Never commit `target/`, `Cargo.lock`, `npm/*/index.js`, `npm/*/*.node`, `*.wasm` or `npm/*-<platform>/` — all are generated and gitignored.
- Use `mnative` rather than running cargo directly; it applies the workspace paths and keeps one invocation over every crate. The `--pure` flag scopes the cargo commands to the pure crates.
- Never `#![deny(warnings)]` in Rust source — `-D warnings` is a CI flag only.
- Release-profile tuning (`lto`, `codegen-units`, `strip`) lives once in the workspace `[profile.release]` — never in a crate.

## Before marking a task done

- [ ] `mnative fmt:check`
- [ ] `mnative clippy`
- [ ] `mnative check`
- [ ] `mnative test`
- [ ] New crate has `[lints] workspace = true`
- [ ] `mnative sync` leaves nothing to fix (Cargo↔npm edges in place)
- [ ] No generated or build artefacts in the diff
