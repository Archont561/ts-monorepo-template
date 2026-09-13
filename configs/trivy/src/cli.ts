#!/usr/bin/env bun
import { spawnSync, which } from "bun";
import { defineCommand, runMain } from "citty";

function hasTrivy(): boolean {
  return !!which("trivy");
}

function runTrivy(args: string[]): number {
  if (!hasTrivy()) {
    console.warn(
      "⚠️ trivy not found — skipping (install: brew install trivy or https://aquasecurity.github.io/trivy/)",
    );
    return 0;
  }
  const result = spawnSync({
    cmd: ["trivy", ...args],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  return result.exitCode;
}

const fsCommand = defineCommand({
  meta: { name: "fs", description: "trivy fs . --severity HIGH,CRITICAL (filesystem scan)" },
  run() {
    const raw = process.argv.slice(3);
    if (raw.length === 0) {
      process.exit(runTrivy(["fs", ".", "--severity", "HIGH,CRITICAL"]));
    } else {
      process.exit(runTrivy(["fs", ...raw]));
    }
  },
});

const imageCommand = defineCommand({
  meta: {
    name: "image",
    description: "trivy image <image> --severity HIGH,CRITICAL (container scan)",
  },
  run() {
    const raw = process.argv.slice(3);
    process.exit(runTrivy(["image", ...raw]));
  },
});

const main = defineCommand({
  meta: {
    name: "mtrivy",
    version: "1.0.0",
    description: "Trivy wrapper — vuln scanning, defensive (skips if binary missing)",
  },
  subCommands: {
    fs: fsCommand,
    image: imageCommand,
  },
  run() {
    const raw = process.argv.slice(2);
    if (raw.length === 0) {
      console.log(`
mtrivy — Trivy vulnerability scanner wrapper

Usage:
  mtrivy fs [args]       # trivy fs . --severity HIGH,CRITICAL
  mtrivy image <image>   # trivy image <image> --severity HIGH,CRITICAL
  mtrivy fs . --severity HIGH,CRITICAL --format sarif --output results.sarif

Install:
  brew install trivy
  sudo apt-get install trivy
  https://aquasecurity.github.io/trivy/latest/getting-started/installation/

If trivy is not installed, this wrapper warns and exits 0 (does not block).
`);
      process.exit(0);
    }
    process.exit(runTrivy(raw));
  },
});

runMain(main);
