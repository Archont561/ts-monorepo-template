# CONTEXT.md — @myorg/trivy

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in (`confirm`, default `false`), but present in this repo, so its steps are in the generated `ci.yml`.
- Two scans: filesystem (always) and image (when `apps/example/Dockerfile` exists). Both emit SARIF to the Security tab.
- `mtrivy` supports `fs`, `image` and `build`; it warns and exits 0 when Trivy is absent. Root script: `bun run security:trivy`.
- Actions in use: `aquasecurity/trivy-action@v0.24.0` for the scan, `github/codeql-action/upload-sarif@v3` for the upload.

## Decisions as outcomes

- **Advisory locally, enforced in CI** — the wrapper never blocks a commit, the CI step always runs.
- **SARIF over log output** — findings are reviewable in Security → Code scanning instead of buried in a job log.

## Open

- Trivy is not installed in this sandbox, so local scans here are no-op warnings; only the generated workflow has been validated.

## Recent changes

| Commit | What |
| :--- | :--- |
| `fb3a47c` | security scans exposed as one-line root scripts |
