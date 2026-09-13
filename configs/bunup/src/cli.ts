#!/usr/bin/env bun
import { spawnSync } from "bun";

/**
 * m-prefixed Bunup CLI. Wraps the `bunup` binary so callers never need
 * to depend on `bunup` directly – it is owned by `@myorg/bunup` and hoisted
 * from there. All library and config packages should use `mbunup` instead
 * of `bunup`.
 */
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
