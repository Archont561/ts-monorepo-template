# AGENTS.md — @myorg/turbo

> Task orchestration. `turbo.base.json` in this config is the task graph; there is no root `turbo.json`.
> Orientation in [README.md](./README.md), current state in [CONTEXT.md](./CONTEXT.md).

## Rules

- Never create a root `turbo.json`. Edit `configs/turbo/turbo.base.json`, which `mturbo` passes as `--root-turbo-json`.
- Add a new monorepo-wide task to the task graph, then let packages implement it — do not add a root script that loops over packages.
- A task that produces files must declare `outputs`, or Turbo will not restore them from cache.
- `dev` is persistent and must never be cached; a watcher in the cache key is a broken watcher.
- Cached tasks must be deterministic. A task reading the network or the clock belongs outside the graph, or with caching disabled.
- Monorepo-wide concerns that are not per-package (git hooks, coverage merging) stay at the root or as `mturbo coverage && mcoverage merge` — do not fake a package for them.
- Do not run `turbo` directly; use `mturbo` so the root config path is applied.

## Before marking a task done

- [ ] New task declared in `turbo.base.json` with `dependsOn` and `outputs`
- [ ] Persistent tasks not cached
- [ ] `bun run build` and `bun run test` both green through Turbo
