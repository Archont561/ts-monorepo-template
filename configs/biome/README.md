# @myorg/biome

> Lint and format, shared across the monorepo.

## What it provides

- `@biomejs/biome` as a shared devDependency.
- `biome.json` — a single shared config (no root-level `biome.json`).
- `mbiome` — a CLI alias that resolves Biome and bakes in
  `--config-path=<configs/biome>` automatically.

### Config highlights

- Lint: `recommended` preset, unused imports as errors, unused variables warn.
- Format: 2-space indent, 100 columns, double quotes, semicolons, trailing commas.
- Assist: `organizeImports` on.
- Ignores: `node_modules`, `dist`, `.turbo`, `coverage`, `test-results`, `playwright-report`.

## Usage

```bash
bun run check        # lint + format check, no writes
bun run check:fix    # auto-fix
```

The pre-commit hook runs `mbiome check --write {staged_files}` automatically.

See [AGENT.md](./AGENT.md) for the agent-facing reference.