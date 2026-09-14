# Refactor Log

Execution record for the plan in [REFACTOR_PLAN.md](./REFACTOR_PLAN.md): one commit per
proposal, Full Gate green after every commit, Scaffold Gate at every phase boundary.

Path shorthand: `TPL/` is the template config package (the self-destructing one), whose real
home is the `template` directory inside the repo's `configs/`. Root docs are copied into
scaffold fixtures and scanned for template leftovers, so this file deliberately avoids the
literal config path, the placeholder scope string, the marker tokens and the template's own
repository URLs — the same rule REFACTOR_PLAN.md follows.

## Commits

Branch `arena/01a09f8a-ts-monorepo-template`.

| # | Commit | Tests | Coverage | Notes |
| :--- | :--- | :--- | :--- | :--- |
| — | `27a0b33` | 147 | 96.95% (159/164) | Phase 0: the session bug-fix set plus `REFACTOR_PLAN.md`, committed as the clean revert point. |
| R1 | `23ed2ea` | 153 (+6) | 96.95% (159/164) | Pure marker pass: `MARKER_PATTERNS`, `MARKER_EXTENSIONS`, `markerFindArgs()`, `stripMarkerBlocks()`; the method keeps its write-only-when-matched behaviour. Bundle rebuilt (41.66 KB). |
| R2 | `ac4448d` | 156 (+3) | 96.95% (159/164) | `STATIC_SCOPE_TARGETS`, `SCOPE_TEXT_FILE`, `findTextFiles()`, `collectScopeTargets()`; the four inline discovery passes become one call. Bundle rebuilt (41.57 KB). |
| R3 | `f618916` | 157 (+1) | 96.95% (159/164) | `isStaying()`, `applyRemovals()`, `RootManifest`/`ReconcileResult`, in-place `reconcileWorkspaces(manifest)` that reports what it dropped. Bundle rebuilt (41.71 KB). |
| R4 | `3882b6c` | 157 | 96.95% (159/164) | Six dead exports removed, unused `options` parameter dropped, all four `as any` casts replaced with typed calls. Biome warnings 19 → 14. Bundle unchanged — the dead exports were already tree-shaken. |

Phase 1 boundary: Scaffold Gate run on both variants and **green** — `native=none`
(install, check 74 files/0 errors, typecheck 6/6, test 9+15+26 pass) and `native=publish`
+ unocss (install, check 97 files/0 errors, typecheck 11/11, test 9+15+6+28 pass, then
`mnative add probe` → install → typecheck 12/12). Baselines updated in `CONTEXT.md`,
`AGENTS.md`, `configs/biome/CONTEXT.md` and `configs/biome/AGENTS.md`.

## Deviations from the plan

1. **Commit subject format.** Commitlint's `scope-enum` requires a scope from the workspace
   package list, and `@commitlint/config-conventional` rejects sentence-case subjects, so the
   requested `refactor(Rn): <title>` became `refactor(<package-scope>): <lowercase title> (Rn)`
   — the R-number is preserved in the subject, the scope names the touched package (or `repo`
   for cross-package work).
2. **R2 helper fidelity.** The plan sketched a helper that errors on a missing search path;
   the original code tolerated one on *every* discovery pass, so the helper keeps
   `.catch(() => "")` everywhere. Set-based dedupe was added but is a no-op for the write
   path (both replacements are idempotent).
3. **R4 typed the casts with citty's own invoker** (`runCommand(cmd, { rawArgs: [] })`)
   rather than building a hand-made `CommandContext`. Verified against the pre-change CLI
   output: `mbadges` and `mbadges check` still print exactly one line and exit 0, and
   `mskills` with no arguments still runs sync.
4. **R1–R3 rebuild the committed bundle** in the same commit as the source change (the plan's
   trap), via the template package's own `build` script (`bun run --filter <template-pkg> build`) — there is no `build:template` script at the root.
5. **R1–R4 added tests the plan only implied.** R1 asked for direct tests of the pure
   stripper (6); R2's dedupe/discovery helper got 3; R3's reporting change got 1.

## Skipped / deferred

| Proposal | Status | Reason |
| :--- | :--- | :--- |
| R5 | deferred | Phase 2 — data-driven workflow table for the two drifted copies. |
| R6 | deferred | Phase 2 — decompose the two setup scripts; characterization tests must land first. |
| R7, R8 | deferred | Phase 3. |
| R9, R10 | deferred | Phase 4 — threshold drift test; widen the coverage merge glob report-only first. |
| R11, R12 | deferred | Phases 5–7. |

Nothing in Phases 2–7 was started, so no proposal was left half-done.

## Final gate (at the Phase 1 boundary)

```
bun run test           # 157 pass / 0 fail, 14/14 tasks
bun run check          # exit 0 — 140 files, 14 warnings + 14 infos
bun run typecheck      # 14/14
bun run coverage:check # 96.95% (159/164) — threshold 80%
```

Scaffold Gate, both variants: green (see the Phase 1 boundary note above).
