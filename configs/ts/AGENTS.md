# AGENTS.md — @myorg/ts

> Shared TypeScript presets and the `mtsc` wrapper.
> Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- Never add `typescript`, `bunup` or `@types/bun` to an individual package's devDependencies. They are owned by this config and hoisted.
- Every package `tsconfig.json` extends `@myorg/ts/library.json` (`packages/*`) or `app.json` (`apps/*`). No bespoke compiler options without a reason.
- Never use `baseUrl` — removed in TS 7.0 (TS5102). Use `paths`.
- Libraries emit (`rootDir: .`, `outDir: dist`); apps set `noEmit`.
- `types: ["bun"]` everywhere.
- Keep `typeRoots` in `base.json` covering both `configs/ts/node_modules/@types` and the repo root — Bun's isolated linker does not hoist `@types/bun`, and `tsc`'s default upward walk then misses it (TS2688). Paths in `base.json` resolve relative to that file.
- Do not edit `dist/` — typecheck emits nothing there, and builds are owned by `@myorg/bunup`.

## Before marking a task done

- [ ] `bun run typecheck` passes for every package
- [ ] New package extends `library.json` or `app.json`
- [ ] No `baseUrl` anywhere; no `typescript`/`@types/bun`/`bunup` in any package manifest
