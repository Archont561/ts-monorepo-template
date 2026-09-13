# @myorg/external

> The public API surface of this monorepo — the only package published to npm.

## What it is

- Built with Bunup: `bun run build` produces `dist/` (ESM + `.d.ts`)
- Re-exports the public API explicitly (never `export *`)
- Inlines `@myorg/internal` at build time — consumers never depend on `@myorg/internal-*` packages

> [!IMPORTANT]
> This is the **only published package**. All implementation lives in `internal` and is inlined.

### API

| Module | Exports | Description |
| :--- | :--- | :--- |
| `.` | `greetUser`, types (`src/user.ts`) | Main entry |
| `./http` | `fetchJson` | Example subpath (if added) |

## Development

```bash
bun run dev          # bunup --watch
bun run build        # bunup
bun run typecheck    # tsc --noEmit
bun run test         # bun test
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

## Guide: Adding a New Package

> [!TIP]
> Split new logic into a separate internal package when it is reused across modules, then inline it into this package with Bunup.

### Internal Package (Private, Inlined)

- [ ] Create the directory:

  ```bash
  mkdir -p packages/internal-<name>/src packages/internal-<name>/tests
  ```

- [ ] Create `packages/internal-<name>/package.json` — mirror the dependency pattern of `@myorg/internal` (`@myorg/ts` for the tsconfig, `@myorg/bunup` for the config; `"build": "bunup"`, `"dev": "bunup --watch"`, `"typecheck": "tsc --noEmit"`, `"test": "bun test"`).

- [ ] Create `packages/internal-<name>/tsconfig.json` extending `@myorg/ts/library.json` with `rootDir: "."`, `outDir: "./dist"`, `"types": ["bun"]`, and the `@src/*` / `@tests/*` path aliases.

- [ ] Create `packages/internal-<name>/bunup.config.ts`:

  ```ts
  import { baseConfig, defineConfig } from "@myorg/bunup";

  export default defineConfig({
    ...baseConfig,
    entry: ["src/index.ts"],
  });
  ```

- [ ] Write the implementation in `src/index.ts` and tests in `tests/`.

- [ ] Link it to the external package:

  ```bash
  bun add -d @myorg/internal-<name> --filter @myorg/external
  ```

- [ ] Add it to `.changeset/config.json` under `"ignore"`.

- [ ] Run `bun install && bun run build` to verify.

<details>
<summary>Internal package checklist</summary>

- [ ] `package.json` with correct `build`, `dev`, `typecheck`, `test` scripts
- [ ] `tsconfig.json` extends `@myorg/ts/library.json`
- [ ] `bunup.config.ts` with `baseConfig`
- [ ] Implementation in `src/index.ts`
- [ ] Tests in `tests/`
- [ ] Added to `.changeset/config.json` ignore
- [ ] Linked as devDependency to `external`

</details>

### App Package

Use apps for servers, CLIs, and frontends — they are not bundled:

1. `mkdir -p apps/<name>/src apps/<name>/tests`.
2. Declare `"dev": "bun --hot src/index.ts"`, `"typecheck": "tsc --noEmit"`.
3. Extend `@myorg/ts/app.json` (`noEmit`, `"types": ["bun"]`).
4. `bun install` to link the workspace.

> [!WARNING]
> Apps are not bundled. Bun runs TypeScript directly. Do not use Bunup.

## Guide: Adding a New Subpath Export

Subpath exports let consumers import specific modules:

```ts
import { greetUser } from "@myorg/external";
import { fetchJson } from "@myorg/external/http";
```

- [ ] Create or identify the internal package providing the functionality (see above).
- [ ] Create the re-export file in this package (`src/<subpath>.ts`) with explicit named exports — never `export *`:

  ```ts
  export { myFunction, type MyType } from "@myorg/internal-<name>";
  ```

- [ ] Add the entry to `bunup.config.ts`:

  ```ts
  entry: ["src/index.ts", "src/<subpath>.ts"],
  ```

- [ ] Add the export to `package.json`:

  ```json
  "./<subpath>": {
    "types": "./dist/<subpath>.d.ts",
    "import": "./dist/<subpath>.js"
  }
  ```

- [ ] Add a changeset (`bun run changeset`, type **minor**) and verify:

  ```bash
  bun run build
  bun run typecheck
  ```

> [!NOTE]
> Each subpath produces a separate file in `dist/`, fully tree-shakeable.

<details>
<summary>Subpath checklist</summary>

- [ ] Re-export file with explicit named exports
- [ ] Entry added to `bunup.config.ts`
- [ ] Export added to `package.json` with `types` + `import`
- [ ] Changeset created (minor)
- [ ] Build + typecheck pass

</details>
