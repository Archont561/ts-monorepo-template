import { $, write } from "bun";
import { resolveConfig } from "../utils/paths";
import { defineCommand, rawArgsAfter, runMain } from "../utils/spawn";

/**
 * Regenerates the root lefthook.yml as a one-line wrapper around the shared
 * config, then installs the Git hooks.
 *
 * The wrapper points at this package's own copy of lefthook.yml rather than
 * `node_modules/@myorg/lefthook/lefthook.yml`, so it survives R27 deleting
 * configs/.
 */
export async function msetup(target = "lefthook"): Promise<void> {
  if (target !== "lefthook") {
    throw new Error(`Unknown setup target '${target}' (expected "lefthook")`);
  }

  const shared = "node_modules/@myorg/tooling/src/configs/lefthook.yml";
  await write("lefthook.yml", `extends:\n  - ${shared}\n`);
  await $`bunx lefthook install`.quiet().nothrow();
  // Referenced so the shared config is not tree-shaken out of readers' minds:
  // the committed copy lives at resolveConfig("lefthook.yml").
  void resolveConfig("lefthook.yml");
}

const lefthookCommand = defineCommand({
  meta: { name: "lefthook", description: "Regenerate lefthook.yml wrapper and install Git hooks" },
  args: {
    target: {
      type: "positional",
      description: "Setup target (default: lefthook)",
      required: false,
      default: "lefthook",
    },
  },
  async run({ args }) {
    await msetup((args.target as string) ?? "lefthook");
  },
});

const binsCommand = defineCommand({
  meta: {
    name: "bins",
    description: "Link m-bins into node_modules/.bin (handled by bun install)",
  },
  run() {
    console.log("Bins are linked automatically on bun install via workspaces. Nothing to do.");
  },
});

const main = defineCommand({
  meta: {
    name: "setup",
    version: "1.0.0",
    description: "Setup CLI — regenerates lefthook.yml, installs hooks, ensures changeset config",
  },
  subCommands: { lefthook: lefthookCommand, bins: binsCommand },
  args: {
    target: {
      type: "positional",
      description: "Target (lefthook, bins, or empty for full setup)",
      required: false,
    },
  },
  async run({ args }) {
    const raw = rawArgsAfter("setup");
    const target = (args.target as string | undefined) ?? raw[0] ?? "lefthook";

    if (target === "lefthook") {
      await msetup("lefthook");
      return;
    }
    if (target === "bins") {
      return;
    }

    // Default: full setup
    await msetup("lefthook");
    // Dynamic: importing ./changeset statically would run its module-scope
    // passthrough while this command is what the user actually asked for.
    const { minit } = await import("./changeset");
    await minit("changeset").catch(() => {});
  },
});

if (import.meta.main) {
  runMain(main);
}

export default main;
