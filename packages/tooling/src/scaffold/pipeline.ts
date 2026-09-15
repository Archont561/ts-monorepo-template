import { $, file, Glob, spawnSync, write } from "bun";
import {
  readJson,
  removeJsonArrayValue,
  removeJsonEntry,
  setJsonBlock,
  updateManifestFile,
} from "../manifest/editor";
import { regenerateAll } from "./aggregator";
import type {
  DiscoveredConfig,
  ScaffoldMeta,
  ScaffoldRemovals,
  ScaffoldSelection,
} from "./features";
import {
  DEFAULT_SCOPE,
  disabledScopesFor,
  enabledDirsFor,
  FEATURES,
  FEATURES_MANIFEST_PATH,
  isDisabledSelection,
  isStaying as isStayingFeature,
  SCOPE_MANIFEST_PATH,
  selectedFor as selectedForFeature,
} from "./features";

export interface ScaffolderOptions {
  targetDir?: string;
  scope?: string;
  gitHooks?: boolean;
  /** GitHub owner used for badge, Cargo and CODEOWNERS URLs. */
  owner?: string;
  /** Repository name used for badge, Cargo and Pages URLs. */
  repo?: string;
  /** Flag -> selected value for opt-in configs (from scaffold metadata). */
  configs?: Record<string, ScaffoldSelection>;
  /**
   * The features to apply. Defaults to the `FEATURES` registry.
   *
   * Injectable because discovery stopped reading the filesystem (R27): the
   * removal engine can no longer be driven by `configs/<dir>/package.json`
   * files written into a fixture directory, so unit tests hand it a synthetic
   * feature list instead. Production callers leave it unset.
   */
  features?: readonly DiscoveredConfig[];
}

/** Identity that badge/Cargo/Pages URLs are rewritten to. */
export const IDENTITY_PLACEHOLDER = { owner: "Archont561", repo: "ts-monorepo-template" } as const;
/** Used when no owner can be resolved — never a wrong repo, obviously a TODO. */
const UNKNOWN_OWNER = "OWNER";

const FILES_TO_REMOVE: string[] = ["tests/template.test.ts"];

const PACKAGE_JSON_KEYS_TO_REMOVE = ["bun-create"];

const PACKAGE_JSON_SCRIPTS_TO_REMOVE = [
  "build:template",
  "search:tools",
  // Template-only test entry points — configs/template is pruned on scaffold.
  "test:template",
  "test:template:cases",
  "test:template:coverage",
  "test:template:watch",
];

/**
 * Marker handling lives in `./markers` so the workflow generator can use it
 * without a cycle. Re-exported here because it is part of this module's
 * documented surface — `src/scaffold/index.ts` and the tests both import it
 * from here.
 */
export {
  CUSTOM_MARKER_PATTERNS,
  isScopeDisabled,
  MARKER_PATTERNS,
  markerFindArgs,
  stripMarkerBlocks,
} from "./markers";

import { markerFindArgs, stripMarkerBlocks } from "./markers";

/** Files that always carry the placeholder scope, relative to the target dir. */
const STATIC_SCOPE_TARGETS: readonly string[] = [
  // Root manifests and wrappers
  "package.json",
  "lefthook.yml",

  // Documentation
  "README.md",
  "AGENTS.md",
  "CONTEXT.md",
  "LICENSE.md",
  // The per-package and per-app docs are discovered below — every package
  // and app directory carries its own README/AGENTS/CONTEXT.

  // Changesets
  ".changeset/config.json",

  // Internal package
  "packages/internal/package.json",
  "packages/internal/tsconfig.json",
  "packages/internal/bunup.config.ts",

  // External package
  "packages/external/package.json",
  "packages/external/tsconfig.json",
  "packages/external/bunup.config.ts",
  "packages/external/src/index.ts",
  "packages/external/src/user.ts",
  "packages/external/src/native.ts",

  // Native workspace (self-contained, no root Cargo.toml)
  "packages/native/Cargo.toml",
  // The bridge package that stands for every pure Rust crate in the Turbo
  // graph — a single static node, unlike the npm packages discovered below.
  "packages/native/crates/package.json",
  // The npm packages underneath it are discovered below — there is one per
  // binding crate, so they cannot be listed here.

  // Example app
  "apps/example/package.json",
  "apps/example/tsconfig.json",
  "apps/example/bunup.config.ts",
  "apps/example/src/index.ts",
  "apps/example/src/pages/index.ts",
  "apps/example/src/pages/api/index.ts",
  "apps/example/src/pages/api/greet/[name].ts",
  "apps/example/src/pages/api/shout/[name].ts",
  "apps/example/src/pages/api/native/index.ts",
  "apps/example/src/pages/api/native/add.ts",
  "apps/example/src/pages/api/native/status.ts",
  "apps/example/src/pages/api/native/fibonacci/[n].ts",
  "apps/example/src/pages/api/native/primes/[n].ts",
  "apps/example/src/pages/api/native/reverse.ts",
  "apps/example/playwright.config.ts",
  "apps/example/Dockerfile",
  "apps/example/docker-compose.yml",
  "apps/example/.dockerignore",
  ".dockerignore",
  ".github/dependabot.yml",
  ".github/workflows/dependabot-auto-merge.yml",
  // Community health (always)
  ".github/CODEOWNERS",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/FUNDING.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  // Editor / Git
  ".editorconfig",
  ".gitattributes",
];

/** Extensions that are safe to rewrite as text. */
const SCOPE_TEXT_FILE = /\.(json|ts|js|md|yml|yaml|toml)$/;

/**
 * Repo-relative text files under `searchPaths`.
 *
 * `names` mirrors the filters the discovery passes had inline (`-name "*.md"`
 * for the package docs); omitting it walks every file and keeps the text ones.
 * A missing path is not an error — the pass simply discovers nothing there.
 */
async function findTextFiles(
  root: string,
  searchPaths: readonly string[],
  options: { names?: readonly string[]; exclude?: readonly string[] } = {},
): Promise<string[]> {
  const { names = [], exclude = [] } = options;
  const args = [
    ...searchPaths,
    "-type",
    "f",
    ...names.flatMap((name, i) => [...(i > 0 ? ["-o"] : []), "-name", name]),
    ...exclude.flatMap((path) => ["-not", "-path", path]),
  ];
  // Every discovery pass tolerated a missing path (`.catch(() => "")`).
  const found = await $`find ${args}`.text().catch(() => "");
  return found
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((absolute) => absolute.replace(`${root}/`, ""))
    .filter((relative) => SCOPE_TEXT_FILE.test(relative));
}

/**
 * Every file whose path or contents carry the placeholder scope.
 *
 * Three families are discovered rather than enumerated because their contents
 * grow with the workspace: per-package docs, the per-crate npm packages, the
 * config packages (except the template workspace itself, which is removed
 * later) and the `.agents` tree the skills setup fills in. Duplicates are
 * harmless — both replacements are idempotent — but deduping keeps the write
 * pass to one visit per file.
 */
export async function collectScopeTargets(targetDir: string): Promise<string[]> {
  const targets = new Set<string>(STATIC_SCOPE_TARGETS);

  // Per-package and per-app documentation (README/AGENTS/CONTEXT).
  const docs = await findTextFiles(targetDir, [`${targetDir}/packages`, `${targetDir}/apps`], {
    names: ["*.md"],
    exclude: ["*/node_modules/*", "*/dist/*", "*/target/*", "*/.turbo/*"],
  });
  for (const relativePath of docs) targets.add(relativePath);

  // Native npm packages: one per binding crate (`crates/*` -> `npm/*`).
  const nativeGlob = new Glob("packages/native/npm/**/*.{json,ts,md}");
  for await (const relativePath of nativeGlob.scan({ cwd: targetDir })) {
    targets.add(relativePath);
  }

  // Config package manifests and config files.
  const configs = await findTextFiles(targetDir, [`${targetDir}/configs`], {
    exclude: ["*/node_modules/*", "*/dist/*", "*/configs/template/*"],
  });
  for (const relativePath of configs) targets.add(relativePath);

  // Skills setup copies files to .agents/skills after this method runs.
  const agents = await findTextFiles(targetDir, [`${targetDir}/.agents`], {
    exclude: ["*/node_modules/*"],
  });
  for (const relativePath of agents) targets.add(relativePath);

  return [...targets];
}

/** The parts of the root manifest the removal pass reads and edits. */
interface RootManifest {
  workspaces?: string[];
  scripts?: Record<string, string>;
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;
  [key: string]: unknown;
}

/** The reconciled root manifest plus what had to go, for callers and tests. */
interface ReconcileResult {
  /** The edited manifest text — the file's committed formatting survives. */
  source: string;
  droppedWorkspaces: string[];
  droppedDependencies: string[];
}

export class MonorepoScaffolder {
  readonly targetDir: string;
  readonly scope: string;
  readonly gitHooks: boolean;
  readonly owner: string;
  readonly repo: string;
  readonly configs: Record<string, ScaffoldSelection>;
  /** Injected feature list, or `undefined` to use the `FEATURES` registry. */
  readonly features: readonly DiscoveredConfig[] | undefined;
  private readonly placeholder = DEFAULT_SCOPE;
  private disabledScopes = new Set<string>(["template"]);

  constructor(options: ScaffolderOptions = {}) {
    this.targetDir = options.targetDir ?? ".";
    this.scope = options.scope ?? DEFAULT_SCOPE;
    this.gitHooks = options.gitHooks ?? true;
    this.owner = options.owner ?? resolveOwner();
    this.repo = options.repo ?? resolveRepo(this.targetDir);
    this.configs = options.configs ?? {};
    this.features = options.features;
  }

  /**
   * The features this run applies — the injected list, or the registry.
   *
   * Replaces the three `discoverConfigs(this.targetDir)` call sites. The
   * target directory is no longer consulted: R27 deletes `configs/`, so there
   * is nothing there to scan.
   */
  private featureList(): DiscoveredConfig[] {
    return this.features ? [...this.features] : [...FEATURES];
  }

  /**
   * Removes template-only metadata from root package.json.
   */
  async sanitizePackageJson(): Promise<void> {
    const pkgPath = `${this.targetDir}/package.json`;
    const pkgFile = file(pkgPath);
    if (!(await pkgFile.exists())) return;

    const pkg = await pkgFile.json();

    // Remove top-level keys
    for (const key of PACKAGE_JSON_KEYS_TO_REMOVE) {
      delete pkg[key];
    }

    // Remove specific scripts
    if (pkg.scripts) {
      for (const script of PACKAGE_JSON_SCRIPTS_TO_REMOVE) {
        delete pkg.scripts[script];
      }
    }

    // Remove the template workspace itself from root dependencies
    delete pkg.devDependencies?.["@myorg/template"];

    // The runtime prompts are bundled into the committed dist bundle, so the
    // generated project has no use for the source-level devDependency.
    delete pkg.devDependencies?.["@clack/prompts"];

    // Remove template from workspaces
    if (pkg.workspaces) {
      pkg.workspaces = pkg.workspaces.filter(
        (w: string) => w !== "template" && w !== "packages/template" && w !== "configs/template",
      );
    }

    await write(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  }

  /**
   * Removes template-only references from files that otherwise survive
   * into generated projects.
   */
  async sanitizeTemplateRefs(): Promise<void> {
    const gitignorePath = `${this.targetDir}/.gitignore`;
    const gitignore = file(gitignorePath);
    if (await gitignore.exists()) {
      const lines = (await gitignore.text())
        .split("\n")
        .filter(
          (line) =>
            !/configs\/template/.test(line) &&
            !/packages\/template/.test(line) &&
            !/template bundle is committed on purpose/.test(line) &&
            !/bun-create\.postinstall runs/.test(line),
        );
      await write(gitignorePath, `${lines.join("\n")}\n`);
    }

    const bunfigPath = `${this.targetDir}/configs/bun-config/bunfig.toml`;
    const bunfig = file(bunfigPath);
    if (await bunfig.exists()) {
      const lines = (await bunfig.text())
        .split("\n")
        .filter(
          (line) =>
            !/"\*\*\/configs\/template\/\*\*"/.test(line) &&
            !/"\*\*\/packages\/template\/\*\*"/.test(line),
        );
      await write(bunfigPath, `${lines.join("\n")}\n`);
    }
  }

  /**
   * Replaces the placeholder scope (@myorg) with the user's scope
   * across all workspace files, configs, docs, and source code.
   */
  /** Rewrites the placeholder scope in every file that carries it. */
  async replaceScopePlaceholders(): Promise<void> {
    for (const relativePath of await collectScopeTargets(this.targetDir)) {
      const fullPath = `${this.targetDir}/${relativePath}`;
      const target = file(fullPath);
      if (!(await target.exists())) continue;

      const content = await target.text();
      const next = this.replaceIdentity(content).replaceAll(this.placeholder, this.scope);
      if (next !== content) {
        await write(fullPath, next);
      }
    }
  }

  /**
   * Rewrites URLs that point at the template's own repository. Only URL forms
   * are touched: the "bun create Archont561/ts-monorepo-template" instructions
   * in the README must keep pointing at the template itself.
   */
  private replaceIdentity(content: string): string {
    if (!content.includes(IDENTITY_PLACEHOLDER.owner)) return content;
    const { owner, repo } = this;
    return content
      .replaceAll(
        `github.com/${IDENTITY_PLACEHOLDER.owner}/${IDENTITY_PLACEHOLDER.repo}`,
        `github.com/${owner}/${repo}`,
      )
      .replaceAll(
        `codecov/c/github/${IDENTITY_PLACEHOLDER.owner}/${IDENTITY_PLACEHOLDER.repo}`,
        `codecov/c/github/${owner}/${repo}`,
      )
      .replaceAll(
        `codecov.io/gh/${IDENTITY_PLACEHOLDER.owner}/${IDENTITY_PLACEHOLDER.repo}`,
        `codecov.io/gh/${owner}/${repo}`,
      )
      .replaceAll(
        `${IDENTITY_PLACEHOLDER.owner}.github.io/${IDENTITY_PLACEHOLDER.repo}`,
        `${owner}.github.io/${repo}`,
      )
      .replaceAll(`@${IDENTITY_PLACEHOLDER.owner}`, `@${owner}`);
  }

  /**
   * Returns the selected value for an opt-in config, falling back to the
   * metadata default when no explicit override was provided.
   */
  private selectedFor(meta: ScaffoldMeta): ScaffoldSelection {
    return selectedForFeature(meta, this.configs);
  }

  /**
   * A select-type config is disabled when the "none"-ish default is chosen;
   * a confirm-type config is disabled when the user answers "no".
   */
  private isDisabled(meta: ScaffoldMeta, selected: ScaffoldSelection): boolean {
    return isDisabledSelection(meta, selected);
  }

  /**
   * Resolves which removals apply for the selected value of a config.
   * Select-type configs map values to per-value removal sets.
   * Merges top-level removals (ScaffoldMeta extends ScaffoldRemovals) with
   * per-value removals so both are honored (e.g. template self-destruct has
   * top-level scriptsToRemove + per-value extraRemovals).
   */
  private removalsFor(meta: ScaffoldMeta, selected: ScaffoldSelection): ScaffoldRemovals {
    const base: ScaffoldRemovals = {
      extraRemovals: meta.extraRemovals,
      scriptsToRemove: meta.scriptsToRemove,
      turboTasksToRemove: meta.turboTasksToRemove,
      appDepsToRemove: meta.appDepsToRemove,
      filePatternsToRemove: meta.filePatternsToRemove,
      fileRegexesToRemove: meta.fileRegexesToRemove,
    };
    if (meta.removals) {
      const perValue = meta.removals[String(selected)];
      if (perValue) {
        return {
          extraRemovals: [...(base.extraRemovals ?? []), ...(perValue.extraRemovals ?? [])],
          scriptsToRemove: [...(base.scriptsToRemove ?? []), ...(perValue.scriptsToRemove ?? [])],
          turboTasksToRemove: [
            ...(base.turboTasksToRemove ?? []),
            ...(perValue.turboTasksToRemove ?? []),
          ],
          appDepsToRemove: [...(base.appDepsToRemove ?? []), ...(perValue.appDepsToRemove ?? [])],
          filePatternsToRemove: [
            ...(base.filePatternsToRemove ?? []),
            ...(perValue.filePatternsToRemove ?? []),
          ],
          fileRegexesToRemove: [
            ...(base.fileRegexesToRemove ?? []),
            ...(perValue.fileRegexesToRemove ?? []),
          ],
        };
      }
    }
    return base;
  }

  /**
   * The TEMPLATE-ONLY scopes this scaffold strips.
   *
   * Derived by the shared `disabledScopesFor` over the same feature list the
   * rest of the run uses. The workflow generator calls it too, from the
   * selections a project recorded — two copies of this logic is exactly how the
   * two entry points drifted apart the first time.
   */
  private async computeDisabledScopes(): Promise<Set<string>> {
    return disabledScopesFor(this.featureList(), this.configs);
  }

  /**
   * Strips scoped TEMPLATE-ONLY markers from all text files.
   *
   * A block is removed entirely when ALL its scopes are disabled.
   * When any scope is enabled, only the marker lines are removed
   * and the content is preserved.
   */
  async stripTemplateMarkers(): Promise<void> {
    const result = await $`find ${markerFindArgs(this.targetDir)}`.text();

    for (const filePath of result.trim().split("\n").filter(Boolean)) {
      const target = file(filePath);
      if (!(await target.exists())) continue;

      const { content, changed } = stripMarkerBlocks(await target.text(), this.disabledScopes);
      if (changed) await write(filePath, content);
    }
  }
  /**
   * Removes files that only exist in the template source.
   */
  async removeTemplateFiles(): Promise<void> {
    for (const relativePath of FILES_TO_REMOVE) {
      const fullPath = `${this.targetDir}/${relativePath}`;
      if (await file(fullPath).exists()) {
        await $`rm -rf ${fullPath}`.quiet();
      }
    }
  }

  /**
   * Removes files matching glob patterns (data-driven, via Bun.Glob).
   */
  private async removeByGlobPatterns(patterns: string[]): Promise<void> {
    for (const pattern of patterns) {
      try {
        const glob = new Bun.Glob(pattern);
        for await (const relativePath of glob.scan({
          cwd: this.targetDir,
          dot: true,
          absolute: false,
          onlyFiles: false,
        })) {
          // Skip node_modules, .git, dist to avoid accidental mass deletion
          if (
            relativePath.includes("node_modules") ||
            relativePath.includes(".git/") ||
            relativePath.startsWith(".git") ||
            relativePath.includes("/dist/") ||
            relativePath.endsWith("/dist")
          ) {
            continue;
          }
          await $`rm -rf ${this.targetDir}/${relativePath}`.quiet();
        }
      } catch {
        // Invalid glob — fallback to direct rm for backward compat
        await $`rm -rf ${this.targetDir}/${pattern}`.quiet();
      }
    }
  }

  /**
   * Removes files matching regex patterns (data-driven).
   * Regexes are matched against relative paths from targetDir.
   */
  private async removeByRegexPatterns(regexes: string[]): Promise<void> {
    if (regexes.length === 0) return;

    const compiled = regexes.map((r) => {
      try {
        return new RegExp(r);
      } catch {
        // If not a valid regex, treat as literal substring
        return new RegExp(r.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&"));
      }
    });

    // Find all files (text-readable) to test against regexes
    const findArgs = [
      this.targetDir,
      "-type",
      "f",
      "-not",
      "-path",
      "*/node_modules/*",
      "-not",
      "-path",
      "*/.git/*",
      "-not",
      "-path",
      "*/dist/*",
      "-not",
      "-path",
      "*/.turbo/*",
    ];
    const result = await $`find ${findArgs}`.text().catch(() => "");
    const files = result.trim().split("\n").filter(Boolean);

    for (const absolutePath of files) {
      const relativePath = absolutePath.replace(`${this.targetDir}/`, "");
      if (compiled.some((re) => re.test(relativePath))) {
        await $`rm -rf ${absolutePath}`.quiet();
      }
    }
  }

  /**
   * Applies config removals entirely from discovered scaffold metadata.
   * Always-on configs survive unless they `selfDestruct` (the template);
   * opt-in configs are removed when their selection evaluates to disabled.
   */
  /**
   * True when a config survives the removal pass: always-on configs stay
   * unless they are template-only, opt-in configs stay when selected.
   */
  private isStaying(meta: ScaffoldMeta): boolean {
    return isStayingFeature(meta, this.configs);
  }

  /**
   * Every removal one disabled config asks for, applied as edits to the root
   * manifest text — the committed formatting of the entries that stay must
   * survive, so nothing here is re-serialized.
   */
  private async applyRemovals(config: DiscoveredConfig, source: string): Promise<string> {
    const { meta } = config;
    const removals = this.removalsFor(meta, this.selectedFor(meta));
    let next = source;

    // 1. Remove the config package directory
    await $`rm -rf ${this.targetDir}/configs/${config.dir}`.quiet();

    // 2. Remove the workspace dependency from root
    next = removeJsonEntry(next, `devDependencies.${config.name}`);

    // 3. Extra removals (exact paths, backward compat)
    for (const relativePath of removals.extraRemovals ?? []) {
      await $`rm -rf ${this.targetDir}/${relativePath}`.quiet();
    }

    // 3b. File patterns (glob) — data-driven
    if (removals.filePatternsToRemove) {
      await this.removeByGlobPatterns(removals.filePatternsToRemove);
    }

    // 3c. File regexes — data-driven
    if (removals.fileRegexesToRemove) {
      await this.removeByRegexPatterns(removals.fileRegexesToRemove);
    }

    // 4. Root scripts
    for (const script of removals.scriptsToRemove ?? []) {
      next = removeJsonEntry(next, `scripts.${script}`);
    }

    // 5. Turbo tasks live in their own manifest and keep its formatting too.
    if (removals.turboTasksToRemove) {
      const tasks = removals.turboTasksToRemove;
      await updateManifestFile(`${this.targetDir}/configs/turbo/turbo.base.json`, (turbo) => {
        let edited = turbo;
        for (const task of tasks) edited = removeJsonEntry(edited, `tasks.${task}`);
        return edited;
      });
    }

    // 6. App deps
    if (removals.appDepsToRemove) {
      const deps = removals.appDepsToRemove;
      await updateManifestFile(`${this.targetDir}/apps/example/package.json`, (appManifest) => {
        let edited = appManifest;
        for (const dep of deps) edited = removeJsonEntry(edited, `devDependencies.${dep}`);
        return edited;
      });
    }

    return next;
  }

  async handleConfig(): Promise<void> {
    const configs = this.featureList();
    const rootPkgPath = `${this.targetDir}/package.json`;

    await updateManifestFile(rootPkgPath, async (source) => {
      let next = source;
      for (const config of configs) {
        if (this.isStaying(config.meta)) continue;
        next = await this.applyRemovals(config, next);
      }

      // A config removal can take a whole workspace with it (native=none deletes
      // packages/native, the npm packages under npm/* included). A root
      // dependency or workspace glob left pointing at the missing directory makes
      // `bun install` fail outright, so both are reconciled with what survived.
      const reconciled = await this.reconcileWorkspaces(next);
      return reconciled.source;
    });
  }

  /**
   * Drops workspace globs that no longer match a package and `workspace:*`
   * dependencies that no longer resolve to one.
   *
   * Only entries with a `workspace:` specifier can be checked this way — a
   * regular npm dependency is left alone, even when its name matches nothing
   * locally.
   *
   * Returns the edited text, so the entries that survive keep the bytes the
   * repository committed, and reports what it dropped.
   */
  private async reconcileWorkspaces(source: string): Promise<ReconcileResult> {
    const manifest = readJson<RootManifest>(source);

    const droppedWorkspaces: string[] = [];
    for (const pattern of manifest.workspaces ?? []) {
      const manifests = [...new Glob(`${pattern}/package.json`).scanSync({ cwd: this.targetDir })];
      if (manifests.length === 0) droppedWorkspaces.push(pattern);
    }

    // Package names come from the whole tree rather than only the surviving
    // globs: a nested package (`packages/native/npm/*`) or one whose glob is
    // imprecise enough that a manifest is missed still resolves, and dropping
    // it would break `bun install` in the other direction.
    const names = new Set<string>();
    const manifests = new Glob("{apps,packages,configs}/**/package.json").scanSync({
      cwd: this.targetDir,
      onlyFiles: true,
    });
    for (const manifestPath of manifests) {
      if (/(^|\/)(node_modules|dist|target|\.git|\.turbo)\//.test(manifestPath)) continue;
      try {
        const name = (await file(`${this.targetDir}/${manifestPath}`).json()).name;
        if (typeof name === "string") names.add(name);
      } catch {
        // Unreadable manifest — treat the package as absent.
      }
    }

    const droppedDependencies: string[] = [];
    let next = source;
    for (const pattern of droppedWorkspaces) {
      next = removeJsonArrayValue(next, "workspaces", pattern);
    }
    for (const field of ["devDependencies", "dependencies"] as const) {
      for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
        if (!spec.startsWith("workspace:") || names.has(name)) continue;
        droppedDependencies.push(name);
        next = removeJsonEntry(next, `${field}.${name}`);
      }
    }

    return { source: next, droppedWorkspaces, droppedDependencies };
  }

  /**
   * Every feature dir that survives this scaffold — the vocabulary the workflow
   * generator is allowed to draw fragments from.
   */
  private enabledFeatureDirs(): Set<string> {
    return enabledDirsFor(this.featureList(), this.configs);
  }

  /**
   * Records what this project was generated from, in its root manifest.
   *
   * Workflows are built from fragments that ship inside `@myorg/tooling`, so
   * nothing left in a generated project says which features were opted out of.
   * Without this record a later `m docs` would hand back workflows for features
   * the user removed, and would reintroduce the `@myorg` placeholder and the
   * TEMPLATE-ONLY markers.
   *
   * The template repository never gets the record: every feature is on there,
   * and the absence of the key is what tells the generator to leave the markers
   * and the placeholder alone.
   */
  private async recordGenerationContext(): Promise<void> {
    const selections: Record<string, ScaffoldSelection> = {};
    for (const config of this.featureList()) {
      const flag = config.meta.flag;
      if (flag) selections[flag] = this.selectedFor(config.meta);
    }

    await updateManifestFile(`${this.targetDir}/package.json`, (source) =>
      setJsonBlock(
        setJsonBlock(source, FEATURES_MANIFEST_PATH, JSON.stringify(selections, null, 2)),
        SCOPE_MANIFEST_PATH,
        JSON.stringify(this.scope),
      ),
    );
  }

  /**
   * Regenerates `.github/workflows/*.yml` + `.github/dependabot.yml` from the
   * skeletons and step fragments that ship inside `@myorg/tooling`.
   *
   * Three things are handed over explicitly, because the generator no longer
   * reads anything from the target tree:
   *
   * - `enabled` — which features are on. It used to be inferred from which
   *   `configs/<feature>/` directories were still on disk.
   * - `postProcess` — strips TEMPLATE-ONLY blocks and swaps the `@myorg`
   *   placeholder. The fragments ship unprocessed, and this runs after the
   *   pipeline's own tree-wide marker and scope passes, so nothing else can.
   * - `templateDocsSite: false` — the template's docs site is deleted earlier
   *   in the pipeline, so the guard is switched off rather than re-tested.
   */
  async regenerateCI(): Promise<void> {
    await regenerateAll(this.targetDir, {
      templateDocsSite: false,
      enabled: this.enabledFeatureDirs(),
      postProcess: (rendered) => {
        const { content } = stripMarkerBlocks(rendered, this.disabledScopes);
        return this.replaceIdentity(content).replaceAll(this.placeholder, this.scope);
      },
    });
  }

  /**
   * Runs setup steps for enabled configs (data-driven).
   *
   * Each step is a function reference on the registry entry (see `FEATURES`),
   * not a path inside the target: R27 deletes `configs/`, so the previous
   * `${targetDir}/configs/<dir>/src/setup.ts` no longer resolves. The gating
   * rules are unchanged — always-on configs always run unless they
   * self-destruct, opt-in configs run only when enabled.
   */
  async runSetup(): Promise<void> {
    const configs = this.featureList();

    for (const config of configs) {
      const meta = config.meta;
      if (!config.setup) continue;

      // Always-on configs always run setup unless selfDestruct
      // Opt-in configs run setup only when enabled
      if (meta.default === "always" && meta.selfDestruct) continue;

      const selected = this.selectedFor(meta);
      const disabled = meta.selfDestruct || this.isDisabled(meta, selected);
      if (disabled) continue; // Only run for enabled

      await config.setup({ targetDir: this.targetDir, scope: this.scope });
    }
  }

  /**
   * Ensures the target directory is a Git repository.
   *
   * Lefthook hooks are no longer installed here — the root `prepare` script
   * (`m setup lefthook`) handles that during `bun install`,
   * which in the `bun create` flow runs after this preinstall scaffold.
   */
  async setupGitHooks(): Promise<void> {
    if (!this.gitHooks) return;

    try {
      // Use `git -C` instead of a shell cwd so no global shell state is
      // mutated (bun's canary $ shell inherits cwd across invocations).
      const isGit =
        (await $`git -C ${this.targetDir} rev-parse --is-inside-work-tree`.nothrow().quiet())
          .exitCode === 0;
      if (!isGit) {
        await $`git -C ${this.targetDir} init -q`.quiet();
      }
    } catch {
      // Graceful fallback for environments without Git
    }
  }

  /**
   * Executes the full scaffolding pipeline.
   */
  async execute(): Promise<void> {
    this.disabledScopes = await this.computeDisabledScopes();
    await this.sanitizePackageJson();
    await this.sanitizeTemplateRefs();
    await this.replaceScopePlaceholders();
    await this.stripTemplateMarkers(); // Scope-aware
    await this.removeTemplateFiles();
    await this.handleConfig(); // Data-driven removals, incl. template self-destruct
    await this.runSetup(); // Data-driven setup for enabled configs (e.g. native, skills)
    // Second pass after setup — catches files created by setup scripts (e.g. .agents/skills)
    await this.replaceScopePlaceholders();
    await this.regenerateCI(); // Workflows only — README/AGENTS are static reference files
    await this.recordGenerationContext();
    await this.setupGitHooks();

    console.log(`\n🔗 Repository identity: ${this.owner}/${this.repo}`);
    if (this.owner === UNKNOWN_OWNER) {
      console.log(
        "   Set SCAFFOLD_OWNER (or pass `owner`) to point badge and Cargo URLs at your GitHub account.",
      );
    }
  }
}

/**
 * Resolves the GitHub owner for the generated project.
 *
 * `SCAFFOLD_OWNER` wins, then the repo Actions is running in, then the local
 * git identity. Falls back to an obvious `OWNER` placeholder rather than
 * leaving the template's owner behind.
 */
export function resolveOwner(): string {
  const fromEnv = process.env.SCAFFOLD_OWNER ?? process.env.GITHUB_REPOSITORY?.split("/")[0];
  if (fromEnv) return fromEnv;

  const configured = spawnSync(["git", "config", "user.name"], { stdout: "pipe" })
    .stdout?.toString()
    .trim();
  if (configured) {
    const slug = configured.replace(/[^a-zA-Z0-9-]/g, "");
    if (slug) return slug;
  }
  return UNKNOWN_OWNER;
}

/** The new project's repository name — its directory name. */
export function resolveRepo(targetDir: string): string {
  const base = (targetDir.replace(/\/$/, "").split("/").at(-1) ?? "").trim();
  if (base && base !== "." && base !== "..") return base;
  return IDENTITY_PLACEHOLDER.repo;
}
