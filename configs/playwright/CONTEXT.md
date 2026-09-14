# CONTEXT.md — @myorg/playwright

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in with `default: true` — the only opt-in config besides CodeQL that ships enabled.
- `me2e` detects installed browsers and skips when they are missing; CI installs them via `playwright install --with-deps`.
- In this sandbox `bun run test:e2e` reports *"E2E skipped: browser(s) not installed (chromium, firefox, webkit)"* — so the suite has never actually run here.
- `baseURL` follows the app's `PORT` (3000 by default), which `d869bc2` made overridable.

## Decisions as outcomes

- **Skip rather than fail** — an environment without browsers is normal, and a red build for a missing optional dependency trains people to ignore red builds.

## Recent changes

| Commit | What |
| :--- | :--- |
| `d869bc2` | app port made overridable; E2E base URL follows it |
| `fb3a47c` | E2E exposed as `bun run test:e2e`, run through Turbo |
