# Contributing

## Prerequisites

- [Bun](https://bun.sh) `1.3.11` (pinned in `package.json` as `packageManager`).
  This repo's `bun.lock` uses `configVersion: 1`, which selects Bun's
  **isolated** linker. On Bun 1.3.11/Linux the isolated linker hits
  [oven-sh/bun#27110](https://github.com/oven-sh/bun/issues/27110): `bun install`
  populates `node_modules/.bun` but creates **no top-level symlinks**, so nothing
  is runnable. The root `bunfig.toml` works around this with `linker = "hoisted"`.

## Getting started

```bash
bun install        # installs deps, links the m-command bins, installs git hooks
bun run dev        # watch all packages (Turbo)
```

## Recovering from a broken install

`bun install` alone is **not** enough after a linker-strategy change or a
failed/interrupted install. Stale nested `node_modules/` directories can survive
inside the workspace source trees (e.g. `configs/template/node_modules`) and
shadow the good hoisted copies during module resolution.

Use the canonical recovery script, which removes **all** `node_modules`
(including the stale nested ones) before reinstalling:

```bash
bun run reinstall   # == bun run clean:modules && bun install
```

`clean:modules` deletes every `node_modules` directory in the repo (root and
nested), so the subsequent `bun install` starts from a clean slate and rebuilds
the correct hoisted layout.

## Development commands

| Command | Description |
| ------- | ----------- |
| `bun run dev` | Watch all packages (Turbo) |
| `bun run build` | Build all packages (Turbo) |
| `bun run test` | Run all unit tests (Turbo) |
| `bun run coverage` | Unit coverage, merged LCOV at `coverage/lcov.info` |
| `bun run check` / `check:fix` | Biome lint + format |
| `bun run typecheck` | Type-check all packages |
| `bun run docs:sync` | Regenerate `AGENTS.md`, `README.md`, workflows from `configs/*` |
| `bun run reinstall` | Clean all `node_modules` and reinstall |

## `configs/*` convention

Every shared tool lives in its own `configs/<tool>/` package and exposes an
`m`-prefixed CLI bin (e.g. `mturbo`, `mbiome`) that bakes in the shared config
paths. Bins are declared via the package `bin` field and linked by Bun's
package manager — there is no `setup.ts` shim generator. Adding a new config
requires only creating the package and running `bun install`.
