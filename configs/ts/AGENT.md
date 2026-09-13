## TypeScript Configuration

- Shared tsconfigs live in `configs/ts` under the `@myorg/ts` workspace package (`base.json`, `library.json`, `app.json`).
- `@myorg/ts` hosts the `typescript` and `@types/bun` devDependencies so individual packages never declare them.
- Library packages extend `@myorg/ts/library.json` (`--declaration` + source maps); apps extend `@myorg/ts/app.json` (`noEmit` + `"types": ["bun"]`); both extend `base.json`.
- All package tsconfigs must include `"types": ["bun"]` (required for TS 7.x).
- Path aliases `@src/*` and `@tests/*` are defined per-package (never in the shared configs).
- Never use `baseUrl` — it was removed in TypeScript 7.0 (TS5102).
- Type-check with `bun run typecheck` (per-package `tsc --noEmit`, orchestrated by Turbo).