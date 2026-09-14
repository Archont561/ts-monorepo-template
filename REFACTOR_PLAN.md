# Monorepo Refactor Plan

> Plan-only. No source file was modified to produce this document; every proposal is
> behavior-preserving and independently committable.
>
> Numbers below were measured in this workspace on the current working tree
> (`arena/01a09f8a-ts-monorepo-template` @ `ed14130` + the uncommitted bug-fix set).
>
> **Path shorthand — `TPL/`.** The template config package (the self-destructing one) is
> written as `TPL/…` below; its real location is the `template` directory inside the repo's
> `configs/` folder, and every other path in this document is repo-relative. The shorthand is
> not stylistic: the scaffold leak-scan tests read `.md` files in the generated tree and fail
> on the literal config path, on the placeholder scope string, and on the marker tokens, so a
> root-level plan file has to spell none of them out. (First draft of this file did, and
> `Scaffolder integration > committed bundle scaffolds a copied template via its real entry
> point` failed — a useful demonstration of how strictly the scaffold output is guarded.)

## Summary

The monorepo is in good structural shape: 53 `src/**/*.ts` files / 6,580 lines, no
function takes more than 4 parameters, no file has an unused import, and only four
`as any` casts exist. The debt is concentrated, not diffuse:

1. **`TPL/src/scaffolder.ts` (959 lines, one class, 18 methods)** is the
   largest and most bug-prone module — three of this session's bug fixes landed in it.
   Three of its methods are 84–128 lines (`replaceScopePlaceholders` 128,
   `stripTemplateMarkers` 86, `handleConfig` 84), and they carry the file-collection,
   marker-stripping and JSON-removal logic inline. Worse, its `regenerateCI()` (69 lines)
   is a second implementation of `aggregate.regenerateAll()` (86 lines): the same
   ci → release → pages → coverage → native → dependabot → stale sequence exists twice, and
   the two copies have already drifted (the scaffolder's copy omits the template-docs-site
   guard because it deletes `docs/` earlier in the pipeline). It does have the best
   test coverage in the repo (46 unit tests + a 10-case scaffold matrix), so it is also the
   cheapest place to refactor safely.
2. **CLI duplication is systemic.** 18 files hand-roll `spawnSync(..., "inherit" x3)`,
   13 CLIs repeat the same `process.argv.slice()` + help/exit preamble, and three files
   contain near-identical `run(cmd)` helpers. Meanwhile the two helpers written for exactly
   this (`defineWrapperCommand`, `defineSpawnSubcommand`) and mandated by
   `configs/AGENTS.md:13` are **never called** — the repo's own instruction and its code
   disagree. Two CLIs (`mbadges`, `mchangeset`) already shipped a citty parent-fall-through
   double-run bug; the other eight CLIs with a root `run()` only avoid it because every
   subcommand happens to call `process.exit()`.
3. **Two setup scripts and the scaffolder all write the same manifests** (root
   `package.json`, `apps/example/package.json`, `configs/turbo/turbo.base.json`) through
   four different editors — one text-surgery, three `JSON.stringify` — which is the exact
   shape of the formatting bug class fixed earlier in this session. `configs/native/src/setup.ts`
   still reflows `turbo.base.json`; that is a documented Known gap, not a hypothesis.
4. **The coverage gate does not see `configs/**`.** `mcoverage merge` globs
   `{packages,apps}/*/coverage/lcov.info`, so the 80% floor is enforced over 11 files /
   164 lines while the template package already produces 645 measured lines at 100% that
   nobody gates. Twenty-plus config packages have no tests and no coverage script at all.
5. Everything else from the smell catalog is minor or absent: no long parameter lists
   4+ (max is 4, in a dead function), no feature-envy hotspots beyond the demo app's
   path/feature helpers, magic values are mostly already named constants, and the only
   real dead code is six exported symbols plus one unused parameter.

The plan therefore front-loads small, test-protected extraction in the scaffolder (P0),
then makes the setup scripts and the demo app testable before touching them (P1), then
attacks the CLI duplication and the manifest-writer sprawl behind a new CLI contract
harness (P2). Nothing in the plan changes scaffolded output, removes a `TEMPLATE-ONLY`
marker, or lowers the 80% coverage floor.

## Baseline (measured before planning)

| Check | Command | Result |
| :--- | :--- | :--- |
| Tests | `bun run test` | **147 pass / 0 fail**, 14/14 tasks — internal 9, external 15, native 6, example 28, template 89 |
| Lint/format | `bun run check` | exit 0 — 140 files, **19 warnings + 14 infos**, 0 errors |
| Types | `bun run typecheck` | **14/14** |
| Coverage gate | `bun run coverage:check` | **96.95% lines (159/164)**, threshold 80% |
| Coverage scope | `coverage/lcov.info` | 11 files: `apps/example` (6), `packages/external` (3), `packages/internal` (2) |
| Scaffolds | manual | `native=none` and `native=publish` variants: install + check + typecheck + test clean |

Two baselines that matter for refactoring risk:

* `TPL/coverage/lcov.info` reports **645/645 lines (100%)**, including
  `scaffolder.ts` 619/619 — the module this plan touches most is measured, just not gated.
* Every other config package has neither a `test` script nor coverage. `configs/native`
  (cli 678 + templates 536 + setup 343 lines) and `configs/coverage` (the tool that
  enforces the gate) are the two largest untested surfaces.

## Priority Matrix

| Priority | # | Smell(s) | Location | Effort | Risk | Impact |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| P0 | R1 | Long Method, Magic RegExp, Nested Conditionals | `TPL/src/scaffolder.ts` `stripTemplateMarkers()` 440–525 | S | Low | Isolates the marker stripper — the code that produced the most recent bug — into a pure, directly unit-testable function |
| P0 | R2 | Long Method, Duplicated Code | `TPL/src/scaffolder.ts` `replaceScopePlaceholders()` 198–325 | S | Low | Removes 4× copy-pasted find→filter→push; makes the rewrite phase inspectable |
| P0 | R3 | Long Method, Long Parameter List (triple return) | `TPL/src/scaffolder.ts` `handleConfig()` 621–704, `reconcileWorkspaces()` 714 | S | Low | One removal step per config + a manifest-editing seam for R12 |
| P0 | R4 | Dead Code, missing type safety | `configs/citty/src/index.ts`, `TPL/src/aggregate.ts`, `TPL/src/vars.ts`, 4 × `as any` | S | Low | Deletes 6 unreferenced exports, one unused parameter, and every `any` cast outside the citty shim |
| P1 | R5 | Long Method, Nested Conditionals, Duplicated Code | `TPL/src/aggregate.ts` `regenerateAll()` 146–231 **and** `TPL/src/scaffolder.ts` `regenerateCI()` 766–840 | M | Low–Med | Two drifted copies of the workflow sequence become one table; adding a workflow stops being a two-file change |
| P1 | R6 | Long Method, Inappropriate Intimacy, Primitive Obsession | `configs/native/src/setup.ts` `main()` 123–339 (217 lines), `configs/unocss/src/setup.ts` `main()` 15–135 (121 lines) | M | Med | Two of the largest functions in the repo become named steps; requires characterization tests first (none exist today) |
| P1 | R7 | Feature Envy, Nested Conditionals | `apps/example/src/{features.ts,index.ts,pages/api/index.ts}` | M | Med | One `FeatureProvider` per opt-in feature instead of flags threaded through four call sites; `TEMPLATE-ONLY` markers preserved |
| P1 | R8 | Primitive Obsession, Magic Numbers/Strings | `TPL/src/configs.ts`, scaffolder, native/unocss setups, `apps/example/src/port.ts`, `configs/coverage/index.ts` | M | Low–Med | Mode strings and scope literals become named unions; the `80` vs `0.80` duplication gets a drift test |
| P1 | R9 | (risk finding, not a smell) | `configs/coverage/src/cli.ts:238` merge glob, `configs/coverage` tests | S–M | Low–Med | Brings `configs/**` under the gate — 645 measured lines at 100% today — and tests the tool that enforces it |
| P2 | R10 | Duplicated Code | 18 wrapper-shaped CLIs, `configs/citty/src/index.ts` | M | Med | CLI contract harness first, then the repo's documented helper can be made true (or deleted) |
| P2 | R11 | Duplicated Code, Dead Code | `configs/{biome,ts,turbo,bunup,gh-actions,pages,native,trivy,gitleaks,unocss,coverage,skills,bun-config}/src/cli.ts` | L | Med–High | 18 hand-rolled spawn wrappers collapse onto one strategy; help text and exit codes are user-visible, so one CLI per commit |
| P2 | R12 | Inappropriate Intimacy, Duplicated Code | scaffolders + native/unocss setups vs. `package.json` / `turbo.base.json` | M–L | Med | One format-preserving manifest editor ends the "who wrote it last" formatting class (incl. the known `turbo.base.json` reflow) |
| — | R13 | Dead Code (cosmetic) | 19 biome warnings | S | Low | Deferred — see Out of Scope |

Effort: **S** ≤ ½ day, **M** ≈ 1–2 days, **L** ≈ 3–5 days; each estimate includes the tests named below.

---

## Detailed Proposals

### R1 — Extract a pure marker stripper from `stripTemplateMarkers()`

- **Smell:** Long Method (86 lines), Magic RegExp, Nested Conditionals (the `replace`
  callback contains the only real branching).
- **Files:** `TPL/src/scaffolder.ts` (440–525), `TPL/tests/scaffolder.test.ts`.
- **Before:**

  ```ts
  async stripTemplateMarkers(): Promise<void> {
    const patterns = [ { regex: /…yaml…/g }, { regex: /…ts…/g }, { regex: /…html…/g } ];
    const findArgs = [ /* 17-element find argv */ ];
    for (const filePath of (await $`find ${findArgs}`.text()).trim().split("\n").filter(Boolean)) {
      let content = await target.text();
      let modified = false;
      for (const { regex } of patterns) {
        content = content.replace(regex, (_match, scopesStr, innerContent) => {
          const scopes = scopesStr.split(",").map((s: string) => s.trim());
          modified = true;
          return scopes.every((s: string) => disabled.has(s)) ? "" : innerContent;
        });
      }
      if (modified) { /* 3 cleanup regexes */ await write(filePath, content); }
    }
  }
  ```

- **After:**

  ```ts
  // module scope — data, not control flow
  export const MARKER_PATTERNS: readonly RegExp[] = [/* the three comment styles */];
  export function markerFileArgs(root: string): string[] { /* find argv builder */ }

  /** Pure: strips or keeps every marker block, then normalises whitespace. */
  export function stripMarkerBlocks(content: string, disabledScopes: ReadonlySet<string>): string {
    let next = content;
    for (const regex of MARKER_PATTERNS) next = next.replace(regex, (_m, scopes, inner) => /* … */);
    return next.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/\n{2,}$/, "\n");
  }

  async stripTemplateMarkers(): Promise<void> {
    for (const path of await findMarkerFiles(this.targetDir)) {
      const content = await file(path).text();
      const next = stripMarkerBlocks(content, this.disabledScopes);
      if (next !== content) await write(path, next);
    }
  }
  ```

- **Pattern:** Extract Method + Extract Class (pattern table as module data). This also
  turns R1 into the seam for a future Chain-of-Responsibility pipeline (see R12).
- **Test Strategy:** `scaffolder.test.ts` already has a `stripTemplateMarkers` describe
  block (283–462) covering keep/strip/all-scopes/indentation cases; add direct unit tests
  for `stripMarkerBlocks` (pure string in → string out, no filesystem) and keep the
  method-level tests unchanged as the behavior contract. `cases.test.ts` (10-case matrix)
  independently asserts no `TEMPLATE-ONLY` markers survive in any scaffold.
- **Estimated Effort:** S.

### R2 — Extract scope-target collection from `replaceScopePlaceholders()`

- **Smell:** Long Method (128 lines), Duplicated Code (the same `find` → split → filter →
  `push` shape four times, with the same extension regex twice).
- **Files:** `TPL/src/scaffolder.ts` (198–325).
- **Before:** one method holding a 60-entry `files[]` literal plus four inline discovery
  blocks (docs under `packages`/`apps`, native npm glob, `configs` tree, `.agents` tree),
  each re-implementing `absolutePath.replace(targetDir + "/", "")` and its own extension filter.
- **After:**

  ```ts
  const SCOPE_TEXT_EXTENSIONS = /\.(json|ts|js|md|yml|yaml|toml)$/;

  export async function collectScopeTargets(targetDir: string): Promise<string[]> {
    return dedupe([
      ...STATIC_TARGETS,                              // the literal list, unchanged
      ...(await findTextFiles(`${targetDir}/packages`, `${targetDir}/apps`)),   // docs
      ...(await glob("packages/native/npm/**/*.{json,ts,md}", targetDir)),      // npm pkgs
      ...(await findTextFiles(`${targetDir}/configs`, { skip: TEMPLATE_DIR })), // TEMPLATE_DIR = the self-destructing one
      ...(await findTextFiles(`${targetDir}/.agents`)),
    ]);
  }
  ```

  `replaceScopePlaceholders()` becomes: collect → for each file, `replaceIdentity` +
  `replaceAll(placeholder, scope)` → write only when changed (the existing loop body).
- **Pattern:** Extract Method; the four collectors share one `findTextFiles` helper.
- **Test Strategy:** `scaffolder.test.ts` `replaceScopePlaceholders` describe (182–282)
  asserts which files get rewritten and that the static list still resolves;
  `cases.test.ts` asserts the resulting package names (`<scope>/internal`, `<scope>/external`)
  and a repo-wide leak scan for the placeholder scope. Add one unit test asserting
  `collectScopeTargets()` returns each discovered family exactly once (guards against the
  dedupe regression that the current code hides by tolerance).
- **Estimated Effort:** S.

### R3 — Split `handleConfig()`; give `reconcileWorkspaces()` a parameter object

- **Smell:** Long Method (84 lines), Long Parameter List (3 positional args, 3-value
  return tuple), Primitive Obsession (`workspaces: string[]` vs `deps: Record<string,string>`
  flowing as siblings).
- **Files:** `TPL/src/scaffolder.ts` (621–704, 714–765).
- **Before:** a single loop that, per disabled config, does six unrelated mutations
  (rm dir → delete root dep → extra removals → glob removals → regex removals → root
  scripts → turbo text surgery → app deps), then reconciles the whole tree at the end.
- **After:**

  ```ts
  interface RootManifest { workspaces: string[]; devDependencies: DepMap; dependencies: DepMap }

  /** One disabled config, one commit-sized unit of work. */
  private async applyRemovals(config: DiscoveredConfig, root: RootManifest): Promise<void> { … }

  interface ReconcileResult { manifest: RootManifest; droppedWorkspaces: string[]; droppedDeps: string[] }
  private async reconcileWorkspaces(manifest: RootManifest): Promise<ReconcileResult> { … }

  async handleConfig(): Promise<void> {
    const manifest = await readRootManifest(this.targetDir);
    for (const config of (await discoverConfigs(this.targetDir))) {
      if (this.isStaying(config.meta)) continue;
      await this.applyRemovals(config, manifest);
    }
    const { manifest: reconciled, droppedWorkspaces, droppedDeps } = await this.reconcileWorkspaces(manifest);
    await writeRootManifest(this.targetDir, reconciled, { droppedWorkspaces, droppedDeps });
  }
  ```

- **Pattern:** Extract Method + Introduce Parameter Object; the returned `dropped*` arrays
  make the reconcile decisions observable (today they are silent) without changing output.
- **Test Strategy:** `scaffolder.test.ts` `handleConfig` describe (551–781) already tests
  each removal family per config, including the last-entry newline case for
  `removeJsonObjectEntry`; `scaffolder.test.ts` `removeJsonObjectEntry` describe (813+)
  covers the turbo text surgery directly. Parameter-object introduction is a pure call-site
  change verified by the same tests plus `typecheck`.
- **Estimated Effort:** S.

### R4 — Delete dead exports, drop the unused parameter, remove the `as any` casts

- **Smell:** Dead Code (6 exported symbols with zero references anywhere in `apps`,
  `packages`, `configs` — including tests), plus 4 unjustified `any` casts.
- **Files / evidence:**
  - `configs/citty/src/index.ts`: `createMain`, `parseArgs` (re-exports, never imported),
    `defineWrapperCommand` (34), `defineSpawnSubcommand` (68) — never called; referenced
    only in `configs/AGENTS.md:13`, `configs/citty/README.md:9`, `configs/citty/CONTEXT.md:9`.
  - `TPL/src/aggregate.ts:41` `aggregateMarkdown` — only the declaration matches.
  - `TPL/src/vars.ts:39` `WorkflowVar` — only the declaration matches.
  - `configs/native/src/templates.ts:77` — `options` parameter unused (one of the 19
    baseline biome warnings, `noUnusedFunctionParameters`).
  - `as any`: `configs/badges/src/cli.ts:45`, `configs/skills/src/cli.ts:401`,
    `configs/lefthook/src/cli.ts:72–73`.
- **Before / After (the `any` casts):**

  ```ts
  // before — and the reason citty's parent command ran twice (fixed with process.exit(0))
  await checkCommand.run?.({ args: { owner: "…", scope: "…" } } as any);

  // after — citty's own typed invoker, which does not fall through
  await runCommand(checkCommand, { rawArgs: [] });
  ```

- **Pattern:** dead-code removal; for `citty` the decision is *keep-and-use* (see R10/R11)
  or *delete* — but the helpers cannot stay unused while `configs/AGENTS.md` mandates them.
  Recommendation: keep the helpers, make R10's harness call them, and update the three
  docs in the same commit that starts using them.
- **Test Strategy:** nothing imports these symbols (verified by repo-wide grep), so the
  risk is documentation drift only; `bun run check` must stay at ≤19 warnings (this removes
  one), and `configs/citty`'s own CLI (`mcitty info`) gets a smoke run in R10's harness.
  Removing `aggregateMarkdown` requires checking `mdocs`/`docs:sync` output is unchanged
  (`bun run docs:sync` → no diff, as in the baseline run).
- **Estimated Effort:** S.

### R5 — One workflow table for `regenerateAll()` and `regenerateCI()`

- **Smell:** Long Method (86 + 69 lines in two files), Nested Conditionals (each file has
  six `if (exists) generate else if (stale) delete` blocks, three levels deep), Duplicated
  Code — the two methods are the same ci → release → pages → coverage → native →
  dependabot → stale sequence written twice, and they already differ: `regenerateAll()`
  guards on `pagesConfigExists && !templateDocsExists`, `regenerateCI()` only on
  `pagesConfigExists` (it runs after `docs/` was removed, an invariant that lives in a
  comment today). A conditional that must stay in sync across two files is exactly the
  shape that produced the stale-workflow bugs in this area.
- **Files:** `TPL/src/aggregate.ts` (146–231), `TPL/src/scaffolder.ts` (766–840),
  `TPL/tests/aggregate.test.ts`.
- **Before:** the same seven-step sequence hand-written twice, once per entry point, with
  the delete-stale block copy-pasted four times in each copy.
- **After:**

  ```ts
  interface WorkflowSpec {
    base: string; steps: string; output?: string;
    enabledWhen: (dir: string) => Promise<boolean>;
    stale: string;               // workflow file to delete when disabled
    reason: string;              // used verbatim in the log line
  }

  const WORKFLOWS: readonly WorkflowSpec[] = [
    { base: "ci.base.yml", steps: "ci.steps.yml", enabledWhen: always, stale: "", reason: "" },
    { base: "release.base.yml", steps: "release.steps.yml", enabledWhen: always, stale: "", reason: "" },
    { base: "pages.base.yml", steps: "pages.steps.yml", output: "pages.yml",
      enabledWhen: pagesEnabled, stale: ".github/workflows/pages.yml", reason: "pages disabled" },
    /* coverage, native, dependabot, stale … */
  ];

  export async function regenerateAll(targetDir: string, opts: { templateDocsSite?: boolean } = {}): Promise<void> {
    for (const spec of WORKFLOWS) await syncWorkflow(targetDir, spec, opts); // generate xor delete-stale
  }

  // scaffolder — the second copy disappears
  async regenerateCI(): Promise<void> {
    await regenerateAll(this.targetDir, { templateDocsSite: false });
  }
  ```

  The `templateDocsSite` flag is the one thing the two copies genuinely differ on, so it
  becomes an explicit parameter instead of a comment.

- **Pattern:** Replace Conditional with Polymorphism (spec objects as strategies) +
  Consolidate Duplicate Conditional Fragments.
- **Test Strategy:** `aggregate.test.ts` asserts generated fragments and per-config step
  inclusion; `index.test.ts` drives the bundled scaffolder end-to-end and asserts the
  regenerated `ci.yml` has no unsubstituted placeholder; `cases.test.ts` asserts, per case,
  exactly which workflows exist and which do not (`["ci.yml","release.yml","pages.yml",
  "coverage.yml","native.yml","stale.yml","dependabot.yml","template-docs.yml"]`). Add one
  table-driven test that iterates `WORKFLOWS` and asserts each spec's enabled/disabled
  outcomes for both entry points (`templateDocsSite` true/false) — the refactor must not
  change a single generated file, so `bun run docs:sync` must stay diff-free and the two
  scaffold variants must still generate byte-identical workflows.
- **Estimated Effort:** M.

### R6 — Decompose the two setup scripts (tests first)

- **Smell:** Long Method (`configs/native/src/setup.ts` `main()` 123–339 = **217 lines**;
  `configs/unocss/src/setup.ts` `main()` 15–135 = **121 lines**), Inappropriate Intimacy
  (both write manifests they do not own), Primitive Obsession (bare mode strings and the
  placeholder scope literal duplicated at unocss lines 22 and 73).
- **Files:** `configs/native/src/setup.ts`, `configs/unocss/src/setup.ts`,
  new `configs/native/tests/setup.test.ts`, new `configs/unocss/tests/setup.test.ts`.
- **Before:** `main()` executes six (native) / five (unocss) numbered steps inline:
  migrate legacy crate → write crates → sync workspace members → toolchain/cargo/gitignore →
  root manifest → turbo tasks → example routes (native); config file → HTML swap → app
  manifest → root manifest → stray config removal (unocss). Nesting reaches three levels
  in the toolchain/cargo-config branches (`40–48`, `54–67`) and in the unocss
  `if/else` chain at `98–106`.
- **After:**

  ```ts
  async function setupToolchain(): Promise<void> { /* 40–49 */ }
  async function setupCargoConfig(): Promise<void> { /* 50–67 */ }
  async function linkNpmPackages(rootPkg: PackageJson): Promise<void> { /* 218–231 */ }
  async function ensureTurboTasks(): Promise<void> { /* 240–262 */ }
  async function writeExampleRoutes(): Promise<void> { /* 285–325 */ }

  async function main(): Promise<void> {
    await migrateLegacyLayout();
    const crates = await writeCrates();
    await syncWorkspaceMembers(crates);
    await setupToolchain();
    await setupCargoConfig();
    await ensureNativeGitignore();
    await linkNpmPackages();
    await ensureTurboTasks();
    await writeExampleRoutes();
    printNextSteps();
  }
  ```

  with early-return guards replacing the nested `if (!exists) { if (exists) … else … }`
  shapes (`if (await exists(a)) return;`).
- **Pattern:** Extract Method + Replace Nested Conditional with Guard Clauses.
- **Test Strategy:** *No tests exist for either script today* — the skill's rule applies:
  add characterization tests **before** refactoring. Both scripts are `import.meta.main`
  guarded and read `process.cwd()`, so a test can `cp -r` a prepared fixture into a temp
  dir, run the script with `bun <path>` in that cwd, and assert the exact manifest/file
  deltas (root scripts added, workspace glob present, `apps/example` devDeps, turbo tasks,
  route files present). Then the refactor must reproduce byte-identical results. The
  existing `cases.test.ts` matrix and the manual two-variant scaffold gate
  (`native=none`, `native=publish`: install → check → typecheck → test) remain the
  end-to-end proof.
- **Estimated Effort:** M.

### R7 — Replace demo-app feature conditionals with feature providers

- **Smell:** Feature Envy (call sites know other modules' paths and file names),
  Nested Conditionals, Primitive Obsession (two booleans threaded through four files).
- **Files:** `apps/example/src/features.ts` (89 lines) → `apps/example/src/features/{index,unocss,native}.ts`,
  `apps/example/src/index.ts`, `apps/example/src/pages/api/index.ts`,
  `apps/example/tests/{features,routes,integration}.test.ts`.
- **Before:** `features.ts` mixes three concerns — path resolution (`appFile`, `repoFile`),
  UnoCSS detection (page *or* built config *or* HTML content), native detection (route file
  existence) — while `index.ts` separately probes `public/uno.css` and builds a MIME table,
  and `pages/api/index.ts` re-derives a flag from the endpoint list it just built
  (`unocss: endpoints.includes("/uno.css")`).
- **After:**

  ```ts
  // features/provider.ts
  export interface FeatureProvider {
    readonly name: "unocss" | "native";
    enabled(): Promise<boolean>;
    endpoints(): string[];
  }

  // features/unocss.ts
  export const unocss: FeatureProvider = {
    name: "unocss",
    enabled: async () => (await hasPage()) || (await hasBuiltCss()) || (await hasConfig()),
    endpoints: () => ["/uno.css"],
  };

  // features/index.ts — detectFeatures() keeps its exact shape
  const PROVIDERS = [unocss, native];
  export async function detectFeatures(): Promise<FeatureFlags> {
    const states = await Promise.all(PROVIDERS.map(async (p) => [p.name, await p.enabled()] as const));
    return Object.fromEntries(states) as FeatureFlags;
  }
  ```

  `pages/api/index.ts` becomes `endpoints.push(...provider.endpoints())` and reports the
  same flags it computed rather than re-deriving them.
- **Pattern:** Strategy / Replace Conditional with Polymorphism. **Constraint honored:**
  `TEMPLATE-ONLY` markers stay exactly where they are (the native provider's file body and
  the native endpoint block), so the scopes the scaffolder strips are unchanged.
- **Test Strategy:** `features.test.ts` (12 tests) asserts `Object.keys(detectFeatures()).sort()`
  equals `["native","unocss"]` plus each detection branch; `routes.test.ts` (native describe
  wrapped in markers) covers `/api` payloads; `integration.test.ts` boots the server on a
  real port. `cases.test.ts` re-runs the whole matrix and fails on any surviving marker or
  leftover scope. The new provider modules are pure enough for direct unit tests — add one
  per provider asserting `enabled()` false/true against a fixture directory.
- **Estimated Effort:** M.

### R8 — Replace mode/selection primitives with named types and constants

- **Smell:** Primitive Obsession (`default: "always" | boolean | string`,
  `selected: boolean | string`, `configs: Record<string, boolean | string>`,
  `removals[String(selected)]`), Magic Strings (mode values, placeholder scope literals),
  Magic Numbers (`3000`, `retries: 2`, `max-age=60`).
- **Files:** `TPL/src/configs.ts`, `TPL/src/scaffolder.ts`,
  `configs/native/{index.ts,src/setup.ts}`, `configs/unocss/src/setup.ts`,
  `apps/example/src/port.ts`, `configs/coverage/index.ts`, `configs/bun-config/bunfig.toml`.
- **Before / After:**

  ```ts
  // before: stringly-typed everywhere
  const spec = { native: "none" /* or "publish" | "docker" */ };
  pkg.devDependencies[`${scope}/unocss`] = "workspace:*";   // scope ?? "@<org>" x2

  // after: one source of truth per vocabulary
  export const NATIVE_MODES = { none: "none", publish: "publish", docker: "docker" } as const;
  export type NativeMode = (typeof NATIVE_MODES)[keyof typeof NATIVE_MODES];
  export type ScaffoldSelection = boolean | "always" | NativeMode;
  export const DEFAULT_SCOPE = "@<org>";            // used by scaffolder + both setups
  export const DEFAULT_PORT = 3000;                 // apps/example/src/port.ts
  export const CSS_CACHE_MAX_AGE_SECONDS = 60;      // apps/example/src/index.ts
  ```

  `ScaffoldMeta.default` narrows to `"always" | boolean | NativeMode`, which makes
  `native=none|publish|docker` a type error if misspelled — today it silently falls through
  to "enabled".
- **Pattern:** Replace Type Code with Class/Enum (const-object variant), Replace Magic
  Number with Named Constant.
- **Test Strategy:** `cases.test.ts` covers every native mode (`none`, `publish`, `docker`)
  and the unocss/skills/pages/security combinations — a typo'd or renamed mode changes the
  generated file set and fails the matrix. Add one drift test asserting
  `COVERAGE_THRESHOLD` (80) equals the `lines/thresholds` value written in
  `configs/bun-config/bunfig.toml` (0.80), so the two sources cannot diverge again. `PORT`
  is already asserted indirectly by `integration.test.ts` binding the server.
- **Estimated Effort:** M.

### R9 — Extend the coverage gate to `configs/**`, and test the gate itself

- **Smell:** not one of the ten — this is the risk finding that governs how much the rest of
  the plan is worth. `configs/coverage/src/cli.ts:238` merges
  `{packages,apps}/*/coverage/lcov.info` only, so the 80% floor covers 11 files / 164 lines.
  the template package already writes `TPL/coverage/lcov.info` (645/645 = 100%,
  `scaffolder.ts` 619/619) that nothing consumes.
- **Files:** `configs/coverage/src/cli.ts` (merge glob), new `configs/coverage/tests/cli.test.ts`,
  `configs/bun-config/bunfig.toml` (unchanged — **the floor must not move**),
  `AGENTS.md` / `CONTEXT.md` / `configs/coverage/CONTEXT.md` (measured numbers).
- **Before / After:**

  ```ts
  // before
  new Bun.Glob("{packages,apps}/*/coverage/lcov.info")
  // after — same floor, wider tree
  new Bun.Glob("{packages,apps,configs}/*/coverage/lcov.info")
  ```

  Rollout: land the glob behind a **report-only** run first (print the merged totals and the
  delta without failing), confirm the union still clears 80% (today it gains 645 lines at
  100%), then flip the gate. Never lower `0.80`.
- **Pattern:** n/a (configuration/measurement change), sequenced as its own small PR.
- **Test Strategy:** unit-test the pure helpers in `configs/coverage/src/cli.ts`
  (`totals()` LCOV parsing, threshold comparison, missing-file behavior) — it is the tool
  enforcing the gate and currently has zero tests. Also assert the merge picks up a fixture
  under `configs/` (temp dir) so the glob is pinned. Verify with `bun run coverage` +
  `bun run coverage:check` before and after, and re-run the scaffold variants (generated
  projects have no `TPL/` directory, so their merge is unaffected).
- **Estimated Effort:** S–M.

### R10 — Add a CLI contract harness; resolve the documented-but-unused citty helpers

- **Smell:** Duplicated Code (13 CLIs repeat the `process.argv.slice()` + help + exit
  preamble; 3 files contain near-identical `run(cmd)` helpers) — and the repo's own
  `configs/AGENTS.md:13` tells contributors to use helpers that nothing calls.
- **Files:** `TPL/tests/` (harness lives with the test suite that can run CLIs
  in a temp tree), `configs/citty/src/index.ts`, `configs/AGENTS.md` (doc truth-up).
- **Before:**

  ```ts
  // configs/coverage/src/cli.ts, configs/bunup/src/cli.ts, configs/pages/src/cli.ts — three copies
  function run(cmd: string[], opts: { cwd?: string } = {}): number {
    return spawnSync({ cmd, cwd: opts.cwd, stdout: "inherit", stderr: "inherit", stdin: "inherit" }).exitCode;
  }
  ```

- **After (harness, then helper):**

  ```ts
  // tests/cli-harness.ts — characterization, not a new abstraction
  export async function runCli(bin: string, args: string[], cwd: string) {
    const proc = Bun.spawn([bin, ...args], { cwd, stdout: "pipe", stderr: "pipe" });
    return { code: await proc.exited, out: await new Response(proc.stdout).text(), err: … };
  }

  // configs/citty/src/index.ts — the helpers get real (or the doc gets deleted)
  export const mcoverage = defineWrapperCommand({
    name: "mcoverage", description: "…", binPath: "bun", configArgs: ["src/cli.ts"],
  });
  ```

- **Pattern:** Strategy (one wrapper strategy per tool shape: *resolve-bin-and-append-flag*
  for biome/turbo, *prepend-runtime* for ts/gh-actions, *plain passthrough* for turbo/act)
  + Template Method for the shared `spawnSync → inherit → exit(code)` skeleton.
- **Test Strategy:** capture `--help` output, exit codes and stdout/stderr for every `m*`
  binary **before** any change, commit those snapshots as fixtures, and make the harness
  assert them. This turns user-visible CLI behavior (help text, exit codes, citty's
  parent-fall-through) into a regression net — exactly what makes R11 safe.
- **Estimated Effort:** M.

### R11 — Migrate wrapper CLIs onto the shared command strategy (one CLI per commit)

- **Smell:** Duplicated Code (18 files hand-roll the same spawn shape — `configs/native`
  and `configs/bun-config` at 4 call sites each, `configs/pages` 3, five more with 2).
- **Files (in migration order, smallest first):** `configs/ts`, `configs/biome`,
  `configs/turbo` (the three near-identical 30-line wrappers) → `configs/pages`,
  `configs/gh-actions`, `configs/bunup` → `configs/gitleaks`, `configs/trivy`,
  `configs/unocss` (share the "no args → default scan" preamble) → `configs/native`
  (4 spawn sites, one per cargo/napi path) → `configs/coverage`, `configs/skills`,
  `configs/bun-config`, `configs/changeset` (largest, most bespoke).
- **Before / After:** each CLI's `run()` body loses the hand-rolled spawn, the duplicated
  argv slicing and the implicit "every subcommand must call `process.exit()`" invariant:

  ```ts
  // before — the invariant that mbadges/mchangeset violated once already
  const main = defineCommand({ /* … */ run() { process.exit(runTool([...baked, ...raw])); } });

  // after
  runMain(defineWrapperCommand({
    name: "mbiome",
    binPath: Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome")),
    configArgs: [`--config-path=${import.meta.dir}/..`],
    description: "Biome with baked config path",
  }));
  ```

- **Pattern:** Strategy + Factory Function; the CLI-specific bits (bin path, baked flags,
  missing-tool warning) stay as data passed in.
- **Test Strategy:** R10's snapshots are the contract — after each single-CLI commit, run
  the harness plus `bun run test && bun run check && bun run typecheck && bun run coverage:check`.
  Behavior that must be preserved verbatim: help/usage text, exit codes, the
  `⚠️ tool not found — skipping` warnings (trivy/gitleaks/native return 0, not 1), and
  `mbadges`/`mchangeset` printing exactly once.
- **Estimated Effort:** L (one small commit per CLI).
- **Risk:** Med–High — CLIs are user-facing; mitigated by one-CLI-per-commit plus snapshots.

### R12 — One format-preserving manifest editor for all writers

- **Smell:** Inappropriate Intimacy (three modules edit manifests they do not own),
  Duplicated Code (four editors), and it is the root cause of the bug class fixed earlier
  this session.
- **Files:** writers — `TPL/src/scaffolder.ts` (`removeJsonObjectEntry` text
  surgery, 52–97; root/app writes at 621–704), `configs/native/src/setup.ts` (root
  `package.json` 218–231, `turbo.base.json` 259–262), `configs/unocss/src/setup.ts`
  (app manifest 69–109, root manifest 113–121). Target home: a small always-on
  config package (e.g. `configs/manifest`) that ships to generated projects like
  `configs/citty`/`configs/ts` do, with `native`/`unocss`/`template` taking it as a
  workspace dependency.
- **Before / After:**

  ```ts
  // before — three strategies for the same job
  await Bun.write(rootPkgPath, `${JSON.stringify(pkg, null, 2)}\n`);        // reflows arrays
  turbo = removeJsonObjectEntry(turbo, task);                               // text surgery
  await Bun.write(appPkgPath, JSON.stringify(pkg, null, 2) + "\n");         // third variant

  // after — one editor, one formatting contract
  await patchJsonFile(rootPkgPath, (pkg) => { pkg.scripts ??= {}; pkg.scripts["build:native"] = …; });
  await deleteJsonKey(turboPath, `tasks.${task}`);   // keeps committed formatting
  ```

- **Pattern:** Extract Class (editor) + Facade for the three writers; this is also where a
  Chain of Responsibility for the scaffold pipeline becomes possible
  (`computeDisabledScopes → sanitize → replaceScope → stripMarkers → removals → reconcile → regenerateCI`),
  each step taking a shared `ScaffoldContext` — but only *after* R1–R3 have made the steps
  small.
- **Test Strategy:** unit tests for the editor (add/remove/nested key, arrays preserved
  verbatim, missing file, idempotent second run) plus the existing `removeJsonObjectEntry`
  tests re-pointed at it. End-to-end: the two-variant scaffold gate must show
  `biome check` clean in the generated tree (this is what caught the last two formatting
  bugs) and `bun install` unchanged. Fixes the known `turbo.base.json` reflow gap.
- **Estimated Effort:** M–L.
- **Risk:** Med — touches generated output; mitigated by the scaffold gate in every phase.

---

## Execution Order

Each phase ends with the same gate; anything touching `configs/**` or `apps/example/**`
additionally runs the two-variant scaffold check.

**Gate A (every phase):**
`bun run test && bun run check && bun run typecheck && bun run coverage:check`
— expect 147 pass, exit 0, 14/14, ≥96.95%.

**Gate B (phases 1–6):** scaffold `native=none` and `native=publish` into temp dirs;
in each: `bun install` → `bun run check` → `bun run typecheck` → `bun run test`
(0 errors, no formatter diffs, all tasks green).

**Phase 0 — prepare (no code change)**
Commit the current bug-fix working tree (scaffolder + native generator + app features + docs
baselines) so every refactor has a clean revert point; tag it; record `git status` clean.
Run `bun run docs:sync` once and confirm it is diff-free.

**Phase 1 — scaffolder P0 (R1, R2, R3, R4)**
Small extractions inside the best-tested module. One proposal = one commit. R4's citty
helper decision is made here (keep + use in R10), so only the two re-exports, the dead
template exports, the unused parameter and the `as any` casts are removed.
*Exit: Gate A + Gate B; the template package's coverage stays 100%.*

**Phase 2 — data-driven CI generation and vocabularies (R5, R8)**
The two workflow-sequence copies collapse onto one table (with `templateDocsSite` as the
explicit difference); mode/scope/port constants get names and a drift test for `80` vs
`0.80`. Verify with `bun run docs:sync` producing **no diff** and the
10-case matrix still green (it pins every mode).
*Exit: Gate A + Gate B.*

**Phase 3 — demo app features (R7)**
Provider interface, same markers, same endpoints. `features.test.ts` + `routes.test.ts` +
`integration.test.ts` are the contract; add per-provider unit tests first (the provider
modules are pure).
*Exit: Gate A + Gate B (+ `bun run test:e2e` still "skipped — browsers not installed").*

**Phase 4 — setup scripts (R6)**
Tests first: characterization tests for both scripts, then the extraction. This is the
first phase that can break a scaffold without any unit test noticing, so Gate B is run
twice (before and after) and the generated manifests are diffed.
*Exit: Gate A + Gate B, manifests byte-identical.*

**Phase 5 — the gate itself (R9)**
Widen the merge glob report-only, publish the delta, then flip. Add the `mcoverage` unit
tests in the same phase.
*Exit: Gate A with a wider tree; `bun run coverage:check` still ≥ the old number or the
gap is explained and the floor is *not* lowered.*

**Phase 6 — CLI consolidation (R10, R11)**
Harness + snapshots first (R10), then one CLI per commit (R11), smallest first.
*Exit: Gate A after each commit; harness green; `mbadges`/`mchangeset` print once.*

**Phase 7 — one manifest editor (R12)** *(optional / next cycle)*
Only after R1–R3 have isolated the removal steps and R6 has characterization tests around
the setup scripts. Then the scaffold pipeline can be modelled as an explicit step chain if
it still needs to be.
*Exit: Gate A + Gate B, plus `biome check` clean inside both generated trees.*

Cross-cutting rules for every phase (the "clean up" step of the skill):

* Update `CONTEXT.md`, the touched package's `CONTEXT.md`/`AGENTS.md`, and re-run
  `bun run docs:sync` in the same commit as the code.
* No phase changes generated output. If a scaffold diff appears, the phase reverts —
  behavior preservation is non-negotiable.
* Keep the `TEMPLATE-ONLY` markers and the 80% floor untouched; both are load-bearing.
* Commit per proposal (never mix two proposals), so every step is independently revertable.

## Out of Scope

| Excluded | Why |
| :--- | :--- |
| Removing or re-architecting `TEMPLATE-ONLY` markers | Load-bearing: the scaffolder's removal, leak-scan tests and scope-aware stripping all depend on them. R7 relocates code *inside* the markers; nothing proposes removing the mechanism. |
| Lowering the 80% line gate (or the `0.80` value in `configs/bun-config/bunfig.toml`) | Explicit constraint. R9 widens what is measured; it must not weaken what is enforced. |
| Changing scaffolded output, file names, script names or workflow contents | Behavior preservation. The only intentional non-code change is R9's *measurement* scope. |
| Rust / cargo work (compiling crates, `mnative check`, llvm-cov) | No Rust toolchain in this environment and apt is blocked — unverifiable here. `configs/native/src/cli.ts` spawning logic is still refactorable (R11), but nothing that needs a real build. |
| `native.yml` publish ordering, container targets, WASI SDK | Pre-existing known gaps, unwired by design; not structural smells and not verifiable locally. |
| Rewriting the demo app (routing, serving, MIME table extraction) | `apps/example/src/index.ts` is a deliberate demo; splitting the MIME table into its own module is churn without a maintenance payoff. |
| Biome warning burn-down (19 warnings / 14 infos) | Baseline explicitly allows them; the only warning tied to a real smell (unused `options` parameter) is in R4. Fixing the rest (notably the 14 `noNonNullAssertion` in `integration.test.ts`) is churn while the files are stable. |
| Dependency upgrades, formatter-wide rewrites, renames of `m*` binaries, help-text rewording | Dependency upgrades are a separate risk class; renames/help edits break the R10 CLI contract and would need their own migration. |
| New features, new config packages beyond R12's optional editor, publishing changes | The task is refactoring: structure only, no new capability. |
| Making `configs/*` publishable packages | Out of scope; configs are workspace-internal (one self-destructing template). |

## Appendix — Evidence

**Long functions (≥40 lines, measured):** `native/src/setup.ts` `main()` 217 ·
`template/src/scaffolder.ts` `replaceScopePlaceholders()` 128 ·
`unocss/src/setup.ts` `main()` 121 · `scaffolder.ts` `stripTemplateMarkers()` 86 ·
`aggregate.ts` `regenerateAll()` 86 · `scaffolder.ts` `handleConfig()` 84 ·
`scaffolder.ts` `regenerateCI()` 69 · `native/src/templates.ts` `crateLibRs()` 68 ·
`templates.ts` `npmPackageJson()` 67 · `aggregate.ts` `aggregateWorkflow()` 65 ·
`playwright/src/e2e.ts` `run()` 65 · `native/src/cli.ts` `run()` 57 ·
`harness.ts` `prepare()` 54 · `scaffolder.ts` `removeJsonObjectEntry()` 46 ·
`scaffolder.ts` `runSetup()` 41 · `bunup/src/cli.ts` `run()` 41 ·
`scaffolder.ts` `removeByRegexPatterns()` 40 · `pages/src/cli.ts` `stage()` 40 ·
`templates.ts` `workspaceCargoToml()` 40 · `native/src/setup.ts` `migrateLegacyCrate()` 40.

**Parameter counts (verified by reading the signatures):** `aggregateMarkdown(targetDir,
fileName, outputFileName, marker)` = 4 — and it is dead code; `reconcileWorkspaces`,
`writeCrate`, `runNapiPerPackage`, `checkBadges`, `defineSpawnSubcommand` = 3 each; nothing
else exceeds 3. R3 and R12 absorb the two that matter.

**Duplication:** 18 files contain `spawnSync` with the identical `stdout/stderr/stdin:
"inherit"` trio (`configs/native` and `configs/bun-config` 4 sites each, `configs/pages` 3,
`configs/{trivy,gh-actions,changeset,bunup}` 2, nine more 1 each); 13 CLIs repeat
`process.argv.slice(2|3)` + help preamble + `process.exit`; `run(cmd[, cwd])` exists
three times (`coverage`, `bunup`, `pages`).

**Dead code:** `createMain`, `parseArgs`, `defineWrapperCommand`, `defineSpawnSubcommand`,
`aggregateMarkdown`, `WorkflowVar` — zero references outside their declaration
(repo-wide grep incl. tests/docs); `configs/native/src/templates.ts:77` unused `options`.

**Type escapes:** `as any` at `configs/badges/src/cli.ts:45`, `configs/skills/src/cli.ts:401`,
`configs/lefthook/src/cli.ts:72,73`. No other `: any`/`as any` in `src/`.

**Markers:** inline `TEMPLATE-ONLY` pairs live in 28 files (heaviest: `AGENTS.md` 12,
`TPL/tests/scaffolder.test.ts` 9, `TPL/src/scaffolder.ts` 6,
`cases.test.ts` 4, `configs/native/src/setup.ts` 3 — emitted inside generated route files).
Only `configs/native/src/setup.ts` writes new ones at runtime.

**Manifest writers:** root `package.json` — scaffolder (`sanitizePackageJson` 121–163,
`handleConfig` 621–704), `configs/native/src/setup.ts` 218–231, `configs/unocss/src/setup.ts`
113–121; `apps/example/package.json` — scaffolder 682–692, unocss 69–109;
`configs/turbo/turbo.base.json` — scaffolder 665–675 (text), native 259–262 (stringify).
