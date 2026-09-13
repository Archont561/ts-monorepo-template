# @myorg/ts

> Shared TypeScript presets.

## What it provides

- `typescript` + `@types/bun` as shared devDependencies (hoisted)
- `library.json` — base for library packages (`external`, `internal`)
- `app.json` — base for apps (`example`)
- `mtsc` — CLI alias for `tsc` with shared config resolution

> [!CAUTION]
> Never add `typescript`, `bunup`, or `@types/bun` to individual package devDependencies. They are owned here and hoisted.

### Presets

| Preset | Extends | Use |
| :--- | :--- | :--- |
| `library.json` | — | `packages/*` — `rootDir:.`, `outDir:dist`, `types:[bun]` |
| `app.json` | `library.json` | `apps/*` — `noEmit`, `types:[bun]` |

## Usage

```jsonc
// packages/external/tsconfig.json
{
  "extends": "@myorg/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"],
    "paths": {
      "@src/*": ["./src/*"],
      "@tests/*": ["./tests/*"]
    }
  }
}
```

```bash
bun run typecheck   # mturbo typecheck → per-package mtsc
mtsc --noEmit       # Direct
```

```mermaid
graph TD
    A[@myorg/ts<br/>library.json + app.json] --> B[packages/external<br/>extends library]
    A --> C[packages/internal<br/>extends library]
    A --> D[apps/example<br/>extends app]
    B --> E[mtsc --noEmit]
    C --> E
    D --> E

    style A fill:#0969DA,color:#fff
```

<details>
<summary>Path aliases</summary>

- `@src/*` → `./src/*`
- `@tests/*` → `./tests/*`
- No `baseUrl` — removed in TS 7.0 (TS5102), use `paths` only

</details>

## Rules

- [ ] No `baseUrl` in any `tsconfig.json`
- [ ] `rootDir: "."`, `outDir: "./dist"` for libraries
- [ ] `noEmit` for apps
- [ ] `types: ["bun"]` everywhere

See [AGENT.md](./AGENT.md) for the agent-facing reference.
