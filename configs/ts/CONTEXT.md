# CONTEXT.md — @myorg/ts

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Owns `base.json`, `library.json`, `app.json` and the `mtsc` bin; always-on (`default: always`).
- Consumers: `packages/external` and `packages/internal` extend `library.json`, `apps/example` extends `app.json`, and the native npm package has its own `tsconfig.json` checked by `mnative typecheck`.
- Typecheck runs through Turbo: `bun run typecheck` → `mturbo typecheck` → `mtsc --noEmit` per package.

## Decisions as outcomes

- **`typeRoots` in `base.json`** — chosen over switching Bun to the hoisted linker or installing `@types/bun` at the root, because it keeps the isolated linker and still lets `types: ["bun"]` resolve from any package.
- **No `baseUrl`** — it is gone in TS 7.0, so `paths` is the only alias mechanism.
- **Compiler and bundler owned centrally** — a package that adds its own `typescript` or `bunup` gets a second, drifting copy.

## Recent changes

| Commit | What |
| :--- | :--- |
| `c8024de` | paths and versions centralised in `base.json` |
| `fb3a47c` | typecheck offloaded to Turbo |
