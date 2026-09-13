# AGENT.md - @myorg/gitattributes

> `.gitattributes` — Git file handling.

## What it provides

- `.gitattributes` at repo root
- `* text=auto eol=lf`, `*.sh eol=lf`, binary for lock files, images, `.node`, coverage.

## For agents

- Do not create `.gitattributes` manually elsewhere — this package owns it.
- If you add a new binary type (e.g. `.wasm`), add it to `.gitattributes` as `binary`.
- Always included.

## Files

- `.gitattributes` at root
- `configs/gitattributes/package.json`
