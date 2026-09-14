# CONTEXT.md — @myorg/bunup

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- 16 `bunup.config.ts` files across `packages/*` and `configs/*`; the app has none.
- `mbunup health` finds publishable packages by reading the root `workspaces` field and filtering out `private: true`. It was a hardcoded `packages/*`, `configs/*`, `apps/*` glob until the native package moved to `packages/native/npm/native` and silently dropped out of the check.
- `attw` runs with `--profile esm-only`; the package-health step is `mbunup health` in `configs/bunup/ci.steps.yml`.

## Decisions as outcomes

- **ESM-only output** — no CJS build, so `attw` is pinned to the esm-only profile rather than loosened.
- **Private packages are inlined, not published** — one published artifact, no version-skew between `external` and `internal`.
- **Package discovery comes from the workspace definition** — the root `workspaces` field is the only place the package layout is declared.

## Recent changes

| Commit | What |
| :--- | :--- |
| `a8ea08c` | publishable packages discovered from root `workspaces` instead of hardcoded globs |
| `c8024de` | shared paths and versions centralised |

## Open

- `publint` and `attw` are fetched on demand (`bunx`), so the health step needs network access in CI.
