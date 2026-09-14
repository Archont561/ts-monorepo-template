# @myorg/unocss

Atomic CSS with UnoCSS — opt-in, and built **by the app that owns the CSS**, never by a global script.

## What it provides

- `unocss` and `@unocss/cli` as shared workspace dependencies
- `uno.config.ts` inside `configs/unocss/` — no root-level config file
- `munocss` — a CLI that owns the config path, so scripts say `munocss build` instead of a long `--config ../../…` invocation
- `apps/example/public/index-unocss.html` — the utility-class variant of the example page

### Presets

| Preset | What it gives you |
| :--- | :--- |
| `presetWind3` | Tailwind-compatible utilities (v3) |
| `transformerDirectives` | `@apply` and friends |
| `transformerVariantGroup` | `hover:(bg-blue text-white)` |

## Usage

```bash
munocss build      # generate the CSS bundle
munocss watch      # watch mode
munocss info       # is it enabled, which config, which output file
```

The app that owns the CSS calls it from its own scripts — there is no root `build:css`:

```json
{
  "scripts": {
    "build": "munocss build",
    "build:css": "munocss build",
    "build:css:watch": "munocss watch"
  }
}
```

```html
<div class="flex items-center p-4 bg-blue-500 text-white rounded">Hello UnoCSS</div>
```

### How the example handles it

| File | Behaviour |
| :--- | :--- |
| `apps/example/public/index.html` | Plain page — kept when UnoCSS is off |
| `apps/example/public/index-unocss.html` | Utility-class page — moved over `index.html` when enabled |
| `apps/example/public/uno.css` | Generated bundle, served at `/uno.css` |

The example's `/uno.css` route returns the generated CSS or a fallback note, and page handlers try the UnoCSS HTML first and fall back to the plain one — both runtime file checks, so the app works either way.

> [!NOTE]
> Opt-in, off by default. When it is declined, `index-unocss.html`, `uno.config.ts` and `uno.css` are pruned by glob, regex and dependency list.
