# @myorg/pages

Opt-in GitHub Pages deployment where **what gets deployed is discovered, not hardcoded**: any workspace package that declares a `pages` field in its own `package.json` is published.

## What it provides

- A `confirm` scaffold prompt — *Set up GitHub Pages deployment?*
- `pages.base.yml` skeleton with the required Pages permissions (`pages: write`, `id-token: write`), `concurrency: group pages` and the `github-pages` environment
- `mpages` CLI — `build` stages the artifact, `base` reports the URL and injects the base path, `list` shows what was discovered

## Usage

```bash
mpages list     # which packages declare a Pages artifact
mpages build    # build them and stage into .pages/
mpages base     # repo name + Pages URL (--inject rewrites absolute href/src)
```

A package opts in from its own manifest:

```json
{ "pages": { "dir": "public" } }
```

`"pages": "public"` and `"pages": true` are also accepted. One package deploys to the site root; several are nested under `/<name>/`. CSS is **not** built here — the app that owns the UnoCSS config builds it in its own `build` script.

> [!NOTE]
> This repository is the exception: the template-only docs site owns Pages (`template-docs.yml` → `mdocs site`), so `docs:sync` does not generate `pages.yml` here — one site, one deployer. Generated monorepos have no `docs/`, so they get `pages.yml` whenever Pages is enabled.

### One-time setup

Settings → Pages → Source → **GitHub Actions**. The `github-pages` environment is created automatically; add a protection rule so only `main` can deploy.

### URLs

| Repo | URL |
| :--- | :--- |
| `username.github.io` | `https://username.github.io` |
| Any other repo | `https://username.github.io/repo-name` |
| Custom domain | `https://yourdomain.com` |
