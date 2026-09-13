# @myorg/bun-config

> Shared Bun runtime, test, and coverage configuration.

## What it provides

- `bunfig.toml` — the single source of truth for test + coverage settings.
- `mbun` — single bin for this package:
  - `mbun <bun cmd>` — wraps `bun`; passes `--config=<configs/bun-config/bunfig.toml>` for
    `bun test` (other commands pass through unchanged).
  - `mbun coverage` — runs `mturbo coverage` (per-package coverage in dependency
    order) then merges the per-package `coverage/lcov.info` reports into a single
    `coverage/lcov.info` with `lcov-result-merger --prepend-source-files`.

### Config highlights (`bunfig.toml`)

- Coverage always on: LCOV + text reporters → `coverage/lcov.info`.
- 80% line/function threshold; test/config/bundle/`e2e` paths ignored.

## Usage

```bash
bun run test       # mturbo test   (Turbo runs per-package mbun test)
bun run coverage   # mbun coverage (mturbo coverage + merged root lcov.info)
```

## Rules

- No per-package `bunfig.toml` symlinks — the shared config is always passed
  explicitly, so coverage output stays deterministic.
- Bun uses JavaScriptCore (JSC), not V8: never use Node coverage APIs, and
  don't expect `bun test --coverage` to capture separately spawned processes.

See [AGENT.md](./AGENT.md) for the agent-facing reference.