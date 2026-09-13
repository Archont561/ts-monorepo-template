#!/usr/bin/env bun
import { spawnSync } from "bun";

/**
 * m-prefixed TypeScript CLI. Wraps the `tsc` binary so callers never need
 * to depend on `typescript` directly – it is owned by `@myorg/ts` and hoisted
 * from there. All packages should use `mtsc` instead of `tsc`.
 */
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
