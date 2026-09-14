# CONTEXT.md — @myorg/coverage

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Threshold: **80% lines** (`COVERAGE_THRESHOLD` in `index.ts`), mirrored as `0.80` in `configs/bun-config/bunfig.toml`.
- Measured today: **96.95% lines (159/164)** — well above the gate.
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
