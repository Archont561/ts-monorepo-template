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
| — | `01b1436` | 167 | 96.95% (159/164) | Phase 2 boundary: baselines + log. |
| R7 | `bfc0b3c` | 176 (+9) | 96.95% (159/164) | Demo-app features behind `FeatureProvider` (`features/{index,paths,provider,unocss,native}.ts`); `/api` reports the flags it decided on. Markers untouched; the new native import sits inside the native scope so a native-free scaffold has no unused import. |
| R8 | `2787e5d` | 179 (+3) | 96.95% (159/164) | Named vocabularies: `NATIVE_MODES`/`NativeMode`/`ScaffoldSelection`/`DEFAULT_SCOPE`, per-package default scopes, `DEFAULT_PORT`, `CSS_CACHE_MAX_AGE_SECONDS`, plus three scaffold-metadata drift tests. Bundle rebuilt (42.10 KB). |
| — | `e32dbd2` | 179 | 96.95% (159/164) | Phase 3 boundary: baselines + log. |
| R9 | `1132d85` | 182 (+3) | 96.95% (159/164) | The coverage floor has two spellings (`COVERAGE_THRESHOLD = 80` and the bunfig's `lines = 0.80`); a drift test in the coverage package now requires them to agree, verified by mutating each side. Gate floor untouched. |
| R10a | `86d4bae` | 190 (+8) | 97.47% (193/198) | Merge pattern built once (`coveragePattern`/`coverageReports`), threshold comparison named, `--report-only` dry run, and the gate's own parsing/discovery/globbing is now tested. Report-only: widening would measure 99.37% (791/796). |
| R10b | `a8a3450` | 190 | **99.37% (791/796)** | Config packages included by default; `--no-include-configs` reproduces the narrow set. The measured floor rose 1.90 points / 598 lines; the 80% threshold was not touched. |
| R11a | `8f237ac` | 191 (+1) | 99.37% (791/796) | CLI contract harness: one test drives all 20 `m*` bins through `--help` and `--version` against a checked-in fixture (refresh with `UPDATE_CLI_CONTRACT=1`). Wrapper work from here edits only `src/cli.ts`, which the coverage configuration excludes, so the measured set does not move until R12. |
| R11b | `c69a43b` | 191 | 99.37% (791/796) | `mtsc`: the bin path and baked flags become arguments of `defineWrapperCommand`; the local spawn wrapper is gone. |
| R11c | `5eb8e4e` | 191 | 99.37% (791/796) | `mbiome`: same shape, with the tool's own config flag appended **after** the caller's arguments. |
| R11d | `1a53289` | 191 | 99.37% (791/796) | `mturbo`: passthrough mode drops the hand-rolled argv plumbing. |
| R11e | `8041eec` | 191 | 99.37% (791/796) | `mbunup`: passthrough wrapper with its extra subcommands registered beside the run. |
| R11f | `dedd78e` | 191 | 99.37% (791/796) | `mci`: `lint`/`act` move to `defineSpawnSubcommand` — `act -l` byte-identical, `lint --help` keeps its ARGS text. |
| R11g | `705a341` | 191 | 99.37% (791/796) | `mgitleaks`: argv-identical `detect --source . --no-git --verbose`; a shim proves exit codes pass through (`SHIM_EXIT=3` → 3). |
| R11h | `b910ced` | 191 | 99.37% (791/796) | `mtrivy`: `fs . --severity HIGH,CRITICAL` and the docker build arguments preserved. |
| R11i | `e14e23e` | 191 | 99.37% (791/796) | `munocss`: a real build still writes the example app's `uno.css`; both spawn sites funnel through the helper. |
| R11j | `78a9af0` | 191 | 99.37% (791/796) | `mnative`: four spawn sites moved, output byte-identical. |
| R11k | `556030a` | 191 | 99.37% (791/796) | `mpages`: `list` and `base --json` identical (the two `git` captures stay). |
| R11m | `ca7223b` | 191 | 99.37% (791/796) | `mbun` (bun-config): four spawn sites moved. |
| R11n | `b9ff052` | 191 | 99.37% (791/796) | `mchangeset`: both spawn blocks moved; `init` exit 0 and `status` exit 1 stay byte-identical. |
| R11o | `f4649c5` | 191 | 99.37% (791/796) | `mgithub-actions` and `mbunup`: the last two hand-rolled spawns (act / actionlint, bunup / publint / attw). |
| R12a | `c8ffe35` | 212 (+21) | 99.41% (1011/1017) | New shared manifest editor: text-level insert/replace/remove that leaves every other byte alone, with its own `test` and `coverage` tasks. No bin, scaffold `always`. |
| R12b | `e70c57e` | 212 | 99.41% (1011/1017) | The native and unocss setup scripts edit manifests through the editor. Old-vs-new fixtures: stdout identical, and the only tree diff is the reflow the old re-serialization caused. |
| R12b-fix | `9c3575a` | 212 | 99.41% (1011/1017) | Setup scripts import the editor by path — inside a scaffold they run before `bun install`, where workspace names do not resolve. The bunfig change that attributes shared config code to its own run rides along. |
| R12c | `f8c755e` | 214 (+2) | 99.49% (974/979) | TPL scaffolder edits the root manifest as text end-to-end; its private JSON surgery is deleted, so the totals shrink by the 38 lines that code cost — every remaining measured line is covered. |
| R11l | `38f411a` | 230 (+16) | **99.52% (1037/1042)** | `mcoverage` spawns through the shared helper; the helper gains its first tests (100% of its 63 lines) and is measured by its own run instead of by its importers. |
| — | `5e9c43d` | 190 | 99.37% (791/796) | Phase 4 boundary: baselines and log rows for R9-R10. |
| — | `49868fe` | 230 | 99.52% (1037/1042) | Phase 5-7 boundary: baselines, the R11/R12 log rows, deviations 9-12 and the final gate output. |
| — | `1949e6a` | 230 | 99.52% (1037/1042) | Post-plan fix found while opening the PR (deviation 13): the generated workflows could never resolve the workspace bins (exit 127). The call sites now use `bunx`, and the workflows are regenerated from the fragments. |

Phase 1 boundary: Scaffold Gate run on both variants and **green** — `native=none`
(install, check 74 files/0 errors, typecheck 6/6, test 9+15+26 pass) and `native=publish`
+ unocss (install, check 97 files/0 errors, typecheck 11/11, test 9+15+6+28 pass, then
`mnative add probe` → install → typecheck 12/12). Baselines updated in `CONTEXT.md`,
`AGENTS.md`, `configs/biome/CONTEXT.md` and `configs/biome/AGENTS.md`.

Phase 4 boundary: Scaffold Gate **green** — `native=none` (check 78 files/0 errors,
typecheck 6/6, test 7/7 tasks) and `native=publish` + unocss (check 103 files/0 errors,
typecheck 11/11, test 14/14 tasks, then `mnative add probe` → install → typecheck 12/12).
No scaffold has a config package that emits coverage, so the widened merge changes nothing
there, and the coverage package's new tests run in both. The gate measures more than before
on purpose: 99.37% over 19 files across apps, packages and configs.

Phase 3 boundary: Scaffold Gate **green** — `native=none` (check 78 files/0 errors,
typecheck 6/6, test 6/6 tasks) and `native=publish` + unocss (check 103 files/0 errors,
typecheck 11/11, test 13/13 tasks, then `mnative add probe` → install → typecheck 12/12,
which also proves the named scope constant resolves). Baselines moved: 179 tests, template
suite 103.

Phase 2 boundary: Scaffold Gate **green** again — `native=none` (check 74 files/0 errors,
typecheck 6/6, test 6/6 tasks) and `native=publish` + unocss (check 99 files/0 errors,
typecheck 11/11, test 13/13 tasks including the two new config-package suites in the
scaffolded tree, then `mnative add probe` → install → typecheck 12/12). Baselines moved:
167 tests over 16 tasks, biome infos 14 → 10, template suite 99 → 100.

Phase 5–7 boundary: Scaffold Gate **green** on both variants after R11 (install, check,
typecheck and the full test task set clean), and re-run after R12c and again after R11l —
the last run reports `native=none` 9/9 tasks and `native=publish` + unocss 16/16 tasks, no
missing-module output, plus `mnative add probe` → install → typecheck on the publish variant.
R11 kept "one CLI per commit" (13 commits: a–o plus the harness); the `coverage` slot was
reverted once and re-landed last, after R12, which is why its commit follows the R12 ones.

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
9. **Shared config code is measured by the run that owns it.** From R12 on, config packages
   import each other (the setup scripts use the manifest editor, `mcoverage` uses the shared
   CLI helper). bun matches the coverage ignore patterns against the *importing* run's relative
   paths, so an importer measured the shared module a second time, and the `..` path it saw
   escaped the `**/configs/**` pattern. Both shared modules were given their own `test` and
   `coverage` tasks and added to the bunfig's ignore list, so each is measured exactly once.
   The 0.80 thresholds in that file were not touched; the measured floor rose to 99.52%.
10. **R12b needed a follow-up commit.** Its setup scripts imported the editor by workspace
   name, which does not resolve in a copied scaffold that has not been installed yet, so the
   step silently did nothing. The fix (import by path) is `9c3575a`, committed right after
   R12b rather than folded in, because R12b had already been verified byte-identical against
   the pre-refactor scripts and that evidence stays usable.
11. **R11l was reverted once and re-attempted differently.** The naive migration made the
   coverage package's own run measure the shared helper at ~9% lines and sank its threshold.
   The retry added the helper's tests plus the attribution rule from deviation 9 instead of
   loosening any gate.
12. **The R12 totals drop in the Coverage column for R12c.** That is deleted code, not a
   narrower measurement: the scaffolder's private JSON parser (38 measured lines) is gone and
   everything that remains is covered. The gate's floor (96.95%) and the bunfig's 0.80 are
   unchanged throughout.

13. **A post-plan fix rides on the branch: the generated workflows could never find the
   workspace bins.** Opening the PR ran the native workflow for the first time (it triggers on
   changes under the native package) and its matrix step exited 127 — a bare `mnative` is not
   on `PATH` in a `run:` step. The same held for about two dozen call sites (`mcoverage`,
   `mbunup`, `mpages`, `mtrivy`, `mdocs`) across the four workflows. The fragments now invoke
   them through `bunx`, the root workflows are regenerated from those fragments so the fix
   survives the next regeneration, and the one static workflow is fixed in place. Nothing in
   the refactor changed; the scaffold gate was re-run because the fragments ship into
   generated projects (their workflows now resolve the bins too).
   With the fix in place the `matrix` job passes; the downstream build jobs — the container bun
   installs, the Windows binding build and the WASI/artifact fan-in — still fail or have never
   completed, and are left as the documented-unverified part of that workflow rather than reworked
   here.

## Skipped / deferred

| Proposal | Status | Reason |
| :--- | :--- | :--- |
| R7, R8 | landed | `bfc0b3c`, `2787e5d` — feature providers and the named mode/scope vocabulary. |
| R9, R10 | landed | `1132d85`, `86d4bae`, `a8a3450` — threshold drift test, then the widened merge. |
| R11, R12 | landed | R11 `8f237ac`…`f4649c5`; R12 `c8ffe35`, `e70c57e`, `9c3575a`, `f8c755e`; R11l `38f411a`. |

Every proposal in the plan has landed. The one known defect the plan's scope did not cover —
the legacy-crate migration nesting a copied `src/` (deviation 7) — stays pinned by tests
rather than fixed, because fixing it would change behaviour.

## Gate output (at the Phase 4 boundary)

```
bun run test           # 190 pass / 0 fail, 17/17 tasks
bun run check          # exit 0 — 146 files, 14 warnings + 10 infos
bun run typecheck      # 14/14
bun run coverage:check # 99.37% (791/796) — threshold 80%
```

Scaffold Gate, both variants: green (see the phase boundary notes above).

## Gate output (final, at `38f411a`)

```
bun run install        # lockfile unchanged
bun run test           # 230 pass / 0 fail, 19/19 tasks
bun run check          # exit 0 — 152 files, 0 errors, 14 warnings + 10 infos
bun run typecheck      # exit 0
bun run build          # 19/19 tasks, no bundle drift
bun run coverage       # merges 7 reports → 21 lcov records
bun run coverage:check # 99.52% (1037/1042) — threshold 80%, floor 96.95% untouched
```

The branch tip additionally carries the CI fix from deviation 13 (workspace bins invoked through
`bunx`), which leaves every figure above unchanged.

Scaffold Gate, both variants at the final commit:

```
native=none            # install, typecheck, test (9/9 tasks), check — all exit 0
native=publish+unocss  # install, typecheck, test (16/16 tasks), check — all exit 0
                       # then: mnative add probe → install → typecheck — all exit 0
```
