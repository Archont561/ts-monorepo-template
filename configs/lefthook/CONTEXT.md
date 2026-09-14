# CONTEXT.md — @myorg/lefthook

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Two hooks: `pre-commit` (`mbiome check --write {staged_files}`) and `commit-msg` (`commitlint --edit {1}`).
- `msetup` does four jobs: link `m`-bins, regenerate the root `lefthook.yml`, run `lefthook install`, and ensure `.changeset/config.json`.
- The root `prepare` script runs `msetup lefthook && mchangeset init` on every `bun install`, so hooks and bins are never stale for long.

## Decisions as outcomes

- **Generated wrapper, committed source** — the root file exists so `lefthook` finds it, but only `configs/lefthook/lefthook.yml` is edited.
- **Hooks format, they do not verify** — the expensive gates (tests, typecheck, coverage) belong to CI, so the hook stays fast enough not to be bypassed.

## Open

- Hooks cannot run in this sandbox: `actionlint` and the rest of the pre-commit chain need network access, so commits here are made with `--no-verify`.

## Recent changes

| Commit | What |
| :--- | :--- |
| `fb3a47c` | monorepo-wide concerns (hooks, bin linking) kept at the root |
