#!/usr/bin/env bun
import { spawnSync } from "bun";
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "mbiome",
    version: "1.0.0",
    description: "Biome with baked config path — lint and format, no root biome.json needed",
  },
  args: {
    command: { type: "positional", description: "Biome command (check, lint, format, etc.)", required: false },
  },
  run() {
    const biome = Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome"));
    const args = process.argv.slice(2);
    const result = spawnSync({
      cmd: [biome, ...args, `--config-path=${import.meta.dir}/..`],
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    });
    process.exit(result.exitCode);
  },
});

runMain(main);
