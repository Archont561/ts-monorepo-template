# AGENTS.md — @myorg/native-config

> Cargo + NAPI-RS native bindings. Opt-in (`none` / `publish` / `docker`).
> Orientation and CI layout are in [README.md](./README.md); current state in [CONTEXT.md](./CONTEXT.md).

## Layout rules

- The repo root never gets a `Cargo.toml`. `packages/native/` is the virtual workspace root; `crates/*` are its members and `npm/*` the packages that wrap them.
- One npm package per binding crate. A pure-Rust crate (`mnative add shared --pure`) gets no npm package.
- Never hand-edit `members`. `mnative add <name>` creates the crate and its package, re-syncs and sorts `members`, and wires turbo.
- Every new crate declares `[lints] workspace = true` so `unsafe_code = "forbid"` is inherited.
- `crate-type = ["cdylib"]` goes on binding crates only; pure crates stay ordinary `rlib`s.
- New crates inherit version, edition, license and repository from `[workspace.package]` — do not restate them.

## Generated files

- Per-platform npm packages (`npm/*-linux-x64-gnu/` and friends), `*.node` binaries and `Cargo.lock` are generated and gitignored. Never commit or hand-edit them.
- `npm/*/` bundling is produced in CI by `mnative create-npm-dirs` + `mnative artifacts`. Never build a "cross-platform" package on a dev machine and publish it.
- `packages/native/npm/*` must be in the root `workspaces` field — `mnative add` does this; verify after adding a package by hand.

## Command conventions

| Do | Don't |
| :--- | :--- |
| `mnative check` / `clippy` / `test` / `fmt:check` | `cd packages/native && cargo check` |
| `mnative add parser` | editing `Cargo.toml` by hand |
| `mnative napi:build --only <pkg>` | `napi build` from inside a crate |
| `mnative napi <args>` for anything unlisted | installing `@napi-rs/cli` into a package |

- Cargo runs workspace-wide; napi runs once per package with explicit `--manifest-path` / `--package-json-path` / `--output-dir`.
- Unknown `mnative` subcommands fall through to cargo — prefer an explicit command when one exists.
- All `mnative` commands no-op when `packages/native` is absent, so root scripts need no `test -f` guards.
- Use `mnative check` for the fast inner loop; `napi:build` is for producing artifacts.

## Forbidden

- Never call `.node` from the browser. Native code runs server-side here.
- Never `#![deny(warnings)]` in Rust source — `-D warnings` is a CI flag only.
- Never commit `Cargo.lock` (these are cdylib libraries, not binaries).
- Never add `typescript` or `bunup` to a native npm package — `@myorg/ts` owns those.

## Before marking a task done

- [ ] `mnative fmt:check`
- [ ] `mnative clippy`
- [ ] `mnative check`
- [ ] `mnative test`
- [ ] `mnative napi:build`
- [ ] `mnative typecheck`
- [ ] New crate has `[lints] workspace = true`
- [ ] No `*.node`, `Cargo.lock` or `npm/*-<platform>/` in the diff
