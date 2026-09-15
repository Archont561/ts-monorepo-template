import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { resolveConfig } from "@/src/utils/paths";
import {
  defineCommand,
  defineSpawnSubcommand,
  rawArgsAfter,
  runMain,
  spawnTool,
} from "@/src/utils/spawn";
import { skipMissingTool, TOOLS, withOptionalTool } from "@/src/utils/tools";

const ACT_FLAGS = [
  "-P",
  "ubuntu-latest=catthehacker/ubuntu:act-latest",
  "--container-architecture",
  "linux/amd64",
];

const ACTIONLINT_INSTALL = `
'actionlint' is not available.

The 'github-actionlint' package does not bundle the binary — its entry point
downloads a release on first run and caches it under
~/.github-actionlint/bin/<version>/. When that download is blocked (offline,
sandbox, corporate cert interception) the tool is unusable and every run dies
with an opaque TLS error.

Fix one of these:
  bun install --force                                    # retry the download
  brew install actionlint                                # macOS system binary
  go install github.com/rhysd/actionlint/cmd/actionlint@latest
  ACTIONLINT_BIN=/path/to/actionlint m ci:lint           # point at an existing one

Then run: m ci:lint
`;

/** Version the npm wrapper would download, read from its own manifest. */
function actionlintRelease(): string | null {
  try {
    const pkgPath = Bun.fileURLToPath(import.meta.resolve("github-actionlint/package.json"));
    return (Bun.file(pkgPath).json() as { version?: string }).version ?? null;
  } catch {
    return null;
  }
}

/**
 * A usable actionlint, or `null` — decided without touching the network.
 *
 * Resolution order mirrors the npm wrapper's own: an explicit `ACTIONLINT_BIN`
 * first, then a binary already on PATH, then the wrapper's download cache. Only
 * if all three miss is the tool considered absent, because the alternative is
 * letting the wrapper start a download and fail on it.
 *
 * Returning a path lets callers invoke actionlint directly, which also avoids
 * paying for the wrapper's spawn when a system binary is present.
 */
export function actionlintBinary(): string | null {
  const fromEnv = process.env.ACTIONLINT_BIN;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;

  const onPath = Bun.which("actionlint");
  if (onPath) return onPath;

  const cacheRoot =
    process.env.ACTIONLINT_CACHE_DIR ?? join(homedir(), ".github-actionlint", "bin");
  const version = actionlintRelease();
  if (version) {
    const cached = join(
      cacheRoot,
      version,
      process.platform === "win32" ? "actionlint.exe" : "actionlint",
    );
    if (existsSync(cached)) return cached;
  }
  return null;
}

/**
 * Runs actionlint over the workflows.
 *
 * Pass `--if-installed` to skip with a warning (exit 0) when actionlint is
 * unavailable instead of failing. That is what the pre-commit hook uses: a tool
 * that is not installed locally must not block a commit, because CI is the
 * authoritative gate. A plain `m ci:lint` stays strict.
 *
 * Neither mode performs a network operation.
 */
export function runActionlint(args: string[]): number {
  const optional = args.includes("--if-installed");
  const forwarded = args.filter((arg) => arg !== "--if-installed");

  const binary = actionlintBinary();
  if (!binary) {
    // --if-installed is the hook path: skip loudly and keep going, because CI is
    // the authoritative gate. A bare `m ci:lint` is an explicit request to lint,
    // so it still fails — but with the same install guidance rather than the
    // opaque TLS error the npm wrapper used to surface.
    if (optional) return skipMissingTool(TOOLS.actionlint);
    console.error(ACTIONLINT_INSTALL);
    return 1;
  }

  return spawnTool([binary, `-config-file=${resolveConfig("actionlint.yaml")}`, ...forwarded]);
}

/**
 * Runs workflows locally under Docker.
 *
 * A missing `act` is a logged skip rather than a failure, matching every other
 * optional tool here: the developer learns what is absent and how to install it,
 * and nothing that wraps this command — a hook, a package task, a CI job — is
 * blocked by a tool it may not need.
 */
export function runAct(args: string[]): number {
  return withOptionalTool("act", (actPath) => spawnTool([actPath, ...ACT_FLAGS, ...args]));
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
