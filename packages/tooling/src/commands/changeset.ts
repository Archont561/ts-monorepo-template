import { mkdir } from "node:fs/promises";
import { file, write } from "bun";
import { resolveConfig } from "../utils/paths";
import { defineCommand, rawArgsAfter, runMain, spawnTool } from "../utils/spawn";

export async function minit(target = "changeset"): Promise<void> {
  if (target !== "changeset") {
    throw new Error(`Unknown init target '${target}' (expected "changeset")`);
  }

  const configPath = ".changeset/config.json";
  // Absolute path into this package's consolidated assets — the original
  // hardcoded the repo-relative "configs/changeset/config.json", which stops
  // existing once configs/ is deleted in R27.
  const source = resolveConfig("changeset.config.json");

  if (await file(configPath).exists()) {
    console.log("Changeset config already exists; skipping.");
    return;
  }
  if (!(await file(source).exists())) return;

  await mkdir(".changeset", { recursive: true });
  await write(configPath, await file(source).text());
}

const CHANGESET = Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js"));

// Passthrough for changeset commands — bypass citty for unknown subcommands
const rawArgs = rawArgsAfter("changeset");
const knownSubcommands = ["init"];
const firstArg = rawArgs[0];
const isHelp = rawArgs.includes("--help") || rawArgs.includes("-h");
const isVersion = rawArgs.includes("--version") || rawArgs.includes("-v");

// This block runs at module scope, so it must not fire merely because another
// command imported this module for `minit` — `m setup lefthook` would otherwise
// hand `setup lefthook` to the real changeset CLI.
const invoked = process.argv.slice(2).includes("changeset");

if (
  invoked &&
  firstArg &&
  !knownSubcommands.includes(firstArg) &&
  !firstArg.startsWith("-") &&
  !isHelp &&
  !isVersion
) {
  process.exit(spawnTool(["bun", CHANGESET, ...rawArgs]));
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
    name: "changeset",
    version: "1.0.0",
    description: "Changesets wrapper — init config and delegate to @changesets/cli",
  },
  subCommands: { init: initCommand },
  run() {
    process.exit(spawnTool(["bun", CHANGESET, ...rawArgsAfter("changeset")]));
  },
});

if (import.meta.main) {
  runMain(main);
}

export default main;
