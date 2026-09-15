import {
  defineCommand,
  defineSpawnSubcommand,
  rawArgsAfter,
  runMain,
  spawnTool,
} from "../utils/spawn";
import { withOptionalTool } from "../utils/tools";

function runGitleaks(args: string[]): number {
  return withOptionalTool("gitleaks", (bin) => spawnTool([bin, ...args]));
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
    name: "gitleaks",
    version: "1.0.0",
    description: "Gitleaks wrapper — secret scanning, defensive (skips if binary missing)",
  },
  subCommands: { detect: detectCommand, protect: protectCommand },
  run() {
    const raw = rawArgsAfter("gitleaks");
    if (raw.length === 0) {
      console.log(`
m gitleaks — secret scanning wrapper

Usage:
  m gitleaks detect [args]   # scan repo (default: --source . --no-git --verbose)
  m gitleaks protect [args]  # scan staged (default: --staged --verbose)

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

if (import.meta.main) {
  runMain(main);
}

export default main;
