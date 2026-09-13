#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { file, spawnSync, write } from "bun";

/**
 * m-prefixed Changesets CLI — single bin for @myorg/changeset.
 *
 * - `mchangeset init` — ensures `.changeset/config.json` exists, copying from
 *   the shared config package when missing (never overwrites).
 * - `mchangeset <args>` — delegates to `@changesets/cli` (e.g. `add`, `version`, `publish`).
 *
 * Root `prepare` uses `mchangeset init`; `changeset`, `version`, `release`
 * scripts use `mchangeset` directly.
 */

export async function minit(target = "changeset"): Promise<void> {
  if (target !== "changeset") {
    throw new Error(`Unknown init target '${target}' (expected "changeset")`);
  }

  const configPath = ".changeset/config.json";
  const source = "configs/changeset/config.json";

  if (await file(configPath).exists()) {
    console.log("Changeset config already exists; skipping.");
    return;
  }

  if (!(await file(source).exists())) return;

  await mkdir(".changeset", { recursive: true });
  await write(configPath, await file(source).text());
}

async function main() {
  const args = process.argv.slice(2);
  const sub = args[0];

  if (sub === "init") {
    await minit(args[1] ?? "changeset");
    return;
  }

  const changeset = Bun.fileURLToPath(import.meta.resolve("@changesets/cli/bin.js"));

  const result = spawnSync({
    cmd: ["bun", changeset, ...args],
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });

  process.exit(result.exitCode);
}

if (import.meta.main) {
  await main();
}
