# @myorg/skills

> AI agent skill management (opt-in).

## What it provides

- `skills` as a shared devDependency.
- `skills/` — modular skill markdown files, the source of truth.
- `mskills` — syncs skills into `.agents/skills/` (gitignored) or lists them.

## Usage

```bash
bun run skills:list   # mskills list
bun run skills:sync   # mskills sync
```

## Opt-in

This config is **opt-in**: unless selected during scaffolding, the
`skills:sync` / `skills:list` root scripts are removed and `configs/skills/`
(+ `.agents/`) is pruned from the generated project.

See [AGENT.md](./AGENT.md) for the agent-facing reference.