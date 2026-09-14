# @myorg/bunup

Bundling presets for library packages, plus the package-health check CI runs before publish.

## What it provides

- `bunup` as a shared workspace dependency
- `baseConfig` and `defineConfig` — ESM + `.d.ts` output, dependencies externalized, `@myorg/internal` inlined
- `mbunup` — the bin that resolves the preset; `mbunup health` builds, then runs `publint` + `arethetypeswrong` over every publishable package

> [!IMPORTANT]
> Library packages are bundled. Apps are **not** — Bun runs their TypeScript directly.

## Usage

```bash
bun run build      # mturbo build → per-package mbunup
bun run dev        # watch mode via Turbo
mbunup health      # build + publint + arethetypeswrong
```

```typescript
// bunup.config.ts
import { baseConfig, defineConfig } from "@myorg/bunup";

export default defineConfig({
  ...baseConfig,
  entry: ["src/index.ts", "src/http.ts"],
});
```

A CLI package uses `...cliConfig` instead of `...baseConfig` when it ships a bin.

## Internal inlining

`packages/external` declares `packages/internal` as a devDependency and Bunup inlines it, so consumers install one bundle. `internal` must never depend on `external` — that would be circular.
