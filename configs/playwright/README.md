# @myorg/playwright

> Shared Playwright E2E testing.

## What it provides

- `@playwright/test` as a shared devDependency.
- `e2e.ts` — `me2e`, a CLI alias that:
  - auto-skips (exit 0) with a hint when no browser is installed;
  - runs `playwright test` against `apps/example/playwright.config.ts` from the
    repository root, so it works with zero flags.

## Usage

```bash
bunx playwright install   # one-time browser download
bun run test:e2e           # run the E2E suite (Turbo-driven)
```

## Rules

- Keep E2E config in the consuming app (`apps/example/playwright.config.ts`); this
  package ships the shared primitives (browser detection, reporter setup).
- Playwright specs import from `@playwright/test`; unit tests import from
  `bun:test`. Never mix.
- Playwright's `page.coverage` is Chromium V8 coverage only — it never reaches
  into Bun's JSC runtime, so coverage merges happen at the LCOV layer only.

See [AGENT.md](./AGENT.md) for the agent-facing reference.