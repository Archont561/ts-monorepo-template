## Build Orchestration

- `mturbo` (from `@myorg/turbo`, `configs/turbo`) wraps Turbo and bakes in `--root-turbo-json=<configs/turbo/turbo.base.json>`; there is no root-level `turbo.json`.
- Root scripts (`dev`, `build`, `test`, `test:e2e`, `typecheck`, and `coverage` via `mcoverage`) delegate to `mturbo`, so Turbo infers inter-package dependency order automatically.
- Do not add `turbo` to individual package devDependencies — it is owned by `@myorg/turbo` and hoisted from there.