<!-- AUTO-GENERATED from configs/*/README.md -->
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

<!-- PACKAGE:biome:START -->
# @myorg/biome

> Lint and format, shared across the monorepo.

## What it provides

- `@biomejs/biome` as a shared devDependency.
- `biome.json` — a single shared config (no root-level `biome.json`).
- `mbiome` — a CLI alias that resolves Biome and bakes in
  `--config-path=<configs/biome>` automatically.

### Config highlights

- Lint: `recommended` preset, unused imports as errors, unused variables warn.
- Format: 2-space indent, 100 columns, double quotes, semicolons, trailing commas.
- Assist: `organizeImports` on.
- Ignores: `node_modules`, `dist`, `.turbo`, `coverage`, `test-results`, `playwright-report`.

## Usage

```bash
bun run check        # lint + format check, no writes
bun run check:fix    # auto-fix
```

The pre-commit hook runs `mbiome check --write {staged_files}` automatically.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:biome:END -->

<!-- PACKAGE:bun-config:START -->
# @myorg/bun-config

> Shared Bun runtime, test, and coverage configuration.

## What it provides

- `bunfig.toml` — the single source of truth for test + coverage settings.
- `mbun` — wraps `bun`; passes `--config=<configs/bun-config/bunfig.toml>` for
  `bun test` (other commands pass through unchanged).
- `mcoverage` — runs `mturbo coverage` (per-package coverage in dependency
  order) then merges the per-package `coverage/lcov.info` reports into a single
  `coverage/lcov.info` with `lcov-result-merger --prepend-source-files`.

### Config highlights (`bunfig.toml`)

- Coverage always on: LCOV + text reporters → `coverage/lcov.info`.
- 80% line/function threshold; test/config/bundle/`e2e` paths ignored.

## Usage

```bash
bun run test       # mturbo test   (Turbo runs per-package mbun test)
bun run coverage   # mcoverage     (mturbo coverage + merged root lcov.info)
```

## Rules

- No per-package `bunfig.toml` symlinks — the shared config is always passed
  explicitly, so coverage output stays deterministic.
- Bun uses JavaScriptCore (JSC), not V8: never use Node coverage APIs, and
  don't expect `bun test --coverage` to capture separately spawned processes.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:bun-config:END -->

<!-- PACKAGE:bunup:START -->
# @myorg/bunup

> Shared [Bunup](https://bun.sh) bundling configuration for library and CLI packages.

## What it provides

Re-exports Bunup's complete public API — `defineConfig`, `defineWorkspace`,
`build`, and the full set of types (`BuildOptions`, `BuildResult`,
`BunupPlugin`, `DefineConfigItem`, …) — so packages import from `@myorg/bunup`
instead of `bunup` directly.

### Presets

| Preset | Extends | DTS | Purpose |
| ------ | ------- | --- | ------- |
| `baseConfig` | — | ✅ | Defaults: ESM, clean builds, Node target, no minification |
| `libraryConfig` | `baseConfig` | ✅ | Published packages (adds source maps) |
| `inlinedConfig` | `baseConfig` | ❌ | Internal packages inlined by Bunup |
| `cliConfig` | `baseConfig` | — | Executables: minified, Bun target, deps bundled inline |

## Usage

```ts
// packages/external/bunup.config.ts
import { defineConfig, libraryConfig } from "@myorg/bunup";

export default defineConfig({
  ...libraryConfig,
  entry: ["src/index.ts"],
});
```

```json
{
  "scripts": {
    "build": "bunup",
    "dev": "bunup --watch",
    "typecheck": "tsc --noEmit"
  }
}
```

## Rules

- Never depend on `bunup` from an individual package — it is owned here and
  hoisted from `configs/bunup`.
- Do not edit anything inside `dist/` (generated, never committed).

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:bunup:END -->

<!-- PACKAGE:changeset:START -->
# @myorg/changeset

> Changesets versioning + releases, configured.

## What it provides

- `@changesets/cli` as a shared devDependency (exposed via `changeset`,
  `changeset version`, `changeset publish`).
- `config.json` — the shared Changesets config (public access, `main` base
  branch, every non-published package in `ignore`).
- `minit` — copies `config.json` to `.changeset/config.json` when missing and
  never overwrites it afterwards, so developers can customize.

## Lifecycle

The root `prepare` script invokes `bun configs/changeset/init.ts changeset`
on every `bun install`, ensuring `.changeset/config.json` exists.

## Usage

```bash
bun run changeset    # create a changeset for a published-package change
bun run version      # apply versions + changelogs
bun run release      # publish to npm
```

Only `@myorg/external` is published; everything else stays in `ignore`.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:changeset:END -->

<!-- PACKAGE:commitlint:START -->
# @myorg/commitlint

> Conventional Commit validation, shared.

## What it provides

- `@commitlint/cli` and `@commitlint/config-conventional` as shared devDependencies.
- `index.js` — the single commitlint config, consumed with
  `--config configs/commitlint/index.js`.

## Enforced rules

- **Scopes** (`scope-enum`): `config`, `internal`, `external`, `example`,
  `deps`, `release`, `ci`.
- **Types** (`type-enum`): `feat`, `fix`, `docs`, `style`, `refactor`, `test`,
  `chore`, `ci`, `perf`.

## Usage

```bash
bunx commitlint --config configs/commitlint/index.js --edit {1}
```

The commit-msg hook runs this on every commit, so messages are validated
automatically.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:commitlint:END -->

<!-- PACKAGE:gh-actions:START -->
# @myorg/gh-actions

> GitHub Actions CI + local `act` simulation.

## What it provides

- `github-actionlint` as a shared devDependency.
- `actionlint.yaml` — the shared actionlint config.
- `ci.base.yml` / `release.base.yml` — the **workflow skeletons** whose
  `{{STEPS}}` placeholder is filled from the configs' step fragments by
  `bun run docs:sync` (generating `.github/workflows/ci.yml` + `release.yml`).
- `mactionlint` — validates `.github/workflows/` syntax, baking in
  `-config-file=<configs/gh-actions/actionlint.yaml>`.
- `mact` — wraps `act` for local CI, baking in a feature-complete runner image
  (`catthehacker/ubuntu:act-latest`) and `--container-architecture`; prints an
  install guide when `act` is not installed.

## Usage

```bash
bun run docs:sync     # regenerate .github/workflows/ from the skeletons + fragments
bun run ci:lint       # validate workflow syntax (mactionlint)
bun run ci:list       # list workflows/jobs (mact -l)
bun run ci:dry        # dry-run plan (mact push -n)
bun run ci:local      # run CI in Docker (mact push)
```

Other events: `act pull_request -n`, `act -W .github/workflows/release.yml -n`,
`act -j actionlint -n`. Secrets are absent locally — pass `-s NPM_TOKEN` or
use an untracked `.secrets` file.

## Rules

- Workflows are generated, never hand-edited: edit the base skeletons
  (`configs/gh-actions/*.base.yml`) and the per-config `ci.steps.yml` /
  `release.steps.yml` fragments, then run `bun run docs:sync`.
- `if: ${{ !env.ACT }}` guards must live on **step-level** `if` (job-level
  `if` cannot access the `env` context; actionlint enforces this).
- Run `bun run ci:lint` after regenerating a workflow.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:gh-actions:END -->

<!-- PACKAGE:lefthook:START -->
# @myorg/lefthook

> Git hooks for the monorepo, configured once.

## What it provides

- `lefthook` as a shared devDependency.
- `lefthook.yml` — hooks that are merged into the root wrapper on install.
- `msetup` — regenerates the root `lefthook.yml` wrapper, re-links the
  `m`-prefixed CLI bins into `node_modules/.bin`, and installs the hooks.

### Hooks

| Hook | Command |
| ---- | ------- |
| pre-commit | `mbiome check --write {staged_files}` (formats staged files) |
| pre-commit | `bun run ci:lint` when workflow files are staged |
| commit-msg | `bunx commitlint --config configs/commitlint/index.js --edit {1}` |

## Lifecycle

The root `prepare` script invokes `bun configs/lefthook/setup.ts lefthook` —
it runs on every `bun install`. Because the root ships zero
`devDependencies`, the wrapper regeneration + bin linking are what make the
`m`-commands resolvable through `node_modules/.bin`.

Use `msetup lefthook` directly to re-apply after changing hooks.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:lefthook:END -->

<!-- PACKAGE:native:START -->
# @myorg/native

> Opt-in NAPI-RS native bindings, selected at scaffold time.

## What it provides

- A `select` scaffold prompt (`none` / `publish` / `docker`) that decides
  whether a generated project ships native bindings.
- `@napi-rs/cli` as a shared devDependency for projects that opt in.

## Usage

```bash
bun create <user>/<repo> my-app   # choose "Set up native Node-API bindings?"
```

Selecting `none` removes the config (and its artifacts) from the generated
project entirely.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:native:END -->

<!-- PACKAGE:playwright:START -->
# @myorg/playwright

> Shared Playwright E2E testing.

## What it provides

- `@playwright/test` as a shared devDependency.
- `e2e.ts` — `me2e`, a CLI alias that:
  - auto-skips (exit 0) with a hint when no browser is installed;
  - runs `playwright test` against `apps/example/playwright.config.ts` from the
    repository root, so it works with zero flags.

## Usage

```bash
bunx playwright install   # one-time browser download
bun run test:e2e           # run the E2E suite (Turbo-driven)
```

## Rules

- Keep E2E config in the consuming app (`apps/example/playwright.config.ts`); this
  package ships the shared primitives (browser detection, reporter setup).
- Playwright specs import from `@playwright/test`; unit tests import from
  `bun:test`. Never mix.
- Playwright's `page.coverage` is Chromium V8 coverage only — it never reaches
  into Bun's JSC runtime, so coverage merges happen at the LCOV layer only.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:playwright:END -->

<!-- PACKAGE:skills:START -->
# @myorg/skills

> AI agent skill management (opt-in).

## What it provides

- `skills` as a shared devDependency.
- `skills/` — modular skill markdown files, the source of truth.
- `mskills` — syncs skills into `.agents/skills/` (gitignored) or lists them.

## Usage

```bash
bun run skills:list   # mskills list
bun run skills:sync   # mskills sync
```

## Opt-in

This config is **opt-in**: unless selected during scaffolding, the
`skills:sync` / `skills:list` root scripts are removed and `configs/skills/`
(+ `.agents/`) is pruned from the generated project.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:skills:END -->

<!-- PACKAGE:template:START -->
# @myorg/template

> The `bun create` scaffolder that turns this monorepo into a reusable template.

## What it provides

- `@myorg/template` — a first-class Bun workspace declared as
  `bun-create.preinstall` in the root `package.json`. On `bun create`, the
  committed bundle at `dist/index.js` scaffolds the project *before* `bun install`.
- A **data-driven** engine: `discoverConfigs()` reads every
  `configs/*/package.json`'s `scaffold` metadata — no config package is
  hardcoded in the scaffolder.
- `docs:sync` — runs `src/aggregate.ts` to regenerate the root `AGENTS.md`,
  `README.md`, and `.github/workflows/*.yml` from the `configs/*` packages
  (`AGENT.md`, `README.md`, `ci.steps.yml`, and the gh-actions base skeletons).

## Source map

| File | Role |
| ---- | ---- |
| `src/index.ts` | CLI entry (bundled) |
| `src/collector.ts` | `OptionsCollector` — Clack prompts + repo-root discovery |
| `src/scaffolder.ts` | `MonorepoScaffolder` — the pipeline engine |
| `src/configs.ts` | `discoverConfigs` / `ScaffoldMeta` types |
| `src/harness.ts` | `TemplateHarness` — full-pipeline test helper (`BUN_CREATE_DIR`) |
| `src/aggregate.ts` | `docs:sync` — aggregates AGENTS.md, README.md, and CI workflows |

## Development

```bash
bun run --filter @myorg/template test     # unit + integration suites
bun run --filter @myorg/template build    # rebuild the committed dist bundle
bun run docs:sync                          # regenerate root docs + workflows
bun run ci:lint                            # after regenerating workflows
```

## Template Development Only

This package is **removed** from generated projects (its scaffold metadata
declares `selfDestruct: true`). Everything it references is stripped by the
scaffolder (`TEMPLATE-ONLY` blocks, the `docs:sync` script, the
`configs/template` workspace). Root `prepare` in generated projects uses the
surviving `configs/lefthook/setup.ts` + `configs/changeset/init.ts` directly.

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:template:END -->

<!-- PACKAGE:ts:START -->
# @myorg/ts

> Shared TypeScript configuration for the monorepo.

## What it provides

- `typescript` and `@types/bun` as a single, shared devDependency (the only
  place in the repo that declares them).
- Three `tsconfig` presets, all extending `base.json`:

| Preset | Intent |
| ------ | ------ |
| `base.json` | Strict, modern defaults (ES2022, `moduleResolution: "Bundler"`, `strict`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`) |
| `library.json` | `base` + declaration files and source maps (library packages) |
| `app.json` | `base` + `noEmit` and `"types": ["bun"]` (apps, run directly by Bun) |

## Usage

Add the workspace dependency and extend the preset from any package:

```bash
bun add -d @myorg/ts --filter @myorg/<package>  # workspace:* protocol
```

```jsonc
// packages/<name>/tsconfig.json
{
  "extends": "@myorg/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"],
    "paths": { "@src/*": ["./src/*"], "@tests/*": ["./tests/*"] }
  }
}
```

## Files

- `base.json`, `library.json`, `app.json`

## Rules

- Path aliases are per-package — never add them to the shared presets.
- Never use `baseUrl` (removed in TypeScript 7.0, TS5102).

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:ts:END -->

<!-- PACKAGE:turbo:START -->
# @myorg/turbo

> Turborepo task orchestration, configured.

## What it provides

- `turbo` as a shared devDependency.
- `turbo.base.json` — the root task graph (there is no root-level `turbo.json`).
- `mturbo` — a CLI alias that resolves Turbo and bakes in
  `--root-turbo-json=<configs/turbo/turbo.base.json>` automatically.

## Usage

```bash
bun run dev          # watch all packages
bun run build        # build in dependency order
bun run typecheck    # type-check all packages
bun run test:e2e     # run e2e tasks
```

All root scripts delegate to `mturbo`, so Turbo infers inter-package
dependency order and caches task output (`.turbo/`).

## Files

- `turbo.base.json` (exported as `@myorg/turbo/turbo.json`)

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:turbo:END -->

<!-- PACKAGE:unocss:START -->
# @myorg/unocss

> Opt-in UnoCSS (atomic CSS) configuration for Bun workspaces.

## What it provides

- `baseConfig` (exported from `@myorg/unocss`) with `presetWind3`,
  `transformerDirectives`, `transformerVariantGroup`, a `brand` color palette,
  and shared `btn-primary` / `card` shortcuts.
- A scaffold prompt that prunes `uno.config.ts` and the `unocss` /
  `@unocss/reset` app dependencies when the feature is declined.

## Usage

```ts
import { baseConfig, defineConfig } from "@myorg/unocss";

export default defineConfig({ ...baseConfig, content: { /* ... */ } });
```

See [AGENT.md](./AGENT.md) for the agent-facing reference.
<!-- PACKAGE:unocss:END -->

