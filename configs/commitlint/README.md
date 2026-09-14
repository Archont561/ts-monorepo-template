# @myorg/commitlint

Conventional Commits, enforced before a message is ever pushed.

## What it provides

- `@commitlint/cli` + `@commitlint/config-conventional` as shared dependencies
- `commitlint.config.js` — the shared config
- A Lefthook `commit-msg` hook that rejects invalid messages

> [!IMPORTANT]
> Messages must follow Conventional Commits. The `commit-msg` hook blocks anything that does not.

### Rules

| Part | Rule |
| :--- | :--- |
| Type | `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `perf`, `build`, `ci`, `revert` |
| Scope | Optional, must match a workspace name or a cross-cutting scope |
| Subject | Lowercase, no trailing period, max 100 chars |
| Body | Max 100 chars per line |

### Scopes

Scopes are derived at runtime from the workspaces in the root `package.json` — one per package, unscoped (`@myorg/pages` → `pages`) — plus cross-cutting scopes that point at no single workspace:

| Scope | Covers |
| :--- | :--- |
| `config` | several `configs/*` packages at once |
| `repo` | the monorepo itself (root files, toolchain) |
| `deps` | dependency bumps |
| `release` | versioning and publishing |
| `ci` | workflows and Actions |

Adding a package makes its name a valid scope automatically — nothing to update.

## Usage

```bash
# Valid
feat(external): add new greet function
fix(internal): handle edge case
docs: update README

# Invalid — blocked by the hook
Add new feature
WIP
```

Use `feat!:` or a `BREAKING CHANGE:` footer for breaking changes.
