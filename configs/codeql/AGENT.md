# AGENT.md - @myorg/codeql

> CodeQL SAST — security scanning for JS/TS.

## What it provides

- `ci.steps.yml` — adds CodeQL init/autobuild/analyze to `ci.yml`
- `mcodeql` CLI — info/help only (CodeQL runs in GitHub Actions)
- Optional `codeql-config.yml` for custom queries.

## For agents

- CodeQL is opt-in, default true (`default: true` in scaffold).
- To add CodeQL to a repo, ensure `configs/codeql` is enabled, then `bun run docs:sync` to regenerate workflows.
- Results appear in GitHub Security tab, not in PR comments.
- No local binary required — runs in Actions. If you need local, install CodeQL CLI via brew.
- If you add new languages (e.g. Rust), extend `languages:` list — but CodeQL Rust support is limited, use `cargo audit/deny` instead.

## Files

- `configs/codeql/ci.steps.yml` — CI fragment
- `configs/codeql/src/cli.ts` — wrapper
- `configs/codeql/package.json` — scaffold metadata
