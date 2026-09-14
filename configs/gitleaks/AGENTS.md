# AGENTS.md - @myorg/gitleaks

> Secret scanning via gitleaks — Lefthook pre-commit + CI.

## What it provides

- `mgitleaks` CLI wrapper — runs gitleaks if installed, otherwise warns and skips (never blocks without binary)
- Lefthook pre-commit hook: `mgitleaks protect --staged`
- CI step: `gitleaks/gitleaks-action@v2` in `ci.yml`
- No custom config needed — uses default rules; `.gitleaksignore` optional for false positives.

## For agents

- Do not commit secrets — gitleaks will catch them in pre-commit and CI.
- If gitleaks is not installed locally, install via `brew install gitleaks` or use Docker fallback.
- If you have a false positive, add it to `.gitleaksignore` (one per line, or path:line format).
- Always included by default (`default: always`). To disable, scaffold with `--no-gitleaks`.
- The CLI (`mgitleaks`) is defensive: if binary missing, it prints warning and exits 0 (does not fail CI locally).

## Commands

```bash
mgitleaks detect               # scan repo
mgitleaks protect --staged     # scan staged (pre-commit)
```

## Files

- `configs/gitleaks/src/cli.ts` — wrapper
- `configs/gitleaks/ci.steps.yml` — CI fragment
- `configs/lefthook/lefthook.yml` — pre-commit hook (gitleaks)
- `.gitleaksignore` (optional, not committed by default)
