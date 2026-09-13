# @myorg/external

> The public API surface of this monorepo — the only package published to npm.

## What it is

- Built with Bunup: `bun run build` produces `dist/` (ESM + `.d.ts`).
- Re-exports the public API explicitly (never `export *`).
- Inlines `@myorg/internal` at build time — consumers never depend on
  `@myorg/internal-*` packages.

### API

| Module | Exports |
| ------ | ------- |
| `.` | `greetUser`, types (`src/user.ts`) |

## Development

```bash
bun run dev          # bunup --watch
bun run build        # bunup
bun run typecheck    # tsc --noEmit
bun run test         # bun test
```

## Guide: Adding a New Package

Split new logic into a separate internal package when it is reused across
modules, then inline it into this package with Bunup.

### Internal Package (Private, Inlined)

1. Create the directory:

   ```bash
   mkdir -p packages/internal-<name>/src packages/internal-<name>/tests
   ```

2. Create `packages/internal-<name>/package.json` — mirror the dependency
   pattern of `@myorg/internal` (`@myorg/ts` for the tsconfig, `@myorg/bunup`
   for the config; `"build": "bunup"`, `"dev": "bunup --watch"`,
   `"typecheck": "tsc --noEmit"`, `"test": "bun test"`).

3. Create `packages/internal-<name>/tsconfig.json` extending
   `@myorg/ts/library.json` with `rootDir: "."`, `outDir: "./dist"`,
   `"types": ["bun"]`, and the `@src/*` / `@tests/*` path aliases.

4. Create `packages/internal-<name>/bunup.config.ts`:

   ```ts
   import { baseConfig, defineConfig } from "@myorg/bunup";

   export default defineConfig({
     ...baseConfig,
     entry: ["src/index.ts"],
   });
   ```

5. Write the implementation in `src/index.ts` and tests in `tests/`.

6. Link it to the external package:

   ```bash
   bun add -d @myorg/internal-<name> --filter @myorg/external
   ```

7. Add it to `.changeset/config.json` under `"ignore"`.

8. Run `bun install && bun run build` to verify.

### App Package

Use apps for servers, CLIs, and frontends — they are not bundled:

1. `mkdir -p apps/<name>/src apps/<name>/tests`.
2. Declare `"dev": "bun --hot src/index.ts"`, `"typecheck": "tsc --noEmit"`.
3. Extend `@myorg/ts/app.json` (`noEmit`, `"types": ["bun"]`).
4. `bun install` to link the workspace.

> Apps are not bundled. Bun runs TypeScript directly. Do not use Bunup.

## Guide: Adding a New Subpath Export

Subpath exports let consumers import specific modules:

```ts
import { greetUser } from "@myorg/external";
import { fetchJson } from "@myorg/external/http";
```

1. Create or identify the internal package providing the functionality (see
   above).
2. Create the re-export file in this package (`src/<subpath>.ts`) with
   explicit named exports — never `export *`:

   ```ts
   export { myFunction, type MyType } from "@myorg/internal-<name>";
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

5. Add a changeset (`bun run changeset`, type **minor**) and verify:

   ```bash
   bun run build
   bun run typecheck
   ```

Each subpath produces a separate file in `dist/`, fully tree-shakeable.