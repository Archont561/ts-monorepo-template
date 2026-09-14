# @myorg/turbo

Task orchestration. Package-level work — build, dev, test, coverage, typecheck — runs through Turbo, so the root scripts stay one word long and dependency order comes from the graph rather than from hand-written sequences.

## What it provides

- `turbo` as a shared workspace dependency
- `turbo.base.json` — the task graph (there is no root `turbo.json`)
- `mturbo` — Turbo with `--root-turbo-json=configs/turbo/turbo.base.json` baked in

> [!NOTE]
> Every root script delegates to `mturbo`. Packages decide *how* a task runs; Turbo decides *when* and caches the result.

### Task graph

| Task | Depends on | Output | Cached |
| :--- | :--- | :--- | :---: |
| `build` | `^build` | `dist/` | ✅ |
| `typecheck` | `^build` | — | ✅ |
| `test` | `^build` | `coverage/` | ✅ |
| `coverage` | `^build` | `coverage/lcov.info` | ✅ |
| `dev` | — | — | ❌ persistent |
| `preview` | `build` | — | ❌ persistent |

`^build` means "my dependencies have built", which is why `packages/internal` builds before `packages/external` and both before `apps/example`.

## Usage

```bash
bun run dev          # every package in watch mode (persistent)
bun run build        # dependency order, cached
bun run typecheck
bun run test
bun run coverage
```

Each package implements a task its own way — `mbunup` for a library, `mbun test` for unit tests, `mnative napi:build` for native, `me2e` for E2E, `munocss build` for CSS. The root does not know or care.
