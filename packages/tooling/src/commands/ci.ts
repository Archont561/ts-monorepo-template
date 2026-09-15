import { resolveConfig } from "../utils/paths";
import {
  defineCommand,
  defineSpawnSubcommand,
  rawArgsAfter,
  runMain,
  spawnTool,
} from "../utils/spawn";

const ACT_FLAGS = [
  "-P",
  "ubuntu-latest=catthehacker/ubuntu:act-latest",
  "--container-architecture",
  "linux/amd64",
];

export function runActionlint(args: string[]): number {
  const actionlint = Bun.fileURLToPath(
    import.meta.resolve("github-actionlint/dist/bin/actionlint.js"),
  );
  return spawnTool([
    "bun",
    actionlint,
    `-config-file=${resolveConfig("actionlint.yaml")}`,
    ...args,
  ]);
}

export function runAct(args: string[]): number {
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
    return 1;
  }

  return spawnTool([actPath, ...ACT_FLAGS, ...args]);
}

const lintCommand = defineSpawnSubcommand({
  name: "lint",
  description: "Validate workflows via actionlint with shared config",
  argsDescription: "Extra args for actionlint",
  spawn: runActionlint,
});

const actCommand = defineSpawnSubcommand({
  name: "act",
  description: "Run GitHub Actions locally via act with baked-in flags",
  argsDescription: "Extra args for act",
  spawn: runAct,
});

const main = defineCommand({
  meta: {
    name: "ci",
    version: "1.0.0",
    description: "CI tooling for GitHub Actions — lint workflows and run locally with act",
  },
  subCommands: { lint: lintCommand, act: actCommand },
  run() {
    const raw = rawArgsAfter("ci");
    if (raw.length > 0 && raw[0]?.startsWith("-")) {
      runAct(raw);
    } else {
      console.log(`
m ci — CI tooling for GitHub Actions

Usage:
  m ci lint [args]   Validate workflows (actionlint)
  m ci act [args]    Run workflows locally (act)
  m ci:lint          Shorthand for: m ci lint
  m ci:local         Shorthand for: m ci act push

Examples:
  m ci lint
  m ci act -l
  m ci act push -n
  m ci act push
`);
    }
  },
});

if (import.meta.main) {
  runMain(main);
}

export default main;
