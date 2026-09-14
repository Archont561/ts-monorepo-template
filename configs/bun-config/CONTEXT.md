# CONTEXT.md — @myorg/bun-config

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- `bunfig.toml` enables coverage on every `bun test` run, writes `text` + `lcov` into `./coverage`, and skips test files.
- Threshold mirrors `COVERAGE_THRESHOLD` (80%) from `configs/coverage/index.ts` as a fraction (`0.80`).
- The ignore list has grown to cover generated and CLI entry points: `dist`, `node_modules`, `configs/**`, `src/cli.ts`, `src/setup.ts`, `src/aggregate.ts`, `src/harness.ts`, `src/collector.ts`, `src/docs.ts`, `*.node`, `*.wasi.cjs`, `target/**`, `.devcontainer/**`, plus `apps/example/src/index.ts` and `pages/index.ts`.
- CI step: `configs/bun-config/ci.steps.yml`.

## Decisions as outcomes

- **One config, passed explicitly** — a per-package symlink farm is a common monorepo trap; `mbun` avoids it.
- **Coverage collection is per package, merging is global** — Turbo runs each package's report, then `mcoverage merge` combines them, so a single package can't skew the total.
- **Rust coverage joins the same file** — `mnative llvm-cov` contributes a second LCOV that the merge folds in.

## Recent changes

| Commit | What |
| :--- | :--- |
| `c8024de` | coverage threshold centralised in `@myorg/coverage`, mirrored here by comment |
| `fb3a47c` | per-package test/coverage offloaded to Turbo; `mbun coverage` runs packages only |
