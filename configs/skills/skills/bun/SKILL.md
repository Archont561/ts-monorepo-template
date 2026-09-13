---
name: bun
description: Bun runtime, package manager, test runner, and coverage — the only runtime for this monorepo
---

# Bun Runtime

This monorepo uses Bun as runtime, package manager, test runner, and bundler. No npm, pnpm, yarn, or Node.

## When to use

- Installing dependencies
- Running scripts
- Running tests
- Coverage collection
- Hot-reloading dev servers

## Key Facts

- Bun executes TypeScript natively — no compilation for apps
- `bun install` is the only supported install command
- `bun test` uses `bun:test` (JSC, not V8)
- `bun --hot src/index.ts` for dev servers
- Coverage uses LCOV, not V8 APIs

## Commands

```bash
bun install              # install deps + link m-bins + lefthook
bun run <script>         # run package.json script
bun run dev              # watch all via Turbo
bun run build            # build all
bun run test             # unit tests via mturbo
bun run coverage         # mbun coverage → merged LCOV
bun test                 # direct test run
bun --hot src/index.ts   # hot reload
```

## Config

- `configs/bun-config/bunfig.toml` — single source of truth for test + coverage
- `mbun` bin wraps `bun` and injects config for `bun test`
- `mbun coverage` runs `mturbo coverage` then merges LCOV

## Do NOT

- Use `npm`, `pnpm`, `yarn`, `npx`
- Use `node` to run scripts
- Use Node coverage APIs (Bun uses JSC)

## References

- [Bun Config README](../../bun-config/README.md)
- [Bun Config AGENT](../../bun-config/AGENT.md)
