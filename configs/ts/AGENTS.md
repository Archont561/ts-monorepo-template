## TypeScript

> [!CAUTION]
> Never add `typescript`, `bunup`, or `@types/bun` to individual packages. Owned by `@myorg/ts` and hoisted.

- `@myorg/ts` (`configs/ts`) owns `typescript`, `@types/bun`, `bunup` — no per-package devDeps
- `base.json` sets `typeRoots` to `["./node_modules/@types", "../../node_modules/@types"]` — Bun's isolated linker keeps `@types/bun` in `configs/ts/node_modules/@types` instead of the repo root, so `tsc`'s default upward walk from each package never finds it (TS2688). Paths resolve relative to `base.json`, so both the isolated and hoisted locations are covered; missing dirs are ignored.
- Presets: `library.json` for `packages/*` (`rootDir:.`, `outDir:dist`, `types:[bun]`, `@src/*` + `@tests/*` paths), `app.json` for `apps/*` (`noEmit`, `types:[bun]`)
- `mtsc` bin wraps `tsc`; `bun run typecheck` → `mturbo typecheck` → per-package `mtsc --noEmit`
- No `baseUrl` in any `tsconfig.json` — removed in TS 7.0 (TS5102), use `paths` only
- `tsconfig.json` per package extends `@myorg/ts/library.json` or `app.json` with `rootDir`, `outDir`, `types`, `paths`

| Package | Extends | Build |
| :--- | :--- | :--- |
| `external` | `library.json` | `mbunup` |
| `internal` | `library.json` | `mbunup` |
| `example` | `app.json` | `bun --hot` (no bundle) |

```mermaid
graph LR
    A[ts/library.json] --> B[external]
    A --> C[internal]
    D[ts/app.json] --> E[example]
    B --> F[mtsc]
    C --> F
    E --> F

    style A fill:#0969DA,color:#fff
```

> [!WARNING]
> `baseUrl` was removed in TS 7.0 — use `paths` with `@src/*`.
