#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { file, write } from "bun";

const TARGET_DIR = process.cwd();
const SOURCE = join(import.meta.dir, "../devcontainer.json");
const DEST_DIR = join(TARGET_DIR, ".devcontainer");
const DEST = join(DEST_DIR, "devcontainer.json");

async function main() {
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
  const scope = process.env.DEVCONTAINER_SCOPE || process.env.SCOPE || "@myorg";
  const final = scope !== "@myorg" ? content.replaceAll("@myorg", scope) : content;

  await write(DEST, final);
  console.log(`  ✓ Created ${DEST} from configs/devcontainer/devcontainer.json`);

  console.log("\n✅ Devcontainer setup complete\n");
}

if (import.meta.main) {
  await main();
}
