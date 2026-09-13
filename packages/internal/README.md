# @myorg/internal

[![CI](https://github.com/Archont561/ts-monorepo-template/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Archont561/ts-monorepo-template/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/Archont561/ts-monorepo-template?logo=codecov&label=Coverage)](https://codecov.io/gh/Archont561/ts-monorepo-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)
[![Bun](https://img.shields.io/badge/Bun-1.4.2-black?logo=bun)](https://bun.sh)

> Private shared implementation — inlined into `@myorg/external` by Bunup.

> [!TIP]
> Badges: update `Archont561/ts-monorepo-template` → `YOUR_ORG/YOUR_REPO` after scaffolding. Coverage from root `bun run coverage` (mbun + mcoverage) → `coverage/lcov.info` → Codecov + HTML.

## What it is

- **Private**: never published, never imported by apps directly
- Provides the implementation modules that `@myorg/external` re-exports (`format.ts`, `greeting.ts`, `index.ts`)
- **Never depends on `@myorg/external`** (would be circular)
- Consumed as a devDependency by `@myorg/external` and inlined at build time, so consumers of the published package see only one bundle

> [!CAUTION]
> Never import `@myorg/internal` directly from apps — only via `@myorg/external`.

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

| Rule | Allowed | Description |
| :--- | :---: | :--- |
| `external → internal` | ✅ | Inlined by Bunup |
| `internal → external` | ❌ | Circular |
| `apps → external` | ✅ | Public API only |
| `apps → internal` | ❌ | Private |

## Development

```bash
bun run dev          # bunup --watch
bun run build        # bunup
bun run typecheck    # tsc --noEmit
bun run test         # bun test
```

<details>
<summary>Adding functionality</summary>

1. Add new module in `src/` (e.g., `src/utils.ts`)
2. Export from `src/index.ts` with explicit named export
3. Re-export from `@myorg/external` if public:

   ```ts
   // packages/external/src/index.ts
   export { myUtil } from "@myorg/internal";
   ```

4. Add tests in `tests/`
5. Run `bun run build && bun run test`

</details>

See the [Adding a New Package guide](../external/README.md) for how internal packages are structured.
