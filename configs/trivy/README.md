# @myorg/trivy

Vulnerability scanning for the filesystem and container images, with results uploaded to the GitHub Security tab.

## What it provides

- `ci.steps.yml` — a filesystem scan on every CI run, plus an image scan when a Dockerfile exists
- `mtrivy` — a local wrapper: `fs`, `image` and `build`, which skips cleanly when Trivy is not installed
- `.trivyignore` for reviewed false positives

Trivy is open-source and fast, scans lock files as well as images, and complements the other security layers — Dependabot for dependency updates, CodeQL for static analysis, gitleaks for secrets.

## Usage

```bash
# install:  brew install trivy   |   apt-get install trivy
mtrivy fs . --severity HIGH,CRITICAL          # filesystem
mtrivy build                                  # build the scan image
mtrivy image app:trivy-scan --severity HIGH,CRITICAL
bun run security:trivy                        # the same scan via the root script
```

Only `HIGH` and `CRITICAL` are reported — lower severities would be noise on every run.

### In CI

The fragment runs `aquasecurity/trivy-action` in SARIF format and uploads the result with `github/codeql-action/upload-sarif`, so findings appear under Security → Code scanning rather than in a log. When `apps/example/Dockerfile` exists, an image is built as `app:trivy-scan` and scanned the same way.

> [!NOTE]
> Opt-in, `false` by default. No local binary is required — CI uses the action.
