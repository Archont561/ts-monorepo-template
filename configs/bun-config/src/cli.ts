#!/usr/bin/env bun
import { existsSync, readdirSync, rmSync } from "node:fs";
import { defineCommand, runMain, spawnTool } from "@myorg/citty";
import { which } from "bun";

const bunfig = `${import.meta.dir}/../bunfig.toml`;

async function runCoverage() {
  const mturbo = which("mturbo");
  if (!mturbo) {
    console.error(
      "mbun coverage needs `mturbo` on PATH — run `bun install` first (it links the m-bins into node_modules/.bin).",
    );
    process.exit(1);
  }

  // Per-package coverage is turbo's job; merging is mcoverage's
  // (`bun run coverage` = mturbo coverage && mcoverage merge).
  console.log("Running per-package coverage via mturbo...\n");
  process.exit(spawnTool([mturbo, "coverage"]));
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
const rawArgs = process.argv.slice(2);
const knownSubcommands = ["coverage", "test", "clean:modules"];
const isHelp = rawArgs.includes("--help") || rawArgs.includes("-h");
const isVersion = rawArgs.includes("--version") || rawArgs.includes("-v");
const firstArg = rawArgs[0];

if (
  firstArg &&
  !knownSubcommands.includes(firstArg) &&
  !firstArg.startsWith("-") &&
  !isHelp &&
  !isVersion
) {
  // Direct passthrough to bun (e.g. mbun build, mbun --hot, etc.)
  let cmd: string[];
  if (firstArg === "test") {
    cmd = ["bun", firstArg, `--config=${bunfig}`, ...rawArgs.slice(1)];
  } else {
    cmd = ["bun", ...rawArgs];
  }
  process.exit(spawnTool(cmd));
}

const coverageCommand = defineCommand({
  meta: { name: "coverage", description: "Run per-package coverage via mturbo then merge LCOV" },
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
    const raw = process.argv.slice(3);
    const cmd = ["bun", "test", `--config=${bunfig}`, ...raw];
    process.exit(spawnTool(cmd));
  },
});

const main = defineCommand({
  meta: {
    name: "mbun",
    version: "1.0.0",
    description: "Bun wrapper — injects shared bunfig.toml for test, provides coverage merging",
  },
  subCommands: {
    coverage: coverageCommand,
    test: testCommand,
    "clean:modules": cleanModulesCommand,
  },
  async run() {
    const raw = process.argv.slice(2);
    const subcommand = raw[0];

    if (subcommand === "coverage") {
      await runCoverage();
      return;
    }

    if (subcommand === "clean:modules") {
      cleanModules();
      process.exit(0);
    }

    let cmd: string[];
    if (subcommand === "test") {
      cmd = ["bun", subcommand, `--config=${bunfig}`, ...raw.slice(1)];
    } else {
      cmd = ["bun", ...raw];
    }

    process.exit(spawnTool(cmd));
  },
});

runMain(main);
