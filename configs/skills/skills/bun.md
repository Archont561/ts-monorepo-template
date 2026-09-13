# Bun Runtime

This project uses Bun as the runtime, package manager, and test runner.

## Key Facts
- Bun executes TypeScript natively — no compilation step for apps.
- `bun install` is the only supported package manager command.
- `bun test` runs tests using `bun:test`.

## Commands
- `bun run <script>` — run a package.json script
- `bun test` — run unit tests
- `bun --hot src/index.ts` — hot-reloading dev server

## Do NOT
- Use `npm`, `pnpm`, or `yarn`.
- Use `node` to run scripts.