# AGENTS.md — @myorg/citty

## Rules

- Every `m`-bin is a citty command defined with `defineCommand` — no hand-rolled `process.argv` parsing.
- Always set `meta.name`, `meta.version` and `meta.description` so `--help` and `--version` work.
- Use `subCommands` for any bin with more than one verb; lazy-load them (`() => import("./cmd")`) when the module is large.
- Use `runCommand(cmd, { rawArgs })` from agent scripts instead of shelling out to another `m`-bin.
- Keep each config's CLI in `configs/<name>/src/cli.ts`; this package provides the dependency and helpers, not other packages' commands.
- Use `setup`/`cleanup` for resources (temp dirs, spawned processes) — `cleanup` always runs.

## Before marking a task done

- [ ] New or changed `m`-bins: `bun <bin> --help` renders and `--version` prints
- [ ] Subcommands appear in the generated help
- [ ] No `process.argv` parsing outside a citty command
