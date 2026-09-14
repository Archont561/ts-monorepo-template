# CONTEXT.md — @myorg/turbo

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Always-on. Five tasks: `build`, `typecheck`, `test`, `coverage`, `dev`.
- Root scripts are thin: `dev`, `build`, `typecheck`, `test`, `coverage` all delegate to `mturbo`.
- Caches live in `.turbo/` (gitignored). `dev` is persistent and uncached.
- Coverage is two-phase — `mturbo coverage` per package, then `mcoverage merge` at the root.

## Decisions as outcomes

- **Turbo owns ordering and caching** — root scripts stopped naming packages, so adding a package needs no script edits.
- **Packages own the method** — Turbo runs `build`; whether that means `mbunup`, `mnative napi:build` or `munocss build` is the package's business.

## Recent changes

| Commit | What |
| :--- | :--- |
| `fb3a47c` | per-package build/test/dev/coverage offloaded to Turbo; root scripts collapsed |
| `c8024de` | coverage threshold and paths given a single source |
| this change | `mturbo` sets `TURBO_GLOBAL_WARNING_DISABLED` — under bun's isolated linker turbo cannot detect the configs/turbo-local install from the repo root, so its "globally installed" warning was a false positive |
