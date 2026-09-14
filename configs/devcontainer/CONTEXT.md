# CONTEXT.md — @myorg/devcontainer

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in (`confirm`, default `false`). When declined, `.devcontainer/` is pruned via `extraRemovals`, `**/.devcontainer/**` and the `devcontainer` regex.
- Owned file: `.devcontainer/devcontainer.json` — base `mcr.microsoft.com/devcontainers/base:1.2.1-ubuntu-22.04`, features Node 22.13.1, Bun 1.4.2, Rust stable, github-cli 2.74.2, docker-in-docker 2.12.0.
- VS Code extensions: `oven.bun-vscode`, `biomejs.biome`. `remoteUser: vscode`, `forwardPorts: [3000]`.

## Decisions as outcomes

- **Pinned, never `latest`** — a feature that moves under you turns "works on my machine" into "worked last week".
- **Opt-in by default** — most consumers develop on their host; the container is for people who want zero setup.

## Open

- The devcontainer has never been built in this sandbox — the image and feature versions are unverified against a real Codespaces start.

## Recent changes

| Commit | What |
| :--- | :--- |
| `d869bc2` | app port and image versions made overridable — the port the devcontainer forwards is the same `PORT` the app reads |
