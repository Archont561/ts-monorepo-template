# @myorg/stale

A scheduled workflow that labels inactive issues and PRs, then closes them — with a comment that says why and a grace period to answer.

## What it provides

`stale.base.yml` — the whole workflow, since nothing else contributes steps to it:

| Setting | Value |
| :--- | :--- |
| Schedule | Mondays, 06:00 UTC (`0 6 * * 1`) |
| Issues stale after | 60 days, closed 14 days later |
| PRs stale after | 30 days, closed 14 days later |
| Labels | `stale` added, and removed when the item wakes up |
| Exempt | `pinned`, `security`, `enhancement` (issues), `pinned`, `security` (PRs) |
| Permissions | `issues: write`, `pull-requests: write` |

`workflow_dispatch` is enabled, so the sweep can be triggered by hand.

## Usage

```bash
bun run docs:sync   # regenerates .github/workflows/stale.yml
```

Tune the messages, days and exempt labels in `configs/stale/stale.base.yml`, then re-run `docs:sync` — never edit the generated workflow.

> [!NOTE]
> Opt-in, **off by default**. When it is disabled, the config and the generated workflow are pruned together.
