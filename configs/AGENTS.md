# AGENTS.md — configs/

> One directory per tool. Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- No tool config lives at the repo root. No root `turbo.json`, `biome.json`, `bunfig.toml`, `commitlint.config.js`, `lefthook.yml` (generated), `playwright.config.ts` or `uno.config.ts`. Configs live in `configs/<name>/` and are referenced by CLI flag.
- One config exposes **exactly one** `m`-prefixed bin, with subcommands where it needs several. Do not add a second bin to a config, and do not add root scripts that duplicate it.
- A config that needs CI contributes a `*.steps.yml` fragment. Fragments are spliced under `steps:`, so every line is indented, and a new fragment filename must be registered in the aggregator or it will be ignored.
- Every config that can be pruned declares `removals` in its `scaffold` metadata — exact paths, globs, regexes, root scripts, turbo tasks and app dependencies. The scaffolder has no per-config branches.
- Config CLIs are defensive: a missing external binary warns and exits 0, because CI is the enforcement point, not a developer's laptop.
- Never add `typescript`, `bunup` or `@types/bun` to a config's devDependencies — `@myorg/ts` owns them.
- Use `mcitty` helpers (`defineWrapperCommand`, `defineSpawnSubcommand`) for new CLIs rather than hand-rolled `process.argv` parsing.
- Every config directory ends with exactly `README.md`, `AGENTS.md` and `CONTEXT.md`. An extra `*.md` is either folded in or removed.
- Three-way split, never duplicated: a **rule** goes in `AGENTS.md`, a **current fact** in `CONTEXT.md`, **orientation** in `README.md`. If a sentence could live in two, it belongs in exactly one — link instead.

## Before marking a task done

- [ ] Config file inside `configs/<name>/`, not at the root
- [ ] `scaffold` metadata complete, including `removals` for the disabled state
- [ ] `bun run docs:sync` run if any fragment or skeleton changed
- [ ] `bun run ci:lint` clean
- [ ] `bun run check`, `bun run typecheck` and `bun run test` green
- [ ] The directory holds only `README.md`, `AGENTS.md` and `CONTEXT.md`
