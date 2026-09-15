import { existsSync } from "node:fs";
import { which } from "bun";
import {
  defineCommand,
  defineSpawnSubcommand,
  rawArgsAfter,
  runMain,
  spawnTool,
} from "../utils/spawn";
import { withOptionalTool } from "../utils/tools";

const DOCKERFILE = "apps/example/Dockerfile";
const IMAGE = "app:trivy-scan";

function runTrivy(args: string[]): number {
  return withOptionalTool("trivy", (bin) => spawnTool([bin, ...args]));
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
    name: "trivy",
    version: "1.0.0",
    description: "Trivy wrapper — vuln scanning, defensive (skips if binary missing)",
  },
  subCommands: { fs: fsCommand, image: imageCommand, build: buildCommand },
  run() {
    const raw = rawArgsAfter("trivy");
    if (raw.length === 0) {
      console.log(`
m trivy — Trivy vulnerability scanner wrapper

Usage:
  m trivy fs [args]       # trivy fs . --severity HIGH,CRITICAL
  m trivy image <image>   # trivy image <image> --severity HIGH,CRITICAL
  m trivy build           # docker build the image the image scan uses

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

if (import.meta.main) {
  runMain(main);
}

export default main;
