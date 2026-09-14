# @myorg/devcontainer

An opt-in Dev Container with Bun, Node, Rust and Docker already installed — the same environment in Codespaces, VS Code and compatible tools.

## What it provides

- `.devcontainer/devcontainer.json` at the repo root
- Pinned base image and pinned features: Node 22, Bun 1.4.2, Rust stable, GitHub CLI, Docker-in-Docker
- `postCreateCommand` runs `bun install` once; `forwardPorts` exposes 3000
- VS Code customisations: Bun and Biome extensions

> [!IMPORTANT]
> Opt-in — choose *Include devcontainer config for Codespaces / Dev Containers?* during `bun create`.

## Usage

Open the repo in a supported editor or in Codespaces and choose "Reopen in Container". The container installs dependencies on first create and forwards port 3000 for the example app.

| Option | Result |
| :--- | :--- |
| `false` (default) | `.devcontainer/` is pruned by the scaffolder |
| `true` | `devcontainer.json` is kept, with pinned image and features |
