# @myorg/gitleaks

Secret scanning before a secret reaches the remote — locally in a pre-commit hook, and again in CI.

## What it provides

- `mgitleaks` — a wrapper that bakes in the config path and degrades gracefully when the binary is absent
- **Pre-commit hook** — `mgitleaks protect --staged` scans staged changes
- **CI step** — `gitleaks/gitleaks-action@v2` in `ci.yml`
- `.gitleaksignore` for reviewed false positives

Gitleaks is open-source, fast, scans history as well as the working tree, and needs no baseline file to keep false positives quiet.

## Usage

```bash
# install (pick one)
brew install gitleaks                                  # macOS
go install github.com/gitleaks/gitleaks/v8@latest      # Go
docker pull zricethezav/gitleaks:latest                # Docker

mgitleaks detect                # scan the repository
mgitleaks protect --staged      # scan staged changes (the pre-commit hook)
bun run security:gitleaks       # the same scan via the root script
```

> [!NOTE]
> When the binary is missing, `mgitleaks` warns and exits 0 — a missing scanner must never block a commit. CI still enforces it.
