# CONTEXT.md — @myorg/gitleaks

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- `mgitleaks` (`configs/gitleaks/src/cli.ts`) supports `detect` and `protect --staged`, and skips with a warning when gitleaks is not on PATH.
- CI step in `configs/gitleaks/ci.steps.yml` uses `gitleaks/gitleaks-action@v2`.
- Root script: `bun run security:gitleaks`. Scans the filesystem (`--no-git`) in CI so forks and shallow clones work.

## Decisions as outcomes

- **Local scan is advisory, CI is the gate** — developers without the binary are not blocked, but nothing merges unscanned.
- **Default ruleset** — no custom `gitleaks.toml` today; tuning happens only after a real false positive.

## Open

- gitleaks is not installed in this sandbox, so every local run here is a no-op warning; the CI path is what has actually been exercised.

## Recent changes

| Commit | What |
| :--- | :--- |
| `fb3a47c` | security scans exposed as one-line root scripts |
