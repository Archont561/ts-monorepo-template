# AGENTS.md — @myorg/pages

## Rules

- Never hardcode a deploy target. Packages declare `pages` in their own `package.json`; `mpages` discovers them.
- Never add a global CSS or build step to the Pages workflow — each app builds its own assets in its `build` script.
- Only one workflow may deploy to a Pages site. Before adding another deploy step, check whether `pages.yml`, `coverage.yml` or `template-docs.yml` already owns it.
- `mpages base --inject` rewrites absolute `href`/`src` in staged HTML; a non-root repo needs that base path or the site serves broken links.
- Pages is opt-in — when it is disabled, the workflow, skeleton and fragment are pruned together.

## Before marking a task done

- [ ] New deployable package declares `pages` in its manifest
- [ ] `mpages list` shows it
- [ ] `bun run docs:sync` run if workflow fragments changed
- [ ] No second workflow deploys to the same site
