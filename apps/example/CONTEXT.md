# CONTEXT.md — @myorg/example

> Snapshot of this app's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Version `0.0.0`, private, never published. Depends on `@myorg/external`; dev-depends on `@myorg/tooling`, `@myorg/native` and `@playwright/test`.
- Declares `pages: { dir: "public" }`, so it is the package the Pages site deploys.
- One opt-in feature is present here: native (`src/pages/api/native/**`).
- Port defaults to 3000 and comes from `src/port.ts`; `PORT` overrides it and `playwright.config.ts` reads the same value.
- Docker: multi-stage `Dockerfile` plus `docker-compose.yml`, both inheriting `BUN_VERSION` / `RUST_VERSION` from the Dockerfile ARGs.

## Decisions as outcomes

- **Two-tier routing** — hot paths are static routes; everything else is discovered by `FileSystemRouter`, so adding an endpoint adds a file.
- **Runtime checks over build flags** — the same source serves with or without an opt-in config, because pruning must not break the app.

## Open

- E2E has never run here: no browsers are installed, so `bun run test:e2e` always skips.
- The Docker build has not been exercised in this sandbox; the Rust stages in particular are unverified.

## Recent changes

| Commit | What |
| :--- | :--- |
| `d869bc2` | port centralised in `src/port.ts`; docker-compose inherits image versions |
| `fb3a47c` | app build/test/dev moved behind Turbo |
