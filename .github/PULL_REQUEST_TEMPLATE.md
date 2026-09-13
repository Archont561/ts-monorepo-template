<!-- PULL_REQUEST_TEMPLATE.md — prepopulates every PR -->
## Summary

<!-- What does this PR do? Link issues: Closes #123 -->

## Changes

- [ ] Feature / fix / docs / chore
- [ ] Breaking change?

## Checklist

- [ ] `bun run check:fix` passes (Biome lint + format)
- [ ] `bun run typecheck` passes
- [ ] `bun run test` passes
- [ ] `bun run coverage` — coverage not decreased (80% threshold)
- [ ] Added tests for new functionality
- [ ] Updated docs (`README.md`, `AGENTS.md`, `configs/*/README.md`) if needed
- [ ] `bun run docs:sync` if you edited `configs/*/*.steps.yml` or `*.base.yml`
- [ ] Conventional Commit format (`feat:`, `fix:`, `chore:`, etc.) — checked by commitlint

## Screenshots / Demo (if UI)

<!-- Add before/after screenshots or Loom link -->

## Notes for Reviewers

<!-- Anything reviewers should focus on? -->
