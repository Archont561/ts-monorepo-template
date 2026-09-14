#!/usr/bin/env bun
import { existsSync } from "node:fs";
import {
  defineCommand,
  defineSpawnSubcommand,
  runMain,
  spawnIfPresent,
  spawnTool,
} from "@myorg/citty";
import { which } from "bun";

const DOCKERFILE = "apps/example/Dockerfile";
const IMAGE = "app:trivy-scan";

const TRIVY_HINTS = [
  "⚠️ trivy not found — skipping (install: brew install trivy or https://aquasecurity.github.io/trivy/)",
];

function runTrivy(args: string[]): number {
  return spawnIfPresent("trivy", ["trivy", ...args], TRIVY_HINTS);
}

const buildCommand = defineCommand({
  meta: { name: "build", description: `docker build -t ${IMAGE} (image for the trivy image scan)` },
  run() {
    if (!existsSync(DOCKERFILE)) {
      console.warn(`⚠️ ${DOCKERFILE} not found — skipping image build`);
      process.exit(0);
    }
    if (!which("docker")) {
      console.warn("⚠️ docker not found — skipping image build");
      process.exit(0);
    }
    const exitCode = spawnTool(["docker", "build", "-t", IMAGE, "-f", DOCKERFILE, "."]);
    if (exitCode !== 0) {
      console.warn("⚠️ image build failed — skipping the Trivy image scan");
    }
    process.exit(0);
  },
});

const fsCommand = defineSpawnSubcommand({
  name: "fs",
  description: "trivy fs . --severity HIGH,CRITICAL (filesystem scan)",
  prefixArgs: ["fs"],
  defaultArgs: [".", "--severity", "HIGH,CRITICAL"],
  spawn: runTrivy,
});

const imageCommand = defineSpawnSubcommand({
  name: "image",
  description: "trivy image <image> --severity HIGH,CRITICAL (container scan)",
  prefixArgs: ["image"],
  spawn: runTrivy,
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
    build: buildCommand,
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
