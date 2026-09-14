# AGENTS.md - @myorg/stale

> Stale action — auto-close inactive issues/PRs.

## What it provides

- Workflow `.github/workflows/stale.yml` (when enabled)
- Configurable via `stale.base.yml`

## For agents

- Opt-in, default false.
- When enabled, `bun run docs:sync` generates stale workflow.
- Customize messages and days in `configs/stale/stale.base.yml`.
- Requires no local binary — runs in GitHub Actions via `actions/stale@v9`.

## Files

- `configs/stale/stale.base.yml` — workflow skeleton
- `configs/stale/package.json` — scaffold metadata
