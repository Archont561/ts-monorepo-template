# Template Docs (template-only)

> VitePress site for the **template repository** itself. **Removed during scaffolding.**

This folder is **template-only** — it exists only in `Archont561/ts-monorepo-template`,
not in generated monorepos.

## What it is

- `docs/.vitepress/config.ts` — all site config (title, `base`, nav, sidebar, local search)
- `docs/index.md` — home page (VitePress `layout: home`)
- `docs/guide/` — introduction + config matrix
- `docs/status.md` + `docs/status.data.ts` — Status page (coverage, CI, versions)
- Deployed by `.github/workflows/template-docs.yml` to GitHub Pages
- Removed on `bun create` via `configs/template` `extraRemovals`

## Commands

```bash
bun run docs:dev       # vitepress dev docs
bun run docs:build     # vitepress build docs -> docs/.vitepress/dist
bun run docs:preview   # vitepress preview docs
bun run docs:site      # mdocs site — coverage + demo app + docs, one artifact
```

`docs:site` is what `template-docs.yml` runs. It is the only Pages deployment in
this repository, so it also carries everything else the site serves:

| Path | Produced by |
| :--- | :--- |
| `/` | `bun run docs:build` (VitePress) |
| `/status` | `docs/status.data.ts` (build-time data loader) |
| `/coverage/` | `mcoverage html --out docs/public/coverage` |
| `/example/` | `mpages build` → `apps/example/public`, copied into `dist/example` |

Because `docs/public/**` is copied to the artifact root, `docs/public/coverage/`
is generated (gitignored) — never commit into it.

## Status page

`docs/status.data.ts` is a VitePress **data loader**: it runs in Node at build
time and its default export becomes the `data` the page renders. It gathers
coverage from `mcoverage summary --json` and the repo slug from
`mpages base --json`, then reads package manifests, `node_modules` versions and
`git log` directly.

Two gotchas, both already handled — keep them in mind when editing:

- The loader is bundled into a cache dir before it runs, so the repo root must
  be found from `process.cwd()`, not `import.meta.url`.
- It must not `import { defineLoader } from "vitepress"`: the bundle is CJS and
  `vitepress` is ESM-only, which fails the build. `defineLoader` is types only.

`vitepress` is a root devDependency alongside the docs scripts. `sanitizePackageJson()`
in `configs/template/src/scaffolder.ts` strips both from generated monorepos, so a
scaffolded project never inherits a docs toolchain it has no docs for.

## Why VitePress and not static HTML?

The previous `docs/index.html` needed no build, but every edit was hand-written markup.
VitePress gives the template markdown pages, local search, last-updated timestamps and
edit links, at the cost of one build step in the deploy workflow.

## Rules

| Rule | Detail |
| :--- | :--- |
| `base` | `/ts-monorepo-template/` — required for a Pages project site |
| `ignoreDeadLinks` | `/coverage/` and `/example/` — generated into the site, not VitePress pages |
| `fetch-depth: 0` | Set in the workflow so `lastUpdated` can read git history |
| `cleanUrls: true` | `/guide/` instead of `/guide.html` |
| Search | `provider: "local"` — no external service |
| Output dir | `docs/.vitepress/dist/` — gitignored, never committed |

## Removal logic

In `configs/template/package.json`:

```json
{
  "scaffold": {
    "default": "always",
    "selfDestruct": true,
    "scriptsToRemove": ["docs:sync"],
    "removals": {
      "always": {
        "extraRemovals": ["docs", ".github/workflows/template-docs.yml"],
        "filePatternsToRemove": ["**/template-docs.yml", "**/docs/**"]
      }
    }
  }
}
```

The docs scripts (`docs:dev`, `docs:build`, `docs:preview`) and the `vitepress`
devDependency are removed by `sanitizePackageJson()` over in the scaffolder.
