# @myorg/citty

> Elegant CLI Builder for m-bins — zero deps, typed, subcommands, auto-help.

## What it provides

- `citty` as shared dependency (zero deps, 3kB gzipped, ~20M weekly downloads)
- `mcitty` — info CLI about citty usage
- Helpers: `defineWrapperCommand`, `defineSpawnSubcommand` for monorepo m-bins
- Re-exports: `defineCommand`, `runMain`, `runCommand`, `createMain`, `parseArgs`, `renderUsage`, `showUsage`

> [!NOTE]
> Citty is based on native `util.parseArgs` — fast, lightweight, case-agnostic args (`--user-name` === `--userName` via `scule`).

## Why use citty in monorepo?

| Current (manual) | With citty |
| :--- | :--- |
| `process.argv` parsing | Typed `args` with auto-casting |
| Manual `--help` | Auto-generated usage from `meta` |
| `if (sub === "lint")` | `subCommands: { lint }` with lazy loading |
| No version handling | Auto `--version` from `meta.version` |
| Shell out via `spawnSync` only | `runCommand()` for programmatic use |

### Current m-bins analysis

| Bin | Complexity | Citty benefit |
| :--- | :--- | :--- |
| `mbiome`, `mbunup`, `mtsc`, `mturbo` | Simple wrapper (spawn + baked config) | Low — keep simple, or use for consistent help |
| `mbun` | Has `coverage` subcommand + passthrough | Medium — typed subcommands |
| `mci` | `lint` + `act` subcommands | High — clean subcommands, help |
| `mchangeset` | `init` subcommand | Medium — lifecycle hooks |
| `msetup` | `lefthook` setup | Medium — setup/cleanup |
| `mskills` | 8 subcommands (sync/list/add/update/validate/index/init/remove) | **Very High** — elegant subcommands, auto-help, typed args |
| `mdocs` | Workflow aggregation | Medium — args for base files |

## Installation

```bash
bun add citty --cwd configs/<name>
```

Since zero deps, nothing extra.

## Usage — Basic wrapper

```ts
import { defineCommand, runMain } from "citty";
import { spawnSync } from "bun";

const main = defineCommand({
  meta: { name: "mbiome", version: "1.0.0", description: "Biome with baked config" },
  args: {
    verbose: { type: "boolean", description: "Verbose output" },
  },
  run({ args }) {
    const biome = Bun.fileURLToPath(import.meta.resolve("@biomejs/biome/bin/biome"));
    const result = spawnSync({
      cmd: [biome, ...process.argv.slice(2), `--config-path=${import.meta.dir}/..`],
      stdout: "inherit", stderr: "inherit", stdin: "inherit",
    });
    process.exit(result.exitCode);
  },
});

runMain(main);
```

## Usage — Subcommands (like mskills)

```ts
import { defineCommand, runMain } from "citty";

const build = defineCommand({
  meta: { name: "build", description: "Build project" },
  run() { console.log("Building..."); }
});

const main = defineCommand({
  meta: { name: "my-tool", version: "1.0.0", description: "My CLI" },
  subCommands: {
    build,
    deploy: () => import("./commands/deploy").then(r => r.default), // lazy
  },
});

runMain(main);
```

## Usage — Programmatic (agent scripts)

```ts
import { runCommand } from "citty";
import { buildCmd } from "./commands/build";

await runCommand(buildCmd, { rawArgs: ["--verbose"] });
```

> [!TIP]
> Use `runCommand` instead of `child_process` when calling citty commands from agent scripts.

## Core API

| Need | Use |
| :--- | :--- |
| Define command | `defineCommand({ meta, args, run })` |
| Run as binary | `runMain(main)` |
| Run programmatically | `runCommand(cmd, { rawArgs })` |
| Wrap for export | `createMain(cmd)` |
| Nest commands | `subCommands: { name: cmd }` |
| Lazy-load | `subCommands: { name: () => import(...) }` |
| Parse args only | `parseArgs(rawArgs, argsDef)` |
| Print help | `showUsage(cmd)` |
| Generate help string | `renderUsage(cmd)` |

## Lifecycle

```ts
const main = defineCommand({
  meta: { name: "my-tool" },
  setup({ args }) { /* before */ },
  run({ args }) { /* main */ },
  cleanup({ args }) { /* always in finally */ },
});
```

Order: `setup()` → subcommand or `run()` → `cleanup()` (always).

## Agent Checklist

- [ ] `bun add citty --cwd configs/<name>` (zero deps)
- [ ] Use `defineCommand` for every command — keeps types tight
- [ ] Use lazy `subCommands` imports for large CLIs
- [ ] Use `runCommand` instead of shelling out in agent scripts
- [ ] Include `meta.name`, `version`, `description` — for auto `--help`/`--version`
- [ ] Use `setup`/`cleanup` for resource management

## Proof-of-Concept in this repo

We have citty versions for:

- `configs/skills/src/cli.citty.ts` — 8 subcommands, typed args, auto-help
- `configs/gh-actions/src/cli.citty.ts` — `lint` + `act` subcommands
- `configs/bun-config/src/cli.citty.ts` — `coverage` + `test` subcommands

Try:

```bash
bun configs/skills/src/cli.citty.ts --help
bun configs/skills/src/cli.citty.ts sync --help
bun configs/skills/src/cli.citty.ts add --help
bun configs/gh-actions/src/cli.citty.ts --help
bun configs/bun-config/src/cli.citty.ts --help
```

## Migration Strategy

### Phase 1: Complex CLIs (high benefit)

- [x] `mskills` — 8 subcommands, already using citty POC
- [ ] `mci` — `lint`/`act`
- [ ] `mbun` — `coverage` + passthrough

### Phase 2: Medium CLIs

- [ ] `mchangeset` — `init`
- [ ] `msetup` — `lefthook`
- [ ] `mdocs` — workflow aggregation

### Phase 3: Simple wrappers (optional, for consistency)

- [ ] `mbiome`, `mbunup`, `mtsc`, `mturbo`, `me2e` — keep simple or wrap with citty for uniform help

### Shared package

- [x] `configs/citty` — provides citty + helpers, always-on

## References

- [Citty GitHub](https://github.com/unjs/citty)
- [Citty npm](https://www.npmjs.com/package/citty) — 20M weekly downloads
- [UnJS](https://github.com/unjs)

See [AGENT.md](./AGENT.md) for agent-facing reference.
