# AGENT.md - @myorg/badges

> Badges for CI, coverage, license across all READMEs.

## What it provides

- Root README badges: CI (workflow status), Coverage (Codecov dynamic + graph + HTML link), License, Bun, TypeScript
- Packages: external (CI + Coverage + npm version + License + Bun), internal (CI + Coverage + License + Bun), native (CI + Coverage + Rust + License + Bun)
- Apps: example (CI + Coverage + Bun + License)
- Coverage flow: `mbun coverage` + `mnative llvm-cov` → merged LCOV → Codecov upload + `mcoverage html` → artifact + Pages `/coverage/` or standalone coverage.yml
- Docs: how to update badges after scaffolding (`Archont561/ts-monorepo-template` → `YOUR_ORG/YOUR_REPO`, `@myorg` → scope)

## For agents

- Badges are in README.md files at root and in `packages/*/README.md`, `apps/*/README.md` — not generated via mdocs, static reference files.
- When you change coverage threshold or add new workflow, update badge URLs and README tips.
- After scaffolding, `@myorg` in npm version badge is replaced via `replaceScopePlaceholders()` (hardcoded list includes `packages/*/README.md`, `apps/*/README.md`).
- GitHub owner `Archont561/ts-monorepo-template` in CI/coverage badges is **not** auto-replaced — user must update manually (add note in README tip). Could add owner prompt in collector if needed, but current is manual update.
- Always included (`default: always`) — baseline repo health.
- Coverage badges require Codecov token for private repos; public repos work without token (but `fail_ci_if_error: false`).

## Files

- `README.md` (root, monorepo section) — badges row after title
- `packages/external/README.md` — badges row
- `packages/internal/README.md` — badges row
- `packages/native/README.md` — badges row
- `apps/example/README.md` — badges row
- `configs/badges/README.md` + `AGENT.md` — docs
- `configs/badges/package.json` — scaffold metadata (always)

## Badge URLs (template repo)

- CI: `https://github.com/Archont561/ts-monorepo-template/actions/workflows/ci.yml/badge.svg?branch=main`
- Codecov: `https://img.shields.io/codecov/c/github/Archont561/ts-monorepo-template?logo=codecov&label=Coverage`
- Codecov graph: `https://codecov.io/gh/Archont561/ts-monorepo-template/graph/badge.svg`
- Coverage HTML: `https://img.shields.io/badge/Coverage-HTML-brightgreen?logo=github` → `./coverage/html/` or Pages `/coverage/`
- License: `https://img.shields.io/badge/License-MIT-yellow.svg`
- Bun: `https://img.shields.io/badge/Bun-1.4.2-black?logo=bun`
- npm: `https://img.shields.io/npm/v/@myorg/external?logo=npm&color=blue`
- Rust: `https://img.shields.io/badge/Rust-stable-orange?logo=rust`
