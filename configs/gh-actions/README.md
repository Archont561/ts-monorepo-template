# @myorg/gh-actions

Workflow skeletons and the local tooling to validate and run them. Workflows in `.github/` are generated — this is where their sources live.

## What it provides

- `actionlint` and `act` as shared workspace dependencies
- `ci.base.yml` and `release.base.yml` — skeletons with a `{{STEPS}}` placeholder that fragments are spliced into
- `mci` — `mci lint` validates workflows, `mci act` runs them locally in Docker

Other configs own their own skeletons (`pages.base.yml`, `coverage.base.yml`, `dependabot.base.yml`, `native.base.yml`) and contribute step fragments to the shared ones.

### Workflow generation

| Skeleton | Fragments | Output | When |
| :--- | :--- | :--- | :--- |
| `ci.base.yml` | `*/ci.steps.yml` | `.github/workflows/ci.yml` | Always |
| `release.base.yml` | `*/release.steps.yml` | `.github/workflows/release.yml` | Always |
| `pages.base.yml` | `*/pages.steps.yml` | `.github/workflows/pages.yml` | Pages enabled |
| `coverage.base.yml` | `*/coverage.steps.yml` | `.github/workflows/coverage.yml` | Pages disabled |
| `native.base.yml` | `*/native.steps.yml` | `.github/workflows/native.yml` | Native enabled |
| `dependabot.base.yml` | `*/dependabot.yml` | `.github/dependabot.yml` | Always |
| `dependabot-auto-merge.base.yml` | `*/dependabot-auto-merge.steps.yml` | `.github/workflows/dependabot-auto-merge.yml` | Always |

### Placeholders

Fragments are static YAML, so anything with a single source of truth in TypeScript is substituted at generation time:

| Placeholder | Value |
| :--- | :--- |
| `{{BUN_VERSION}}` | Bun version installed by the workflows |
| `{{NATIVE_DIR}}` | `packages/native` |
| `{{NATIVE_CARGO}}` | `packages/native/Cargo.toml` |
| `{{NATIVE_NPM}}` | `packages/native/npm/*/package.json` |
| `{{NATIVE_WASI_SDK_VERSION}}` | WASI SDK release used by the native matrix |
| `{{APP_DIR}}` | `apps/example` |
| `{{APP_DOCKERFILE}}` | `apps/example/Dockerfile` |

## Usage

```bash
bun run docs:sync   # regenerate every workflow and dependabot config
bun run ci:lint     # actionlint over the generated workflows
bun run ci:list     # list the jobs `act` would run
bun run ci:dry      # dry-run the push event
bun run ci:local    # run CI locally in Docker
```
