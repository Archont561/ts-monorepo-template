#!/usr/bin/env bun
import { spawnSync } from "bun";

/**
 * m-prefixed Biome CLI. Bakes in the shared config directory so callers
 * never need `--config-path` or root-level biome.json.
 */
const biome = Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome"));
const args = process.argv.slice(2);

const result = spawnSync({
  cmd: [biome, ...args, `--config-path=${import.meta.dir}/..`],
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

process.exit(result.exitCode);
