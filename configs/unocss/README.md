# @myorg/unocss

> Opt-in UnoCSS (atomic CSS) configuration for Bun workspaces.

## What it provides

- `baseConfig` (exported from `@myorg/unocss`) with `presetWind3`,
  `transformerDirectives`, `transformerVariantGroup`, a `brand` color palette,
  and shared `btn-primary` / `card` shortcuts.
- A scaffold prompt that prunes `uno.config.ts` and the `unocss` /
  `@unocss/reset` app dependencies when the feature is declined.

## Usage

```ts
import { baseConfig, defineConfig } from "@myorg/unocss";

export default defineConfig({ ...baseConfig, content: { /* ... */ } });
```

See [AGENT.md](./AGENT.md) for the agent-facing reference.