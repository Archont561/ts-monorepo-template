## Bun Runtime & Test Coverage

- `@myorg/bun-config` (`configs/bun-config`) owns `bunfig.toml`: coverage on for `bun test`, LCOV + text reporters, `coverage/lcov.info` output, 80% line/function threshold, and ignore patterns for test/bundle/config files.
- `mbun` is the single bin for this package: wraps `bun` and passes `--config` for `bun test` (other commands pass through); `mbun coverage` runs `mturbo coverage` (Turbo runs every workspace's `coverage` script in dependency order) and merges the per-package LCOV reports into a single root report.
- `bun run test` → `mturbo test` (Turbo runs each package's `mbun test`; `e2e/` Playwright specs are excluded by the config ignore patterns).
- `bun run coverage` → `mbun coverage` → `mturbo coverage` + a merged `coverage/lcov.info`.
- No per-package `bunfig.toml` symlinks; the shared config is always passed explicitly.
- **Coverage rules**: Bun uses JavaScriptCore, not V8 — never use `NODE_V8_COVERAGE`, `v8.takeCoverage()`, or `Profiler.takePreciseCoverage`. `bun test --coverage` only tracks code executed within the test process; use in-process integration tests for server-side coverage.