# @myorg/bun-config

The shared Bun runtime configuration — tests, coverage and a `mbun` wrapper that always points Bun at it.

## What it provides

- `bunfig.toml` — the single source of truth for test and coverage settings
- `mbun` — one bin that runs Bun with that config, so no package needs its own `bunfig.toml`

> [!NOTE]
> There are no per-package `bunfig.toml` symlinks. The shared config is passed explicitly by `mbun`.

### Bins

| Bin | Wraps | Description |
| :--- | :--- | :--- |
| `mbun <cmd>` | `bun` | Injects `--config=bunfig.toml` for `bun test` |
| `mbun coverage` | `mturbo coverage` | Per-package coverage only — `bun run coverage` adds `mcoverage merge` |
| `mbun clean:modules` | — | Removes workspace `node_modules` dirs, keeps the root one |

### Config highlights (`bunfig.toml`)

| Setting | Value |
| :--- | :--- |
| Coverage reporters | `text` + `lcov` → `coverage/lcov.info` |
| Coverage threshold | `lines = 0.80`, `functions = 0.80` (mirrors `COVERAGE_THRESHOLD` in `@myorg/coverage`) |
| Skip test files | Yes |
| Ignores | tests, `dist`, `node_modules`, `configs/*`, CLI entry points, `*.node`, `target/**`, devcontainer |

## Usage

```bash
bun run test       # mturbo test — each package runs its own `mbun test`
bun run coverage   # mturbo coverage && mcoverage merge → coverage/lcov.info
bun run coverage:html   # genhtml report at coverage/html/
```

Rendering the HTML report needs `lcov` installed (`mcoverage setup` installs it, or `sudo apt-get install -y lcov`).
