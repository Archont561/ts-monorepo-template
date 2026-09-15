# Introduction

This docs app (`apps/template-docs`) is **template-only**. It is a [VitePress](https://vitepress.dev)
site deployed to GitHub Pages for `Archont561/ts-monorepo-template`, and it is
deleted during scaffolding via `configs/template` self-destruct.

## Scaffolding

```bash
bun create Archont561/ts-monorepo-template my-app
cd my-app
bun install
bun run dev              # http://localhost:3000
bun run test:template    # tests covering every opt-in combination
```

During scaffolding, `@myorg` is replaced with your scope, `TEMPLATE-ONLY` blocks
are stripped, disabled configs are pruned, and the CI workflows are regenerated
from whichever configs survive.

## Opt-in configs

| Config | Default | Bin |
| :--- | :--- | :--- |
| `playwright` | `true` | `me2e` |
| `codeql` | `true` | `mcodeql` |
| `skills` | `false` | `mskills` |
| `devcontainer` | `false` | — |
| `pages` | `false` | — |
| `trivy` | `false` | `mtrivy` |
| `stale` | `false` | — |
| `native` | `none` (`publish` / `docker`) | `mnative` |

## Day-to-day commands

```bash
bun run check            # Biome lint + format
bun run typecheck        # tsc via mtsc, per package
bun run test             # unit tests
bun run test:e2e         # Playwright (auto-skips without browsers)
bun run coverage         # merged LCOV
bun run build            # Bunup, orchestrated by Turbo
bun run docs:sync        # regenerate workflows from configs/*

# One package at a time
bun --filter @myorg/external run test:watch
bun --filter @myorg/external run build
```

CI runs the same set in this order: lint → test → coverage → package health
(`publint` + `arethetypeswrong` on every non-private package) → E2E →
typecheck → build. Dependencies and the Turbo cache are restored before
install, and superseded pull-request runs are cancelled automatically.

## Working on these docs

```bash
bun run docs:dev         # dev server with HMR
bun run docs:build       # -> apps/template-docs/dist
bun run docs:preview     # preview the built output
```

Built output and VitePress' cache are gitignored — never commit
`apps/template-docs/dist/`.
