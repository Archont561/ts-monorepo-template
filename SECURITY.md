# Security Policy

## Supported Versions

| Version | Supported |
| ------- | --------- |
| main    | ✅        |
| < 1.0   | ❌        |

We support the latest `main` branch and the latest published npm versions of `@myorg/external` (replace with your scope after scaffolding).

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Instead:

1. **Email**: Use GitHub's private vulnerability reporting:
   - Go to **Security → Report a vulnerability** in this repository
   - Or email the maintainers listed in `CODEOWNERS`

2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

3. **Response**:
   - Acknowledgment within 48 hours
   - Initial assessment within 5 business days
   - Fix and disclosure timeline coordinated with reporter

## Security Tools in this Template

This template includes (or can include via opt-in configs):

| Tool | Purpose | Config |
| ---- | ------- | ------ |
| `gitleaks` | Detect secrets in commits | `configs/gitleaks` (lefthook + CI) |
| `CodeQL` | SAST for JS/TS/Rust | `configs/codeql` (CI steps) |
| `Trivy` | Container + filesystem vuln scan | `configs/trivy` (CI, Docker) |
| `Dependabot` | Automated dep updates | `configs/dependabot` |
| `CODEOWNERS` | Auto-review for sensitive paths | `.github/CODEOWNERS` |
| `cargo audit / deny` | Rust security + license checks | `mnative audit`, `mnative deny` |

### Running security checks locally

```bash
# Secrets scanning (requires gitleaks installed or via Docker)
bunx gitleaks detect --source . --no-git || echo "gitleaks not installed, use docker: docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source /path"

# Rust audit (requires cargo-audit)
mnative audit || cargo audit

# Rust license/ban check (requires cargo-deny)
mnative deny check || cargo deny check

# Trivy (requires trivy)
trivy fs . --severity HIGH,CRITICAL
```

## Disclosure Policy

We follow coordinated disclosure:

1. Fix is developed privately
2. New version is released with patch
3. Advisory is published via GitHub Security Advisories
4. Credit is given to reporter (unless anonymity requested)

## Dependencies

- **Bun** workspaces — `bun.lock` is tracked as binary in `.gitattributes` to avoid noisy diffs but still scanned by Dependabot.
- **Rust** — `packages/native/Cargo.lock` is gitignored for library, but `cargo audit` runs in CI if `cargo-audit` is installed.

Thank you for helping keep this project secure!
