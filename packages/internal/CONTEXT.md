# CONTEXT.md — @myorg/internal

> Snapshot of this package's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Version `0.0.0`, `private: true`, never published.
- Modules: `src/format.ts`, `src/greeting.ts`, `src/index.ts`.
- Dev dependencies: `@myorg/ts`, `@myorg/bunup`. No runtime dependencies.
- Listed in `.changeset/config.json`'s ignore list, so it is never versioned.

## Decisions as outcomes

- **One internal package until reuse demands another** — the guide in `@myorg/external` covers splitting out `packages/internal-<name>` only when logic is shared across modules.
- **Inlined, not published** — the published bundle has no reference to this package at all.

## Recent changes

| Commit | What |
| :--- | :--- |
| `fb3a47c` | package build/test/typecheck moved behind Turbo |
