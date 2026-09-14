# CONTEXT.md — @myorg/badges

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- This config ships **no bin and no generated files** — it is documentation plus the scaffold metadata that keeps it always-on. (`package.json` declares a `mbadges` bin, but the badge rows themselves are hand-maintained Markdown.)
- Badge rows currently live in five READMEs: root (two sections — template and monorepo), `packages/external`, `packages/internal`, `packages/native/npm/native`, and `apps/example`.
- Owner/repo in badge URLs is rewritten at scaffold time by identity resolution (`SCAFFOLD_OWNER` → `GITHUB_REPOSITORY` → git identity); before that change it was a manual find-and-replace.
- The native badge moved with the package: `packages/native/README.md` → `packages/native/npm/native/README.md`.

## Open

- Codecov coverage badge shows nothing until the repo is connected to Codecov and, for private repos, a `CODECOV_TOKEN` exists.
- The root README trims the old eight-badge row to five; the template intro and the monorepo section still carry slightly different sets on purpose (the intro adds Docs).

## Recent changes

| Commit | What |
| :--- | :--- |
| `408339f` | repository identity rewritten on scaffold — badge URLs now follow it |
| `05e8dc6` | root docs split into README/AGENTS/CONTEXT; badge row trimmed to five |
