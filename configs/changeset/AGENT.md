## Releases

- This monorepo versions and publishes with Changesets. Config is in `configs/changeset/config.json` (copied to `.changeset/config.json` by `mchangeset init` if missing; never overwritten after that).
- Only `@myorg/external` is published. Everything else — `@myorg/internal`, all `configs/*`, and `apps/*` — is listed under `ignore`.
- Create a changeset when you modify `@myorg/external`: new features, bug fixes, breaking changes, or new subpath exports. No changeset needed for private packages, docs, or CI.
- Workflow:
  ```
  bun run changeset   # mchangeset — select external, pick patch/minor/major, write summary
  ```
  PRs with `.changeset/*.md` merge to `main`; the Changesets action opens a "Version Packages" PR; merging it runs `bun run release` (`mchangeset publish`) to publish to npm.
- Manual release: `bun run version` → `bun run build` → `bun run release`.