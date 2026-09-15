/**
 * Availability of the external binaries this repo shells out to but does not
 * vendor.
 *
 * One rule, applied everywhere: a missing optional binary is a **skip that says
 * so**, never a silent pass and never a hard failure. Hooks, CI jobs and package
 * tasks all reach for these helpers, so the wording a developer sees is the same
 * whichever entry point tripped over the absent tool.
 *
 * The alternative failure mode is worse than either extreme. A command that
 * exits 0 quietly looks like a pass, so a machine that never had gitleaks
 * installed reports green forever; a command that exits 1 blocks every commit on
 * a tool the developer may not need. Hence: print, then continue.
 */

export interface ToolSpec {
  /** Binary name as resolved on PATH. */
  bin: string;
  /** Human-readable name used in messages. */
  label: string;
  /** What is being skipped, so the warning explains itself. */
  purpose: string;
  /** Install commands, one per platform where they differ. */
  install: string[];
}

/** The optional external tools this repo knows about. */
export const TOOLS = {
  actionlint: {
    bin: "actionlint",
    label: "actionlint",
    purpose: "local GitHub Actions workflow validation",
    install: [
      "brew install actionlint",
      "go install github.com/rhysd/actionlint/cmd/actionlint@latest",
      "bun install --force          # retries the github-actionlint download",
    ],
  },
  act: {
    bin: "act",
    label: "act",
    purpose: "running GitHub Actions workflows locally",
    install: [
      "brew install act",
      "sudo apt install act",
      "go install github.com/nektos/act@latest",
    ],
  },
  gitleaks: {
    bin: "gitleaks",
    label: "gitleaks",
    purpose: "secret scanning",
    install: ["brew install gitleaks", "https://github.com/gitleaks/gitleaks#installing"],
  },
  trivy: {
    bin: "trivy",
    label: "trivy",
    purpose: "vulnerability scanning",
    install: ["brew install trivy", "https://trivy.dev/latest/getting-started/installation/"],
  },
  cargo: {
    bin: "cargo",
    label: "Rust toolchain (cargo)",
    purpose: "native Rust workspace tasks",
    install: ["rustup — https://rustup.rs"],
  },
  lcov: {
    bin: "lcov",
    label: "lcov",
    purpose: "merging coverage reports",
    install: ["bun run m coverage setup"],
  },
  genhtml: {
    bin: "genhtml",
    label: "genhtml",
    purpose: "rendering the HTML coverage report",
    install: ["bun run m coverage setup"],
  },
} satisfies Record<string, ToolSpec>;

export type ToolName = keyof typeof TOOLS;

/** The resolved path to a tool's binary, or `null` when it is not installed. */
export function findTool(bin: string): string | null {
  return Bun.which(bin);
}

/** True when the named optional tool is installed. */
export function hasTool(name: ToolName): boolean {
  return findTool(TOOLS[name].bin) !== null;
}

/**
 * Logs an absent tool and returns 0, so the caller skips rather than fails.
 *
 * Always paired with a message naming what was skipped — the point is that the
 * developer can tell a real pass from a skip without reading the source.
 */
export function skipMissingTool(spec: ToolSpec): number {
  console.warn(`⚠️  ${spec.label} not found — skipping ${spec.purpose}.`);
  console.warn("   Install it to enable this step:");
  for (const line of spec.install) console.warn(`     ${line}`);
  console.warn("   Continuing: this step is optional locally and CI installs it.");
  return 0;
}

/**
 * Runs `run` when the tool is present, otherwise reports the skip and returns 0.
 *
 * This is the shape every optional-tool wrapper should take; it keeps the
 * "check, warn, continue" sequence in one place instead of per command.
 */
export function withOptionalTool(name: ToolName, run: (bin: string) => number): number {
  const spec = TOOLS[name];
  const bin = findTool(spec.bin);
  if (!bin) return skipMissingTool(spec);
  return run(bin);
}
