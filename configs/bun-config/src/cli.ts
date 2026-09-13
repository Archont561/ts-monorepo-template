#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { spawnSync, which } from "bun";
import { defineCommand, runMain } from "citty";

const bunfig = `${import.meta.dir}/../bunfig.toml`;

async function runCoverage() {
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
    { stdout: "inherit", stderr: "inherit", stdin: "inherit" },
  );

  if (mergeResult.exitCode !== 0) {
    console.error("\nCoverage merge failed.");
    process.exit(mergeResult.exitCode);
  }

  console.log("\nCoverage report: coverage/lcov.info");
  process.exit(0);
}

// Passthrough for bun commands that are not our subcommands — bypass citty to avoid "Unknown command"
const rawArgs = process.argv.slice(2);
const knownSubcommands = ["coverage", "test"];
const isHelp = rawArgs.includes("--help") || rawArgs.includes("-h");
const isVersion = rawArgs.includes("--version") || rawArgs.includes("-v");
const firstArg = rawArgs[0];

if (
  firstArg &&
  !knownSubcommands.includes(firstArg) &&
  !firstArg.startsWith("-") &&
  !isHelp &&
  !isVersion
) {
  // Direct passthrough to bun (e.g. mbun build, mbun --hot, etc.)
  let cmd: string[];
  if (firstArg === "test") {
    cmd = ["bun", firstArg, `--config=${bunfig}`, ...rawArgs.slice(1)];
  } else {
    cmd = ["bun", ...rawArgs];
  }
  const result = spawnSync({ cmd, stdout: "inherit", stderr: "inherit", stdin: "inherit" });
  process.exit(result.exitCode);
}

const coverageCommand = defineCommand({
  meta: { name: "coverage", description: "Run per-package coverage via mturbo then merge LCOV" },
  run: async () => {
    await runCoverage();
  },
});

const testCommand = defineCommand({
  meta: { name: "test", description: "Run bun test with shared bunfig.toml config" },
  run() {
    const raw = process.argv.slice(3);
    const cmd = ["bun", "test", `--config=${bunfig}`, ...raw];
    const result = spawnSync({ cmd, stdout: "inherit", stderr: "inherit", stdin: "inherit" });
    process.exit(result.exitCode);
  },
});

const main = defineCommand({
  meta: {
    name: "mbun",
    version: "1.0.0",
    description: "Bun wrapper — injects shared bunfig.toml for test, provides coverage merging",
  },
  subCommands: { coverage: coverageCommand, test: testCommand },
  run: async ({ args }) => {
    const raw = process.argv.slice(2);
    const subcommand = raw[0];

    if (subcommand === "coverage") {
      await runCoverage();
      return;
    }

    let cmd: string[];
    if (subcommand === "test") {
      cmd = ["bun", subcommand, `--config=${bunfig}`, ...raw.slice(1)];
    } else {
      cmd = ["bun", ...raw];
    }

    const result = spawnSync({ cmd, stdout: "inherit", stderr: "inherit", stdin: "inherit" });
    process.exit(result.exitCode);
  },
});

runMain(main);
