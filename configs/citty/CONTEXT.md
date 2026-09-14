# CONTEXT.md — @myorg/citty

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- 19 configs import `citty` today: badges, biome, bun-config, bunup, changeset, citty, codeql, coverage, gh-actions, gitleaks, lefthook, native, pages, playwright, skills, template, trivy, ts, turbo, unocss.
- The staged migration described in older docs is **finished**: the `cli.citty.ts` proof-of-concept files (`skills`, `gh-actions`, `bun-config`) are gone because their production CLIs are citty-based now.
- Helpers `defineWrapperCommand` and `defineSpawnSubcommand` live in `configs/citty/src/index.ts`.
- `mcitty` is an info bin — it prints usage guidance, it does not wrap a tool.

## Decisions as outcomes

- **Citty over a home-grown arg parser** — zero dependencies, typed args, and auto-help mean every `m`-bin behaves the same way.
- **Args are case-agnostic** (`--user-name` === `--userName`) via `scule`, so scripts and agents need not guess the spelling.

## Recent changes

| Commit | What |
| :--- | :--- |
| `fb3a47c` | root scripts collapsed to one-liners; bins kept their citty interfaces |
