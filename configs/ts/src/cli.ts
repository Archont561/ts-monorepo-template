#!/usr/bin/env bun
import { spawnSync } from "bun";
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "mtsc",
    version: "1.0.0",
    description: "TypeScript wrapper — tsc owned by @myorg/ts, hoisted, use mtsc not tsc",
  },
  args: {
    args: { type: "positional", description: "tsc args", required: false },
  },
  run() {
    const tsc = Bun.fileURLToPath(
      import.meta.resolve("typescript/package.json").replace("package.json", "bin/tsc"),
    );
    const args = process.argv.slice(2);
    const result = spawnSync({
      cmd: ["bun", tsc, ...args],
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    });
    process.exit(result.exitCode);
  },
});

runMain(main);
