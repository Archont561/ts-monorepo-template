import { existsSync } from "node:fs";
import { join } from "node:path";
import { pkgRoot, resolveConfig } from "../utils/paths";
import { defineCommand, rawArgsAfter, runMain, spawnTool } from "../utils/spawn";
import { findTool, skipMissingTool, TOOLS } from "../utils/tools";

/**
 * `commitlint --edit <file>` — Conventional Commits validation.
 *
 * The binary is a workspace devDependency, not a global, so `Bun.which` will
 * not find it: `node_modules/.bin` is not on `PATH` in a plain shell (nor in a
 * lefthook `run:` block, which is exactly where this is called from). Resolve
 * the local bin first and fall back to PATH only for a global install.
 */
function commitlintBin(): string | null {
  const local = join(pkgRoot(), "node_modules", ".bin", "commitlint");
  if (existsSync(local)) return local;
  return findTool("commitlint");
}

function run(args: string[]): number {
  const bin = commitlintBin();
  if (!bin) return skipMissingTool(TOOLS.commitlint);
  return spawnTool([bin, "--config", resolveConfig("commitlint.config.cjs"), ...args]);
}

const USAGE = `
m commitlint — Conventional Commits validation

Usage:
  m commitlint <file>    # validate the message in <file> (what the hook does)
  m commitlint           # validate a message piped on stdin

The commit-msg hook calls this as \`m commitlint {1}\`, where {1} is the path
git handed the hook. It cannot move to pre-commit: git passes pre-commit no
arguments at all and the message does not exist yet, so commit-msg is the
earliest hook that can see it.
`;

const main = defineCommand({
  meta: {
    name: "commitlint",
    version: "1.0.0",
    description: "Conventional Commits validation — defensive (skips if commitlint is missing)",
  },
  args: {
    file: {
      type: "positional",
      description: "Commit message file; omit to read the message from stdin",
      required: false,
    },
  },
  run() {
    const raw = rawArgsAfter("commitlint");

    if (raw.includes("--help") || raw.includes("-h")) {
      console.log(USAGE);
      process.exit(0);
    }

    const file = raw[0];
    if (file !== undefined && !existsSync(file)) {
      console.error(`❌ commit message file not found: ${file}`);
      process.exit(1);
    }

    // No file and nothing piped: commitlint answers this with its own usage
    // text and exit 1, which reads like a lint failure. There is no message to
    // judge, so say so instead.
    if (!file && process.stdin.isTTY) {
      console.log(USAGE);
      process.exit(0);
    }

    // `--edit` reads the message from a file; with no argument commitlint reads
    // stdin, which is what makes `git log -1 --pretty=%B | m commitlint` work.
    process.exit(run(file ? ["--edit", file] : []));
  },
});

if (import.meta.main) {
  runMain(main);
}

export default main;
