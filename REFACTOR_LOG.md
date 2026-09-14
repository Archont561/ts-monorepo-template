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
| — | `846869f` | 157 | 96.95% (159/164) | Phase 1 boundary: baselines in `CONTEXT.md`/`AGENTS.md`/biome docs + this log. |
| R5 | `4b29934` | 158 (+1) | 96.95% (159/164) | One workflow table for both entry points: `regenerateCI()` delegates to `regenerateAll()`, which keeps its exact semantics behind a `templateDocsSite` option. Bundle rebuilt (42.10 KB). |
| R6a | `e6d58da` | 167 (+9) | 96.95% (159/164) | Characterization tests for both setup scripts, committed **before** the refactor: fixture trees in the OS temp dir, byte-identical on a second run. Both config packages gained a `test` task — the suite is 16 turbo tasks from here on. |
| R6b | `7f943c3` | 167 | 96.95% (159/164) | `main()` decomposed into named steps (native 217 → 22 lines, unocss 121 → 12). Proven identical against the pre-refactor scripts on four fixtures: trees and console output byte-for-byte equal. |

Phase 1 boundary: Scaffold Gate run on both variants and **green** — `native=none`
(install, check 74 files/0 errors, typecheck 6/6, test 9+15+26 pass) and `native=publish`
+ unocss (install, check 97 files/0 errors, typecheck 11/11, test 9+15+6+28 pass, then
`mnative add probe` → install → typecheck 12/12). Baselines updated in `CONTEXT.md`,
`AGENTS.md`, `configs/biome/CONTEXT.md` and `configs/biome/AGENTS.md`.

Phase 2 boundary: Scaffold Gate **green** again — `native=none` (check 74 files/0 errors,
typecheck 6/6, test 6/6 tasks) and `native=publish` + unocss (check 99 files/0 errors,
typecheck 11/11, test 13/13 tasks including the two new config-package suites in the
scaffolded tree, then `mnative add probe` → install → typecheck 12/12). Baselines moved:
167 tests over 16 tasks, biome infos 14 → 10, template suite 99 → 100.

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
5. **R5 needed one new option, not just a delegation.** `regenerateCI()` runs after the
   pipeline deletes the template's docs site, while `regenerateAll()` (as `mdocs`) runs in the
   repo where that site exists — and the docs site is what decides whether `pages.yml` /
   `coverage.yml` are generated or removed. Deleting the scaffolded branch outright would have
   changed both. So `regenerateAll(targetDir, { templateDocsSite })` keeps the repo behaviour by
   probing `docs/.vitepress/config.mts` and lets the scaffolder pass `false` for the tree it
   already pruned. This also settles the one case where the two copies genuinely disagreed: a
   stale `coverage.yml` left behind when pages + coverage are both enabled is now removed, which
   is what the scaffolder always did and what the deleted/regenerated files motivate.
6. **R6 added a `test` task to two config packages** (the native and unocss configs)
   because the plan's characterization tests live beside the scripts they pin. The Full Gate is
   therefore 16 turbo tasks rather than 14 — a strengthening, not a loosening. These tests also
   run inside scaffolds that keep those configs; both scaffold variants were re-run to confirm.
7. **R6 found a latent bug it deliberately did not fix.** `migrateLegacyCrate()` copies the old
   crate's `src/` into `crates/<name>/src/` and then writes a fresh crate there, so the legacy
   source survives only at `crates/<name>/src/src/lib.rs`, and the moved npm manifest is
   regenerated over. Both are now pinned by the characterization tests; fixing them is a
   behaviour change, which R6 is not.
8. **R1–R4 added tests the plan only implied.** R1 asked for direct tests of the pure
   stripper (6); R2's dedupe/discovery helper got 3; R3's reporting change got 1.

## Skipped / deferred

| Proposal | Status | Reason |
| :--- | :--- | :--- |
| R7, R8 | deferred | Phase 3 — feature providers in the demo app and branded mode/scope types. |
| R9, R10 | deferred | Phase 4 — threshold drift test; widen the coverage merge glob report-only first. |
| R11, R12 | deferred | Phases 5–7. |

Nothing in Phases 2–7 was started, so no proposal was left half-done.

## Gate output (at the Phase 2 boundary)

```
bun run test           # 167 pass / 0 fail, 16/16 tasks
bun run check          # exit 0 — 142 files, 14 warnings + 10 infos
bun run typecheck      # 14/14
bun run coverage:check # 96.95% (159/164) — threshold 80%
```

Scaffold Gate, both variants: green (see the phase boundary notes above).
