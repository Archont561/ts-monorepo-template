# AGENT.md - @myorg/editorconfig

> `.editorconfig` — consistent editor settings.

## What it provides

- `.editorconfig` at repo root
- `root = true`, `lf`, `utf-8`, `2-space` (4 for Rust), `trim_trailing_whitespace`
- No CLI, no build step — editors read it natively.

## For agents

- Do not create root-level editor config files manually — this package owns `.editorconfig`.
- If you need to change indent or line endings, edit `configs/editorconfig/.editorconfig` template or root `.editorconfig` and run `bun install` if setup copies.
- Always included (`default: always`).

## Files

- `.editorconfig` at repo root (source of truth)
- `configs/editorconfig/package.json` — scaffold metadata
