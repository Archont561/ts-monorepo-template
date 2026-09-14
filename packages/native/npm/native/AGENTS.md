# AGENTS.md — @myorg/native

> The npm package wrapping the `native` crate. Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- Never commit generated output: `index.js`, `index.d.ts`, `*.node`, `*.wasm` and the `native-*-<platform>/` packages are gitignored and rebuilt.
- Never build a "cross-platform" package on a dev machine and publish it. Per-platform packages come from CI: `mnative create-npm-dirs` + `mnative artifacts`.
- Use `mnative` for everything — `mnative check` for the fast inner loop, `mnative napi:build --only native` for artifacts. Do not `cd` into `crates/` and run cargo by hand.
- Targets are declared in this package's `napi.targets`; adding one grows the CI matrix automatically. Do not edit the workflow.
- Rust lives in `../../crates/native`, TypeScript types are generated here. Never put `#[napi]` code in this directory.
- Never add `typescript` or `bunup` here — `@myorg/ts` and `@myorg/bunup` own them.
- Import the addon only from server modules; a browser bundle cannot load `.node`.
- Keep the JS fallback in `@myorg/external` working — native is optional at runtime.

## File layout

| Path | Role |
| :--- | :--- |
| `package.json` | napi config: `binaryName`, `targets`, `wasm` |
| `tsconfig.json` | Extends `@myorg/ts/library.json` |
| `turbo.json` | Package tasks |
| `tests/` | Bun tests against the built addon |
| `index.js` / `index.d.ts` | **Generated** — gitignored |

## Before marking a task done

- [ ] `mnative fmt:check`
- [ ] `mnative clippy`
- [ ] `mnative check`
- [ ] `mnative test`
- [ ] `bun run build` (napi build for this package)
- [ ] `bun run typecheck`
- [ ] No generated file in the diff
