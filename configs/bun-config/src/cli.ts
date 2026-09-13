#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { spawnSync, which } from "bun";

/**
 * m-prefixed Bun CLI — single bin for @myorg/bun-config.
 *
 * - Default: wraps `bun`, injecting `--config=<bunfig.toml>` for `bun test`.
 * - Subcommand `coverage`: runs per-package coverage via `mturbo coverage`
 *   then merges LCOV reports into `coverage/lcov.info`.
 *
 * Usage:
 *   mbun test            # bun test with shared config
 *   mbun coverage        # merged coverage report
 *   mbun <any bun cmd>   # passthrough
 */

const bunfig = `${import.meta.dir}/../bunfig.toml`;
const args = process.argv.slice(2);
const subcommand = args[0];

if (subcommand === "coverage") {
  const mturbo = which("mturbo");

  if (!mturbo) {
    console.error(
      "mbun coverage needs `mturbo` on PATH — run `bun install` first (it links the m-bins into node_modules/.bin).",
    );
    process.exit(1);
  }

  console.log("Running per-package coverage via mturbo...\n");
  const turboResult = spawnSync([mturbo, "coverage"], {
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });

  if (turboResult.exitCode !== 0) {
    process.exit(turboResult.exitCode);
  }

  const reports = new Bun.Glob("{packages,apps}/*/coverage/lcov.info");
  if (Array.from(reports.scanSync()).length === 0) {
    console.warn("\nNo per-package coverage reports found; nothing to merge.");
  }

  console.log("\nMerging package coverage reports...");
  await mkdir("coverage", { recursive: true });
  const merger = Bun.fileURLToPath(
    import.meta.resolve("lcov-result-merger/bin/lcov-result-merger.js"),
  );
  const mergeResult = spawnSync(
    [
      "bun",
      merger,
      "{packages,apps}/*/coverage/lcov.info",
      "coverage/lcov.info",
      "--prepend-source-files",
    ],
    {
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    },
  );

  if (mergeResult.exitCode !== 0) {
    console.error("\nCoverage merge failed.");
    process.exit(mergeResult.exitCode);
  }

  console.log("\nCoverage report: coverage/lcov.info");
  process.exit(0);
}

let cmd: string[];
if (subcommand === "test") {
  cmd = ["bun", subcommand, `--config=${bunfig}`, ...args.slice(1)];
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
