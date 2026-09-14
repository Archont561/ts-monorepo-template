/**
 * @myorg/citty — shared Citty CLI builder for m-bins
 *
 * Re-exports citty with monorepo-specific helpers for defining elegant CLIs.
 */

export type { ArgDef, ArgsDef, CommandDef } from "citty";
export { defineCommand, renderUsage, runCommand, runMain, showUsage } from "citty";

import { spawnSync } from "bun";
/**
 * Helper to define an m-bin wrapper command that spawns underlying tool with baked config.
 * Keeps the zero-root-deps pattern while adding citty's typed args and help.
 */
import { defineCommand } from "citty";

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
}

export function defineWrapperCommand(opts: WrapperOptions) {
  return defineCommand({
    meta: {
      name: opts.name,
      version: opts.version ?? "1.0.0",
      description: opts.description,
    },
    args: {
      [opts.argsName ?? "args"]: {
        type: "positional",
        description: opts.argsDescription ?? "Extra args passed to underlying tool",
        required: false,
      },
    },
    run() {
      const raw = process.argv.slice(2);
      const config = opts.configArgs ?? [];
      const cmd = opts.passthrough
        ? [opts.binPath, ...raw]
        : opts.configArgsPlacement === "append"
          ? [opts.binPath, ...raw, ...config]
          : [opts.binPath, ...config, ...raw];

      const result = spawnSync({
        cmd,
        stdout: "inherit",
        stderr: "inherit",
        stdin: "inherit",
      });
      process.exit(result.exitCode);
    },
  });
}

/**
 * Helper to define a subcommand that spawns a tool.
 */
export function defineSpawnSubcommand(
  name: string,
  description: string,
  spawnFn: (rawArgs: string[]) => void,
) {
  return defineCommand({
    meta: { name, description },
    run() {
      const raw = process.argv.slice(3);
      spawnFn(raw);
    },
  });
}
