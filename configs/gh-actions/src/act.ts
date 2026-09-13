#!/usr/bin/env bun
import { spawnSync } from "bun";

/**
 * m-prefixed act CLI. Runs GitHub Actions workflows locally via Docker,
 * printing an install guide when `act` is not available.
 */
const ACT_FLAGS = [
  "-P",
  "ubuntu-latest=catthehacker/ubuntu:act-latest",
  "--container-architecture",
  "linux/amd64",
];

const actPath = Bun.which("act");

if (!actPath) {
  console.error(`
'act' is not installed.

act runs GitHub Actions locally via Docker.

Install:
  brew install act                          # macOS
  sudo apt install act                      # Debian/Ubuntu
  go install github.com/nektos/act@latest   # Go
  scoop install act                         # Windows

Then ensure Docker is running and try again.
`);
  process.exit(1);
}

const args = process.argv.slice(2);

const result = spawnSync({
  cmd: [actPath, ...ACT_FLAGS, ...args],
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

process.exit(result.exitCode);
