#!/usr/bin/env bun
import { $, file, write } from "bun";
import { defineCommand, runMain } from "citty";

export async function msetup(target = "lefthook"): Promise<void> {
  if (target !== "lefthook") {
    throw new Error(`Unknown setup target '${target}' (expected "lefthook")`);
  }

  const lefthookPkg = await file("configs/lefthook/package.json").json();
  const wrapper = `extends:\n  - node_modules/${lefthookPkg.name}/lefthook.yml\n`;
  await write("lefthook.yml", wrapper);
  await $`bunx lefthook install`.quiet().nothrow();
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
    name: "msetup",
    version: "1.0.0",
    description:
      "Setup CLI — links m-bins, regenerates lefthook.yml, installs hooks, ensures changeset config",
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
    const raw = process.argv.slice(2);
    const target = raw[0] ?? "lefthook";

    if (target === "lefthook") {
      await msetup("lefthook");
      return;
    }
    if (target === "bins") {
      return;
    }

    // Default: full setup
    await msetup("lefthook");
    try {
      const mod = await import("@myorg/changeset/src/cli.ts");
      if ((mod as any).minit) {
        await (mod as any).minit("changeset").catch(() => {});
      }
    } catch {}
  },
});

if (import.meta.main) {
  runMain(main);
}
