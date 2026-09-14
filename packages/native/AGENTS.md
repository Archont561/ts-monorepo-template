# AGENTS.md — packages/native

> The Cargo workspace. Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- `Cargo.toml` here is the workspace root and must stay virtual — no `[package]` section. The repo root never gets a `Cargo.toml`.
- Never hand-edit `members`. `mnative add <name>` creates the crate, its npm package, and re-syncs and sorts `members`.
- One npm package per binding crate; a pure-Rust crate (`--pure`) gets no npm package.
- Every crate declares `[lints] workspace = true` so `unsafe_code = "forbid"` is inherited, and inherits `version`, `edition`, `license` and `repository` from `[workspace.package]` instead of restating them.
- `crate-type = ["cdylib"]` belongs on binding crates only.
- Never commit `target/`, `Cargo.lock`, `npm/*/index.js`, `npm/*/*.node`, `*.wasm` or `npm/*-<platform>/` — all are generated and gitignored.
- Use `mnative` rather than running cargo directly; it applies the workspace paths and keeps one invocation over every crate.
- Never `#![deny(warnings)]` in Rust source — `-D warnings` is a CI flag only.

## Before marking a task done

- [ ] `mnative fmt:check`
- [ ] `mnative clippy`
- [ ] `mnative check`
- [ ] `mnative test`
- [ ] New crate has `[lints] workspace = true`
- [ ] No generated or build artefacts in the diff
