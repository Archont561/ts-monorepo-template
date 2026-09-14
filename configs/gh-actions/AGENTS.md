# AGENTS.md — @myorg/gh-actions

## Rules

> [!CAUTION]
> Never edit `.github/workflows/*.yml` or `.github/dependabot.yml` by hand. Edit the skeleton or the fragment and run `bun run docs:sync`.

- A new workflow means a `*.base.yml` skeleton in the config that owns it **and** a `*.steps.yml` fragment; the fragment filename must be added to the aggregator's allow-list or it will not be collected.
- Step fragments are spliced under a job's `steps:` key, so every line must be indented — a fragment line at column 0 silently produces an unparseable workflow.
- Keep fragments to one-liners that call an `m`-bin. Logic belongs in the config's CLI, not in YAML shell blocks.
- Use `{{PLACEHOLDER}}` for any path or version that has a source of truth in TypeScript; add the value to `WORKFLOW_VARS` in the template config.
- Two workflows must never deploy to the same Pages site — `docs:sync` enforces that by skipping `pages.yml` and `coverage.yml` while the template's docs app (`apps/template-docs`) exists.

## Before marking a task done

- [ ] `bun run docs:sync` run and the generated files committed
- [ ] `bun run ci:lint` clean (actionlint over every workflow)
- [ ] New fragment filenames registered in the aggregator
