# @myorg/gh-actions

> GitHub Actions CI + local `act` simulation.

## What it provides

- `github-actionlint` as a shared devDependency.
- `actionlint.yaml` — the shared actionlint config.
- `ci.base.yml` / `release.base.yml` — the **workflow skeletons** whose
  `{{STEPS}}` placeholder is filled from the configs' step fragments by
  `bun run docs:sync` (generating `.github/workflows/ci.yml` + `release.yml`).
- `mactionlint` — validates `.github/workflows/` syntax, baking in
  `-config-file=<configs/gh-actions/actionlint.yaml>`.
- `mact` — wraps `act` for local CI, baking in a feature-complete runner image
  (`catthehacker/ubuntu:act-latest`) and `--container-architecture`; prints an
  install guide when `act` is not installed.

## Usage

```bash
bun run docs:sync     # regenerate .github/workflows/ from the skeletons + fragments
bun run ci:lint       # validate workflow syntax (mactionlint)
bun run ci:list       # list workflows/jobs (mact -l)
bun run ci:dry        # dry-run plan (mact push -n)
bun run ci:local      # run CI in Docker (mact push)
```

Other events: `act pull_request -n`, `act -W .github/workflows/release.yml -n`,
`act -j actionlint -n`. Secrets are absent locally — pass `-s NPM_TOKEN` or
use an untracked `.secrets` file.

## Rules

- Workflows are generated, never hand-edited: edit the base skeletons
  (`configs/gh-actions/*.base.yml`) and the per-config `ci.steps.yml` /
  `release.steps.yml` fragments, then run `bun run docs:sync`.
- `if: ${{ !env.ACT }}` guards must live on **step-level** `if` (job-level
  `if` cannot access the `env` context; actionlint enforces this).
- Run `bun run ci:lint` after regenerating a workflow.

See [AGENT.md](./AGENT.md) for the agent-facing reference.