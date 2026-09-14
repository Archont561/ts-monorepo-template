# CONTEXT.md — @myorg/template

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Template-only, `selfDestruct: true`; a first-class Bun workspace (`@myorg/template`) with `@clack/prompts` as its only real dependency.
- `mdocs` is the single bin: `docs:sync` (workflow aggregation) and `site` (docs artifact for the Pages site).
- Discovery finds 27 configs: 17 always-on, 9 opt-in, 1 template-only (this one).
- `docs:sync` currently regenerates `ci.yml`, `release.yml`, `native.yml`, `stale.yml`, `dependabot-auto-merge.yml` and `.github/dependabot.yml`, and skips `pages.yml`/`coverage.yml` while `docs/` exists.
- Root `README.md`, `AGENTS.md`, `CONTEXT.md` and `LICENSE.md` are static; `replaceScopePlaceholders` rewrites owner and scope in them at scaffold time.
- `regenerateCI()` duplicates logic from `aggregate.ts` — known duplication, not yet reconciled.

## Decisions as outcomes

- **Data-driven pruning** — a config that is declined removes itself, its scripts, its turbo tasks and its app dependency from metadata, so the scaffolder has no per-config branches.
- **Committed bundle** — `bun create` runs before `bun install`, so the scaffolder cannot depend on an install step.
- **Placeholders over literals** — paths and versions with a TypeScript source of truth are interpolated, keeping YAML honest.

## Open

- `regenerateCI()` in `scaffolder.ts` duplicates `aggregate.ts`; the two can drift.
- `mdocs site` builds the docs artifact but has never been run against a real Pages deployment.

## Recent changes

| Commit | What |
| :--- | :--- |
| `05e8dc6` | root docs split; static reference files with `TEMPLATE-ONLY` blocks |
| `a8ea08c` | `native.steps.yml` registered as an aggregated fragment |
| `c8024de` | paths and versions centralised and exposed as `{{…}}` placeholders |
