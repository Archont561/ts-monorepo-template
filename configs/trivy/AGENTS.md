# AGENTS.md — @myorg/trivy

## Rules

- Never edit the generated `.github/workflows/ci.yml`. Scan settings live in `configs/trivy/ci.steps.yml`.
- Report `HIGH` and `CRITICAL` only. Lowering the severity threshold turns CI into a wall of noise that nobody reads.
- Reviewed false positives go in `.trivyignore` with the CVE id — never by widening the severity or disabling the scan.
- Keep the image scan conditional on a Dockerfile existing; a repo without one must not fail.
- `mtrivy` must stay non-fatal when the binary is missing. A developer without Trivy can still commit; CI is the enforcement point.
- Keep SARIF output and upload — findings belong in the Security tab, not in a build log someone has to open.

## Before marking a task done

- [ ] Scan settings changed in `ci.steps.yml`, then `bun run docs:sync` run
- [ ] New CVE suppressions recorded in `.trivyignore`
- [ ] `bun run ci:lint` clean
