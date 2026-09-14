# CONTEXT.md — @myorg/gitattributes

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Owns exactly one file — the root `.gitattributes`. No bin, no generated files.
- Binary today: `bun.lock`, `Cargo.lock`, images, `*.node`, coverage artefacts. Line endings: LF everywhere, explicitly LF for `*.sh`.
- Always-on (`default: always`).

## Decisions as outcomes

- **Lock files are binary to Git** — a 10 000-line lock diff hides the real change in every PR.

## Open

- As the native config grows, new generated artefact types (`*.wasm`, `wasi-worker.mjs`) may need entries; `*.wasm` is not yet listed.

## Recent changes

| Commit | What |
| :--- | :--- |
| `05e8dc6` | root docs split; this config's docs reduced to the three-document set |
