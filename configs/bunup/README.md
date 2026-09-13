# @myorg/bunup

> Bundling presets for library packages.

## What it provides

- `bunup` as a shared devDependency
- `baseConfig` + `defineConfig` helpers
- `mbunup` — CLI alias that bakes in config resolution; `mbunup health` builds, then runs publint + arethetypeswrong over every non-private package

> [!IMPORTANT]
> Library packages are bundled with Bunup. Apps are not bundled — Bun runs TypeScript directly.

### Presets

| Preset | Description |
| :--- | :--- |
| `baseConfig` | ESM + d.ts, externalize deps, inlined internal |
| `defineConfig` | Helper to merge with base |

## Usage

```bash
bun run build      # mturbo build → per-package mbunup
bun run dev        # watch mode via Turbo
mbunup health      # publint + arethetypeswrong over publishable packages
```

```typescript
// bunup.config.ts
import { baseConfig, defineConfig } from "@myorg/bunup";

export default defineConfig({
  ...baseConfig,
  entry: ["src/index.ts", "src/http.ts"],
});
```

```mermaid
graph LR
    A[src/index.ts] --> B[mbunup]
    B --> C[dist/index.js + .d.ts]
    A -.-> D[@myorg/internal<br/>inlined]
    D --> C

    style B fill:#0969DA,color:#fff
```

<details>
<summary>Internal inlining</summary>

- `external` declares `internal` as devDependency
- Bunup inlines it — consumers see one bundle
- `internal` must never depend on `external` (circular)

</details>

See [AGENT.md](./AGENT.md) for the agent-facing reference.
