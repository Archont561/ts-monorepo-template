#!/usr/bin/env bun
import { defineCommand, runMain } from "citty";

const main = defineCommand({
  meta: {
    name: "mcitty",
    version: "1.0.0",
    description: "Citty CLI builder — elegant, zero-dep, typed CLI framework for m-bins",
  },
  subCommands: {
    info: defineCommand({
      meta: { name: "info", description: "Show citty info and usage" },
      run() {
        console.log(`
citty — Elegant CLI Builder (zero deps, 3kB gzipped)

Usage in monorepo:

  bun add citty --cwd configs/<name>

  import { defineCommand, runMain } from "citty";

  const main = defineCommand({
    meta: { name: "mtool", version: "1.0.0", description: "My tool" },
    args: { verbose: { type: "boolean", description: "Verbose" } },
    subCommands: { build: () => import("./build").then(r => r.default) },
    run({ args }) { console.log(args.verbose); }
  });

  runMain(main);

Benefits for m-bins:
- Typed args with case-agnostic parsing (--user-name === --userName)
- Auto-generated --help and --version
- Nested subcommands with lazy/async loading
- setup/cleanup lifecycle hooks
- runCommand() for programmatic use (agent scripts)
- renderUsage()/showUsage() for help text
- Zero dependencies, 34.6kB unpacked

See: https://github.com/unjs/citty
`);
      },
    }),
  },
  run() {
    console.log(`
mcitty — Citty CLI builder for monorepo m-bins

Usage:
  mcitty info    Show citty usage guide

In configs:
  bun add citty --cwd configs/<name>
  Use defineCommand + runMain for elegant CLIs
`);
  },
});

runMain(main);
