#!/usr/bin/env bun
import { spawnSync } from "bun";

/**
 * m-prefixed Bun CLI for this monorepo.
 *
 * `bun test` (and only bun test) consumes the shared bunfig via its
 * `--config` flag. A `BUNFIG` env var would change coverage output, so the
 * config is always passed as an explicit flag instead. All other bun
 * commands pass through unchanged.
 */
const bunfig = `${import.meta.dir}/bunfig.toml`;
const args = process.argv.slice(2);
const command = args[0];

let cmd: string[];
if (command === "test") {
  cmd = ["bun", command, `--config=${bunfig}`, ...args.slice(1)];
} else {
  cmd = ["bun", ...args];
}

const result = spawnSync({
  cmd,
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

process.exit(result.exitCode);
