# CONTEXT.md — @myorg/codeql

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in (`confirm`, default `true`) — the only opt-in config besides Playwright that ships enabled.
- Present in this repo, so `ci.yml` carries the init/autobuild/analyze steps with `languages: javascript-typescript` and `queries: security-and-quality`.
- `mcodeql` is informational only; there is no local CodeQL binary.
- No `codeql-config.yml` in the repo today — the default query set is used.

## Decisions as outcomes

- **Steps in `ci.yml`, not a separate workflow** — analysis runs on every push and PR alongside everything else, rather than on a weekly schedule nobody watches.
- **JavaScript/TypeScript only** — Rust is covered by `cargo audit`/`deny` through `mnative`, which is a better fit than CodeQL's limited Rust support.

## Open

- No CodeQL analysis has run against this repo, so the alert volume for `security-and-quality` is unknown.

## Recent changes

| Commit | What |
| :--- | :--- |
| `05e8dc6` | root docs split; this config's docs reduced to the three-document set |
