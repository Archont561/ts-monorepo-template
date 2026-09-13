#!/usr/bin/env bun
import { spawnSync } from "bun";

/**
 * m-prefixed Turbo CLI. Bakes in the shared `turbo.base.json` config so
 * callers never need root-level turbo.json, command flags, or knowledge of
 * where the base config lives.
 */
const turbo = Bun.fileURLToPath(import.meta.resolve("turbo/bin/turbo"));
const rootTurboJson = `${import.meta.dir}/turbo.base.json`;
const args = process.argv.slice(2);

const result = spawnSync({
  cmd: ["bun", turbo, `--root-turbo-json=${rootTurboJson}`, ...args],
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

process.exit(result.exitCode);
