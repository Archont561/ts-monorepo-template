# AGENTS.md — @myorg/bunup

## Rules

- Never edit anything under `dist/` — it is Bunup output. Change the source and rebuild.
- Never use `export *` in `@myorg/external`; re-export named symbols explicitly so the public API stays reviewable.
- Never add runtime dependencies to `@myorg/external` — implementation code lives in `@myorg/internal` and is inlined.
- Never bundle an app. Apps run from source with `bun --hot`.
- Import `bunup` only through `@myorg/bunup` (Biome's `noRestrictedImports` enforces this) so presets apply everywhere.
- Every package's `bunup.config.ts` must spread a preset (`...baseConfig` or `...cliConfig`) — never a bare inline config.
- `attw` runs with `--profile esm-only`. node10 and CJS resolution failures are expected, not bugs.

## Before marking a task done

- [ ] `bun run build` passes
- [ ] `mbunup health` passes (publint + arethetypeswrong clean for every publishable package)
- [ ] No new files under `dist/` were committed
