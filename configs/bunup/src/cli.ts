#!/usr/bin/env bun
import { spawnSync } from "bun";
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "mbunup",
    version: "1.0.0",
    description: "Bunup wrapper — bundler owned by @myorg/bunup, hoisted, use mbunup not bunup",
  },
  args: {
    entry: { type: "positional", description: "Entry files or bunup args", required: false },
  },
  run() {
    const bunup = Bun.fileURLToPath(
      import.meta.resolve("bunup/package.json").replace("package.json", "dist/cli/index.js"),
    );
    const args = process.argv.slice(2);
    const result = spawnSync({
      cmd: ["bun", bunup, ...args],
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    });
    process.exit(result.exitCode);
  },
});

runMain(main);
