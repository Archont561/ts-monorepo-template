# @myorg/example

> Example [Bun.serve](https://bun.sh/docs/api/http) HTTP server demo.

## What it is

- A Bun.serve app (`src/index.ts`) with routes in `src/routes.ts`.
- Imports only from `@myorg/external` — never from `@myorg/internal`.
- **Not bundled**: Bun runs TypeScript directly (`bun --hot src/index.ts`).

## Development

```bash
bun run dev       # bun --hot src/index.ts
bun run start     # bun src/index.ts
bun run typecheck # tsc --noEmit
```

Server loads at [http://localhost:3000](http://localhost:3000).

## E2E Testing

Playwright specs live in `e2e/` and run against this app:

```bash
bun run test:e2e   # me2e  (auto-skips when browsers are missing)
```

Config is in `playwright.config.ts`; shared primitives come from
`@myorg/playwright`.