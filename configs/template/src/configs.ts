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
