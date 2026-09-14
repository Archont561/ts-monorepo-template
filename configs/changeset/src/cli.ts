#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { defineCommand, runMain, spawnTool } from "@myorg/citty";
import { file, write } from "bun";

export async function minit(target = "changeset"): Promise<void> {
  if (target !== "changeset") {
    throw new Error(`Unknown init target '${target}' (expected "changeset")`);
  }

  const configPath = ".changeset/config.json";
  const source = "configs/changeset/config.json";

  if (await file(configPath).exists()) {
    console.log("Changeset config already exists; skipping.");
    return;
  }

  if (!(await file(source).exists())) return;

  await mkdir(".changeset", { recursive: true });
  await write(configPath, await file(source).text());
}

// Passthrough for changeset commands — bypass citty for unknown subcommands
const rawArgs = process.argv.slice(2);
const knownSubcommands = ["init"];
const firstArg = rawArgs[0];
const isHelp = rawArgs.includes("--help") || rawArgs.includes("-h");
const isVersion = rawArgs.includes("--version") || rawArgs.includes("-v");

if (
  firstArg &&
  !knownSubcommands.includes(firstArg) &&
  !firstArg.startsWith("-") &&
  !isHelp &&
  !isVersion
) {
  const changeset = Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js"));
  process.exit(spawnTool(["bun", changeset, ...rawArgs]));
}

const initCommand = defineCommand({
  meta: { name: "init", description: "Ensure .changeset/config.json exists from shared template" },
  args: {
    target: {
      type: "positional",
      description: "Init target (default: changeset)",
      required: false,
      default: "changeset",
    },
  },
  async run({ args }) {
    await minit((args.target as string) ?? "changeset");
    // citty falls through to the root command afterwards, which would spawn the
    // real `changeset init` on top of the config we just wrote.
    process.exit(0);
  },
});

const main = defineCommand({
  meta: {
    name: "mchangeset",
    version: "1.0.0",
    description: "Changesets wrapper — init config and delegate to @changesets/cli",
  },
  subCommands: { init: initCommand },
  run() {
    const raw = process.argv.slice(2);
    const changeset = Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js"));

    process.exit(spawnTool(["bun", changeset, ...raw]));
  },
});

if (import.meta.main) {
  runMain(main);
}
