# CONTEXT.md — @myorg/commitlint

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- 36 scopes are derived at runtime from the root `package.json` workspaces plus the five cross-cutting ones.
- The config is plain JavaScript (`configs/commitlint/index.js`) because the scope list is computed, not declared.
- Enforced by the Lefthook `commit-msg` hook (`commitlint --edit {1}`); there is no CI-only fallback, so a bypassed hook means an unlinted message.

## Decisions as outcomes

- **Scopes are derived, not maintained** — the enum used to reject valid scopes for newly added packages; deriving them from workspaces removed that class of failure.

## Recent changes

| Commit | What |
| :--- | :--- |
| `408339f` | scopes derived from workspaces instead of a hardcoded enum |
