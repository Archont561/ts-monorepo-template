# Configs - Agent Reference

Shared tooling configurations. Each sub-directory owns one tool's config and exposes a single `m`-prefixed CLI bin.

## Packages

- [Biome](biome/AGENT.md) — lint and format
- [Bun Config](bun-config/AGENT.md) — Bun runtime and coverage
- [Bunup](bunup/AGENT.md) — bundling presets
- [Changeset](changeset/AGENT.md) — releases
- [Commitlint](commitlint/AGENT.md) — commit messages
- [GitHub Actions](gh-actions/AGENT.md) — CI workflow validation and local act
- [Lefthook](lefthook/AGENT.md) — Git hooks
- [Native](native/AGENT.md) — NAPI-RS opt-in
- [Playwright](playwright/AGENT.md) — E2E testing
- [Skills](skills/AGENT.md) — AI agent skills, opt-in
- [Template](template/AGENT.md) — scaffolder, template-only
- [TypeScript](ts/AGENT.md) — shared tsconfigs
- [Turbo](turbo/AGENT.md) — task orchestration
- [UnoCSS](unocss/AGENT.md) — atomic CSS, opt-in

Root `AGENTS.md` and `README.md` reference these files instead of concatenating them. Workflows are generated via `bun run docs:sync` (`mdocs`).

## Rules

- No root-level `turbo.json`, `biome.json`, `bunfig.toml`, etc. — all config lives in `configs/*` and is referenced by CLI flags.
- Adding a config requires only a new `configs/<dir>/` workspace with `package.json`, `AGENT.md`, `README.md`, and optionally `ci.steps.yml`.
