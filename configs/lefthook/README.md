# @myorg/lefthook

> Git hooks for the monorepo, configured once.

## What it provides

- `lefthook` as a shared devDependency.
- `lefthook.yml` — hooks that are merged into the root wrapper on install.
- `msetup` — regenerates the root `lefthook.yml` wrapper, re-links the
  `m`-prefixed CLI bins into `node_modules/.bin`, and installs the hooks.

### Hooks

| Hook | Command |
| ---- | ------- |
| pre-commit | `mbiome check --write {staged_files}` (formats staged files) |
| pre-commit | `bun run ci:lint` when workflow files are staged |
| commit-msg | `bunx commitlint --config configs/commitlint/index.js --edit {1}` |

## Lifecycle

The root `prepare` script invokes `bun configs/lefthook/setup.ts lefthook` —
it runs on every `bun install`. Because the root ships zero
`devDependencies`, the wrapper regeneration + bin linking are what make the
`m`-commands resolvable through `node_modules/.bin`.

Use `msetup lefthook` directly to re-apply after changing hooks.

See [AGENT.md](./AGENT.md) for the agent-facing reference.