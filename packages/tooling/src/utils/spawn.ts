/**
 * Shared Citty CLI builder for the unified `m` CLI.
 *
 * Copied verbatim from `@myorg/citty` so every command module ported out of
 * `configs/*` keeps working unchanged. This is the API-compatible replacement
 * for `import ... from "@myorg/citty"`; `configs/` is deleted in R27, so the
 * helpers have to live here rather than be re-imported from there.
 */

export type { ArgDef, ArgsDef, CommandDef } from "citty";
export { defineCommand, renderUsage, runCommand, runMain, showUsage } from "citty";

import { spawnSync } from "bun";
import { type CommandDef, defineCommand } from "citty";

/**
 * Spawns a tool with inherited stdio and returns its exit code. Every wrapper
 * in the repo funnels through here, so "spawn, inherit, exit with the code" is
 * written once.
 */
export function spawnTool(cmd: string[], opts: { cwd?: string } = {}): number {
  const result = spawnSync({
    cmd,
    ...(opts.cwd ? { cwd: opts.cwd } : {}),
    // Bun spawns children with the env snapshot from process start, so
    // runtime process.env mutations (e.g. a wrapper exporting a tool flag)
    // never reach the child unless env is passed explicitly.
    env: { ...process.env },
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  return result.exitCode;
}

/**
 * Like {@link spawnTool}, but captures the child's output instead of inheriting
 * it, so the caller can report *why* the tool failed.
 *
 * Worth the loss of live streaming: a CI step that only says "exit code 1" is
 * unreadable when the run's log archive is out of reach (GitHub serves job logs
 * from a separate blob host, and `::error::` annotations are the one part of a
 * failed run that the check-run API returns directly). A wrapper that captures
 * can turn the tool's own last lines into an annotation.
 */
export function spawnToolCaptured(
  cmd: string[],
  opts: { cwd?: string } = {},
): { exitCode: number; output: string } {
  const result = spawnSync({
    cmd,
    ...(opts.cwd ? { cwd: opts.cwd } : {}),
    env: { ...process.env },
    stdout: "pipe",
    stderr: "pipe",
    stdin: "inherit",
  });
  return {
    exitCode: result.exitCode,
    output: `${result.stdout.toString()}${result.stderr.toString()}`,
  };
}

/**
 * Emit a GitHub Actions error annotation. Newlines have to be percent-encoded
 * (`%0A`) or the annotation is truncated at the first line; outside CI the same
 * call is just a readable error on stderr.
 */
export function annotateError(title: string, detail = "", tailLines = 15): void {
  const tail = detail
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .slice(-tailLines)
    .join("\n");
  const message = tail ? `${title}\n${tail}` : title;
  console.error(
    `::error::${message.replace(/%/g, "%25").replace(/\n/g, "%0A").replace(/\r/g, "%0D")}`,
  );
  if (!process.env.GITHUB_ACTIONS) console.error(message);
}

export interface WrapperOptions {
  name: string;
  version?: string;
  description: string;
  /** Executable to spawn — `bun` when the tool's own entry needs a runtime. */
  binPath: string;
  /** Flags baked in front of the caller's arguments (config paths, subcommands). */
  configArgs?: string[];
  /** Spawn exactly what was asked for, without the baked flags. */
  passthrough?: boolean;
  /** Name of the positional argument in `--help` (default: `args`). */
  argsName?: string;
  /** Description of that positional argument; each wrapper words its own. */
  argsDescription?: string;
  /**
   * Where the baked flags sit relative to the caller's arguments. Most tools
   * want them first; biome only accepts `--config-path` once its subcommand and
   * paths are in place, so it appends them.
   */
  configArgsPlacement?: "prepend" | "append";
  /** Extra subcommands to register next to the wrapper's passthrough run. */
  subCommands?: Record<string, CommandDef>;
}

export function defineWrapperCommand(opts: WrapperOptions) {
  return defineCommand({
    meta: {
      name: opts.name,
      version: opts.version ?? "1.0.0",
      description: opts.description,
    },
    subCommands: opts.subCommands,
    args: {
      [opts.argsName ?? "args"]: {
        type: "positional",
        description: opts.argsDescription ?? "Extra args passed to underlying tool",
        required: false,
      },
    },
    run() {
      const raw = rawArgsAfter(opts.name);
      const config = opts.configArgs ?? [];
      const cmd = opts.passthrough
        ? [opts.binPath, ...raw]
        : opts.configArgsPlacement === "append"
          ? [opts.binPath, ...raw, ...config]
          : [opts.binPath, ...config, ...raw];

      process.exit(spawnTool(cmd));
    },
  });
}

export interface SpawnSubcommandOptions {
  name: string;
  description: string;
  /**
   * Documents the arguments in `--help`. Omit it when the subcommand takes no
   * arguments, so the usage text stays exactly as it was.
   */
  argsDescription?: string;
  /** Arguments the subcommand always passes, e.g. the tool's own subcommand. */
  prefixArgs?: string[];
  /** Arguments to use when the caller passes none, e.g. a default scan target. */
  defaultArgs?: string[];
  /**
   * Runs the tool and returns its exit code, which the helper applies — the
   * subcommand does not have to call `process.exit()` itself.
   */
  spawn: (args: string[]) => number;
}

/**
 * Helper to define a subcommand that spawns a tool. The arguments are sliced
 * from argv after the subcommand name, so the parent's own flags stay intact.
 */
export function defineSpawnSubcommand(opts: SpawnSubcommandOptions) {
  const documented = opts.argsDescription
    ? {
        args: {
          args: {
            type: "positional" as const,
            description: opts.argsDescription,
            required: false,
          },
        },
      }
    : {};

  return defineCommand({
    meta: { name: opts.name, description: opts.description },
    ...documented,
    run() {
      const raw = rawArgsAfter(opts.name);
      const args = raw.length === 0 && opts.defaultArgs ? opts.defaultArgs : raw;
      process.exit(opts.spawn([...(opts.prefixArgs ?? []), ...args]));
    },
  });
}

/**
 * Arguments after the last occurrence of `name` in argv.
 *
 * `@myorg/citty` hardcoded `argv.slice(2)` / `argv.slice(3)` because every m-bin
 * was invoked as `m biome check ...` — the command name was argv[0] of the raw
 * slice. Under the unified CLI the same command is `m lint check ...`, so there
 * is one extra leading token. Slicing after the command's own name keeps both
 * invocations identical instead of baking in a magic offset that is only
 * correct at one nesting depth.
 */
export function rawArgsAfter(name: string): string[] {
  const argv = process.argv.slice(2);
  const at = argv.lastIndexOf(name);
  return at === -1 ? argv : argv.slice(at + 1);
}
