# AGENTS.md - @myorg/community

> Community health files for GitHub.

## What it provides

- `.github/CODEOWNERS` — auto-assign reviewers (replace @Archont561 with your org/team)
- `.github/PULL_REQUEST_TEMPLATE.md` — PR checklist (Biome, typecheck, test, coverage, docs:sync, conventional commits)
- `.github/ISSUE_TEMPLATE/bug_report.yml` — bug report form
- `.github/ISSUE_TEMPLATE/feature_request.yml` — feature request form
- Vulnerability reporting, support channels and the code of conduct are **sections of the root `README.md`**, not standalone files — this config owns no root Markdown of its own
- `.github/FUNDING.yml` — sponsorship links (commented template)

## For agents

- Do not delete these files — they are baseline health (Insights → Community Standards).
- When scaffolding, `@myorg` scope is replaced, but CODEOWNERS owner should be customized manually.
- If you add new sensitive paths (e.g. `packages/auth`), add them to CODEOWNERS.
- If you add new CI checks, update PR template checklist.
- Always included (`default: always`).

## Files

- `.github/CODEOWNERS`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/*.yml`
- `SECURITY.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`
- `.github/FUNDING.yml`
- `configs/community/package.json`
