# @myorg/citty

The CLI builder behind every `m`-bin — typed args, subcommands and auto-generated `--help`.

## What it provides

- `citty` as a shared dependency (zero deps, ~3 kB gzipped)
- `mcitty` — a small info bin
- `defineWrapperCommand` and `defineSpawnSubcommand` — helpers for the wrapper-shaped CLIs this repo uses

## Why it is here

| Without citty | With citty |
| :--- | :--- |
| `process.argv` parsing | Typed `args` with automatic casting |
| Hand-written `--help` | Usage generated from `meta` |
| `if (sub === "lint")` | `subCommands: { lint }`, lazily loaded |
| No version handling | `--version` from `meta.version` |
| `spawnSync` only | `runCommand()` for programmatic use |

## Usage

```ts
import { defineCommand, runMain } from "citty";
import { spawnSync } from "bun";

const main = defineCommand({
  meta: { name: "mbiome", version: "1.0.0", description: "Biome with baked config" },
  args: { verbose: { type: "boolean", description: "Verbose output" } },
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

### Core API

| Need | Use |
| :--- | :--- |
| Define a command | `defineCommand({ meta, args, run })` |
| Run as a binary | `runMain(main)` |
| Run programmatically | `runCommand(cmd, { rawArgs })` |
| Nest commands | `subCommands: { name: cmd }` |
| Lazy-load a subcommand | `subCommands: { name: () => import("./cmd") }` |
| Lifecycle | `setup()` → `run()` → `cleanup()` (always, in `finally`) |

Add citty to another config with `bun add citty --cwd configs/<name>`.
