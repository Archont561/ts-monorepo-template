#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";
import { regenerateAll } from "./aggregate";

const main = defineCommand({
  meta: {
    name: "mdocs",
    version: "1.0.0",
    description:
      "Regenerate workflows from configs/* — static README/AGENTS with TEMPLATE-ONLY blocks",
  },
  args: {
    targetDir: {
      type: "positional",
      description: "Target directory (default: .)",
      required: false,
      default: ".",
    },
  },
  async run({ args }) {
    const targetDir = (args.targetDir as string) ?? ".";
    await regenerateAll(targetDir);
  },
});

runMain(main);
