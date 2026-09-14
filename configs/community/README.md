# @myorg/community

> GitHub community health files — CODEOWNERS, PR/issue templates, SECURITY, CODE_OF_CONDUCT, SUPPORT, FUNDING.

## What it provides

| File | Purpose | Location |
| ---- | ------- | -------- |
| `CODEOWNERS` | Auto-assign reviewers by path | `.github/CODEOWNERS` |
| `PULL_REQUEST_TEMPLATE.md` | PR checklist | `.github/PULL_REQUEST_TEMPLATE.md` |
| `ISSUE_TEMPLATE/bug_report.yml` | Structured bug reports | `.github/ISSUE_TEMPLATE/` |
| `ISSUE_TEMPLATE/feature_request.yml` | Structured feature requests | `.github/ISSUE_TEMPLATE/` |
| `FUNDING.yml` | Sponsorship links | `.github/FUNDING.yml` |

GitHub surfaces these in **Insights → Community Standards** and uses them to prepopulate PRs/issues and assign reviewers.

### CODEOWNERS example

```ini
# .github/CODEOWNERS
* @your-org/core-team
/packages/auth/** @your-org/security-team
*.rs @your-org/rust-team
```

### PR template checklist

- Biome lint, typecheck, tests, coverage 80%, conventional commits, docs:sync if needed.

### Issue templates (YAML forms)

- Bug report: what happened, reproduction, environment, logs
- Feature request: problem, proposal, area, context

## Scaffold

Always included — baseline repo health per GitHub's community checklist.

See [AGENTS.md](./AGENTS.md).
