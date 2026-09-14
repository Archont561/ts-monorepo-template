# AGENTS.md — @myorg/stale

## Rules

- Never edit `.github/workflows/stale.yml` — it is generated from `configs/stale/stale.base.yml` by `bun run docs:sync`.
- This config owns its whole skeleton. Unlike `ci` and `release`, no other config contributes `stale.steps.yml`.
- Keep the permissions minimal: `issues: write` and `pull-requests: write`, nothing more.
- Any label a bot or maintainer relies on not being closed must appear in the exempt lists — a PR that only the bot touches looks abandoned.
- Stale is opt-in and off by default; enabling it in a fork that inherits these settings is a deliberate choice.

## Before marking a task done

- [ ] Changes made in `configs/stale/stale.base.yml`, not the generated workflow
- [ ] `bun run docs:sync` run and the generated file committed
- [ ] `bun run ci:lint` clean
