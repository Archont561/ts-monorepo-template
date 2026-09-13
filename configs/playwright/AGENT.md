## E2E Testing

- E2E tests use Playwright and live in `e2e/` directories. The spec lives in `apps/example/e2e/` and is configured in `apps/example/playwright.config.ts`.
- `me2e` (from `@myorg/playwright`, `configs/playwright`) runs `playwright test` against the app config from the repository root — no flags needed.
- `me2e` auto-skips (exit 0) when no browser is installed; install browsers once with `bunx playwright install`.
- Run with `bun run test:e2e` (Turbo runs every workspace's `test:e2e`).
- Playwright's `page.coverage` captures Chromium V8 coverage only — it never reaches into Bun's JSC runtime; merge coverage at the LCOV layer only.
- Do not `import "bun:test"` in Playwright specs, and do not `import "@playwright/test"` in unit tests.