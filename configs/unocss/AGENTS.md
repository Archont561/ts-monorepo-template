# AGENTS.md — @myorg/unocss

> Atomic CSS, opt-in. Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- Never build UnoCSS globally. A root-level `build:css` would run for monorepos that never opted in; the app that owns the CSS builds it in its own `build` script.
- Keep `uno.config.ts` inside `configs/unocss/`. No root-level UnoCSS config file.
- Use `munocss` in scripts, never `bunx unocss --config …` or a hand-written `--config` path.
- Anything that touches UnoCSS output must check at runtime whether the file exists — the app has to work with the config pruned.
- New opt-in CSS files follow the same pattern as `index-unocss.html`: deletion on opt-out, replacement on opt-in, declared in the scaffold metadata (`extraRemovals`, `filePatternsToRemove`, `fileRegexesToRemove`, `appDepsToRemove`).
- Do not add a Pages or CI step that builds CSS; `mpages build` delegates to each package's own build.

## Before marking a task done

- [ ] CSS built by the owning app, not by a root script
- [ ] Scripts call `munocss`, not `unocss --config`
- [ ] Any new UnoCSS output file added to the removal patterns
- [ ] The app still serves correctly with UnoCSS pruned
