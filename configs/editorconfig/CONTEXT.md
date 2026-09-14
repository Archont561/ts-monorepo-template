# CONTEXT.md — @myorg/editorconfig

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Owns exactly one file — the root `.editorconfig`. No bin, no generated files, no CLI.
- Settings: `root = true`, `utf-8`, LF, 2-space indent (4 for Rust), trailing whitespace trimmed.
- Always-on (`default: always`); the scaffolder rewrites nothing in it.

## Decisions as outcomes

- **Editor-native over tool-enforced** — whitespace is settled before a file is saved, so Biome never has to fight the editor.

## Recent changes

| Commit | What |
| :--- | :--- |
| `05e8dc6` | root docs split; this config's docs reduced to the three-document set |
