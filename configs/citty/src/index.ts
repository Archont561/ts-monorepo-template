/**
 * @myorg/citty — shared Citty CLI builder for m-bins
 *
 * Re-exports citty with monorepo-specific helpers for defining elegant CLIs.
 */

export type { ArgDef, ArgsDef, CommandDef } from "citty";
export {
  createMain,
  defineCommand,
  parseArgs,
  renderUsage,
  runCommand,
  runMain,
  showUsage,
} from "citty";

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
  binPath: string;
  configArgs?: string[];
  passthrough?: boolean;
}

export function defineWrapperCommand(opts: WrapperOptions) {
  return defineCommand({
    meta: {
      name: opts.name,
      version: opts.version ?? "1.0.0",
      description: opts.description,
    },
    args: {
      args: {
        type: "positional",
        description: "Extra args passed to underlying tool",
        required: false,
      },
    },
    run() {
      const raw = process.argv.slice(2);
      const cmd = opts.passthrough
        ? [opts.binPath, ...raw]
        : [opts.binPath, ...(opts.configArgs ?? []), ...raw];

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
