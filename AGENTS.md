<!-- TEMPLATE-ONLY:START(template) -->
# AGENTS.md — Template

> Behavioral rules for AI coding agents working in this **template** repository.

This repository is a **template**: opt-in configs plus a data-driven scaffolder (`packages/tooling/`) that turns it into a monorepo via `bun create`. The rules below are the ones that hold in the template repo; after scaffolding, the same file governs the generated monorepo.

> [!NOTE]
> Template mode: this intro is stripped after scaffolding.

```bash
bun create Archont561/ts-monorepo-template my-app
cd my-app
bun install
```

- The scaffolder keeps its own copy of the workflow aggregation (`regenerateCI`). Changing generation behaviour means changing **both** `src/aggregate.ts` and `src/scaffolder.ts` in the template config.

---

<!-- TEMPLATE-ONLY:END(template) -->
# AGENTS.md

> Behavioral rules for AI coding agents. Read at the start of every session.
> Current state, metrics and in-flight work live in [CONTEXT.md](CONTEXT.md) — never here.

## Toolchain

State the tool, not the category — every one of these replaces a more common default.

| Concern | Tool | How it is invoked |
| :--- | :--- | :--- |
| Runtime + package manager | **Bun** | `bun`, `bun install`, `bun add`, `bun run <script>` |
| Test runner | **Bun** | `bun:test` via `mbun test` (Turbo runs it per package) |
| Formatter + linter | **Biome** | `mbiome check --write` |
| Bundler | **Bunup** | `m build` (config in `packages/tooling/src/bunup.ts`) |
| Task runner | **Turbo** | `mturbo <task>` (`turbo.base.json` → generates `turbo.json`) |
| Type checker | **mtsc** | `mtsc --noEmit` — tsc never emits, Bunup does |
| Git hooks | **Lefthook** | `m setup lefthook` (config in `packages/tooling/src/configs/lefthook.yml`) |
| Releases | **Changesets** | `mchangeset` |
| Rust bindings | **Cargo + napi-rs** | `mnative` (opt-in) |

## Forbidden

> [!CAUTION]
> These are non-negotiable. Violations break CI or publishing.

- **Bun only.** Never invoke `npm`, `npx`, `pnpm`, or `yarn`.
- **Biome only.** Never invoke `eslint`, `prettier`, or `lint-staged`.
- **Never add `typescript`, `bunup`, or `@types/bun` to a package's devDependencies.** They are owned by `@myorg/tooling` and hoisted from there.
- **Never edit anything under `dist/`.** Bunup generates it.
- **Never use `baseUrl` in a `tsconfig.json`.** Removed in TypeScript 7.0 (TS5102) — use `paths` only.
- **No root tool configs.** Do not create root `turbo.json`, `biome.json`, `bunfig.toml`, `commitlint.config.js`, or `.actrc`; all shared config lives in `packages/tooling/src/configs/`.
- **Never commit** `node_modules/`, `dist/`, `.turbo/`, `test-results/`, `coverage/`, or `.env` files.
- **Never edit a generated file** — see the table below.
- **Never use `export *` in `@myorg/external`.** Re-export named symbols explicitly.
- **Never add runtime dependencies to `@myorg/external`.** Internal code is inlined by Bunup.
- **Never run `bun test` at the repo root** for package work — use `bun run test` (Turbo) or `--filter <pkg>`.
- **Never hand-write a workflow.** Edit `packages/tooling/src/ci/`, then run `bun run docs:sync`.

## Imports

Exactly three import forms are allowed. Anything else is a bug waiting for a
directory move.

| Form | Use it for | Example |
| :--- | :--- | :--- |
| `./relative` | A sibling or child in the same directory tree | `./features/paths` |
| `@/path` | Anything else inside the **same** package or app | `@/src/features/paths` |
| `@npm-package` | A dependency, workspace or third-party | `@myorg/external`, `citty` |

`@` is the package or app root, mapped by `"paths": { "@/*": ["./*"] }` in that
package's own `tsconfig.json`. bunup resolves it through `preferredTsconfig`, so
the alias works in the build as well as in the editor.

**Never write a `../` import — not even one level.** It is silently wrong the
moment a file moves, and the failure is a missed lookup rather than an error.
A single `../utils/x` is the same hazard as `../../../utils/x`, just smaller.
`packages/tooling/tests/imports.test.ts` fails the build on any `../` module
specifier in a tracked TypeScript file, and on any `@/` specifier that does not
resolve.

That rule is about **module specifiers only**. Filesystem paths are a different
thing and legitimately need `..` — for those, use the exported root constant
instead: `APP_ROOT` / `REPO_ROOT` from `apps/example/src/features/paths.ts`, or
`pkgRoot()` / `repoRoot()` from `packages/tooling/src/utils/paths.ts`.

The runtime constants matter for a second reason: the bundler moves files, so a
path derived from `import.meta.dir` in shipped code resolves differently before
and after the build. Tests are never bundled, which is why `tests/helpers.ts`
can derive `REPO_ROOT` from `import.meta.dir` safely.

## Command conventions

Every tool is reached through an `m`-prefixed bin that bakes in its config path. Bins are linked into `node_modules/.bin` on install — the root ships zero `devDependencies`.

| Alias | Wraps | Notes |
| :--- | :--- | :--- |
| `mturbo` | `turbo` | `turbo.base.json`, DAG order, caching |
| `mbiome` | `biome` | Shared config from `packages/tooling/src/configs/biome.json` |
| `mbun` | `bun` | Injects `bunfig.toml`; `mbun coverage` merges LCOV |
| `mbunup` | `bunup` | `mbunup health` = publint + arethetypeswrong |
| `mtsc` | `tsc` | `--noEmit` only |
| `mchangeset` | `changeset` | `init` ensures `.changeset/config.json` |
| `msetup` | citty | Links `m`-bins, regenerates `lefthook.yml`, installs hooks |
| `mdocs` | citty | Regenerates generated files from `packages/tooling/src/ci/` |
| `mci` | actionlint + act | `lint` validates workflows, `act` runs them locally |
| `mgitleaks` | gitleaks | `detect` + `protect --staged` |
| `mcoverage` | genhtml/lcov | `setup`, `collect`, `merge`, `html`, `check`, `summary`, `sync`, `pages` |
| `mnative` | cargo + napi | `list`, `add`, `matrix`, cargo commands, napi per package (opt-in) |
| `me2e` | playwright | Auto-skips when browsers are missing (opt-in) |
| `mpages` | — | `build`, `base`, `list` (opt-in) |
| `mskills` | skills.sh | `list`, `sync`, `add`, `update`, `validate`, `index` (opt-in) |
| `mtrivy` / `mcodeql` | trivy / codeql | Scanning; no-op locally (opt-in) |

Per-package work (`build`, `test`, `dev`, `coverage`, `typecheck`) belongs to each package's own script and is orchestrated by Turbo. Monorepo-wide concerns stay at the root: git hooks, workflow generation, skills, and the coverage merge that runs after the per-package reports exist.

## Shared configuration

Everything the toolchain needs lives in **`packages/tooling`** — there are no
per-feature config packages any more (R27 collapsed all 28 into this one
package).

| Area | Where it lives |
| :--- | :--- |
| Shared tool config (`biome.json`, `bunfig.toml`, `turbo.base.json`, `uno.config.ts`, `changeset.config.json`, `lefthook.yml`, …) | `packages/tooling/src/configs/` |
| Workflow skeletons and step fragments | `packages/tooling/src/ci/` (`ci.base.yml`, `sections/`, `fragments/`, `standalone/`) |
| The `m` CLI and its wrappers | `packages/tooling/src/cli.ts`, `src/commands/` |
| The scaffolder | `packages/tooling/src/scaffold/` |

Resolve a shared asset with `resolveConfig("<file>")` from `src/utils/paths.ts`
rather than hardcoding a path — it works both in this repo and in a generated
project.

## Generated files — never edit directly

| Generated | Edit this source instead | Regenerate with |
| :--- | :--- | :--- |
| `.github/workflows/*.yml` | `packages/tooling/src/ci/` (`ci.base.yml` + `sections/` + `fragments/`) | `bun run docs:sync` |
| `.github/dependabot.yml` | `packages/tooling/src/ci/fragments/dependabot/` | `bun run docs:sync` |
| `turbo.json` | `packages/tooling/src/configs/turbo.base.json` | `bun run docs:sync` |
| `lefthook.yml` | `packages/tooling/src/configs/lefthook.yml` | `bun install` (`prepare`) |
| `packages/native/npm/*-*/` | nothing — generated in CI by `napi create-npm-dirs` | CI only, never committed |

Editing generated output is silent data loss: the next regeneration overwrites it.

## Non-obvious patterns

- `@myorg` is the template scope; the scaffolder rewrites it. Use it everywhere in configs and never hardcode a real scope.
- `packages/native` is a **virtual Cargo workspace**: `crates/*` for Rust, `npm/*` for the npm packages built from them. There is no root `Cargo.toml`.
- Platform npm packages (`npm/<name>-<platform>/`) are generated in CI and gitignored. Never commit or hand-edit them.
- `attw` runs with `--profile esm-only`. node10 and CJS resolution failures are intentional, not bugs.
- Biome `overrides` **replace** rule options rather than merging — restate every option you need inside each override block.
- TS path aliases are `@src/*` and `@tests/*`. No cross-package `../../` imports.
- `clippy -D warnings` is a CI flag only — never `#![deny(warnings)]` in Rust source.
- Only one workflow may deploy to Pages. In the template repo that is `template-docs.yml`, so `docs:sync` deliberately skips `pages.yml` and `coverage.yml` while the docs app (`apps/template-docs`) exists.

## Package boundaries

Enforced by Biome `noRestrictedImports` and the dependency graph:

- `apps/**` may import from `packages/**`
- `packages/external` may import `packages/internal` (devDependency, inlined at build time)
- `packages/internal` must never import `packages/external` — circular
- `packages/**` must never import from `apps/**`
- No workspace may import `bunup`, `biome`, or `tsc` directly — use the `m`-bin

## Before marking any task done

- [ ] `bun install` — lockfile unchanged (`--frozen-lockfile` in CI)
- [ ] `bun run check` — 0 errors (14 warnings / 10 infos is the baseline)
- [ ] `bun run test` — 19/19 turbo tasks, 230 pass / 0 fail
- [ ] `bun run typecheck` — 14/14
- [ ] `bun run build` — 19/19
- [ ] `bun run coverage` — line coverage ≥ 80% (currently 99.52%, config packages included)
- [ ] Any `packages/tooling/src/ci/` change → `bun run docs:sync` run **and** generated files committed
- [ ] Any published package change → `bun run changeset` with the right bump
- [ ] Any published package change → `publint` + `attw --profile esm-only` clean (`mbunup health`)
- [ ] Any `packages/native` change → `mnative check` + `mnative clippy` clean when a Rust toolchain is present
