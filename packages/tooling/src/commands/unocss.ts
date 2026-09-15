import { existsSync } from "node:fs";
import { which } from "bun";
import { repoRoot, resolveConfig } from "../utils/paths";
import { defineCommand, spawnTool } from "../utils/spawn";

/**
 * The shared UnoCSS config lives in this package, so callers never pass
 * `--config ../../configs/unocss/uno.config.ts` by hand.
 */
const CONFIG_PATH = resolveConfig("uno.config.ts");

/**
 * The shared config scans root-relative patterns (`apps/example/src/**`), so
 * the UnoCSS CLI has to run from the repo root — otherwise an app that calls
 * `munocss build` from its own directory matches nothing.
 */
const REPO_ROOT = repoRoot();

/** Resolved relative to this file, so munocss works from any package dir. */
function configExists(): boolean {
  return existsSync(CONFIG_PATH);
}

/**
 * The `unocss` bin ships with @unocss/cli (a dependency of `unocss`, which has
 * no bin of its own). Prefer the locally installed CLI so the version matches
 * the lockfile; fall back to whatever `unocss` is on PATH.
 */
async function unocssBin(): Promise<string[] | null> {
  try {
    const pkgPath = Bun.fileURLToPath(import.meta.resolve("@unocss/cli/package.json"));
    const pkg = (await Bun.file(pkgPath).json()) as { bin?: Record<string, string> };
    const bin = pkg.bin?.unocss;
    if (bin) return ["bun", pkgPath.replace("package.json", bin)];
  } catch {
    // not resolvable from here — try PATH below
  }
  return which("unocss") ? ["unocss"] : null;
}

/**
 * Output files declared by the config's `cli.entry`, printed after a build so a
 * CI log shows where the CSS actually landed.
 */
async function outputFiles(): Promise<string[]> {
  try {
    const mod = await import(CONFIG_PATH);
    const config = mod.default as { cli?: { entry?: Array<{ outFile?: string }> } } | undefined;
    return (config?.cli?.entry ?? []).map((entry) => entry.outFile).filter((f): f is string => !!f);
  } catch {
    return [];
  }
}

async function runUnocss(extraArgs: string[]): Promise<number> {
  if (!configExists()) {
    console.warn("⚠️ UnoCSS not enabled (configs/unocss/uno.config.ts missing) — skipping");
    return 0;
  }
  const bin = await unocssBin();
  if (!bin) {
    console.warn(
      "⚠️ unocss CLI not found — skipping (install: bun add -d @unocss/cli, or use the unocss config package)",
    );
    return 0;
  }
  return spawnTool([...bin, "--config", CONFIG_PATH, ...extraArgs], { cwd: REPO_ROOT });
}

const buildCommand = defineCommand({
  meta: { name: "build", description: "Generate CSS with the shared UnoCSS config" },
  async run() {
    const code = await runUnocss([]);
    if (code !== 0) {
      console.error(`::error::unocss build failed (exit ${code})`);
      process.exit(code);
    }
    if (!configExists()) process.exit(0);
    const outputs = await outputFiles();
    if (outputs.length > 0) console.log(`✅ CSS built: ${outputs.join(", ")}`);
    process.exit(0);
  },
});

const watchCommand = defineCommand({
  meta: { name: "watch", description: "Same as build, in watch mode" },
  async run() {
    const code = await runUnocss(["--watch"]);
    process.exit(code);
  },
});

const infoCommand = defineCommand({
  meta: { name: "info", description: "Show whether UnoCSS is enabled and what it writes" },
  async run() {
    const enabled = configExists();
    console.log(`enabled: ${enabled}`);
    console.log(`config:  ${CONFIG_PATH}${enabled ? "" : " (missing)"}`);
    if (!enabled) process.exit(0);
    const outputs = await outputFiles();
    console.log(`outputs: ${outputs.length > 0 ? outputs.join(", ") : "(none declared)"}`);
    process.exit(0);
  },
});

const main = defineCommand({
  meta: {
    name: "munocss",
    version: "1.0.0",
    description: "UnoCSS wrapper — owns the shared config path, skips cleanly when disabled",
  },
  subCommands: {
    build: buildCommand,
    watch: watchCommand,
    info: infoCommand,
  },
  run() {
    console.log(`\nmunocss — UnoCSS with the shared config (configs/unocss/uno.config.ts)

Usage:
  munocss <command>

Commands:
  build     Generate CSS (no-op when UnoCSS is not enabled)
  watch     Generate CSS in watch mode
  info      Show config path and declared output files

Examples:
  munocss build          # in an app's "build" script
  munocss watch          # in an app's "build:css:watch" script
`);
    process.exit(0);
  },
});

export default main;
