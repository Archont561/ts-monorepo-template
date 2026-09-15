---
name: commit
description: Conventional Commits helper — create valid commit messages enforced by commitlint
---

# Conventional Commits

Commit messages must follow Conventional Commits, enforced by Lefthook `commit-msg` hook.

## When to use

- Creating commit messages
- Validating commit format
- Understanding bump types

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Examples

```bash
feat(external): add http subpath
fix(internal): handle null edge case
docs: update README
chore: bump deps
refactor(example): simplify routing
test(external): add greet tests
```

### Types

| Type | Bump | Use |
| :--- | :--- | :--- |
| `feat` | Minor | New feature |
| `fix` | Patch | Bug fix |
| `docs` | None | Docs only |
| `chore` | None | Maintenance |
| `refactor` | None | Refactor |
| `test` | None | Tests |
| `perf` | Patch | Performance |
| `BREAKING CHANGE` | Major | Breaking (in footer) |

### Rules

- Subject lowercase, no period, max 100 chars
- Body max line 100 chars
- Scope optional: `feat(external)`, `fix(internal)`, `docs`

## Commands

```bash
# Hook validates automatically on git commit
# If blocked, fix message and retry
```

## Do NOT

- `Add new feature` (no type)
- `WIP` (invalid)
- Uppercase subject or period at end

## References

- [Commitlint README](../../commitlint/README.md)
- [Commitlint AGENT](../../commitlint/AGENTS.md)
