import { mkdir } from "node:fs/promises";
import { $, file, write } from "bun";
import { aggregateWorkflow } from "./aggregate";
import type { ScaffoldMeta, ScaffoldRemovals } from "./configs";
import { discoverConfigs } from "./configs";

export interface ScaffolderOptions {
  targetDir?: string;
  scope?: string;
  gitHooks?: boolean;
  /** Flag -> selected value for opt-in configs (from scaffold metadata). */
  configs?: Record<string, boolean | string>;
}

const FILES_TO_REMOVE: string[] = ["tests/template.test.ts"];

const PACKAGE_JSON_KEYS_TO_REMOVE = ["bun-create"];

const PACKAGE_JSON_SCRIPTS_TO_REMOVE = ["build:template", "search:tools"];

export class MonorepoScaffolder {
  readonly targetDir: string;
  readonly scope: string;
  readonly gitHooks: boolean;
  readonly configs: Record<string, boolean | string>;
  private readonly placeholder = "@myorg";
  private disabledScopes = new Set<string>(["template"]);

  constructor(options: ScaffolderOptions = {}) {
    this.targetDir = options.targetDir ?? ".";
    this.scope = options.scope ?? "@myorg";
    this.gitHooks = options.gitHooks ?? true;
    this.configs = options.configs ?? {};
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

    // CONTRIBUTING.md is a static root doc that should not leak template-only
    // paths. Filter any lingering references to the template workspace that
    // might have been introduced in the source repo.
    const contributingPath = `${this.targetDir}/CONTRIBUTING.md`;
    const contributing = file(contributingPath);
    if (await contributing.exists()) {
      const content = await contributing.text();
      if (/configs\/template/.test(content)) {
        // Replace with a generic example that does not reference the template
        // workspace, preserving the surrounding context.
        const sanitized = content.replaceAll(/configs\/template\/[^\s`)]*/g, "configs/bun-config");
        await write(contributingPath, sanitized);
      }
    }
  }

  /**
   * Replaces the placeholder scope (@myorg) with the user's scope
   * across all workspace files, configs, docs, and source code.
   */
  async replaceScopePlaceholders(): Promise<void> {
    const files = [
      // Root manifests and wrappers
      "package.json",
      "lefthook.yml",

      // Documentation
      "README.md",
      "AGENTS.md",
      "LICENSE.md",
      "CONTRIBUTING.md",
      "packages/external/README.md",
      "packages/internal/README.md",
      "apps/example/README.md",

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

      // Example app
      "apps/example/package.json",
      "apps/example/tsconfig.json",
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
    ];

    // Config package manifests and config files carry the @myorg scope in
    // their names and contents (e.g. changeset ignore lists). Replacing the
    // placeholder across all surviving config sources -- except the template
    // workspace itself, which is removed later -- keeps generated projects
    // free of the template scope.
    const configFiles =
      await $`find ${this.targetDir}/configs -type f -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/configs/template/*"`
        .text()
        .catch(() => "");
    for (const absolutePath of configFiles.trim().split("\n").filter(Boolean)) {
      const relativePath = absolutePath.replace(`${this.targetDir}/`, "");
      if (/\.(json|ts|js|md|yml|yaml|toml)$/.test(relativePath)) {
        files.push(relativePath);
      }
    }

    for (const relativePath of files) {
      const fullPath = `${this.targetDir}/${relativePath}`;
      const target = file(fullPath);

      if (await target.exists()) {
        const content = await target.text();
        if (content.includes(this.placeholder)) {
          await write(fullPath, content.replaceAll(this.placeholder, this.scope));
        }
      }
    }
  }

  /**
   * Returns the selected value for an opt-in config, falling back to the
   * metadata default when no explicit override was provided.
   */
  private selectedFor(meta: ScaffoldMeta): boolean | string {
    const selected = meta.flag ? this.configs[meta.flag] : undefined;
    if (selected !== undefined) return selected;
    return meta.default as boolean | string;
  }

  /**
   * A select-type config is disabled when the "none"-ish default is chosen;
   * a confirm-type config is disabled when the user answers "no".
   */
  private isDisabled(meta: ScaffoldMeta, selected: boolean | string): boolean {
    return meta.type === "select" ? selected === meta.default : !selected;
  }

  /**
   * Resolves which removals apply for the selected value of a config.
   * Select-type configs map values to per-value removal sets.
   */
  private removalsFor(meta: ScaffoldMeta, selected: boolean | string): ScaffoldRemovals {
    if (meta.removals) {
      const perValue = meta.removals[String(selected)];
      if (perValue) return perValue;
    }
    return meta;
  }

  /**
   * Computes the set of TEMPLATE-ONLY scopes to strip based on the
   * discovered config metadata and the user's selections.
   */
  private async computeDisabledScopes(): Promise<Set<string>> {
    const scopes = new Set<string>(["template"]);
    const configs = await discoverConfigs(this.targetDir);

    for (const config of configs) {
      if (config.meta.default === "always") continue;
      const selected = this.selectedFor(config.meta);
      if (this.isDisabled(config.meta, selected)) {
        scopes.add(config.dir);
      }
    }

    return scopes;
  }

  /**
   * Strips scoped TEMPLATE-ONLY markers from all text files.
   *
   * A block is removed entirely when ALL its scopes are disabled.
   * When any scope is enabled, only the marker lines are removed
   * and the content is preserved.
   */
  async stripTemplateMarkers(): Promise<void> {
    const disabled = this.disabledScopes;

    const patterns: Array<{
      regex: RegExp;
    }> = [
      {
        // YAML/TOML/shell: # TEMPLATE-ONLY:START(scope)
        regex:
          /#[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)#[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,
      },
      {
        // TS/JS: // TEMPLATE-ONLY:START(scope)
        regex:
          /\/\/[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)\/\/[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,
      },
      {
        // HTML/MD: <!-- TEMPLATE-ONLY:START(scope) -->
        regex:
          /<!--[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[ \t]*-->([\s\S]*?)<!--[ \t]*TEMPLATE-ONLY:END\([^)]*\)[ \t]*-->[ \t]*\n?/g,
      },
    ];

    const extensions = [".yml", ".yaml", ".ts", ".js", ".md", ".toml", ".html"];

    // Bun's shell does not word-split interpolated strings, so the find
    // arguments must be spread as an array (one element per word).
    const findArgs = [
      this.targetDir,
      "-type",
      "f",
      "(",
      ...extensions.flatMap((e, i) => [...(i > 0 ? ["-o"] : []), "-name", `*${e}`]),
      ")",
      "-not",
      "-path",
      "*/node_modules/*",
      "-not",
      "-path",
      "*/dist/*",
      "-not",
      "-path",
      "*/configs/template/*",
    ];

    const result = await $`find ${findArgs}`.text();

    for (const filePath of result.trim().split("\n").filter(Boolean)) {
      const target = file(filePath);
      if (!(await target.exists())) continue;

      let content = await target.text();
      let modified = false;

      for (const { regex } of patterns) {
        const next = content.replace(regex, (_match, scopesStr, innerContent) => {
          const scopes = scopesStr.split(",").map((s: string) => s.trim());
          const shouldStrip = scopes.every((s: string) => disabled.has(s));

          modified = true;
          if (shouldStrip) {
            return ""; // Remove entire block
          }
          // Keep content, remove only marker lines
          return innerContent;
        });
        content = next;
      }

      if (modified) {
        content = content.replace(/\n{3,}/g, "\n\n");
        await write(filePath, content);
      }
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
  async handleConfig(): Promise<void> {
    const configs = await discoverConfigs(this.targetDir);
    const rootPkgPath = `${this.targetDir}/package.json`;
    if (!(await file(rootPkgPath).exists())) return;
    const rootPkg = await file(rootPkgPath).json();

    for (const config of configs) {
      const meta = config.meta;

      // Always-on configs are kept unless they are template-only.
      if (meta.default === "always" && !meta.selfDestruct) continue;

      const selected = this.selectedFor(meta);
      const disabled = meta.selfDestruct || this.isDisabled(meta, selected);
      if (!disabled) continue;

      const removals = this.removalsFor(meta, selected);

      // 1. Remove the config package directory
      await $`rm -rf ${this.targetDir}/configs/${config.dir}`.quiet();

      // 2. Remove the workspace dependency from root
      delete rootPkg.devDependencies?.[config.name];

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
        delete rootPkg.scripts?.[script];
      }

      // 5. Turbo tasks
      if (removals.turboTasksToRemove) {
        const turboPath = `${this.targetDir}/configs/turbo/turbo.base.json`;
        if (await file(turboPath).exists()) {
          const turbo = await file(turboPath).json();
          for (const task of removals.turboTasksToRemove) {
            delete turbo.tasks?.[task];
          }
          await write(turboPath, `${JSON.stringify(turbo, null, 2)}\n`);
        }
      }

      // 6. App deps
      if (removals.appDepsToRemove) {
        const appPkgPath = `${this.targetDir}/apps/example/package.json`;
        if (await file(appPkgPath).exists()) {
          const appPkg = await file(appPkgPath).json();
          for (const dep of removals.appDepsToRemove) {
            delete appPkg.devDependencies?.[dep];
          }
          await write(appPkgPath, `${JSON.stringify(appPkg, null, 2)}\n`);
        }
      }
    }

    await write(rootPkgPath, `${JSON.stringify(rootPkg, null, 2)}\n`);
  }

  /**
   * Regenerates `.github/workflows/*.yml` from the gh-actions base skeletons
   * and the surviving configs' step fragments.
   */
  async regenerateCI(): Promise<void> {
    await mkdir(`${this.targetDir}/.github/workflows`, { recursive: true });
    await aggregateWorkflow(this.targetDir, "ci.base.yml", "ci.steps.yml");
    await aggregateWorkflow(this.targetDir, "release.base.yml", "release.steps.yml");
    // Only generate pages.yml if pages config is enabled (exists)
    const pagesConfigExists = await file(`${this.targetDir}/configs/pages/package.json`).exists();
    if (pagesConfigExists) {
      await aggregateWorkflow(this.targetDir, "pages.base.yml", "pages.steps.yml");
    } else {
      const pagesWorkflow = `${this.targetDir}/.github/workflows/pages.yml`;
      if (await file(pagesWorkflow).exists()) {
        await $`rm -rf ${pagesWorkflow}`.quiet();
        console.log(`🗑️ Removed ${pagesWorkflow} (pages disabled)`);
      }
    }
  }

  /**
   * Runs setup scripts for enabled configs (data-driven).
   * Setup scripts are declared in scaffold.setup and are executed when config is enabled.
   * Used for native bindings to scaffold packages/native/ when selected.
   */
  async runSetup(): Promise<void> {
    const configs = await discoverConfigs(this.targetDir);

    for (const config of configs) {
      const meta = config.meta;
      if (!meta.setup) continue;

      // Always-on configs always run setup unless selfDestruct
      // Opt-in configs run setup only when enabled
      if (meta.default === "always" && meta.selfDestruct) continue;

      const selected = this.selectedFor(meta);
      const disabled = meta.selfDestruct || this.isDisabled(meta, selected);
      if (disabled) continue; // Only run for enabled

      const setupPath = `${this.targetDir}/${meta.setup}`;
      if (!(await file(setupPath).exists())) continue;

      console.log(`\n🔧 Running setup for ${config.dir}: ${meta.setup}\n`);
      try {
        // Run setup script with scope env
        const proc = Bun.spawn({
          cmd: ["bun", setupPath],
          cwd: this.targetDir,
          env: {
            ...process.env,
            NATIVE_SCOPE: this.scope,
            UNOCSS_SCOPE: this.scope,
            DEVCONTAINER_SCOPE: this.scope,
          },
          stdout: "inherit",
          stderr: "inherit",
        });
        await proc.exited;
      } catch (e) {
        console.warn(`⚠️ Setup for ${config.dir} failed:`, e);
      }
    }
  }

  /**
   * Ensures the target directory is a Git repository.
   *
   * Lefthook hooks are no longer installed here — the root `prepare` script
   * (`msetup lefthook`) handles that during `bun install`,
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
    await this.runSetup(); // Data-driven setup for enabled configs (e.g. native)
    await this.regenerateCI(); // Workflows only — README/AGENTS are static reference files
    await this.setupGitHooks();
  }
}
