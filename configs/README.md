# @myorg/external

A TypeScript library monorepo built with Bun, Turborepo, and Bunup.

## Quick Start

```bash
bun install
bun run dev
```

The example server starts at [http://localhost:3000](http://localhost:3000).

## Commands

| Command | Description |
| ------- | ----------- |
| `bun run dev` | Start all packages in watch mode (Turbo) |
| `bun run build` | Build all packages (Turbo orchestrated) |
| `bun run test` | Run all unit tests (Turbo orchestrates per-package `mbun test`) |
| `bun run test:e2e` | Run Playwright E2E tests (auto-skips if browsers missing) |
| `bun run coverage` | Collect unit-test coverage (merged LCOV at coverage/lcov.info) |
| `bun run typecheck` | Type-check all packages |
| `bun run check` | Lint and format check (Biome) |
| `bun run check:fix` | Auto-fix lint and format issues |
| `bun run ci:lint` | Validate GitHub Actions workflows (actionlint) |
| `bun run ci:list` | List `act` jobs |
| `bun run ci:dry` | Dry-run CI locally (`act -n`) |
| `bun run ci:local` | Run CI locally in Docker (`act`) |
| `bun run skills:list` | List available AI agent skills |
| `bun run skills:sync` | Sync AI agent skills into `.agents/skills/` |

## Project Structure

```
apps/
  example/          Bun.serve HTTP server
configs/
  <tool>/           One workspace per shared tool config (see sections below)
  AGENT.md          Intro for AGENTS.md (aggregated)
  README.md         This intro (aggregated into the root README.md)
packages/
  external/         Public library (published to npm)
  internal/         Private implementation (inlined into external)
```

Every tool config lives in its own `configs/*` package and is reached through
`m`-prefixed CLI aliases (`mturbo`, `mbiome`, `mbun`, ...) that bake in the
config paths; there are no root tool-config files (`turbo.json`,
`biome.json`, `bunfig.toml`, etc.) and the root ships zero `devDependencies`.

The root `README.md`, `AGENTS.md`, and the workflows in `.github/workflows/` are
generated from these `configs/*` packages by `bun run docs:sync` — do not edit
them by hand.

## License

[MIT](LICENSE.md)