#!/usr/bin/env bun
import { spawnSync } from "bun";
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "mturbo",
    version: "1.0.0",
    description: "Turbo with baked root config — no root turbo.json needed, uses turbo.base.json",
  },
  args: {
    task: {
      type: "positional",
      description: "Turbo task (build, dev, test, typecheck, etc.)",
      required: false,
    },
  },
  run() {
    const turbo = Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));
    const rootTurboJson = `${import.meta.dir}/../turbo.base.json`;
    const args = process.argv.slice(2);
    const result = spawnSync({
      cmd: ["bun", turbo, `--root-turbo-json=${rootTurboJson}`, ...args],
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    });
    process.exit(result.exitCode);
  },
});

runMain(main);
