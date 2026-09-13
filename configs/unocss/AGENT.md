## UnoCSS

> Opt-in atomic CSS — disabled by default, enabled via scaffold prompt. Data-driven via `package.json` `scaffold` metadata + `setup.ts`.

- `configs/unocss` (`@myorg/unocss`) provides `unocss`, `uno.config.ts` with `presetWind3`, transformers
- Template has `apps/example/public/index.html` (plain) + `index-unocss.html` (UnoCSS utilities, CDN runtime)
- When `false` (default), deletes `index-unocss.html`, `uno.config.ts`, `uno.css`, `index-plain.html` via `extraRemovals` + `filePatternsToRemove` (`**/index-unocss.html`, `**/uno.css`, `uno.config.*`) + `fileRegexesToRemove` (`unocss`, `index-unocss`) + `appDepsToRemove` (`@myorg/unocss`)
- When `true`, keeps + runs `setup: configs/unocss/src/setup.ts`:
  1. Ensures `uno.config.ts` exists (extends baseConfig)
  2. Moves `index-unocss.html` → `index.html` (replaces plain with UnoCSS version per spec: opt-out delete, opt-in replace)
  3. Adds `@myorg/unocss` to example app
  4. Ensures `/uno.css` route in example server
- Example bundle handling:
  - `apps/example/src/index.ts` has `/uno.css` route inside `// TEMPLATE-ONLY:START(unocss)` — stripped when disabled
  - `src/pages/index.ts` tries unocss html first, then plain — handles both
  - `src/pages/api/index.ts` lists `/uno.css` when enabled
  - `public/uno.css` served via `/uno.css` route, generated via `bunx unocss --out-file public/uno.css` or `bun run build:css`
  - `public/index-unocss.html` uses CDN `@unocss/reset` + runtime as fallback, utility classes like `flex`, `bg-zinc-950`, etc.

| Option | Result |
| :--- | :--- |
| `false` | No unocss files, plain index.html |
| `true` | index-unocss.html → index.html, uno.css route, deps |

```mermaid
graph TD
    A[bun create] --> B{unocss?}
    B -->|no| C[prune index-unocss.html<br/>+ uno.config]
    B -->|yes| D[setup.ts<br/>mv unocss → index.html]
    D --> E[/uno.css route<br/>+ bundle]
    style B fill:#0969DA,color:#fff
```

> [!IMPORTANT]
> Pin versions, use `features` for devcontainer, but for unocss use `setup.ts` replacement pattern. `TEMPLATE-ONLY` markers in example src ensure stripping when disabled.
