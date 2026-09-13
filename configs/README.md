# Configs

Shared tooling configurations for the monorepo. Each sub-directory is a private workspace that owns one tool's config and exposes a single `m`-prefixed CLI bin.

## Packages

- [Biome](biome/README.md) — lint and format (`mbiome`)
- [Bun Config](bun-config/README.md) — Bun runtime, test, coverage (`mbun`)
- [Bunup](bunup/README.md) — bundling presets (`mbunup`)
- [Changeset](changeset/README.md) — versioning and releases (`mchangeset`)
- [Commitlint](commitlint/README.md) — Conventional Commits
- [GitHub Actions](gh-actions/README.md) — CI workflows, `mci lint` / `mci act`
- [Lefthook](lefthook/README.md) — Git hooks (`msetup`)
- [Native](native/README.md) — NAPI-RS bindings, opt-in
- [Playwright](playwright/README.md) — E2E testing (`me2e`)
- [Skills](skills/README.md) — AI agent skills, opt-in (`mskills`)
- [Template](template/README.md) — scaffolder, template-only (`mdocs`)
- [TypeScript](ts/README.md) — shared tsconfigs (`mtsc`)
- [Turbo](turbo/README.md) — task orchestration (`mturbo`)
- [UnoCSS](unocss/README.md) — atomic CSS, opt-in

All bins are linked into `node_modules/.bin` on `bun install`. Root `README.md` and `AGENTS.md` reference these files instead of concatenating them.

Workflows in `.github/workflows/` are generated from `gh-actions/*.base.yml` skeletons with fragments from `*/ci.steps.yml` via `bun run docs:sync`.
