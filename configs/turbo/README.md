# @myorg/turbo

> Turborepo task orchestration, configured.

## What it provides

- `turbo` as a shared devDependency.
- `turbo.base.json` — the root task graph (there is no root-level `turbo.json`).
- `mturbo` — a CLI alias that resolves Turbo and bakes in
  `--root-turbo-json=<configs/turbo/turbo.base.json>` automatically.

## Usage

```bash
bun run dev          # watch all packages
bun run build        # build in dependency order
bun run typecheck    # type-check all packages
bun run test:e2e     # run e2e tasks
```

All root scripts delegate to `mturbo`, so Turbo infers inter-package
dependency order and caches task output (`.turbo/`).

## Files

- `turbo.base.json` (exported as `@myorg/turbo/turbo.json`)

See [AGENT.md](./AGENT.md) for the agent-facing reference.