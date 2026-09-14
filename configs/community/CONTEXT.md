# CONTEXT.md — @myorg/community

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Five files owned today: `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/feature_request.yml`, `.github/FUNDING.yml`.
- No bin, no generated files, no CLI — this config is file content plus scaffold metadata (`default: always`).
- `.github/PULL_REQUEST_TEMPLATE.md` and the issue templates are rewritten by the scaffolder's scope/identity pass.

## Recent changes

| Commit | What |
| :--- | :--- |
| `05e8dc6` | `SECURITY.md`, `SUPPORT.md` and `CODE_OF_CONDUCT.md` folded into root `README.md`; this config no longer owns root Markdown |
| `408339f` | repository identity rewritten on scaffold, so templates can name the right owner |
