# CONTEXT.md — @myorg/external

> Snapshot of this package's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Version `0.1.0`, public, published to npm. The only package in the repo that is not private.
- One export today: `.` → `dist/index.js` / `dist/index.d.ts`. The `./http` subpath in the README is illustrative, not present in the manifest.
- Sources: `src/index.ts` (re-exports), `src/user.ts`, `src/native.ts` (native wrapper with JS fallback).
- Dev dependencies: `@myorg/ts`, `@myorg/bunup`, `@myorg/internal`.
- Versioned by Changesets — it is one of only two packages not in `.changeset/config.json`'s ignore list.

## Decisions as outcomes

- **Single published package** — consumers install one package and one version; internals are inlined so there is no second publish to keep in step.
- **Explicit re-exports** — the public API is a deliberate list, not whatever the internals happen to export.

## Open

- `src/native.ts` is present even when the native config is pruned; the fallback branch is what runs then.

## Recent changes

| Commit | What |
| :--- | :--- |
| `71616ab` | native wrapper documented alongside the workspace layout |
| `fb3a47c` | package build/test/typecheck moved behind Turbo |
