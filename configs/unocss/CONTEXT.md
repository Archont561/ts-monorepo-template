# CONTEXT.md — @myorg/unocss

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in (`confirm`, default `false`), but present in this repo, so `apps/example/public/` holds `index.html`, `index-unocss.html` and the generated `uno.css`.
- `munocss` supports `build`, `watch` and `info`.
- Presets: `presetWind3`, `transformerDirectives`, `transformerVariantGroup`.
- Removal on opt-out is data-driven — no TEMPLATE-ONLY markers for UnoCSS; files, globs, regexes and the example's dependency list are declared in scaffold metadata.

## Decisions as outcomes

- **Per-package CSS build** — a global script would run for repos that never opted in, so every CSS step lives in the app that owns the stylesheet.
- **No root `uno.config.ts`** — the config lives with the package and `munocss` supplies the path.

## Recent changes

| Commit | What |
| :--- | :--- |
| `fb3a47c` | CSS build moved into the owning app's scripts; no root `build:css` |
