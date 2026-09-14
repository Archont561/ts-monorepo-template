# CONTEXT.md — @myorg/biome

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Config: `configs/biome/biome.json` — `recommended` + `style` + `correctness`, formatter at 2 spaces / 100 columns.
- Three overrides today: `packages/**` + `configs/**`, `packages/internal/**`, and `configs/bunup/**`. Each restates `style` rules and the `bunup` import guard.
- CI step lives in `configs/biome/ci.steps.yml` (`mbiome check`).
- Baseline: **0 errors, 14 warnings, 10 infos** across 142 checked files. Warnings are expected — do not "fix" them into errors, and do not let the error count rise above zero.

## Decisions as outcomes

- **No root config file** — every tool config lives in `configs/*`, so a scaffolded repo has no stray dotfiles to reconcile.
- **Warnings stay warnings** — `noUnusedVariables` is `warn` because generated and CLI code legitimately has unused bindings; `noUnusedImports` is an error because those are always dead code.

## Open

- The 14 warnings are `noNonNullAssertion` in `apps/example/tests/integration.test.ts` (13) plus one unused function parameter in the lefthook CLI; the 10 infos are `useTemplate`/`useLiteralKeys` style hints. None are gated. The R4 refactor removed four `as any` casts and an unused parameter, and R6b's setup-script split cleared four style infos.

## Recent changes

| Commit | What |
| :--- | :--- |
| `05e8dc6` | root docs split; lint baseline recorded in `AGENTS.md` |
| `c8024de` | shared paths and versions centralised |
