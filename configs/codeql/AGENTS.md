# AGENTS.md — @myorg/codeql

## Rules

- Never edit the generated `ci.yml`. CodeQL settings live in `configs/codeql/ci.steps.yml`; run `bun run docs:sync` after changing them.
- CodeQL runs in GitHub Actions. There is no local gate, so a green local run says nothing about CodeQL.
- Keep `queries: security-and-quality` unless there is a reason to narrow it.
- Do not add Rust to `languages:` — CodeQL's Rust support is limited. Native code is covered by `mnative audit` / `mnative deny` instead.
- Suppressions and path exclusions belong in `codeql-config.yml`, not by deleting steps from the workflow.

## Before marking a task done

- [ ] Fragment edited, then `bun run docs:sync` run and the generated workflow committed
- [ ] `bun run ci:lint` clean
- [ ] Findings triaged in Security → Code scanning, not ignored
