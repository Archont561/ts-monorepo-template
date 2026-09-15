---
name: test
description: Test generation and best practices — unit tests with bun:test and E2E with Playwright
---

# Test Generation

Generate and maintain tests using `bun:test` for unit and Playwright for E2E.

## When to use

- Adding new feature (need tests)
- Fixing bug (add regression test)
- Improving coverage
- Writing E2E flows

## Unit Tests (bun:test)

### Location

- `packages/external/tests/` — external package tests
- `packages/internal/tests/` — internal tests
- `apps/example/tests/` — example app tests
- `packages/tooling/tests/` — tooling tests

### Format

```typescript
import { describe, expect, test } from "bun:test";
import { greetUser } from "@src/index";

describe("greetUser", () => {
  test("greets by name", () => {
    expect(greetUser("Alice")).toBe("Hello, Alice!");
  });

  test("handles empty", () => {
    expect(greetUser("")).toBe("Hello!");
  });
});
```

### Commands

```bash
bun run test           # all via Turbo
bun run --filter @myorg/external test # single package
mbun test              # direct with config
bun run coverage       # coverage + merged LCOV
```

### Rules

- Use `bun:test`, not `vitest`, `jest`
- Live in `tests/` directories
- Use `@src/*` and `@tests/*` path aliases
- Don't import `@playwright/test` in unit tests

## E2E Tests (Playwright)

### Location

- `apps/example/e2e/` — E2E specs

### Format

```typescript
import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("Hello");
});
```

### Commands

```bash
bun run test:e2e       # with auto-skip
me2e                   # direct
me2e --ui              # UI mode
```

### Rules

- Use `@playwright/test`, not `bun:test`
- Don't import `bun:test` in E2E
- Place in `e2e/`, not `tests/`

## Coverage

- `bunfig.toml` — 80% line/function threshold
- Ignores: `*.test.ts`, `dist`, `node_modules`
- `mbun coverage` merges per-package LCOV

## References

- [Bun Config README](../../bun-config/README.md)
- [Playwright README](../../playwright/README.md)
