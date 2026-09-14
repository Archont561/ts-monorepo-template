# @myorg/codeql

> CodeQL — GitHub's static analysis for security vulnerabilities.

## What it provides

- **CI steps** — `codeql.steps.yml` fragment that adds CodeQL analysis to `ci.yml` (or as standalone workflow if you prefer)
- **Config** — `codeql-config.yml` (optional) for custom queries, paths to ignore
- **CLI** — `mcodeql` wrapper (info only, CodeQL runs in GitHub Actions, not locally)

## Why CodeQL?

- Free for public repos, built into GitHub
- Supports JavaScript, TypeScript, and many other languages
- Finds security vulnerabilities (SQL injection, XSS, etc.) via SAST
- Results appear in **Security → Code scanning alerts**

## Usage

### GitHub setup

1. Enable in **Settings → Code security → Code scanning → CodeQL analysis**
2. Or use the workflow fragment — this config adds steps to `ci.yml`:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: javascript-typescript
    queries: security-and-quality

- name: Autobuild
  uses: github/codeql-action/autobuild@v3

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v3
```

3. Or create a dedicated workflow `.github/workflows/codeql.yml`:

```yaml
name: CodeQL
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
  schedule: [{ cron: "0 6 * * 1" }] # weekly Monday 6am

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: javascript-typescript
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3
```

### Local (optional)

CodeQL CLI is heavy; most teams run it only in CI. If you want local:

```bash
brew install codeql
codeql database create --language=javascript-typescript /tmp/codeql-db --source-root=.
codeql database analyze /tmp/codeql-db --format=sarif-latest --output=/tmp/results.sarif
```

Or use `mcodeql` wrapper for info.

## Scaffold

Opt-in, enabled by default (`default: true`). Disable with `--no-codeql` during `bun create`.

See [AGENTS.md](./AGENTS.md).
