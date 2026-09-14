# @myorg/commitlint

> Conventional Commits enforcement.

## What it provides

- `@commitlint/cli` + `@commitlint/config-conventional`
- `commitlint.config.js` — shared config
- Lefthook integration — validates commit messages on `commit-msg` hook

> [!IMPORTANT]
> Commit messages must follow Conventional Commits. The hook blocks invalid messages.

### Config

| Rule | Description |
| :--- | :--- |
| `type` | `feat`, `fix`, `docs`, `chore`, `refactor`, etc. |
| `scope` | Optional, e.g. `feat(external): ...` |
| `subject` | Lowercase, no period |

### Scopes

Scopes are derived at runtime from the workspaces in the root `package.json` —
one per package, with the scope stripped (`@myorg/pages` → `pages`) — plus
cross-cutting ones that point at no single workspace:

| Scope | Covers |
| :--- | :--- |
| `config` | several `configs/*` packages at once |
| `repo` | the monorepo itself (root files, toolchain) |
| `deps` | dependency bumps |
| `release` | versioning and publishing |
| `ci` | workflows and Actions |

Nothing to update when you add a package: its name becomes a valid scope
automatically.

## Usage

```bash
# Valid
feat(external): add new greet function
fix(internal): handle edge case
docs: update README

# Invalid (blocked by hook)
Add new feature
WIP
```

```mermaid
graph LR
    A[git commit] --> B[lefthook commit-msg]
    B --> C[commitlint]
    C -->|valid| D[commit created]
    C -->|invalid| E[blocked + message]

    style C fill:#0969DA,color:#fff
```

<details>
<summary>Commit types</summary>

- `feat`: New feature (minor bump)
- `fix`: Bug fix (patch bump)
- `docs`: Documentation only
- `chore`: Maintenance, deps
- `refactor`: Code refactor
- `test`: Tests
- `perf`: Performance improvement
- `BREAKING CHANGE`: Major bump (in footer)

</details>

See [AGENTS.md](./AGENTS.md) for the agent-facing reference.
