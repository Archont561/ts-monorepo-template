#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { spawnSync, which } from "bun";

/**
 * m-prefixed coverage CLI. Delegates per-package coverage to Turbo
 * (`mturbo coverage` runs every workspace's `coverage` script in dependency
 * order against the shared bunfig), then merges the per-package
 * `coverage/lcov.info` reports into a single `coverage/lcov.info` at the
 * repository root with `lcov-result-merger`.
 */
const mturbo = which("mturbo");

if (!mturbo) {
  console.error(
    "mcoverage needs `mturbo` on PATH — run `bun install` first (it links the m-command bins into node_modules/.bin).",
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
// lcov-result-merger does not create the output directory, so ensure the
// root coverage/ dir exists before writing the merged lcov.info there.
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
