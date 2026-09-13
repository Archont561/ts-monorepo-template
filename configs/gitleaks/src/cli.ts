#!/usr/bin/env bun
import { spawnSync, which } from "bun";
import { defineCommand, runMain } from "citty";

function hasGitleaks(): boolean {
  return !!which("gitleaks");
}

function runGitleaks(args: string[]): number {
  if (!hasGitleaks()) {
    console.warn(
      "⚠️ gitleaks not found — skipping (install: brew install gitleaks or https://github.com/gitleaks/gitleaks)",
    );
    console.warn(
      "   Docker fallback: docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source /path",
    );
    return 0;
  }
  const result = spawnSync({
    cmd: ["gitleaks", ...args],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  return result.exitCode;
}

const detectCommand = defineCommand({
  meta: { name: "detect", description: "gitleaks detect --source . --no-git (scan repo)" },
  run() {
    const raw = process.argv.slice(3);
    if (raw.length === 0) {
      process.exit(runGitleaks(["detect", "--source", ".", "--no-git", "--verbose"]));
    } else {
      process.exit(runGitleaks(["detect", ...raw]));
    }
  },
});

const protectCommand = defineCommand({
  meta: {
    name: "protect",
    description: "gitleaks protect --staged (scan staged changes, pre-commit)",
  },
  run() {
    const raw = process.argv.slice(3);
    if (raw.length === 0) {
      process.exit(runGitleaks(["protect", "--staged", "--verbose"]));
    } else {
      process.exit(runGitleaks(["protect", ...raw]));
    }
  },
});

const main = defineCommand({
  meta: {
    name: "mgitleaks",
    version: "1.0.0",
    description: "Gitleaks wrapper — secret scanning, defensive (skips if binary missing)",
  },
  subCommands: {
    detect: detectCommand,
    protect: protectCommand,
  },
  run() {
    const raw = process.argv.slice(2);
    if (raw.length === 0) {
      console.log(`
mgitleaks — secret scanning wrapper

Usage:
  mgitleaks detect [args]   # scan repo (default: --source . --no-git --verbose)
  mgitleaks protect [args]  # scan staged (default: --staged --verbose)
  mgitleaks detect --source . --no-git
  mgitleaks protect --staged

Install:
  brew install gitleaks
  go install github.com/gitleaks/gitleaks/v8@latest
  docker pull zricethezav/gitleaks:latest

If gitleaks is not installed, this wrapper warns and exits 0 (does not block).
`);
      process.exit(0);
    }
    // Passthrough unknown args to gitleaks
    process.exit(runGitleaks(raw));
  },
});

runMain(main);
