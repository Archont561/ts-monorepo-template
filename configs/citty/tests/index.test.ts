import { afterEach, describe, expect, test } from "bun:test";
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CommandDef } from "citty";
import {
  defineSpawnSubcommand,
  defineWrapperCommand,
  spawnIfPresent,
  spawnTool,
  type WrapperOptions,
} from "../src/index.ts";

const workDir = mkdtempSync(join(tmpdir(), "citty-test-"));

let recordings = 0;

/**
 * A stand-in for a wrapped tool. The arguments it is handed and the directory
 * it runs in are written next to the script, so a test can see the exact
 * command line the helper built. The values are baked into the script rather
 * than passed through the environment: `process.env` edits made at runtime do
 * not reach anything the helpers spawn.
 */
function makeProbe(options: { exit?: number; argv?: string[] } = {}): string {
  const record = join(workDir, `probe-${recordings++}`);
  const path = `${record}.sh`;
  writeFileSync(
    path,
    `#!/bin/sh
printf '%s\\n' "$@" > '${record}.argv'
pwd > '${record}.pwd'
exit ${options.exit ?? 0}
`,
  );
  chmodSync(path, 0o755);
  return path;
}

function recordedProbe(path: string): { argv: string[]; cwd: string } {
  return {
    argv: readFileSync(`${path.slice(0, -3)}.argv`, "utf8")
      .split("\n")
      .slice(0, -1),
    cwd: readFileSync(`${path.slice(0, -3)}.pwd`, "utf8").trim(),
  };
}

/**
 * The helpers finish by calling `process.exit()` with the tool's code. Tests
 * intercept that call and read the code from the thrown sentinel, so the real
 * exit never happens and the assertions can see what the helper decided.
 */
class Exited extends Error {
  constructor(readonly code: number) {
    super(`exit ${code}`);
  }
}

const realExit = process.exit;
const realArgv = [...process.argv];
const realWarn = console.warn;

let exitCode: number | null = null;

/** Runs a command the way `runMain` would, with `argv` standing in for the process. */
function runCommand(command: CommandDef, argv: string[]): number {
  exitCode = null;
  process.exit = (code?: number): never => {
    exitCode = code ?? 0;
    throw new Exited(exitCode);
  };
  process.argv = ["bun", ...argv];
  try {
    command.run?.({ args: {} } as never);
  } catch (error) {
    if (!(error instanceof Exited)) throw error;
  }
  return exitCode ?? 0;
}

/** Defines a wrapper around a probe, runs it, and reports what the probe saw. */
function runWrapper(
  argv: string[],
  options: Pick<WrapperOptions, "passthrough" | "configArgsPlacement"> & {
    configArgs?: string[];
    exit?: number;
  } = {},
): { code: number; argv: string[]; cwd: string } {
  const probe = makeProbe({ exit: options.exit });
  const command = defineWrapperCommand({
    name: "mdemo",
    description: "demo wrapper",
    binPath: probe,
    configArgs: options.configArgs ?? ["--config-path=configs/demo"],
    passthrough: options.passthrough,
    configArgsPlacement: options.configArgsPlacement,
  });

  const code = runCommand(command, ["mdemo", ...argv]);
  return { code, ...recordedProbe(probe) };
}

afterEach(() => {
  process.exit = realExit;
  process.argv = [...realArgv];
  console.warn = realWarn;
});

describe("spawnTool", () => {
  test("returns the exit code of the tool it spawned", () => {
    expect(spawnTool([makeProbe()])).toBe(0);
    expect(spawnTool([makeProbe({ exit: 7 })])).toBe(7);
  });

  test("runs the tool in the requested directory", () => {
    const probe = makeProbe();

    expect(spawnTool([probe], { cwd: "/tmp" })).toBe(0);
    expect(recordedProbe(probe).cwd).toBe("/tmp");
  });
});

describe("spawnIfPresent", () => {
  test("warns every hint and reports success when the tool is missing", () => {
    const warnings: string[] = [];
    console.warn = (...args: unknown[]) => warnings.push(args.map(String).join(" "));

    const code = spawnIfPresent(
      "myorg-tool-that-is-not-installed",
      ["--check"],
      ["⚠️ tool not found — skipping", "   install: brew install tool"],
    );

    expect(code).toBe(0);
    expect(warnings).toEqual(["⚠️ tool not found — skipping", "   install: brew install tool"]);
  });

  test("spawns the command and returns its code when the tool is on PATH", () => {
    // The command repeats the tool name, the way every caller passes it.
    expect(spawnIfPresent("sh", ["sh", "-c", "exit 4"], [])).toBe(4);
  });
});

describe("defineWrapperCommand", () => {
  test("prepends the baked flags to the caller's arguments", () => {
    const { code, argv } = runWrapper(["extra"]);

    expect(code).toBe(0);
    expect(argv).toEqual(["--config-path=configs/demo", "extra"]);
  });

  test("appends the baked flags for tools that only accept them last", () => {
    const { argv } = runWrapper(["check", "file"], { configArgsPlacement: "append" });

    expect(argv).toEqual(["check", "file", "--config-path=configs/demo"]);
  });

  test("passes the caller's arguments through untouched in passthrough mode", () => {
    const { argv } = runWrapper(["a", "b"], {
      passthrough: true,
      configArgs: ["--ignored"],
    });

    expect(argv).toEqual(["a", "b"]);
  });

  test("carries the tool's exit code out of the command", () => {
    expect(runWrapper([], { exit: 9 }).code).toBe(9);
  });

  test("runs from the directory the helper is invoked in", () => {
    expect(runWrapper([]).cwd).toBe(process.cwd());
  });

  test("names the positional argument from the options", () => {
    const command = defineWrapperCommand({
      name: "mdemo",
      description: "demo wrapper",
      binPath: makeProbe(),
      argsName: "command",
      argsDescription: "Demo command (check, lint, format, etc.)",
    });

    expect(command.meta).toEqual({
      name: "mdemo",
      version: "1.0.0",
      description: "demo wrapper",
    });
    expect(command.args?.command.description).toBe("Demo command (check, lint, format, etc.)");
    expect(command.args?.command.required).toBe(false);
  });

  test("defaults the positional argument description", () => {
    const command = defineWrapperCommand({
      name: "mdemo",
      version: "2.3.4",
      description: "demo wrapper",
      binPath: makeProbe(),
    });

    expect(command.meta?.version).toBe("2.3.4");
    expect(command.args?.args.description).toBe("Extra args passed to underlying tool");
  });

  test("registers extra subcommands next to the passthrough run", () => {
    const probe = defineSpawnSubcommand({
      name: "probe",
      description: "probe the tool",
      spawn: () => 0,
    });

    const command = defineWrapperCommand({
      name: "mdemo",
      description: "demo wrapper",
      binPath: makeProbe(),
      subCommands: { probe },
    });

    expect(Object.keys(command.subCommands ?? {})).toEqual(["probe"]);
  });
});

describe("defineSpawnSubcommand", () => {
  test("takes its arguments from after the subcommand name", () => {
    const seen: string[][] = [];
    const command = defineSpawnSubcommand({
      name: "probe",
      description: "probe the tool",
      argsDescription: "Arguments for the tool",
      spawn: (args) => {
        seen.push(args);
        return 0;
      },
    });

    expect(runCommand(command, ["mdemo", "probe", "--a", "b"])).toBe(0);
    expect(seen).toEqual([["--a", "b"]]);
    expect(command.args?.args.description).toBe("Arguments for the tool");
  });

  test("prefixes the tool's own subcommand", () => {
    const seen: string[][] = [];
    const command = defineSpawnSubcommand({
      name: "detect",
      description: "run the tool's detect subcommand",
      prefixArgs: ["detect"],
      spawn: (args) => {
        seen.push(args);
        return 0;
      },
    });

    expect(runCommand(command, ["mdemo", "detect", "--verbose"])).toBe(0);
    expect(seen).toEqual([["detect", "--verbose"]]);
  });

  test("falls back to the default arguments when the caller passes none", () => {
    const seen: string[][] = [];
    const command = defineSpawnSubcommand({
      name: "scan",
      description: "scan the current directory",
      prefixArgs: ["detect", "--source", "."],
      defaultArgs: ["--no-git"],
      spawn: (args) => {
        seen.push(args);
        return 0;
      },
    });

    expect(runCommand(command, ["mdemo", "scan"])).toBe(0);
    expect(runCommand(command, ["mdemo", "scan", "--verbose"])).toBe(0);
    expect(seen).toEqual([
      ["detect", "--source", ".", "--no-git"],
      ["detect", "--source", ".", "--verbose"],
    ]);
  });

  test("applies the code the spawn function returns", () => {
    const command = defineSpawnSubcommand({
      name: "scan",
      description: "scan the current directory",
      spawn: () => 2,
    });

    expect(runCommand(command, ["mdemo", "scan"])).toBe(2);
    expect(command.args).toBeUndefined();
  });
});
