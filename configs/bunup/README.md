# @myorg/bunup

> Shared [Bunup](https://bun.sh) bundling configuration for library and CLI packages.

## What it provides

Re-exports Bunup's complete public API — `defineConfig`, `defineWorkspace`,
`build`, and the full set of types (`BuildOptions`, `BuildResult`,
`BunupPlugin`, `DefineConfigItem`, …) — so packages import from `@myorg/bunup`
instead of `bunup` directly.

### Presets

| Preset | Extends | DTS | Purpose |
| ------ | ------- | --- | ------- |
| `baseConfig` | — | ✅ | Defaults: ESM, clean builds, Node target, no minification |
| `libraryConfig` | `baseConfig` | ✅ | Published packages (adds source maps) |
| `inlinedConfig` | `baseConfig` | ❌ | Internal packages inlined by Bunup |
| `cliConfig` | `baseConfig` | — | Executables: minified, Bun target, deps bundled inline |

## Usage

```ts
// packages/external/bunup.config.ts
import { defineConfig, libraryConfig } from "@myorg/bunup";

export default defineConfig({
  ...libraryConfig,
  entry: ["src/index.ts"],
});
```

```json
{
  "scripts": {
    "build": "bunup",
    "dev": "bunup --watch",
    "typecheck": "tsc --noEmit"
  }
}
```

## Rules

- Never depend on `bunup` from an individual package — it is owned here and
  hoisted from `configs/bunup`.
- Do not edit anything inside `dist/` (generated, never committed).

See [AGENT.md](./AGENT.md) for the agent-facing reference.