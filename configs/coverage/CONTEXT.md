# CONTEXT.md — @myorg/coverage

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Threshold: **80% lines** (`COVERAGE_THRESHOLD` in `index.ts`), mirrored as `0.80` in `configs/bun-config/bunfig.toml`.
- Measured today: **99.52% lines (1037/1042)** across apps, packages and configs — well above the gate. The merge reads `{packages,apps,configs}/*/coverage/lcov.info`; `mcoverage merge --no-include-configs` reproduces the older, narrower set (97.47%, 193/198).
- Fragments owned: `ci.steps.yml` (setup → html → artifact 14d → check → PR comment), `pages.steps.yml`, `coverage.base.yml` + `coverage.steps.yml` (standalone Pages site when Pages is off).
- Rust coverage joins the same LCOV through `mnative llvm-cov` when `packages/native/Cargo.toml` exists.

## Decisions as outcomes

- **One CLI, thin fragments** — the coverage logic is testable TypeScript instead of YAML shell blocks.
- **Threshold parsing without `lcov`** — `mcoverage check` reads `LF:`/`LH:` directly so the gate works on runners without the binary.
- **One Pages publisher** — coverage is folded into the Pages artifact rather than deploying its own site, except when Pages is disabled entirely.

## Recent changes

| Commit | What |
| :--- | :--- |
| `c8024de` | coverage threshold centralised here; `bunfig.toml` mirrors it |
| `fb3a47c` | per-package coverage offloaded to Turbo; root only merges |
| this change | `mcoverage sync` generates the root `codecov.yml` (components from the package list, refreshed by `prepare`/`docs:sync`); `summary --markdown` feeds `$GITHUB_STEP_SUMMARY`; CI uploads the merged report via codecov-action@v5 with `fail_ci_if_error: true` |
