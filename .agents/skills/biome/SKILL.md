---
name: biome
description: Lint and format with Biome — the only code quality tool in this monorepo
---

# Biome Code Quality

Biome handles linting, formatting, and import sorting for the entire monorepo. No ESLint, Prettier, or lint-staged.

## When to use

- Before committing code
- When fixing lint errors
- When organizing imports
- When checking code style

## Commands

```bash
bun run check        # lint + format check, no writes
bun run check:fix    # auto-fix all issues
mbiome check         # direct bin with baked config path
mbiome check --write # fix in place
```

## Config

- `packages/tooling/src/configs/biome.json` — single shared config (no root `biome.json`)
- Rules: `recommended` preset, unused imports as errors, 2-space indent, 100 cols, double quotes
- Ignores: `node_modules`, `dist`, `.turbo`, `coverage`, `test-results`

## Do NOT

- Add ESLint, Prettier, or related config files
- Create root-level `biome.json`
- Run `eslint` or `prettier` directly

## Pre-commit

The pre-commit hook runs `mbiome check --write {staged_files}` automatically via Lefthook.

## References

- [Biome README](../../biome/README.md)
- [Biome AGENT](../../biome/AGENTS.md)
