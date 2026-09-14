# AGENTS.md - @myorg/trivy

> Trivy — container + filesystem vulnerability scanning.

## What it provides

- `mtrivy` CLI wrapper — defensive, warns if binary missing, exits 0 locally; `fs` + `image` scans and `build` (docker build of the scan image)
- `ci.steps.yml` — FS scan (always) + image scan (if Dockerfile)
- SARIF upload to GitHub Security tab
- `.trivyignore` optional for false positives.

## For agents

- Opt-in, default false (`default: false` in scaffold). Enable with `--trivy` or during prompts.
- When enabled, `bun run docs:sync` adds Trivy steps to `ci.yml`.
- If you add a Dockerfile, Trivy image scan will run (builds `app:trivy-scan`).
- If you have a CVE false positive, add it to `.trivyignore`.
- No local binary required for CI — uses `aquasecurity/trivy-action`.
- For local scanning, install via `brew install trivy`.

## Files

- `configs/trivy/src/cli.ts` — wrapper
- `configs/trivy/ci.steps.yml` — CI fragment
- `.trivyignore` (optional)
