#!/usr/bin/env bun
import { spawnSync } from "bun";

/**
 * m-prefixed Changesets CLI. Wraps the `changeset` binary so callers use
 * `mchangeset` instead of `changeset` directly. Owned by `@myorg/changeset`.
 */
const changeset = Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js"));
const args = process.argv.slice(2);

const result = spawnSync({
  cmd: ["bun", changeset, ...args],
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

process.exit(result.exitCode);
