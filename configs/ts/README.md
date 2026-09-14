# @myorg/ts

The TypeScript setup, in one place: the compiler, Bun's types, and the two presets every package extends.

## What it provides

- `typescript` and `@types/bun` as shared workspace dependencies
- `base.json` — shared compiler options plus the `typeRoots` that make `types: ["bun"]` resolve from every package
- `library.json` — preset for `packages/*`
- `app.json` — preset for `apps/*`
- `mtsc` — `tsc` with shared config resolution

> [!CAUTION]
> Never add `typescript`, `bunup` or `@types/bun` to an individual package's devDependencies. They are owned here and hoisted.

### Presets

| Preset | Extends | For | Notable options |
| :--- | :--- | :--- | :--- |
| `library.json` | `base.json` | `packages/*` | `rootDir: .`, `outDir: dist`, `types: [bun]` |
| `app.json` | `library.json` | `apps/*` | `noEmit`, `types: [bun]` |

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
bun run typecheck   # mturbo typecheck → mtsc --noEmit per package
mtsc --noEmit       # one package
```

<details>
<summary>Path aliases</summary>

- `@src/*` → `./src/*`
- `@tests/*` → `./tests/*`
- No `baseUrl` — it was removed in TS 7.0 (TS5102); use `paths` only.

</details>
