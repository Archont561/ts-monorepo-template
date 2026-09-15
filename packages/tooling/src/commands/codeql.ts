import { defineCommand } from "../utils/spawn";

/** CodeQL runs in GitHub Actions, not locally — this is guidance only. */
export default defineCommand({
  meta: {
    name: "codeql",
    version: "1.0.0",
    description: "CodeQL wrapper — info and local guidance (CodeQL runs in GitHub Actions)",
  },
  run() {
    console.log(`
m codeql — CodeQL SAST wrapper

CodeQL runs in GitHub Actions, not locally. This wrapper provides guidance.

GitHub setup:
  1. Enable in Settings → Code security → Code scanning → CodeQL analysis
  2. Or use the generated 'security' job in .github/workflows/ci.yml
  3. Results appear in Security → Code scanning alerts

Local (optional, heavy):
  brew install codeql
  codeql database create --language=javascript-typescript /tmp/codeql-db --source-root=.
  codeql database analyze /tmp/codeql-db --format=sarif-latest --output=/tmp/results.sarif

Docs: https://codeql.github.com/docs/
`);
  },
});
