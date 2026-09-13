## Git Hooks

- Lefthook is configured in `configs/lefthook/lefthook.yml`; the root `lefthook.yml` is a two-line wrapper that `extends:` it (regenerated on every install so a renamed scope still resolves).
- `msetup` (from `@myorg/lefthook`) regenerates the wrapper, links the config packages' `m`-prefixed bins into `node_modules/.bin`, and installs the hooks. The root `prepare` script invokes it directly (`bun configs/lefthook/setup.ts lefthook`) — the root ships zero `devDependencies`, so no bin is linked until `prepare` runs.
- Pre-commit: Biome formats staged files (`mbiome check --write {staged_files}`), and `actionlint` validates workflow files when they are staged.
- Commit-msg: `commitlint` validates Conventional Commits against `configs/commitlint/index.js`.