# CONTEXT.md — @myorg/skills

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in (`confirm`, default `false`); enabled in this repo.
- Eight curated skills: `biome`, `bun`, `changeset`, `commit`, `playwright`, `review`, `test`, `turbo`. The vendored tree mirrors them exactly — nothing from skills.sh is installed.
- `mskills` exposes six subcommands: `sync`, `list`, `add`, `update`, `validate`, `index`. Root script: `bun run skills` → `mskills`.
- `sync` also rewrites the `@myorg` scope placeholder, reading `SKILLS_SCOPE` / `SCOPE` (default `@myorg`).

## Decisions as outcomes

- **Committed vendored tree** — CI and every developer load identical skill text, rather than re-resolving skills.sh at runtime.
- **One `skills` command** — six near-identical root scripts collapsed into a single CLI entry point.

## Open

- `mskills add` and `mskills update` invoke the skills.sh CLI through `npx`, which is the one place in this monorepo that is not Bun-only. Everything else (`sync`, `list`, `validate`, `index`) is pure Bun.
- `.agents/skills/*/SKILL.md` and `configs/skills/skills/*/SKILL.md` are functional content consumed by tooling, so they are exempt from the three-document rule — a directory's docs are README/AGENTS/CONTEXT plus whatever a tool requires.

## Recent changes

| Commit | What |
| :--- | :--- |
| `fb3a47c` | six skills scripts collapsed into one `skills` command |
| `05e8dc6` | root docs split; skill files kept as-is because tooling reads them |
