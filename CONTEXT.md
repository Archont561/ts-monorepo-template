# CONTEXT.md

> Snapshot of what is true **right now**. Not rules — those are in [AGENTS.md](AGENTS.md).
> Not onboarding — that is in [README.md](README.md).
> This file goes stale on the next commit; regenerate it rather than patching it.

Last updated: 2026-09-14

## Repo shape

TypeScript monorepo, Bun workspaces + Turbo.

- `apps/` — one demo HTTP app (private, never published)
- `packages/` — `external` (the only published package), `internal` (private, inlined by Bunup), `native` (optional Rust workspace)
- `configs/` — 27 tool configs; each owns the files it generates
- `.agents/` — vendored agent skills, one `SKILL.md` per skill
- Generated, never committed as source: `.github/workflows/*`, `turbo.json`, `lefthook.yml`, `packages/native/npm/*-*/`

<!-- TEMPLATE-ONLY:START(template) -->
In template mode this repo is also the template: a scaffolder config that deletes
itself and a docs app (`apps/template-docs`) that the scaffolder removes.
<!-- TEMPLATE-ONLY:END(template) -->

## Packages

| Package | Role | Published |
| :--- | :--- | :--- |
| `@myorg/external` | Public API — the installable artifact | ✅ npm |
| `@myorg/internal` | Shared implementation, inlined into `external` at build time | ❌ |
| `@myorg/native` | Rust bindings built from `packages/native/crates/native` (opt-in) | ✅ npm |
| `@myorg/example` | Bun.serve demo app, also the Pages artifact (opt-in) | ❌ |

All `configs/*` packages are private. `packages/native` itself is a Cargo workspace root,
not an npm package — the npm package is `packages/native/npm/native`.

## Configs

27 configs: 17 always-on, 9 opt-in (pruned by the scaffolder when declined), 1 template-only.

- Always-on: badges, biome, bun-config, bunup, changeset, citty, commitlint, community, coverage, dependabot, editorconfig, gitattributes, gh-actions, gitleaks, lefthook, ts, turbo
- Opt-in: codeql (default on), playwright (default on), devcontainer, native, pages, skills, stale, trivy, unocss
<!-- TEMPLATE-ONLY:START(template) -->
- Template-only: the scaffolder config (`mdocs`) — self-destructs on scaffold
<!-- TEMPLATE-ONLY:END(template) -->

## Architectural decisions

- **ESM-only output** — CJS is not supported. `attw` must run with `--profile esm-only`; node10 and CJS failures are intentional.
- **No `baseUrl`** — TypeScript 7.0 removed it; path aliases use `paths` only.
- **Generated-file system** — every generated file has a source in `configs/*`. Never edit output; always regenerate.
- **Zero root devDependencies** — all tools are workspace packages exposing `m`-prefixed bins.
- **Monorepo-wide concerns stay at the root** — git hooks, workflow generation, skills, coverage merge. Per-package work is Turbo's.
- **Native is a virtual Cargo workspace** — `packages/native/crates/*` for Rust, `packages/native/npm/*` for the npm packages; per-platform packages are CI artifacts only.
- **One Pages deployer** — in this repo `template-docs.yml`, so `docs:sync` skips `pages.yml`/`coverage.yml` while `docs/` exists.
- **Coverage gate is 80% lines** — enforced by `mcoverage check` in CI.

## Current session

### In-flight

- Branch `arena/01a0a0bf-ts-monorepo-template`. Coverage suite re-run after install; three warnings fixed (turbo's "globally installed" false positive via `TURBO_GLOBAL_WARNING_DISABLED` + a `spawnTool` env fix — Bun spawns children with the startup env snapshot; the d.ts TS9007 warning via an explicit `NativeBinding` type) and the pending-changeset leak in scaffolds plugged. Then the docs site moved from root `docs/` into `apps/template-docs`: a real workspace app (own `vitepress` dep, Turbo `build`/`dev`/`preview`, `outDir: "dist"`), removed on scaffold purely via package options, and `template-docs.yml` now uploads `apps/template-docs/dist` — the same dist/ convention as every app. `mdocs site` builds through the `docs:build` delegate and folds coverage (`dist/coverage`) and the demo app (`dist/example`) in after the build, so the cacheable docs build stays deterministic.
- Branch `arena/01a0a048-ts-monorepo-template`. Coverage suite loaded and run end to end (test → coverage → merge → summary → check → html edge cases). Two bugs surfaced and were fixed:
  1. `mcoverage merge --report-only` hardcoded a `+` prefix on the delta, so a coverage *drop* from widening the gate printed as `+-15.00 points` — the dry run exists to show drops, so the sign is now computed via the exported `formatSigned` helper (`configs/coverage/src/cli.ts`), pinned by three regression tests in `tests/merge.test.ts`. Positive-delta output (`+2.05 points, +844 lines`) is byte-identical to before.
  2. `configs/biome/biome.json`'s `!**/coverage` ignore (for generated output dirs) also pruned the **tracked** `configs/coverage` source package — Biome prunes a directory the moment it matches and file-level re-includes cannot un-prune it. Result: the package was silently excluded from every `bun run check`/CI lint pass, and the pre-commit hook (`mbiome check --write {staged_files}`) rejected any commit touching `configs/coverage` with "No files were processed". The config now re-includes `configs/coverage` after the exclusion and re-excludes the package's own generated dirs (mirrors the `.gitignore` negation; rationale in `configs/biome/README.md`). Linting the package for the first time exposed three latent errors in `src/cli.ts` (dead `cp` import, unsorted imports, a 100+col line) — all fixed.
- Branch `arena/01a09f8a-ts-monorepo-template`. Toolchain installed (Bun 1.4.2 from npm — `bun.sh` is unreachable here), full suite run, then a bug pass over the paths that no test covered.
- Bugs fixed: the demo app resolved `public/` one level too high (`apps/public/...`), so `/uno.css` always served the "not built" fallback and the feature log read `unocss=no`; `/api` looked for the UnoCSS config one level short and listed only half the native routes; `mnative add` could only ever use `@myorg` (dead `? undefined : undefined`); `mcoverage check` hardcoded `80` instead of `COVERAGE_THRESHOLD`; `mbadges check` / `mchangeset init` ran twice because citty falls through to the parent command.
- New `apps/example/src/features.ts` owns the app's `public/` paths and feature detection — one source instead of a relative path per call site — with `tests/features.test.ts` (12 tests) covering it.
- Scaffolds now match the picture the docs promised: the root manifest is reconciled with what survived a removal (`bun install` no longer fails on a deleted `packages/native`), scripts whose bin was removed are gone (`security:audit`, `skills`, `security:trivy`/`security:check`), and native-only test imports are wrapped in `TEMPLATE-ONLY` markers.
- The marker stripper and the Turbo writer no longer hand the scaffolded project a file its own `biome check` rejects: marker lines take their indentation with them and JSON edits are text surgery, not `JSON.stringify`.
- `mnative add` writes the package the shipped crate has — compact `tsconfig.json`, `turbo.json`, a structure test to typecheck — instead of a package that failed `typecheck`, lacked a test and broke `check`.
- The E2E specs asserted the plain page only; `/` serves the UnoCSS page whenever that config is enabled, so the title/greeting/background assertions now accept both.

### Verified working (local, this sandbox)

- `bun run check` / `typecheck` / `test` / `build` / `coverage` all exit 0
- `bun run docs:sync` regenerates six workflows; all parse as YAML
- Template suite: 103 tests over every opt-in combination, 0 fail
- `mnative list`, `mnative matrix --gha`, `mnative add <name>` (crate + npm package + sorted `members`)
- `bun install` links `node_modules/@myorg/native` → `packages/native/npm/native`
- Demo app served with `bun src/index.ts` and probed over HTTP: `/health`, `/`, `/api`, `/uno.css` (6068 B built bundle, not the fallback), `/api/native/*` — all 200 with the expected payloads
- `mnative add` scope resolution checked against a throwaway `@acme` workspace: flag → existing package scope → `NATIVE_SCOPE` → `@myorg`

### Known gaps

- Rust toolchain absent in this sandbox — cargo/napi builds no-op, so native bindings have never been compiled here.
- Playwright browsers absent — `bun run test:e2e` skips by design.
- `native.yml`'s build matrix is still unverified. It had never run on real GitHub Actions; with the m-bin `PATH` fix in place its `matrix` job now passes, but the container jobs cannot install bun (the Debian image has no `unzip`; the Alpine image cannot execute the glibc bun), the Windows binding build exits 1, and the WASI download plus the artifact fan-in have not completed a run yet.
- Manifests are edited as text through the shared editor in `configs/manifest`, so adding or removing turbo tasks and workspace entries leaves the surrounding formatting alone; a manifest that does not parse is left untouched instead of being rewritten.
- Publish ordering for the per-platform native npm packages is still unwired — `native.yml` uploads them as `native-npm-packages` but nothing consumes that artifact yet.

### Baseline — do not regress

| Metric | Value |
| :--- | :--- |
| Tests | 233 pass / 0 fail (19 turbo tasks) |
| Typecheck | 14/14 |
| Build | 19/19 |
| Coverage | 99.52% lines (1037/1042) over apps+packages+configs — gate 80% |
| Biome | 0 errors; 14 warnings + 10 infos over 158 files (incl. `configs/coverage`, previously pruned) |
| Workflows | 6 generated, all parse |
| Scaffolds | `native=none` and `native=publish` variants: install + check + typecheck + test all clean |
| E2E | skipped — browsers not installed |

## Recent significant changes

| Commit | What |
| :--- | :--- |
| `71616ab` | native docs rewritten for the workspace; Dockerfile + `.dockerignore` paths fixed |
| `a8ea08c` | `native.yml` build matrix driven by `mnative matrix --gha` |
| `0834b0a` | `packages/native` becomes a virtual Cargo workspace (`crates/*` + `npm/*`) |
| `408339f` | repo identity rewritten on scaffold; commitlint scopes derived from workspaces |
| `d869bc2` | app port and image versions made overridable |
| `c8024de` | single source for cross-package paths, versions, coverage threshold |
| `fb3a47c` | per-package work offloaded to Turbo; verbose root scripts collapsed |
| `8b630bb` | Pages targets discovered from `package.json` instead of hardcoded |

## Package-level divergence from defaults

- `packages/external` is the only package with an `exports` map; `publint`/`attw` run against it
- `packages/native` has no `package.json` — it is a Cargo workspace root, and its npm package is one level deeper (`npm/native`)
- `packages/native/npm/native` builds with `mnative napi:build --only native`, not `mbunup`
- `apps/example` is not bundled (runs from source) and is the only package with E2E specs
- `configs/skills` ships `SKILL.md` sources that are installed into `.agents/skills/`
<!-- TEMPLATE-ONLY:START(template) -->
- The scaffolder config is template-only and removes itself during `bun create`
<!-- TEMPLATE-ONLY:END(template) -->
