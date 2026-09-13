#!/usr/bin/env bun
import { spawnSync } from "bun";

/**
 * m-prefixed CI CLI — single bin for @myorg/gh-actions.
 *
 * Subcommands:
 *   mci lint [args] — validates workflows via actionlint with shared config
 *   mci act [args]  — runs GitHub Actions locally via act with baked-in flags
 *
 * Usage:
 *   mci lint
 *   mci act -l
 *   mci act push -n
 *   mci act push
 */

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

function printHelp() {
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
`);
}

const [sub, ...rest] = process.argv.slice(2);

switch (sub) {
  case "lint":
    runActionlint(rest);
    break;
  case "act":
    runAct(rest);
    break;
  case undefined:
  case "-h":
  case "--help":
  case "help":
    printHelp();
    break;
  default:
    // For backward compat, if first arg looks like an act flag, treat as act
    // e.g. `mci -l` => `mci act -l`
    if (sub?.startsWith("-")) {
      runAct([sub, ...rest]);
    } else {
      console.error(`Unknown subcommand '${sub}'. Expected 'lint' or 'act'.`);
      printHelp();
      process.exit(1);
    }
}
