# AGENTS.md — @myorg/devcontainer

## Rules

- Pin everything: base image tag and every feature version. `latest` in a devcontainer is a reproducibility bug.
- Keep `postCreateCommand` to dependency installation — the container must be disposable and fast to recreate.
- Add the WASI target (`rustup target add wasm32-wasip1-threads`) only when the native config is kept; do not add it unconditionally.
- This config owns exactly one file, `.devcontainer/devcontainer.json`. Do not add Dockerfiles or scripts next to it unless the image genuinely needs them.
- When the devcontainer is disabled, `.devcontainer/` is removed by glob and regex — nothing else may reference it.

## Before marking a task done

- [ ] Every feature and the base image carry an explicit version
- [ ] Ports forwarded match the app's configured port
- [ ] Nothing outside `.devcontainer/` depends on it existing
