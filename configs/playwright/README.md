# @myorg/playwright

End-to-end testing with Playwright — enabled by default, and it skips itself when browsers are not installed.

## What it provides

- `@playwright/test` as a shared workspace dependency
- `playwright.config.ts` for the example app
- `me2e` — wraps `playwright test` with browser detection and graceful auto-skip

### Config highlights

| Setting | Value |
| :--- | :--- |
| `testDir` | `e2e/` |
| Browsers | Chromium, Firefox, WebKit |
| `baseURL` | `http://localhost:3000` (follows the app's configured port) |
| Missing browsers | Skipped, not failed |

## Usage

```bash
bun run test:e2e   # me2e → playwright test
me2e --ui          # UI mode
```

E2E specs live in `apps/example/e2e/`, never in `tests/`. Unit tests use `bun:test`, E2E uses `@playwright/test` — never import one in the other.

> [!NOTE]
> Opt-in, but **on by default**. When declined, the config, its workflow steps and the app's E2E specs are pruned together.
