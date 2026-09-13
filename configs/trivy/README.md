# @myorg/trivy

> Vulnerability scanner for container images, filesystems, and repos.

## What it provides

- **CI steps** — `ci.steps.yml` fragment that runs Trivy FS scan + Docker image scan (if Dockerfile present)
- **CLI** — `mtrivy` wrapper that runs Trivy if installed, otherwise warns and skips
- **Config** — `.trivyignore` (optional) for false positives

## Why Trivy?

- Open-source, fast, maintained by Aqua Security
- Scans container images, filesystems, lock files (npm, Cargo, etc.)
- Complements Dependabot (SCA) + CodeQL (SAST) + gitleaks (secrets)
- Can output SARIF for GitHub Security tab

## Usage

```bash
# Install
brew install trivy
# or
sudo apt-get install trivy

# Scan filesystem (HIGH, CRITICAL only)
mtrivy fs . --severity HIGH,CRITICAL
trivy fs . --severity HIGH,CRITICAL

# Scan Docker image (after build)
mtrivy image my-app:latest --severity HIGH,CRITICAL
trivy image my-app:latest

# With SARIF for GitHub Security
trivy fs . --format sarif --output trivy-results.sarif --severity HIGH,CRITICAL

# Ignore file
echo "CVE-2023-12345" >> .trivyignore
```

### CI integration (auto-added when enabled)

```yaml
- name: Run Trivy FS scan (HIGH, CRITICAL)
  uses: aquasecurity/trivy-action@0.24.0
  with:
    scan-type: fs
    scan-ref: .
    severity: HIGH,CRITICAL
    format: sarif
    output: trivy-results.sarif

- name: Upload Trivy SARIF to GitHub Security
  uses: github/codeql-action/upload-sarif@v3
  with:
    sarif_file: trivy-results.sarif
```

### Docker image scanning (if Dockerfile present)

```yaml
- name: Build image for Trivy scan
  run: docker build -t app:trivy-scan -f apps/example/Dockerfile .

- name: Trivy image scan
  uses: aquasecurity/trivy-action@0.24.0
  with:
    image-ref: app:trivy-scan
    severity: HIGH,CRITICAL
    format: sarif
    output: trivy-image-results.sarif
```

## Scaffold

Opt-in, default false. Enable with `--trivy` during `bun create` or when prompted.

See [AGENT.md](./AGENT.md).
