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
itself and a `docs/` site that the scaffolder removes.
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

- Branch `arena/01a09c8b-ts-monorepo-template`, 32 commits, no PR (work is committed and pushed directly to the branch).
- Documentation is being restructured to the three-document system: `README.md` (orientation), `AGENTS.md` (rules), `CONTEXT.md` (this snapshot). Every directory ends up with exactly those three; `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md` were folded into `README.md` and deleted, `configs/*/AGENTS.md` was renamed to `AGENTS.md` for one consistent name, and `PLAN.md` retired.

### Verified working (local, this sandbox)

- `bun run check` / `typecheck` / `test` / `build` / `coverage` all exit 0
- `bun run docs:sync` regenerates six workflows; all parse as YAML
- Template suite: 84 tests over every opt-in combination, 0 fail
- `mnative list`, `mnative matrix --gha`, `mnative add <name>` (crate + npm package + sorted `members`)
- `bun install` links `node_modules/@myorg/native` → `packages/native/npm/native`

### Known gaps

- Rust toolchain absent in this sandbox — cargo/napi builds no-op, so native bindings have never been compiled here.
- Playwright browsers absent — `bun run test:e2e` skips by design.
- `native.yml` (the build matrix) has never run on real GitHub Actions: container targets, WASI SDK download and the artifact fan-in are unverified.
- Publish ordering for the per-platform native npm packages is still unwired — `native.yml` uploads them as `native-npm-packages` but nothing consumes that artifact yet.

### Baseline — do not regress

| Metric | Value |
| :--- | :--- |
| Tests | 130 pass / 0 fail (14 turbo tasks) |
| Typecheck | 14/14 |
| Build | 19/19 |
| Coverage | 96.7% lines (145/150) — gate 80% |
| Biome | 0 errors; 19 warnings + 14 infos over 138 files |
| Workflows | 6 generated, all parse |
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
