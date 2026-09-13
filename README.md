<!-- TEMPLATE-ONLY:START(template) -->
# TypeScript Monorepo Template

> A reusable template for TypeScript monorepos built with Bun, Turborepo, and Bunup.

This repository is a **template**, not a regular monorepo. Use it to scaffold a new monorepo with `bun create`.

## Using this template

```bash
bun create <your-github-user>/ts-monorepo-template my-app
cd my-app
bun install
bun run dev
```

The example server starts at [http://localhost:3000](http://localhost:3000).

During scaffolding you will be prompted for:

- Organization scope (e.g. `@acme`)
- Opt-in configs (Playwright E2E, UnoCSS, NAPI-RS, AI skills)

The scaffolder replaces `@myorg` with your scope, strips `TEMPLATE-ONLY` blocks, removes template-only files, prunes disabled configs, and regenerates CI workflows.

After scaffolding, this README will describe your monorepo (see below).

---

<!-- TEMPLATE-ONLY:END(template) -->
# @myorg/external

A TypeScript library monorepo built with Bun, Turborepo, and Bunup.

## Quick Start

```bash
bun install
bun run dev
```

The example server starts at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
apps/
  example/          Bun.serve HTTP server (imports from @myorg/external)
packages/
  external/         Public library (published to npm, exports . and subpaths)
  internal/         Private implementation (inlined into external by Bunup)
configs/
  biome/            Lint and format (mbiome)
  bun-config/       Bun runtime, test, coverage (mbun)
  bunup/            Bundling presets (mbunup)
  changeset/        Versioning and releases (mchangeset)
  commitlint/       Conventional Commits (commitlint)
  gh-actions/       GitHub Actions CI + act (mci)
  lefthook/         Git hooks (msetup)
  ts/               TypeScript presets (mtsc)
  turbo/            Task orchestration (mturbo)
```

<!-- TEMPLATE-ONLY:START(playwright,skills,unocss,native) -->
Opt-in configs (present only when selected during scaffolding):

```
configs/
  playwright/       E2E testing (me2e)
  skills/           AI agent skills (mskills)
  unocss/           Atomic CSS
  native/           NAPI-RS bindings
```
<!-- TEMPLATE-ONLY:END(playwright,skills,unocss,native) -->

<!-- TEMPLATE-ONLY:START(template) -->
Template-only (removed after scaffolding):

```
configs/
  template/         Scaffolder (mdocs)
```
<!-- TEMPLATE-ONLY:END(template) -->

Every tool config lives in its own `configs/*` package and is reached through `m`-prefixed CLI bins that bake in config paths. There are no root tool-config files (`turbo.json`, `biome.json`, `bunfig.toml`, etc.) and the root ships zero `devDependencies`.

## Tooling

Tool configs and their docs (reference, not concatenated):

- [Biome](configs/biome/README.md) — lint and format
- [Bun Config](configs/bun-config/README.md) — Bun runtime, test, coverage
- [Bunup](configs/bunup/README.md) — bundling presets
- [Changeset](configs/changeset/README.md) — versioning and releases
- [Commitlint](configs/commitlint/README.md) — Conventional Commits
- [GitHub Actions](configs/gh-actions/README.md) — CI workflows, `mci lint` / `mci act`
- [Lefthook](configs/lefthook/README.md) — Git hooks
<!-- TEMPLATE-ONLY:START(playwright) -->
- [Playwright](configs/playwright/README.md) — E2E testing
<!-- TEMPLATE-ONLY:END(playwright) -->
<!-- TEMPLATE-ONLY:START(skills) -->
- [Skills](configs/skills/README.md) — AI agent skills (opt-in)
<!-- TEMPLATE-ONLY:END(skills) -->
<!-- TEMPLATE-ONLY:START(template) -->
- [Template](configs/template/README.md) — scaffolder, template-only
<!-- TEMPLATE-ONLY:END(template) -->
- [TypeScript](configs/ts/README.md) — shared tsconfigs
- [Turbo](configs/turbo/README.md) — task orchestration
<!-- TEMPLATE-ONLY:START(unocss) -->
- [UnoCSS](configs/unocss/README.md) — atomic CSS, opt-in
<!-- TEMPLATE-ONLY:END(unocss) -->
<!-- TEMPLATE-ONLY:START(native) -->
- [Native](configs/native/README.md) — NAPI-RS, opt-in
<!-- TEMPLATE-ONLY:END(native) -->

See [AGENTS.md](AGENTS.md) for agent-facing documentation and [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow.

## Commands

| Command | Description |
| ------- | ----------- |
| `bun run dev` | Start all packages in watch mode (Turbo) |
| `bun run build` | Build all packages (Turbo orchestrated) |
| `bun run test` | Run all unit tests (Turbo orchestrates per-package `mbun test`) |
| `bun run test:e2e` | Run Playwright E2E tests (auto-skips if browsers missing) |
| `bun run coverage` | Collect unit-test coverage (merged LCOV at `coverage/lcov.info`) |
| `bun run typecheck` | Type-check all packages |
| `bun run check` | Lint and format check (Biome) |
| `bun run check:fix` | Auto-fix lint and format issues |
| `bun run ci:lint` | Validate GitHub Actions workflows (`mci lint`) |
| `bun run ci:list` | List `act` jobs (`mci act -l`) |
| `bun run ci:dry` | Dry-run CI locally (`mci act push -n`) |
| `bun run ci:local` | Run CI locally in Docker (`mci act push`) |
| `bun run skills:list` | List available AI agent skills |
| `bun run skills:sync` | Sync AI agent skills into `.agents/skills/` |
| `bun run docs:sync` | Regenerate workflows from `configs/*` (`mdocs`) |

## Workflows

Workflows in `.github/workflows/` are generated from skeletons in `configs/gh-actions/*.base.yml` with fragments from `configs/*/ci.steps.yml`. Edit the skeletons and fragments, then run `bun run docs:sync`.

## License

[MIT](LICENSE.md)
