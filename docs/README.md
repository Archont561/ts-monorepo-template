# Template Docs (template-only)

> Static GitHub Pages site for the **template repository** itself. **Removed during scaffolding**.

This folder is **template-only** — it exists only in `Archont561/ts-monorepo-template`, not in generated monorepos.

## What it is

- `docs/index.html` — static landing page (no build) explaining template usage, config matrix, scaffolding flow
- Deployed via `.github/workflows/template-docs.yml` to GitHub Pages (template-only workflow)
- Removed on `bun create` via `configs/template/package.json` `extraRemovals: ["docs", ".github/workflows/template-docs.yml"]`

## Why template-only?

Generated monorepos have their own Pages setup:
- `configs/pages` → `pages.yml` deploys `apps/example/public` + `/coverage/` when opt-in
- This `docs/` is for **template documentation**, not example app

If you scaffold a new monorepo, you won't see `docs/` — that's intentional.

## How to add your own template docs

1. Put static files in `docs/` (HTML, MD, assets)
2. Ensure workflow `.github/workflows/template-docs.yml` exists and is template-only (removed via scaffold)
3. Enable Pages in repo Settings → Pages → Source: GitHub Actions
4. On push to `main`, workflow deploys `docs/` to Pages

### Optional: VitePress / Astro

If you want a full docs framework:

```bash
bun add -D vitepress
# create docs/.vitepress/config.ts
# build: vitepress build docs -> docs/.vitepress/dist
# update workflow to build before upload
```

But keep it simple for template-only — static HTML avoids extra deps in template.

## Removal logic

In `configs/template/package.json`:

```json
{
  "scaffold": {
    "default": "always",
    "selfDestruct": true,
    "removals": {
      "always": {
        "extraRemovals": ["docs", ".github/workflows/template-docs.yml"],
        "filePatternsToRemove": ["**/template-docs.yml", "**/docs/**"]
      }
    }
  }
}
```

Or simpler: add to `extraRemovals` in `selfDestruct` path (handled in `scaffolder.ts`).

Currently implemented via `extraRemovals` in template's scaffold metadata.
