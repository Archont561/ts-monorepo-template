import { $, file } from "bun";

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
  setup?: string;
  removals?: Record<string, ScaffoldRemovals>;
  /** Custom template marker(s) declared by this package */
  marker?: string;
  templateMarker?: string;
  markers?: string[];
}

export interface DiscoveredConfig {
  name: string;
  dir: string;
  meta: ScaffoldMeta;
}

/**
 * Scans every `configs/<name>/package.json` inside `repoRoot` and returns
 * each package that declares a `scaffold` metadata field. The scaffolder has
 * zero hardcoded knowledge of individual config packages.
 */
export async function discoverConfigs(repoRoot: string): Promise<DiscoveredConfig[]> {
  const configs: DiscoveredConfig[] = [];
  const configsDir = `${repoRoot}/configs`;

  // Bun.file().exists() reports false for directories, so use a shell test.
  const isDir = await $`test -d ${configsDir}`.nothrow().quiet();
  if (isDir.exitCode !== 0) return configs;

  const entries = await $`find ${configsDir} -maxdepth 2 -name "package.json"`.text();

  for (const pkgPath of entries.trim().split("\n").filter(Boolean)) {
    const pkg = await file(pkgPath).json();
    if (!pkg.scaffold) continue;

    const dir = pkgPath.replace(`${configsDir}/`, "").replace("/package.json", "");

    configs.push({ name: pkg.name, dir, meta: pkg.scaffold });
  }

  return configs;
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
