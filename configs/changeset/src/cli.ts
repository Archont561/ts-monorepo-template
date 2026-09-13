#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { file, write } from "bun";

/**
 * Ensures `.changeset/config.json` exists, copying from the shared config
 * package when the file is missing. Never overwrites an existing config,
 * so developers can customize their Changesets setup.
 *
 * Hoisted as the `minit` bin; `bun run prepare` invokes it directly via
 * `minit changeset`.
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

if (import.meta.main) {
  await minit(process.argv[2]);
}
