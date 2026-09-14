#!/usr/bin/env bun
import { defineCommand, defineSpawnSubcommand, runMain, spawnIfPresent } from "@myorg/citty";

const GITLEAKS_HINTS = [
  "⚠️ gitleaks not found — skipping (install: brew install gitleaks or https://github.com/gitleaks/gitleaks)",
  "   Docker fallback: docker run -v $(pwd):/path zricethezav/gitleaks:latest detect --source /path",
];

function runGitleaks(args: string[]): number {
  return spawnIfPresent("gitleaks", ["gitleaks", ...args], GITLEAKS_HINTS);
}

const detectCommand = defineSpawnSubcommand({
  name: "detect",
  description: "gitleaks detect --source . --no-git (scan repo)",
  prefixArgs: ["detect"],
  defaultArgs: ["--source", ".", "--no-git", "--verbose"],
  spawn: runGitleaks,
});

const protectCommand = defineSpawnSubcommand({
  name: "protect",
  description: "gitleaks protect --staged (scan staged changes, pre-commit)",
  prefixArgs: ["protect"],
  defaultArgs: ["--staged", "--verbose"],
  spawn: runGitleaks,
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
