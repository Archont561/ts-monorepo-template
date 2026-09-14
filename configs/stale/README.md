# @myorg/stale

> Auto-close inactive issues and PRs via `actions/stale`.

## What it provides

- **Workflow** — `.github/workflows/stale.yml` (generated from `stale.base.yml` + fragments, or as standalone)
- **Config** — days-before-stale, days-before-close, messages

## Why stale?

- Keeps backlog clean
- Nudges inactive issues/PRs
- Configurable per repo

## Usage

Workflow (when enabled):

```yaml
name: Stale
on:
  schedule:
    - cron: "0 6 * * 1" # weekly Monday 6am

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          stale-issue-message: "This issue is stale — please comment if still relevant."
          stale-pr-message: "This PR is stale — please update if still relevant."
          days-before-stale: 60
          days-before-close: 14
          days-before-pr-stale: 30
          days-before-pr-close: 14
```

Customize via `configs/stale/stale.base.yml` or `stale.yml` fragment.

## Scaffold

Opt-in, default false. Enable with `--stale` during `bun create`.

See [AGENTS.md](./AGENTS.md).
