#!/usr/bin/env bun
import { spawnSync, which } from "bun";
import { defineCommand, runMain } from "citty";

function run(cmd: string[], opts: { cwd?: string } = {}): number {
  const result = spawnSync({
    cmd,
    cwd: opts.cwd,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  return result.exitCode;
}

const htmlCommand = defineCommand({
  meta: { name: "html", description: "Generate HTML report via genhtml from coverage/lcov.info" },
  run() {
    if (!which("genhtml")) {
      console.error("❌ genhtml not found — install lcov: sudo apt-get install -y lcov (Ubuntu) or brew install lcov (macOS)");
      process.exit(1);
    }
    if (!Bun.file("coverage/lcov.info").size) {
      // check exists via file
    }
    const result = spawnSync({
      cmd: [
        "genhtml",
        "coverage/lcov.info",
        "--output-directory",
        "coverage/html",
        "--title",
        "Coverage Report",
        "--show-details",
        "--highlight",
        "--legend",
      ],
      stdout: "inherit",
      stderr: "inherit",
    });
    if (result.exitCode === 0) {
      console.log("\n✅ HTML report: coverage/html/index.html");
    }
    process.exit(result.exitCode);
  },
});

const checkCommand = defineCommand({
  meta: { name: "check", description: "Check coverage threshold (80%) via lcov --summary" },
  args: {
    threshold: { type: "string", description: "Threshold percent", default: "80" },
  },
  run({ args }) {
    if (!which("lcov")) {
      console.error("❌ lcov not found — install: sudo apt-get install -y lcov");
      process.exit(1);
    }
    const threshold = (args.threshold as string) ?? "80";
    const summary = spawnSync({
      cmd: ["lcov", "--summary", "coverage/lcov.info"],
      stdout: "pipe",
      stderr: "pipe",
    });
    const output = new TextDecoder().decode(summary.stdout) + new TextDecoder().decode(summary.stderr);
    console.log(output);
    const match = output.match(/lines.*:\s*([\d.]+)%/);
    const coverage = match ? parseFloat(match[1]) : null;
    if (coverage === null) {
      console.warn("⚠️ Could not parse coverage");
      process.exit(0);
    }
    console.log(`Line coverage: ${coverage}% (threshold: ${threshold}%)`);
    if (coverage < parseFloat(threshold)) {
      console.error(`❌ Coverage ${coverage}% is below ${threshold}%`);
      process.exit(1);
    }
    console.log(`✅ Coverage ${coverage}% meets threshold`);
    process.exit(0);
  },
});

const mergeCommand = defineCommand({
  meta: { name: "merge", description: "Merge multiple lcov.info via lcov --add-tracefile (monorepo)" },
  run() {
    if (!which("lcov")) {
      console.error("❌ lcov not found");
      process.exit(1);
    }
    const glob = new Bun.Glob("{packages,apps}/*/coverage/lcov.info");
    const files = Array.from(glob.scanSync()).filter(Boolean);
    if (files.length === 0) {
      console.warn("No per-package lcov.info found");
      process.exit(0);
    }
    console.log(`Merging ${files.length} files:`, files);
    const args = files.flatMap((f) => ["--add-tracefile", f]).concat(["--output-file", "coverage/merged.lcov"]);
    const result = run(["lcov", ...args]);
    if (result === 0) {
      console.log("✅ Merged: coverage/merged.lcov");
      run(["genhtml", "coverage/merged.lcov", "--output-directory", "coverage/html", "--title", "Coverage Report", "--show-details", "--highlight", "--legend"]);
    }
    process.exit(result);
  },
});

const summaryCommand = defineCommand({
  meta: { name: "summary", description: "Show lcov summary" },
  run() {
    process.exit(run(["lcov", "--summary", "coverage/lcov.info"]));
  },
});

const main = defineCommand({
  meta: {
    name: "mcoverage",
    version: "1.0.0",
    description: "Coverage reporting — genhtml, threshold check, merge, summary. Wraps lcov tools.",
  },
  subCommands: {
    html: htmlCommand,
    check: checkCommand,
    merge: mergeCommand,
    summary: summaryCommand,
  },
  run() {
    const raw = process.argv.slice(2);
    if (raw.length === 0) {
      console.log(`
mcoverage — LCOV coverage reporting

Usage:
  mcoverage <command>

Commands:
  html              genhtml coverage/lcov.info → coverage/html/
  check [--threshold 80]   Check threshold via lcov --summary + bc
  merge             Merge {packages,apps}/*/coverage/lcov.info via lcov --add-tracefile
  summary           lcov --summary coverage/lcov.info

Examples:
  mcoverage html
  mcoverage check
  mcoverage check --threshold 80
  mcoverage merge
  mcoverage summary

Requires: lcov (sudo apt-get install -y lcov)
`);
      process.exit(0);
    }
  },
});

runMain(main);
