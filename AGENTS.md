<!-- TEMPLATE-ONLY:START(template) -->
# AGENTS.md — Template

> Behavioral rules for AI coding agents working in this **template** repository.

This repository is a **template**: opt-in configs plus a data-driven scaffolder (`configs/template/`) that turns it into a monorepo via `bun create`. The rules below are the ones that hold in the template repo; after scaffolding, the same file governs the generated monorepo.

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
| Bundler | **Bunup** | `mbunup` (config in `configs/bunup/`) |
| Task runner | **Turbo** | `mturbo <task>` (`turbo.base.json` → generates `turbo.json`) |
| Type checker | **mtsc** | `mtsc --noEmit` — tsc never emits, Bunup does |
| Git hooks | **Lefthook** | `msetup` (config in `configs/lefthook/`) |
| Releases | **Changesets** | `mchangeset` |
| Rust bindings | **Cargo + napi-rs** | `mnative` (opt-in) |

## Forbidden

> [!CAUTION]
> These are non-negotiable. Violations break CI or publishing.

- **Bun only.** Never invoke `npm`, `npx`, `pnpm`, or `yarn`.
- **Biome only.** Never invoke `eslint`, `prettier`, or `lint-staged`.
- **Never add `typescript`, `bunup`, or `@types/bun` to a package's devDependencies.** They are owned by `@myorg/ts` (`configs/ts`) and hoisted from there.
- **Never edit anything under `dist/`.** Bunup generates it.
- **Never use `baseUrl` in a `tsconfig.json`.** Removed in TypeScript 7.0 (TS5102) — use `paths` only.
- **No root tool configs.** Do not create root `turbo.json`, `biome.json`, `bunfig.toml`, `commitlint.config.js`, or `.actrc`; all config lives in `configs/*`.
- **Never commit** `node_modules/`, `dist/`, `.turbo/`, `test-results/`, `coverage/`, or `.env` files.
- **Never edit a generated file** — see the table below.
- **Never use `export *` in `@myorg/external`.** Re-export named symbols explicitly.
- **Never add runtime dependencies to `@myorg/external`.** Internal code is inlined by Bunup.
- **Never run `bun test` at the repo root** for package work — use `bun run test` (Turbo) or `--filter <pkg>`.
- **Never hand-write a workflow.** Edit `configs/*/*.base.yml` + `*.steps.yml`, then run `bun run docs:sync`.

## Command conventions

Every tool is reached through an `m`-prefixed bin that bakes in its config path. Bins are linked into `node_modules/.bin` on install — the root ships zero `devDependencies`.

| Alias | Wraps | Notes |
| :--- | :--- | :--- |
| `mturbo` | `turbo` | `turbo.base.json`, DAG order, caching |
| `mbiome` | `biome` | Shared config from `configs/biome` |
| `mbun` | `bun` | Injects `bunfig.toml`; `mbun coverage` merges LCOV |
| `mbunup` | `bunup` | `mbunup health` = publint + arethetypeswrong |
| `mtsc` | `tsc` | `--noEmit` only |
| `mchangeset` | `changeset` | `init` ensures `.changeset/config.json` |
| `msetup` | citty | Links `m`-bins, regenerates `lefthook.yml`, installs hooks |
| `mdocs` | citty | Regenerates generated files from `configs/*` |
| `mci` | actionlint + act | `lint` validates workflows, `act` runs them locally |
| `mgitleaks` | gitleaks | `detect` + `protect --staged` |
| `mcoverage` | genhtml/lcov | `merge`, `html`, `check`, `summary`, `pages` |
| `mnative` | cargo + napi | `list`, `add`, `matrix`, cargo commands, napi per package (opt-in) |
| `me2e` | playwright | Auto-skips when browsers are missing (opt-in) |
| `mpages` | — | `build`, `base`, `list` (opt-in) |
| `mskills` | skills.sh | `list`, `sync`, `add`, `update`, `validate`, `index` (opt-in) |
| `munocss` | unocss | `build`, `watch`; no-op when disabled (opt-in) |
| `mtrivy` / `mcodeql` | trivy / codeql | Scanning; no-op locally (opt-in) |

Per-package work (`build`, `test`, `dev`, `coverage`, `typecheck`) belongs to each package's own script and is orchestrated by Turbo. Monorepo-wide concerns stay at the root: git hooks, workflow generation, skills, and the coverage merge that runs after the per-package reports exist.

## Configs

Each config owns the rules for its area — read the linked file before changing it. Rows for pruned configs are stripped by the scaffolder.

<details>
<summary>Always-on</summary>

| Config | Rules |
| :--- | :--- |
| Badges | [AGENTS.md](configs/badges/AGENTS.md) |
| Biome | [AGENTS.md](configs/biome/AGENTS.md) |
| Bun Config | [AGENTS.md](configs/bun-config/AGENTS.md) |
| Bunup | [AGENTS.md](configs/bunup/AGENTS.md) |
| Changeset | [AGENTS.md](configs/changeset/AGENTS.md) |
| Citty | [AGENTS.md](configs/citty/AGENTS.md) |
| Commitlint | [AGENTS.md](configs/commitlint/AGENTS.md) |
| Community | [AGENTS.md](configs/community/AGENTS.md) |
| Coverage | [AGENTS.md](configs/coverage/AGENTS.md) |
| Dependabot | [AGENTS.md](configs/dependabot/AGENTS.md) |
| EditorConfig | [AGENTS.md](configs/editorconfig/AGENTS.md) |
| GitAttributes | [AGENTS.md](configs/gitattributes/AGENTS.md) |
| GitHub Actions | [AGENTS.md](configs/gh-actions/AGENTS.md) |
| Gitleaks | [AGENTS.md](configs/gitleaks/AGENTS.md) |
| Lefthook | [AGENTS.md](configs/lefthook/AGENTS.md) |
| TypeScript | [AGENTS.md](configs/ts/AGENTS.md) |
| Turbo | [AGENTS.md](configs/turbo/AGENTS.md) |

</details>

<!-- TEMPLATE-ONLY:START(playwright,skills,template,unocss,native,devcontainer,pages,codeql,trivy,stale) -->
<details>
<summary>Opt-in</summary>

| Config | Rules |
| :--- | :--- |
<!-- TEMPLATE-ONLY:END(playwright,skills,template,unocss,native,devcontainer,pages,codeql,trivy,stale) -->
<!-- TEMPLATE-ONLY:START(codeql) -->
| CodeQL | [AGENTS.md](configs/codeql/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(codeql) -->
<!-- TEMPLATE-ONLY:START(devcontainer) -->
| Devcontainer | [AGENTS.md](configs/devcontainer/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(devcontainer) -->
<!-- TEMPLATE-ONLY:START(native) -->
| Native | [AGENTS.md](configs/native/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(native) -->
<!-- TEMPLATE-ONLY:START(pages) -->
| Pages | [AGENTS.md](configs/pages/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(pages) -->
<!-- TEMPLATE-ONLY:START(playwright) -->
| Playwright | [AGENTS.md](configs/playwright/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(playwright) -->
<!-- TEMPLATE-ONLY:START(skills) -->
| Skills | [AGENTS.md](configs/skills/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(skills) -->
<!-- TEMPLATE-ONLY:START(stale) -->
| Stale | [AGENTS.md](configs/stale/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(stale) -->
<!-- TEMPLATE-ONLY:START(trivy) -->
| Trivy | [AGENTS.md](configs/trivy/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(trivy) -->
<!-- TEMPLATE-ONLY:START(unocss) -->
| UnoCSS | [AGENTS.md](configs/unocss/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(unocss) -->
<!-- TEMPLATE-ONLY:START(template) -->
| Template | [AGENTS.md](configs/template/AGENTS.md) |
<!-- TEMPLATE-ONLY:END(template) -->

</details>

## Generated files — never edit directly

| Generated | Edit this source instead | Regenerate with |
| :--- | :--- | :--- |
| `.github/workflows/*.yml` | `configs/*/*.base.yml` + `configs/*/*.steps.yml` | `bun run docs:sync` |
| `.github/dependabot.yml` | `configs/dependabot/dependabot.base.yml` + fragments | `bun run docs:sync` |
| `turbo.json` | `turbo.base.json` (in `configs/turbo`) | `bun run docs:sync` |
| `lefthook.yml` | `configs/lefthook/lefthook.yml` | `bun install` (`prepare`) |
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
- Only one workflow may deploy to Pages. In the template repo that is `template-docs.yml`, so `docs:sync` deliberately skips `pages.yml` and `coverage.yml` while `docs/` exists.

## Package boundaries

Enforced by Biome `noRestrictedImports` and the dependency graph:

- `apps/**` may import from `packages/**`
- `packages/external` may import `packages/internal` (devDependency, inlined at build time)
- `packages/internal` must never import `packages/external` — circular
- `packages/**` must never import from `apps/**`
- No workspace may import `bunup`, `biome`, or `tsc` directly — use the `m`-bin

## Before marking any task done

- [ ] `bun install` — lockfile unchanged (`--frozen-lockfile` in CI)
- [ ] `bun run check` — 0 errors (14 warnings / 14 infos is the baseline)
- [ ] `bun run test` — 14/14 turbo tasks, 157 pass / 0 fail
- [ ] `bun run typecheck` — 14/14
- [ ] `bun run build` — 19/19
- [ ] `bun run coverage` — line coverage ≥ 80% (currently 96.95%)
- [ ] Any `configs/` change → `bun run docs:sync` run **and** generated files committed
- [ ] Any published package change → `bun run changeset` with the right bump
- [ ] Any published package change → `publint` + `attw --profile esm-only` clean (`mbunup health`)
- [ ] Any `packages/native` change → `mnative check` + `mnative clippy` clean when a Rust toolchain is present
