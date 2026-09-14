# @myorg/gitleaks

> Secret scanning — detects API keys, tokens, passwords in Git history and staged changes.

## What it provides

- **Lefthook pre-commit hook** — runs `gitleaks protect --staged` before commit (if gitleaks installed)
- **CI step** — `gitleaks detect --source . --no-git` in `ci.yml` (via `gitleaks.steps.yml`)
- **Config** — `.gitleaksignore` + `gitleaks.toml` (optional) at repo root
- **CLI** — `mgitleaks` wrapper that bakes in config path and handles missing binary gracefully

## Why gitleaks?

- Open-source, fast, no false-positive baseline file needed (unlike detect-secrets)
- Scans Git history, staged changes, and files
- Used by many orgs as pre-commit + CI gate
- Alternative to GitHub's built-in secret scanning (works locally)

## Usage

```bash
# Install (choose one)
brew install gitleaks          # macOS
go install github.com/gitleaks/gitleaks/v8@latest
# or Docker
docker pull zricethezav/gitleaks:latest

# Run locally
mgitleaks detect               # scan current repo
mgitleaks protect --staged     # scan staged changes (pre-commit)
mgitleaks detect --source . --no-git --verbose

# Via Docker (if not installed)
docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source /path --no-git
```

### Lefthook integration

Pre-commit hook (in `configs/lefthook/lefthook.yml`):

```yaml
gitleaks:
  glob: "*"
  run: mgitleaks protect --staged
```

If gitleaks is not installed, the hook warns and skips (does not block).

### CI integration

In `ci.yml` (generated from `gitleaks.steps.yml`):

```yaml
- name: Gitleaks — secret scanning
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Config files

- `.gitleaksignore` — ignore false positives (optional)
- `gitleaks.toml` — custom rules (optional)

This template ships without custom config — gitleaks default rules are used. Add `.gitleaksignore` if you have known false positives.

## Scaffold

Always included (security baseline). Can be disabled via `--no-gitleaks` during `bun create`.

See [AGENTS.md](./AGENTS.md).
