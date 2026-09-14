# @myorg/external

[![CI](https://github.com/Archont561/ts-monorepo-template/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/Archont561/ts-monorepo-template/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/Archont561/ts-monorepo-template?logo=codecov&label=Coverage)](https://codecov.io/gh/Archont561/ts-monorepo-template)
[![npm version](https://img.shields.io/npm/v/@myorg/external?logo=npm&color=blue)](https://www.npmjs.com/package/@myorg/external)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE.md)
[![Bun](https://img.shields.io/badge/Bun-1.4.2-black?logo=bun)](https://bun.sh)

> The public API surface of this monorepo — the only package published to npm.

> [!TIP]
> Badges: update `Archont561/ts-monorepo-template` → `YOUR_ORG/YOUR_REPO` and `@myorg` → your scope after scaffolding. Coverage comes from root `bun run coverage` → `coverage/lcov.info` → Codecov + HTML at `/coverage/` on Pages.

## What it is

- Built with Bunup: `bun run build` produces `dist/` (ESM + `.d.ts`)
- Re-exports the public API **explicitly** — never `export *`
- Inlines `@myorg/internal` at build time, so consumers never depend on it

> [!IMPORTANT]
> This is the **only published package**. Every implementation lives in `internal` and is inlined at build time.

### API

| Module | Exports | Description |
| :--- | :--- | :--- |
| `.` | `greetUser`, types (`src/user.ts`) | Main entry |
| `./http` | `fetchJson` | Example subpath |

## Development

```bash
bun run dev          # mbunup --watch
bun run build        # mbunup
bun run typecheck    # mtsc --noEmit
bun run test         # mbun test
```

```mermaid
graph TD
    A[@myorg/internal<br/>private] --> B[@myorg/external<br/>public]
    B --> C[dist/<br/>ESM + d.ts]
    C --> D[npm publish]
    E[apps/example] --> B

    style B fill:#0969DA,color:#fff
    style C fill:#f6f8fa,stroke:#0969DA
```

## Adding a subpath export

Subpath exports let consumers import a specific module:

```ts
import { greetUser } from "@myorg/external";
import { fetchJson } from "@myorg/external/http";
```

1. Create the internal package or module that provides the functionality.
2. Create `src/<subpath>.ts` here with **explicit named exports** — never `export *`:

   ```ts
   export { myFunction, type MyType } from "@myorg/internal";
   ```

3. Add the entry to `bunup.config.ts`:

   ```ts
   entry: ["src/index.ts", "src/<subpath>.ts"],
   ```

4. Add the export to `package.json`:

   ```json
   "./<subpath>": {
     "types": "./dist/<subpath>.d.ts",
     "import": "./dist/<subpath>.js"
   }
   ```

5. Add a changeset (`bun run changeset`, type **minor**), then verify:

   ```bash
   bun run build
   bun run typecheck
   ```

> [!NOTE]
> Each subpath produces a separate file in `dist/`, fully tree-shakeable.

To add a whole new package rather than a subpath, see [Adding a package or app](../../README.md#adding-a-package-or-app) in the root README.
