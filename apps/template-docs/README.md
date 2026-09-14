# Template Docs (template-only)

> VitePress site for the **template repository** itself. **Removed during scaffolding.**

This app is **template-only** — it exists only in `Archont561/ts-monorepo-template`,
not in generated monorepos.

## What it is

- `.vitepress/config.mts` — all site config (title, `base`, nav, sidebar, local search, `outDir: "dist"`)
- `index.md` — home page (VitePress `layout: home`)
- `guide/` — introduction + config matrix
- `status.md` + `status.data.ts` — Status page (coverage, CI, versions)
- Deployed by `.github/workflows/template-docs.yml` to GitHub Pages
- Removed on `bun create` via `configs/template` `extraRemovals`

The app is a workspace like any other: `vitepress` is its own devDependency, its
`build` runs through Turbo, and the bundled static site lands in `dist/` — the
same convention as every other app, which is what the Pages workflow uploads.

## Commands

```bash
bun run docs:dev       # mturbo dev --filter=@myorg/template-docs
bun run docs:build     # mturbo build --filter=@myorg/template-docs -> apps/template-docs/dist
bun run docs:preview   # mturbo preview --filter=@myorg/template-docs (serves dist/)
bun run docs:site      # mdocs site — coverage + demo app + docs, one artifact
```

`docs:site` is what `template-docs.yml` runs. It is the only Pages deployment in
this repository, so it also carries everything else the site serves:

| Path | Produced by |
| :--- | :--- |
| `/` | `docs:build` (VitePress, via Turbo) |
| `/status` | `status.data.ts` (build-time data loader) |
| `/coverage/` | `mcoverage html` → `coverage/html`, copied into `dist/coverage` after the build |
| `/example/` | `mpages build` → `.pages/`, copied into `dist/example` |

Coverage and the demo app are assembled into `dist/` **after** the VitePress
build on purpose: they are regenerated on every site build, and gitignored files
are invisible to Turbo's hash — a build input the cache cannot see would make
`docs:build` replay stale artifacts.

## Status page

`status.data.ts` is a VitePress **data loader**: it runs in Node at build
time and its default export becomes the `data` the page renders. It gathers
coverage from `mcoverage summary --json` and the repo slug from
`mpages base --json`, then reads package manifests, `node_modules` versions and
`git log` directly.

Two gotchas, both already handled — keep them in mind when editing:

- The loader is bundled into a cache dir before it runs, so the repo root must
  be found from `process.cwd()`, not `import.meta.url`.
- It must not `import { defineLoader } from "vitepress"`: the bundle is CJS and
  `vitepress` is ESM-only, which fails the build. `defineLoader` is types only.

## Why VitePress and not static HTML?

The previous `docs/index.html` needed no build, but every edit was hand-written markup.
VitePress gives the template markdown pages, local search, last-updated timestamps and
edit links, at the cost of one build step in the deploy workflow.

## Rules

| Rule | Detail |
| :--- | :--- |
| `base` | `/ts-monorepo-template/` — required for a Pages project site |
| `dest` | `dist` — the app's bundled static site, uploaded by the workflow |
| `ignoreDeadLinks` | `/coverage/` and `/example/` — assembled into `dist/`, not VitePress pages |
| `fetch-depth: 0` | Set in the workflow so `lastUpdated` can read git history |
| `cleanUrls: true` | `/guide/` instead of `/guide.html` |
| Search | `provider: "local"` — no external service |
| Output dir | `apps/template-docs/dist/` — gitignored, never committed |

## Removal logic

In `configs/template/package.json`:

```json
{
  "scaffold": {
    "default": "always",
    "selfDestruct": true,
    "scriptsToRemove": ["docs:sync", "docs:site", "docs:dev", "docs:build", "docs:preview"],
    "removals": {
      "always": {
        "extraRemovals": ["apps/template-docs", ".github/workflows/template-docs.yml"],
        "filePatternsToRemove": ["**/template-docs.yml", "**/template-docs/**"]
      }
    }
  }
}
```

The whole toolchain — `vitepress` devDependency, `build`/`dev`/`preview` scripts,
`tsconfig.json` — lives inside the app, so deleting the directory removes all of
it. Only the root `docs:*` delegates need a separate entry, and they are listed
in `scriptsToRemove`.
