# CONTEXT.md — @myorg/pages

> Snapshot of this config's current state. Rules are in [AGENTS.md](./AGENTS.md), overview in [README.md](./README.md).

## Current state

- Opt-in (`confirm`, default `false`).
- In this repo `pages.yml` is **not generated**: `template-docs.yml` deploys the docs site produced by `mdocs site` (docs + `/coverage/` + `/example/`). Generated monorepos get `pages.yml` because they have no docs app.
- Official actions in use: `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`.
- Discovery reads `apps/*` and `packages/*` manifests for a `pages` field (`"pages": { "dir": "public" }`, `"pages": "public"`, or `true`).

## Decisions as outcomes

- **Discovery over configuration** — the Pages target list used to be hardcoded to `apps/example`; adding a second deployable app meant editing the config.
- **One deployer per site** — a second workflow uploading to Pages silently clobbers the first deployment, so generation is guarded rather than documented.

## Open

- No Pages deployment has been run from this sandbox; the URL and base-path behaviour is verified only by `mpages list`/`base` output.

## Recent changes

| Commit | What |
| :--- | :--- |
| `8b630bb` | Pages targets discovered from `package.json` instead of hardcoded |
| `d869bc2` | app port and image versions made overridable |
