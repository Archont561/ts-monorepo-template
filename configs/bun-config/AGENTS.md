# AGENTS.md — @myorg/bun-config

## Rules

- Never add a `bunfig.toml` to a package. The shared config is the only one, and `mbun` passes it.
- Never run bare `bun test` for package work — use `bun run test` (Turbo) or `bun --filter <pkg> run test`, which end up in `mbun test`.
- The coverage **threshold** is owned by `@myorg/coverage` (`COVERAGE_THRESHOLD`); the value in `bunfig.toml` must stay in sync and is documented as a mirror, not the source.
- Reporting — HTML, artifacts, Pages and the CI gate — belongs to `@myorg/coverage`, not here. Do not add coverage reporting to this config.
- `mbun coverage` runs per-package reports only; the merge is a root concern (`bun run coverage`).

## Before marking a task done

- [ ] `bun run test` passes (Turbo runs `mbun test` per package)
- [ ] `bun run coverage` produces `coverage/lcov.info`
- [ ] Any threshold change is made in `configs/coverage/index.ts` **and** mirrored in `bunfig.toml`
