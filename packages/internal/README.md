# @myorg/internal

[![CI](https://github.com/Archont561/ts-monorepo-template/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Archont561/ts-monorepo-template/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/Archont561/ts-monorepo-template?logo=codecov&label=Coverage)](https://codecov.io/gh/Archont561/ts-monorepo-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)
[![Bun](https://img.shields.io/badge/Bun-1.4.2-black?logo=bun)](https://bun.sh)

> Private shared implementation — inlined into `@myorg/external` by Bunup.

> [!TIP]
> Badges: update `Archont561/ts-monorepo-template` → `YOUR_ORG/YOUR_REPO` after scaffolding. Coverage comes from root `bun run coverage` → `coverage/lcov.info` → Codecov + HTML.

## What it is

- **Private** — never published, never imported by an app directly
- Holds the implementation that `@myorg/external` re-exports
- Consumed as a devDependency of `@myorg/external` and **inlined at build time**, so consumers of the published package see one bundle
- **Never depends on `@myorg/external`** — that would be circular

> [!CAUTION]
> Never import `@myorg/internal` from an app. Only via `@myorg/external`.

## Architecture

```mermaid
graph TD
    A[@myorg/internal<br/>src/*.ts] --> B[Bunup inlines]
    B --> C[@myorg/external<br/>dist/]
    C --> D[npm]
    E[apps/example] -->|imports| C
    E -.->|never| A

    style A fill:#f6f8fa,stroke:#0969DA
    style C fill:#0969DA,color:#fff
```

| Rule | Allowed | Why |
| :--- | :---: | :--- |
| `external → internal` | ✅ | Inlined by Bunup |
| `internal → external` | ❌ | Circular |
| `apps → external` | ✅ | Public API only |
| `apps → internal` | ❌ | Private implementation |

## Development

```bash
bun run dev          # mbunup --watch
bun run build        # mbunup
bun run typecheck    # mtsc --noEmit
bun run test         # mbun test
```

### Adding functionality

1. Add the module in `src/` (for example `src/utils.ts`).
2. Export it from `src/index.ts` with an explicit named export.
3. Re-export it from `@myorg/external` if it is public:

   ```ts
   // packages/external/src/index.ts
   export { myUtil } from "@myorg/internal";
   ```

4. Add tests in `tests/`.
5. Run `bun run build && bun run test`.
