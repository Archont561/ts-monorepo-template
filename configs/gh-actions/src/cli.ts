#!/usr/bin/env bun
import { spawnSync } from "bun";

/**
 * m-prefixed actionlint CLI. Bakes in the shared actionlint config so
 * callers never need `-config-file` or root-level config.
 */
const actionlint = Bun.fileURLToPath(
  import.meta.resolve("github-actionlint/dist/bin/actionlint.js"),
);
const args = process.argv.slice(2);

const result = spawnSync({
  cmd: ["bun", actionlint, `-config-file=${import.meta.dir}/../actionlint.yaml`, ...args],
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

process.exit(result.exitCode);
