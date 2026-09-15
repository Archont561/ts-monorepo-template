import { existsSync, readdirSync, rmSync } from "node:fs";
import { which } from "bun";
import { pkgRoot, resolveConfig } from "@/src/utils/paths";
import { defineCommand, rawArgsAfter, runMain, spawnTool } from "@/src/utils/spawn";

const bunfig = resolveConfig("bunfig.toml");

/** `m turbo` re-entered through this package, so coverage does not depend on the legacy `m turbo` bin. */
const TURBO_VIA_CLI = ["bun", `${pkgRoot()}/src/cli.ts`, "turbo"];

async function runCoverage() {
  if (!which("bun")) {
    console.error("m bun coverage needs `bun` on PATH.");
    process.exit(1);
  }
  // Per-package coverage is turbo's job; merging is m coverage's
  // (`bun run coverage` = m turbo coverage && m coverage merge).
  console.log("Running per-package coverage via turbo...\n");
  process.exit(spawnTool([...TURBO_VIA_CLI, "coverage"]));
}

/** Removes workspace node_modules dirs (never the root one — we run from it). */
function cleanModules(): void {
  const roots = ["apps", "packages", "configs"];
  let removed = 0;
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = `${root}/${entry.name}/node_modules`;
      if (!existsSync(dir)) continue;
      rmSync(dir, { recursive: true, force: true });
      removed++;
    }
  }
  console.log(`🧹 Removed ${removed} workspace node_modules dir(s) (root node_modules kept)`);
}

// Passthrough for bun commands that are not our subcommands — bypass citty to avoid "Unknown command"
const rawArgs = rawArgsAfter("bun");
const knownSubcommands = ["coverage", "test", "clean:modules"];
const isHelp = rawArgs.includes("--help") || rawArgs.includes("-h");
const isVersion = rawArgs.includes("--version") || rawArgs.includes("-v");
const firstArg = rawArgs[0];

// Same guard as changeset.ts: this runs at module scope.
const invoked = process.argv.slice(2).includes("bun");

if (
  invoked &&
  firstArg &&
  !knownSubcommands.includes(firstArg) &&
  !firstArg.startsWith("-") &&
  !isHelp &&
  !isVersion
) {
  // Direct passthrough to bun (e.g. m bun build, m bun --hot, etc.)
  const cmd =
    firstArg === "test"
      ? ["bun", firstArg, `--config=${bunfig}`, ...rawArgs.slice(1)]
      : ["bun", ...rawArgs];
  process.exit(spawnTool(cmd));
}

const coverageCommand = defineCommand({
  meta: { name: "coverage", description: "Run per-package coverage via turbo then merge LCOV" },
  run: async () => {
    await runCoverage();
  },
});

const cleanModulesCommand = defineCommand({
  meta: {
    name: "clean:modules",
    description: "Remove workspace node_modules dirs (keeps the root one)",
  },
  run() {
    cleanModules();
    process.exit(0);
  },
});

const testCommand = defineCommand({
  meta: { name: "test", description: "Run bun test with shared bunfig.toml config" },
  run() {
    const raw = rawArgsAfter("test");
    process.exit(spawnTool(["bun", "test", `--config=${bunfig}`, ...raw]));
  },
});

const main = defineCommand({
  meta: {
    name: "bun",
    version: "1.0.0",
    description: "Bun wrapper — injects shared bunfig.toml for test, provides coverage merging",
  },
  subCommands: {
    coverage: coverageCommand,
    test: testCommand,
    "clean:modules": cleanModulesCommand,
  },
  async run() {
    const raw = rawArgsAfter("bun");
    const subcommand = raw[0];

    if (subcommand === "coverage") {
      await runCoverage();
      return;
    }
    if (subcommand === "clean:modules") {
      cleanModules();
      process.exit(0);
    }

    const cmd =
      subcommand === "test"
        ? ["bun", subcommand, `--config=${bunfig}`, ...raw.slice(1)]
        : ["bun", ...raw];

    process.exit(spawnTool(cmd));
  },
});

if (import.meta.main) {
  runMain(main);
}

export default main;
