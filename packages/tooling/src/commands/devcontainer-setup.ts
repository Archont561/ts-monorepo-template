#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { file, write } from "bun";
import { resolveConfig } from "@/src/utils/paths";

/**
 * Setup script for devcontainer — run when the devcontainer feature is enabled.
 *
 * Ported from `configs/devcontainer/src/setup.ts` (R27). The template asset now
 * lives in this package's consolidated config directory, so the source is
 * resolved through `resolveConfig()` instead of `import.meta.dir/..`.
 */

const TARGET_DIR = process.cwd();
const SOURCE = resolveConfig("devcontainer.json");
const DEST_DIR = join(TARGET_DIR, ".devcontainer");
const DEST = join(DEST_DIR, "devcontainer.json");

/** Placeholder scope in the committed asset, replaced with the user's scope. */
const DEFAULT_SCOPE = "@myorg";

async function main(): Promise<void> {
  console.log("\n🐳 Setting up devcontainer...\n");

  if (!(await file(SOURCE).exists())) {
    console.warn(`⚠️ Source not found: ${SOURCE}`);
    return;
  }

  await mkdir(DEST_DIR, { recursive: true });

  if (await file(DEST).exists()) {
    console.log(`  ✓ ${DEST} already exists, keeping`);
    return;
  }

  const content = await file(SOURCE).text();
  // Replace scope placeholder if provided
  const scope = process.env.DEVCONTAINER_SCOPE || process.env.SCOPE || DEFAULT_SCOPE;
  const final = scope !== DEFAULT_SCOPE ? content.replaceAll(DEFAULT_SCOPE, scope) : content;

  await write(DEST, final);
  console.log(`  ✓ Created ${DEST} from ${SOURCE}`);

  console.log("\n✅ Devcontainer setup complete\n");
}

if (import.meta.main) {
  await main();
}
