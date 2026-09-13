## GitHub Actions + Dependabot

> [!IMPORTANT]
> Workflows in `.github/workflows/` + `.github/dependabot.yml` are generated — don't edit directly.

- Skeletons: `configs/gh-actions/*.base.yml` contain `{{STEPS}}` or `{{UPDATES}}` placeholder
- Fragments: `configs/*/ci.steps.yml`, `*/release.steps.yml`, `*/pages.steps.yml`, `*/dependabot.yml`, `*/dependabot-auto-merge.steps.yml`
- Aggregation: `bun run docs:sync` (`mdocs` from `@myorg/template`) runs `discoverConfigs()` to collect fragments and generates `ci.yml` + `release.yml` + `pages.yml` + `dependabot.yml` + `dependabot-auto-merge.yml`
- Validation: `mci lint` (`actionlint`) + `mci act` (`act`) for local runs
- `mci` bin from `@myorg/gh-actions` wraps `actionlint` + `act` with config
- Dependabot: always config `configs/dependabot` provides 4 ecosystems (npm/cargo/github-actions/docker) with grouping, ignore major, labels, limits, commit-message chore+scope — see `configs/dependabot/README.md`

| Command | Description |
| :--- | :--- |
| `bun run docs:sync` | Regenerate workflows + dependabot.yml |
| `bun run ci:lint` | `mci lint` — validate |
| `bun run ci:list` | `mci act -l` — list jobs |
| `bun run ci:dry` | `mci act push -n` — dry-run |
| `bun run ci:local` | `mci act push` — Docker |

```mermaid
graph TD
    A[*.base.yml] --> C[mdocs]
    B[*/ci.steps.yml + */dependabot.yml] --> C
    C --> D[ci.yml + release.yml + pages.yml + dependabot.yml + auto-merge]
    D --> E[mci lint]

    style C fill:#0969DA,color:#fff
```

> [!TIP]
> After editing skeletons or fragments, run `docs:sync` then `ci:lint`.

- Adding a config with CI steps: create `configs/<name>/ci.steps.yml`
- Adding dependabot entries: create `configs/<name>/dependabot.yml` fragment (list item starting with `- package-ecosystem:`)
- No root `.actrc` — config lives in `configs/gh-actions`
