---
name: playwright
description: E2E testing with Playwright — browser detection and auto-skip
---

# Playwright E2E Testing

E2E testing with Playwright for `apps/example`. Opt-in, enabled by default.

## When to use

- Testing user flows in browser
- Validating UI behavior
- Running E2E in CI
- Debugging E2E failures

## Commands

```bash
bun run test:e2e      # me2e → playwright with auto-skip
me2e                  # direct wrapper
me2e --ui             # UI mode
bunx playwright install # install browsers
```

## Config

- `apps/example/playwright.config.ts` — `testDir: e2e/`, `baseURL: http://localhost:3000`
- `me2e` bin detects browsers, auto-skips if missing
- Specs in `apps/example/e2e/`

## Writing Tests

```typescript
import { test, expect } from "@playwright/test";

test("homepage", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
});
```

## Do NOT

- Import `bun:test` in Playwright specs
- Import `@playwright/test` in unit tests
- Put E2E specs in `tests/` (use `e2e/`)

## References

- [Playwright README](../../playwright/README.md)
- [Playwright AGENT](../../playwright/AGENT.md)
