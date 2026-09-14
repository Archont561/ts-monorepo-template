# @myorg/community

The GitHub community-health files that make a repository feel maintained — reviewers get assigned automatically, issues arrive structured.

## What it provides

| File | Purpose | Location |
| --- | --- | --- |
| `CODEOWNERS` | Auto-assign reviewers by path | `.github/CODEOWNERS` |
| `PULL_REQUEST_TEMPLATE.md` | PR checklist | `.github/PULL_REQUEST_TEMPLATE.md` |
| `ISSUE_TEMPLATE/bug_report.yml` | Structured bug reports | `.github/ISSUE_TEMPLATE/` |
| `ISSUE_TEMPLATE/feature_request.yml` | Structured feature requests | `.github/ISSUE_TEMPLATE/` |
| `FUNDING.yml` | Sponsorship links | `.github/FUNDING.yml` |

GitHub surfaces these under **Insights → Community Standards** and uses them to prepopulate issues and PRs.

> [!NOTE]
> Vulnerability reporting, support channels and the code of conduct are sections of the root `README.md`, not standalone files — this config owns no root Markdown of its own.

### CODEOWNERS example

```ini
# .github/CODEOWNERS
*                  @your-org/core-team
/packages/auth/**  @your-org/security-team
*.rs               @your-org/rust-team
```

### PR checklist

Biome lint, typecheck, tests, 80% coverage, Conventional Commits, and `docs:sync` when anything under `configs/` changed.

### Scaffold

Always included — baseline repo health per GitHub's community checklist. The `@myorg` scope is rewritten on scaffold, but the CODEOWNERS **owner** is yours to set.
