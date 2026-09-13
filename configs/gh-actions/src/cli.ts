#!/usr/bin/env bun
import { spawnSync } from "bun";
import { defineCommand, runMain } from "citty";

const ACT_FLAGS = [
  "-P",
  "ubuntu-latest=catthehacker/ubuntu:act-latest",
  "--container-architecture",
  "linux/amd64",
];

function runActionlint(args: string[]) {
  const actionlint = Bun.fileURLToPath(
    import.meta.resolve("github-actionlint/dist/bin/actionlint.js"),
  );
  const result = spawnSync({
    cmd: ["bun", actionlint, `-config-file=${import.meta.dir}/../actionlint.yaml`, ...args],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  process.exit(result.exitCode);
}

function runAct(args: string[]) {
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

  const result = spawnSync({
    cmd: [actPath, ...ACT_FLAGS, ...args],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  process.exit(result.exitCode);
}

const lintCommand = defineCommand({
  meta: { name: "lint", description: "Validate workflows via actionlint with shared config" },
  args: {
    args: { type: "positional", description: "Extra args for actionlint", required: false },
  },
  run() {
    const raw = process.argv.slice(3);
    runActionlint(raw);
  },
});

const actCommand = defineCommand({
  meta: { name: "act", description: "Run GitHub Actions locally via act with baked-in flags" },
  args: {
    args: { type: "positional", description: "Extra args for act", required: false },
  },
  run() {
    const raw = process.argv.slice(3);
    runAct(raw);
  },
});

const main = defineCommand({
  meta: {
    name: "mci",
    version: "1.0.0",
    description: "CI tooling for GitHub Actions — lint workflows and run locally with act",
  },
  subCommands: { lint: lintCommand, act: actCommand },
  run() {
    const raw = process.argv.slice(2);
    if (raw.length > 0 && raw[0].startsWith("-")) {
      runAct(raw);
    } else {
      console.log(`
mci — CI tooling for GitHub Actions

Usage:
  mci lint [args]   Validate workflows (actionlint)
  mci act [args]    Run workflows locally (act)

Examples:
  mci lint
  mci act -l
  mci act push -n
  mci act push

Run mci <command> --help for more info.
`);
    }
  },
});

runMain(main);
