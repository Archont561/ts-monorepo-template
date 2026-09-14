# AGENTS.md — @myorg/playwright

## Rules

- Never import `bun:test` in an E2E spec, and never import `@playwright/test` in a unit test.
- E2E specs live in `apps/example/e2e/`; unit tests live in `tests/` directories. Turbo runs the second, `me2e` runs the first.
- Missing browsers mean **skip**, not fail — CI installs them, local machines may not have them, and `bun run test:e2e` must stay green either way.
- Keep E2E tests on user-visible behaviour through the running server; do not reach into internals.
- Do not add an E2E step to the unit-test workflow — they are separate tasks with separate browser requirements.

## Before marking a task done

- [ ] New specs under `e2e/`, not `tests/`
- [ ] `bun run test:e2e` exits 0 (skipping counts as passing)
- [ ] No cross-imports between the two test runners
