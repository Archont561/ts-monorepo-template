# CONTEXT.md — @myorg/gh-actions

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Owns `ci.base.yml`, `release.base.yml`, its own `ci.steps.yml`, and `actionlint.yaml`. The `pages`, `coverage`, `native` and `dependabot` skeletons live with the configs that own them.
- Six workflows are generated today: `ci.yml`, `release.yml`, `native.yml`, `dependabot-auto-merge.yml`, `stale.yml`, plus `template-docs.yml` (hand-written, template-only). `pages.yml` and `coverage.yml` are deliberately not generated while the docs app exists.
- Placeholders available: `BUN_VERSION`, `NATIVE_DIR`, `NATIVE_CARGO`, `NATIVE_NPM`, `NATIVE_WASI_SDK_VERSION`, `APP_DIR`, `APP_DOCKERFILE`.

## Decisions as outcomes

- **Skeleton + fragments, one generator** — a config that is pruned takes its steps with it, and the workflow is regenerated from survivors rather than patched.
- **Placeholders over literals** — a path or version that lives in TypeScript must not be repeated in YAML, where nothing checks it.

## Open

- `native.yml` has never run on real GitHub Actions: the container targets, WASI SDK download and artifact fan-in are unverified.
- `mci lint` (actionlint) cannot run in this sandbox — it needs network access, so workflow validation here is limited to YAML parsing.

## Recent changes

| Commit | What |
| :--- | :--- |
| `a8ea08c` | `native.steps.yml` registered as an aggregated fragment; `native.yml` generated with the config |
| `c8024de` | port and image versions centralised into placeholders |
