#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "mcodeql",
    version: "1.0.0",
    description: "CodeQL wrapper — info and local guidance (CodeQL runs in GitHub Actions)",
  },
  run() {
    console.log(`
mcodeql — CodeQL SAST wrapper

CodeQL runs in GitHub Actions, not locally. This wrapper provides guidance.

GitHub setup:
  1. Enable in Settings → Code security → Code scanning → CodeQL analysis
  2. Or use the workflow fragment from configs/codeql/ci.steps.yml
  3. Results appear in Security → Code scanning alerts

Local (optional, heavy):
  brew install codeql
  codeql database create --language=javascript-typescript /tmp/codeql-db --source-root=.
  codeql database analyze /tmp/codeql-db --format=sarif-latest --output=/tmp/results.sarif

CI fragment (auto-added to ci.yml when enabled):
  - uses: github/codeql-action/init@v3
    with:
      languages: javascript-typescript
      queries: security-and-quality
  - uses: github/codeql-action/autobuild@v3
  - uses: github/codeql-action/analyze@v3

Docs: https://codeql.github.com/docs/
`);
  },
});

runMain(main);
