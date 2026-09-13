---
name: review
description: Code review checklist — ensure quality before PR
---

# Code Review Checklist

Ensure code quality, consistency, and monorepo rules before PR.

## When to use

- Reviewing PRs
- Self-review before pushing
- Ensuring monorepo conventions

## Checklist

### Code Quality

- [ ] `bun run check:fix` passes (Biome)
- [ ] `bun run typecheck` passes (no TS errors)
- [ ] `bun run test` passes (unit tests)
- [ ] `bun run test:e2e` passes if E2E affected
- [ ] No `console.log` left (use proper logging)
- [ ] No commented-out code

### Monorepo Rules

- [ ] No runtime deps added to `@myorg/external` (internal inlined)
- [ ] No `export *` in `external` (explicit named re-exports)
- [ ] `internal` never depends on `external` (circular)
- [ ] Apps only import from `@myorg/external`, not `@myorg/internal`
- [ ] All inter-package deps use `workspace:*`
- [ ] No `typescript`, `bunup`, `@types/bun` in individual package devDeps (owned by `@myorg/ts`)
- [ ] No `baseUrl` in `tsconfig.json` (TS 7.0 removed)
- [ ] No root-level `turbo.json`, `biome.json`, `bunfig.toml`

### Security

- [ ] No secrets committed (`.env` files)
- [ ] No API keys in code
- [ ] Dependencies from trusted sources
- [ ] Reviewed `bun.lock` changes

### Docs

- [ ] README updated if needed
- [ ] Changeset added for public API changes (`bun run changeset`)
- [ ] Comments for complex logic

## Commands

```bash
bun run check:fix
bun run typecheck
bun run test
bun run ci:lint
```

## References

- [AGENTS.md](../../../AGENTS.md) — absolute constraints
- [CONTRIBUTING.md](../../../CONTRIBUTING.md)
