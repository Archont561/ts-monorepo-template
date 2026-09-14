# CONTEXT.md — configs/

> Snapshot of this area's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- 27 config packages: 17 always-on, 9 opt-in, 1 template-only (`template`).
- Opt-in today: `codeql` (default `true`), `playwright` (default `true`), `pages`, `devcontainer`, `skills`, `stale`, `trivy`, `unocss` (all default `false`), and `native` (a `select`, default `none`).
- Every config except `commitlint`, `community`, `dependabot`, `devcontainer`, `editorconfig`, `gitattributes` and `stale` exposes an `m`-bin.
- CI fragments are contributed by: `biome`, `bun-config`, `bunup`, `codeql`, `coverage`, `gh-actions`, `gitleaks`, `native`, `playwright`, `trivy`, `turbo`.
- `mcitty` is the shared CLI toolkit — 19 configs import it, and the staged migration to it is finished (the `cli.citty.ts` proof-of-concept files are gone).

## Decisions as outcomes

- **Configs as workspaces** — each is a real package with a real bin, so `bun install` puts every `m`-command on PATH with no root devDependencies at all.
- **Pruning is metadata-driven** — the scaffolder reads `scaffold` fields rather than branching per config, so a config can add files, scripts, tasks and dependencies and still be removable.
- **Steps, not workflows** — configs contribute fragments; the workflow is regenerated from whatever survived.

## Open

- `native.yml` has never run on GitHub Actions; the matrix, container mapping and WASI path are unverified.
- `mskills add`/`update` call the skills.sh CLI through `npx` — the one place in the monorepo that is not Bun-only.
- `regenerateCI()` in the scaffolder duplicates `aggregate.ts`.

## Recent changes

| Commit | What |
| :--- | :--- |
| `05e8dc6` | root docs split; every config directory carries README + AGENTS + CONTEXT |
| `fb3a47c` | per-package work offloaded to Turbo; verbose root scripts collapsed |
| `408339f` | repo identity rewritten on scaffold; commitlint scopes derived from workspaces |
