import { file } from "bun";

import { type FeatureSetup, setupDevcontainer, setupNative } from "./setups";

/** Values the native config accepts — one source of truth for the select metadata. */
export const NATIVE_MODES = { none: "none", publish: "publish", docker: "docker" } as const;

/** A native build mode: skip bindings, publish them, or build them in Docker. */
export type NativeMode = (typeof NATIVE_MODES)[keyof typeof NATIVE_MODES];

/**
 * How a scaffolder flag is selected: `"always"` for always-on configs, a boolean
 * for confirm configs, or one of the select-type modes.
 */
export type ScaffoldSelection = boolean | "always" | NativeMode;

/** The scope every placeholder in the template is written as. */
export const DEFAULT_SCOPE = "@myorg";

export interface ScaffoldRemovals {
  extraRemovals?: string[];
  scriptsToRemove?: string[];
  turboTasksToRemove?: string[];
  appDepsToRemove?: string[];
  /** Glob patterns (relative to targetDir) for files to remove when config is disabled. */
  filePatternsToRemove?: string[];
  /** Regex patterns (matched against relative paths) for files to remove when config is disabled. */
  fileRegexesToRemove?: string[];
  /** Custom template marker(s) declared for this removal */
  marker?: string;
  templateMarker?: string;
  markers?: string[];
  markersToRemove?: string[];
}

export interface ScaffoldOption {
  value: NativeMode | string;
  label: string;
  marker?: string;
  templateMarker?: string;
  markers?: string[];
}

export interface ScaffoldMeta extends ScaffoldRemovals {
  /** "always" = never removed. boolean/mode = default for opt-in. */
  default: ScaffoldSelection;
  /** Template-only workspace: always removed from generated projects. */
  selfDestruct?: boolean;
  flag?: string;
  prompt?: string;
  type?: "confirm" | "select";
  /** Select values — the typed vocabulary, so a typo cannot fall through. */
  options?: ScaffoldOption[];
  removals?: Record<string, ScaffoldRemovals>;
  /** Custom template marker(s) declared by this package */
  marker?: string;
  templateMarker?: string;
  markers?: string[];
}

/**
 * One scaffoldable feature.
 *
 * `dir` is kept even though `configs/` is gone (R27): it is the flag fallback
 * (`meta.flag ?? dir`) and the key every removal set is looked up by, so it is
 * part of the vocabulary rather than a filesystem detail.
 */
export interface DiscoveredConfig {
  name: string;
  dir: string;
  meta: ScaffoldMeta;
  /**
   * Runs when the feature is enabled. Replaces the old `meta.setup` path
   * string, which pointed at `${targetDir}/configs/<dir>/src/setup.ts` and so
   * stopped existing the moment `configs/` was deleted.
   */
  setup?: FeatureSetup;
  /**
   * The files under `src/ci/` this feature contributes, e.g.
   * `["sections/biome.yml"]`.
   *
   * The aggregator used to gather fragments with
   * `find <target>/configs -name '<steps>.yml'`, which made "is this feature
   * enabled?" a question about whether `configs/<dir>/` still existed. R27
   * removes that directory, so contribution is declared here and the
   * scaffolder selects from its own enabled set instead.
   *
   * `*.base.yml` entries own a workflow; `*.steps.yml` and `sections/*.yml`
   * contribute steps to one. Derived by content hash from the `configs/`
   * layout, which makes the split a perfect bijection with it — see
   * `tests/scaffold/ci-fragments.test.ts`.
   */
  ciFiles?: string[];
}

/**
 * The feature registry (R27).
 *
 * Every entry is a verbatim transcription of the `scaffold` block that used to
 * live in `configs/<dir>/package.json`, generated from those 28 manifests so
 * nothing is hand-copied. `discoverConfigs()` used to scan that directory; the
 * scan is what tied the scaffolder to a layout that no longer exists, so the
 * data is inlined here instead.
 *
 * Adding a feature means adding an entry — the scaffolder still has no
 * hardcoded knowledge of individual features beyond the `setup` references.
 *
 * Two of the old `setup` values are deliberately absent here: `changeset`
 * declared `"mchangeset init"` and `playwright` declared `"mbun x playwright
 * install --with-deps"`. Neither is a file, so the previous
 * `file(setupPath).exists()` gate skipped both on every run — they are covered
 * by the real `m changeset init` and `m e2e` commands instead.
 */
const FEATURE_RECORD = {
  badges: {
    name: "@myorg/badges",
    dir: "badges",
    meta: {
      default: "always",
      flag: "badges",
      prompt: "Include badges for CI, coverage, license in READMEs?",
    },
  },
  biome: {
    name: "@myorg/biome",
    ciFiles: ["sections/biome.yml"],
    dir: "biome",
    meta: {
      default: "always",
      flag: "biome",
      prompt: "Configure Biome (lint + format)?",
    },
  },
  "bun-config": {
    name: "@myorg/bun-config",
    ciFiles: ["sections/bun-config.yml"],
    dir: "bun-config",
    meta: {
      default: "always",
      flag: "bun-config",
      prompt: "Configure Bun (coverage, test settings)?",
    },
  },
  bunup: {
    name: "@myorg/bunup",
    ciFiles: ["sections/bunup.yml"],
    dir: "bunup",
    meta: {
      default: "always",
      flag: "bunup",
      prompt: "Configure Bunup (Bun-based package bundler)?",
    },
  },
  changeset: {
    name: "@myorg/changeset",
    ciFiles: ["fragments/changeset/release.steps.yml"],
    dir: "changeset",
    meta: {
      default: "always",
      flag: "changeset",
      prompt: "Configure Changesets (versioning + releases)?",
    },
  },
  citty: {
    name: "@myorg/citty",
    dir: "citty",
    meta: {
      default: "always",
      flag: "citty",
      prompt: "Configure Citty (elegant CLI builder)?",
    },
  },
  codeql: {
    name: "@myorg/codeql",
    ciFiles: ["sections/codeql.yml"],
    dir: "codeql",
    meta: {
      default: true,
      flag: "codeql",
      prompt: "Include CodeQL (GitHub SAST for JS/TS)?",
      type: "confirm",
    },
  },
  commitlint: {
    name: "@myorg/commitlint",
    dir: "commitlint",
    meta: {
      default: "always",
      flag: "commitlint",
      prompt: "Configure Commitlint (Conventional Commits)?",
    },
  },
  community: {
    name: "@myorg/community",
    dir: "community",
    meta: {
      default: "always",
      flag: "community",
      prompt:
        "Include community health files (CODEOWNERS, PR template, issue templates, SECURITY, CODE_OF_CONDUCT, SUPPORT, FUNDING)?",
    },
  },
  coverage: {
    name: "@myorg/coverage",
    ciFiles: [
      "fragments/coverage-report/coverage.base.yml",
      "fragments/coverage-report/coverage.steps.yml",
      "fragments/coverage-report/pages.steps.yml",
      "sections/coverage.yml",
    ],
    dir: "coverage",
    meta: {
      default: "always",
      flag: "coverage",
      prompt: "Configure coverage reporting (LCOV, HTML, artifact, Pages, threshold)?",
    },
  },
  dependabot: {
    name: "@myorg/dependabot",
    ciFiles: [
      "fragments/dependabot/dependabot-auto-merge.base.yml",
      "fragments/dependabot/dependabot-auto-merge.steps.yml",
      "fragments/dependabot/dependabot.base.yml",
      "standalone/dependabot.yml",
    ],
    dir: "dependabot",
    meta: {
      default: "always",
      flag: "dependabot",
      prompt: "Configure Dependabot (automated dependency updates)?",
    },
  },
  devcontainer: {
    name: "@myorg/devcontainer",
    dir: "devcontainer",
    setup: setupDevcontainer,
    meta: {
      default: false,
      flag: "devcontainer",
      prompt: "Include devcontainer config for Codespaces / Dev Containers?",
      type: "confirm",
      removals: {
        true: {},
        false: {
          extraRemovals: [".devcontainer"],
          filePatternsToRemove: ["**/.devcontainer/**", ".devcontainer/**", "**/devcontainer.json"],
          fileRegexesToRemove: ["devcontainer", "\\.devcontainer"],
        },
      },
    },
  },
  editorconfig: {
    name: "@myorg/editorconfig",
    dir: "editorconfig",
    meta: {
      default: "always",
      flag: "editorconfig",
      prompt: "Include .editorconfig (consistent editor settings)?",
    },
  },
  "gh-actions": {
    name: "@myorg/gh-actions",
    ciFiles: ["ci.base.yml", "ci.bootstrap.yml", "release.base.yml", "sections/gh-actions.yml"],
    dir: "gh-actions",
    meta: {
      default: "always",
      flag: "gh-actions",
      prompt: "Configure GitHub Actions (CI + release workflows)?",
    },
  },
  gitattributes: {
    name: "@myorg/gitattributes",
    dir: "gitattributes",
    meta: {
      default: "always",
      flag: "gitattributes",
      prompt: "Include .gitattributes (line endings, binary handling)?",
    },
  },
  gitleaks: {
    name: "@myorg/gitleaks",
    ciFiles: ["sections/gitleaks.yml"],
    dir: "gitleaks",
    meta: {
      default: "always",
      flag: "gitleaks",
      prompt: "Include Gitleaks (secret scanning via Lefthook + CI)?",
    },
  },
  lefthook: {
    name: "@myorg/lefthook",
    dir: "lefthook",
    meta: {
      default: "always",
      flag: "lefthook",
      prompt: "Configure Lefthook (Git hooks)?",
    },
  },
  manifest: {
    name: "@myorg/manifest",
    dir: "manifest",
    meta: {
      default: "always",
      flag: "manifest",
      prompt: "Configure the manifest editor (format-preserving package.json edits)?",
    },
  },
  native: {
    name: "@myorg/native-config",
    ciFiles: [
      "fragments/native/native.base.yml",
      "fragments/native/native.steps.yml",
      "fragments/native/release.steps.yml",
      "sections/native.yml",
    ],
    dir: "native",
    setup: setupNative,
    meta: {
      default: "none",
      flag: "native",
      prompt: "Set up native Node-API (NAPI-RS) bindings?",
      type: "select",
      options: [
        {
          value: "none",
          label: "None - skip native bindings",
        },
        {
          value: "publish",
          label: "Publish a native npm package",
        },
        {
          value: "docker",
          label: "Build native bindings in Docker",
        },
      ],
      removals: {
        none: {
          extraRemovals: ["packages/native", "apps/example/src/pages/api/native"],
          scriptsToRemove: ["build:native", "build:wasm", "test:native", "security:audit"],
          turboTasksToRemove: ["build:native", "build:wasm"],
          filePatternsToRemove: [
            "**/*.node",
            "**/*.napi.*",
            "**/*.wasi.cjs",
            "**/rust-toolchain.toml",
            "Cargo.lock",
            ".cargo/**",
            "**/native/**",
            "**/api/native/**",
          ],
          fileRegexesToRemove: ["\\\\.node$", "napi", "rust-toolchain", "api/native"],
          appDepsToRemove: ["@myorg/native"],
        },
        publish: {},
        docker: {},
      },
    },
  },
  pages: {
    name: "@myorg/pages",
    ciFiles: ["fragments/pages/pages.base.yml", "fragments/pages/pages.steps.yml"],
    dir: "pages",
    meta: {
      default: false,
      flag: "pages",
      prompt: "Set up GitHub Pages deployment (static site via Actions)?",
      type: "confirm",
      removals: {
        true: {},
        false: {
          extraRemovals: [".github/workflows/pages.yml"],
          filePatternsToRemove: ["**/pages.yml"],
          fileRegexesToRemove: ["pages\\.yml"],
        },
      },
    },
  },
  playwright: {
    name: "@myorg/playwright",
    ciFiles: ["sections/playwright.yml"],
    dir: "playwright",
    meta: {
      default: true,
      flag: "playwright",
      prompt: "Include E2E testing with Playwright?",
      removals: {
        true: {},
        false: {
          scriptsToRemove: ["test:e2e"],
          turboTasksToRemove: ["test:e2e"],
          extraRemovals: ["apps/example/playwright.config.ts", "apps/example/e2e"],
          filePatternsToRemove: ["**/e2e/**", "**/*.e2e.ts", "**/playwright.config.ts"],
          fileRegexesToRemove: ["playwright", ".*\\.spec\\.e2e\\..*"],
          appDepsToRemove: ["@myorg/playwright", "@playwright/test"],
        },
      },
    },
  },
  skills: {
    name: "@myorg/skills",
    dir: "skills",
    meta: {
      default: false,
      flag: "skills",
      prompt: "Install AI agent skills? (for Cursor, Claude, Cline)",
      removals: {
        false: {
          extraRemovals: [".agents"],
          filePatternsToRemove: [".agents/**", "**/.claude/**", "**/skills/**"],
          fileRegexesToRemove: ["\\.agents", "skills"],
          scriptsToRemove: ["skills"],
        },
      },
    },
  },
  stale: {
    name: "@myorg/stale",
    ciFiles: ["fragments/stale/stale.base.yml"],
    dir: "stale",
    meta: {
      default: false,
      flag: "stale",
      prompt: "Include stale action (auto-close inactive issues/PRs)?",
      type: "confirm",
    },
  },
  template: {
    name: "@myorg/template",
    dir: "template",
    meta: {
      default: "always",
      selfDestruct: true,
      scriptsToRemove: ["docs:sync", "docs:site", "docs:dev", "docs:build", "docs:preview"],
      removals: {
        always: {
          extraRemovals: [
            ".github/workflows/template-docs.yml",
            "apps/template-docs",
            "codecov.yml",
            // The scaffolder ships in every generated project as the toolchain,
            // but it has nothing left to scaffold there: its tests drive the
            // harness against a template repo, and the committed bundle only
            // exists to run `bun-create.preinstall`.
            "packages/tooling/tests",
            "packages/tooling/dist",
          ],
          filePatternsToRemove: ["**/template-docs.yml", "**/template-docs/**", ".changeset/*.md"],
          fileRegexesToRemove: ["template-docs"],
        },
      },
    },
  },
  trivy: {
    name: "@myorg/trivy",
    ciFiles: ["sections/trivy.yml"],
    dir: "trivy",
    meta: {
      default: false,
      flag: "trivy",
      prompt: "Include Trivy (container + filesystem vulnerability scanning)?",
      type: "confirm",
      removals: {
        false: {
          filePatternsToRemove: ["**/trivy*"],
          scriptsToRemove: ["security:trivy", "security:check"],
        },
      },
    },
  },
  ts: {
    name: "@myorg/ts",
    dir: "ts",
    meta: {
      default: "always",
      flag: "ts",
      prompt: "Configure TypeScript (shared tsconfigs)?",
    },
  },
  turbo: {
    name: "@myorg/turbo",
    ciFiles: ["sections/turbo.yml"],
    dir: "turbo",
    meta: {
      default: "always",
      flag: "turbo",
      prompt: "Configure Turbo (task orchestration)?",
    },
  },
} satisfies Record<string, DiscoveredConfig>;

/**
 * Every scaffoldable feature, in a deterministic (alphabetical by `dir`) order.
 *
 * The old directory scan returned whatever order `find` produced, which is
 * filesystem-dependent; prompt order and removal order are now reproducible.
 */
export const FEATURES: readonly DiscoveredConfig[] = Object.values(FEATURE_RECORD);

/** Fast lookup by `dir` — the key removals and flags are addressed by. */
export const FEATURES_BY_DIR: ReadonlyMap<string, DiscoveredConfig> = new Map(
  FEATURES.map((feature) => [feature.dir, feature]),
);

/**
 * Returns every registered feature.
 *
 * The signature is unchanged so callers do not move: `repoRoot` is accepted and
 * deliberately unused, because discovery no longer depends on the shape of the
 * target directory. It used to read `configs/<dir>/package.json` out of the copy
 * being scaffolded — see `FEATURES` for why that indirection is gone.
 */
export async function discoverConfigs(_repoRoot?: string): Promise<DiscoveredConfig[]> {
  return [...FEATURES];
}

/** Flag -> the value chosen for it, as recorded in a generated project. */
export type ConfigMap = Record<string, ScaffoldSelection>;

/** Root manifest entry a generated project records its selections under. */
export const FEATURES_MANIFEST_PATH = "tooling.features";

/** Root manifest entry a generated project records its package scope under. */
export const SCOPE_MANIFEST_PATH = "tooling.scope";

/** The select values, as plain strings, for membership tests. */
const NATIVE_MODE_VALUES: readonly string[] = Object.values(NATIVE_MODES);

/**
 * Narrows an unknown manifest value to a selection.
 *
 * A predicate rather than a cast, so a hand-edited manifest that names a mode
 * this build does not know about is dropped instead of flowing into the
 * scaffolder as a value with no removal set behind it.
 */
function isScaffoldSelection(value: unknown): value is ScaffoldSelection {
  if (typeof value === "boolean") return true;
  if (typeof value !== "string") return false;
  return value === "always" || NATIVE_MODE_VALUES.includes(value);
}

/** The value a feature ends up with: the caller's choice, else its default. */
export function selectedFor(meta: ScaffoldMeta, configs: ConfigMap): ScaffoldSelection {
  const selected = meta.flag ? configs[meta.flag] : undefined;
  return selected === undefined ? meta.default : selected;
}

/**
 * True when a selection means "off": the "none"-ish default for a select, a
 * falsy answer for a confirm.
 */
export function isDisabledSelection(meta: ScaffoldMeta, selected: ScaffoldSelection): boolean {
  return meta.type === "select" ? selected === meta.default : !selected;
}

/**
 * True when a feature survives into the generated project: always-on features
 * stay unless they are template-only, opt-in features stay when selected.
 */
export function isStaying(meta: ScaffoldMeta, configs: ConfigMap): boolean {
  if (meta.default === "always" && !meta.selfDestruct) return true;
  const selected = selectedFor(meta, configs);
  return !(meta.selfDestruct === true || isDisabledSelection(meta, selected));
}

/**
 * Every feature dir that survives a scaffold with these selections.
 *
 * The feature list is a parameter rather than a read of `FEATURES` so a
 * scaffolder running with an injected list stays consistent with the scopes it
 * computes from the same list.
 */
export function enabledDirsFor(
  features: readonly DiscoveredConfig[],
  configs: ConfigMap,
): Set<string> {
  const dirs = new Set<string>();
  for (const feature of features) {
    if (isStaying(feature.meta, configs)) dirs.add(feature.dir);
  }
  return dirs;
}

/**
 * Every TEMPLATE-ONLY scope that a scaffold with these selections strips.
 *
 * `template` is always in the set: the template's own blocks never survive into
 * a generated project. Beyond that a scope is disabled when its feature is off,
 * or when it belongs to a select option the user did not pick.
 *
 * Shared with the workflow generator, which has to reach the same conclusion
 * from the recorded selections alone — two copies of this logic is how the
 * scaffolder and the generator drifted apart the first time.
 */
export function disabledScopesFor(
  features: readonly DiscoveredConfig[],
  configs: ConfigMap,
): Set<string> {
  const scopes = new Set<string>(["template"]);

  for (const feature of features) {
    const { meta } = feature;
    if (meta.default === "always") continue;
    const selected = selectedFor(meta, configs);

    if (isDisabledSelection(meta, selected)) {
      scopes.add(feature.dir);
      if (meta.flag) scopes.add(meta.flag);
      if (meta.marker) scopes.add(meta.marker);
      if (meta.templateMarker) scopes.add(meta.templateMarker);
      for (const m of meta.markers ?? []) scopes.add(m);
    }

    for (const opt of meta.options ?? []) {
      if (opt.value === selected) continue;
      if (opt.marker) scopes.add(opt.marker);
      if (opt.templateMarker) scopes.add(opt.templateMarker);
      for (const m of opt.markers ?? []) scopes.add(m);
    }

    const removal = meta.removals?.[String(selected)];
    if (removal) {
      if (removal.marker) scopes.add(removal.marker);
      if (removal.templateMarker) scopes.add(removal.templateMarker);
      for (const m of removal.markers ?? []) scopes.add(m);
      for (const m of removal.markersToRemove ?? []) scopes.add(m);
    }
  }

  return scopes;
}

/**
 * The selections a generated project recorded when it was scaffolded, or null
 * when its manifest carries no record.
 *
 * The template repository itself has no record, which is the signal that every
 * feature is on. A generated project needs one because workflows are built from
 * fragments that ship inside this package: nothing left in the project's tree
 * says which features were opted out of, so a later `m docs` would otherwise
 * hand back workflows for features the user removed.
 */
export async function readRecordedSelections(targetDir: string): Promise<ConfigMap | null> {
  const manifest = file(`${targetDir}/package.json`);
  if (!(await manifest.exists())) return null;

  try {
    const pkg = (await manifest.json()) as { tooling?: { features?: unknown } };
    const recorded = pkg.tooling?.features;
    if (!recorded || typeof recorded !== "object" || Array.isArray(recorded)) return null;

    const configs: ConfigMap = {};
    for (const [flag, value] of Object.entries(recorded)) {
      if (isScaffoldSelection(value)) configs[flag] = value;
    }
    return configs;
  } catch {
    return null;
  }
}

/** The package scope a generated project recorded, or null when it has none. */
export async function readRecordedScope(targetDir: string): Promise<string | null> {
  const manifest = file(`${targetDir}/package.json`);
  if (!(await manifest.exists())) return null;

  try {
    const pkg = (await manifest.json()) as { tooling?: { scope?: unknown } };
    const scope = pkg.tooling?.scope;
    return typeof scope === "string" && scope.length > 0 ? scope : null;
  } catch {
    return null;
  }
}

export interface RegisteredConfigInfo {
  name: string;
  dir: string;
  flag: string;
  type: "confirm" | "select" | "always";
  default: ScaffoldSelection;
  options: string[];
  isOptIn: boolean;
  selfDestruct?: boolean;
}

export interface RegisteredConfigsMetadata {
  allConfigs: RegisteredConfigInfo[];
  optInConfigs: RegisteredConfigInfo[];
  alwaysConfigs: RegisteredConfigInfo[];
  byFlag: Record<string, RegisteredConfigInfo>;
  /** Creates a ConfigMap where every opt-in config is disabled (false or "none"). */
  buildDisabledConfigs: () => Record<string, ScaffoldSelection>;
  /** Creates a ConfigMap where every opt-in config is enabled (true or first non-none option). */
  buildEnabledConfigs: () => Record<string, ScaffoldSelection>;
  /** Creates a ConfigMap with the defaults declared in package.json metadata. */
  buildDefaultConfigs: () => Record<string, ScaffoldSelection>;
}

/**
 * Autoregisters and structures metadata from all discovered packages in the repo.
 * Provides ready-to-use config maps and query helpers for testing and scaffolding.
 */
export function registerConfigsMetadata(discovered: DiscoveredConfig[]): RegisteredConfigsMetadata {
  const allConfigs: RegisteredConfigInfo[] = discovered.map((c) => {
    const flag = c.meta.flag ?? c.dir;
    const isOptIn = c.meta.default !== "always" && !c.meta.selfDestruct;
    const type: "confirm" | "select" | "always" =
      c.meta.default === "always" ? "always" : c.meta.type === "select" ? "select" : "confirm";
    const options =
      c.meta.options?.map((o) => (typeof o === "string" ? o : String(o.value))) ??
      (type === "confirm" ? ["false", "true"] : []);

    return {
      name: c.name,
      dir: c.dir,
      flag,
      type,
      default: c.meta.default,
      options,
      isOptIn,
      selfDestruct: c.meta.selfDestruct,
    };
  });

  const optInConfigs = allConfigs.filter((c) => c.isOptIn);
  const alwaysConfigs = allConfigs.filter((c) => !c.isOptIn && !c.selfDestruct);
  const byFlag: Record<string, RegisteredConfigInfo> = {};
  for (const c of allConfigs) {
    byFlag[c.flag] = c;
  }

  const buildDisabledConfigs = (): Record<string, ScaffoldSelection> => {
    const map: Record<string, ScaffoldSelection> = {};
    for (const c of optInConfigs) {
      if (c.type === "select") {
        map[c.flag] = "none";
      } else {
        map[c.flag] = false;
      }
    }
    return map;
  };

  const buildEnabledConfigs = (): Record<string, ScaffoldSelection> => {
    const map: Record<string, ScaffoldSelection> = {};
    for (const c of optInConfigs) {
      if (c.type === "select") {
        const enabledOpt = c.options.find((o) => o !== "none") ?? c.options[0] ?? "publish";
        map[c.flag] = enabledOpt as ScaffoldSelection;
      } else {
        map[c.flag] = true;
      }
    }
    return map;
  };

  const buildDefaultConfigs = (): Record<string, ScaffoldSelection> => {
    const map: Record<string, ScaffoldSelection> = {};
    for (const c of optInConfigs) {
      map[c.flag] = c.default;
    }
    return map;
  };

  return {
    allConfigs,
    optInConfigs,
    alwaysConfigs,
    byFlag,
    buildDisabledConfigs,
    buildEnabledConfigs,
    buildDefaultConfigs,
  };
}

/**
 * Automatically discovers all package configs from repoRoot and registers their metadata.
 */
export async function getRegisteredConfigs(repoRoot: string): Promise<RegisteredConfigsMetadata> {
  const discovered = await discoverConfigs(repoRoot);
  return registerConfigsMetadata(discovered);
}
