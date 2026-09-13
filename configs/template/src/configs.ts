import { $, file } from "bun";

export interface ScaffoldRemovals {
  extraRemovals?: string[];
  scriptsToRemove?: string[];
  turboTasksToRemove?: string[];
  appDepsToRemove?: string[];
}

export interface ScaffoldMeta extends ScaffoldRemovals {
  /** "always" = never removed. boolean/string = default for opt-in. */
  default: "always" | boolean | string;
  /** Template-only workspace: always removed from generated projects. */
  selfDestruct?: boolean;
  flag?: string;
  prompt?: string;
  type?: "confirm" | "select";
  options?: Array<{ value: string; label: string }>;
  setup?: string;
  removals?: Record<string, ScaffoldRemovals>;
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
