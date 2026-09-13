#!/usr/bin/env bun
import { $, file } from "bun";

/**
 * m-prefixed skills CLI. Manages the AI-agent skill files shipped in this
 * package: syncing them into `.agents/skills/` or listing what is available.
 */
const SKILLS_DIR = `${import.meta.dir}/skills`;
const TARGET_DIR = `${process.cwd()}/.agents/skills`;

const command = process.argv[2] ?? "sync";

switch (command) {
  case "sync": {
    await $`mkdir -p ${TARGET_DIR}`.quiet();
    await $`cp -r ${SKILLS_DIR}/* ${TARGET_DIR}/`.quiet();
    const skills = await $`ls ${SKILLS_DIR}`.text();
    const count = skills.trim().split("\n").filter(Boolean).length;
    console.log(`Synced ${count} skills to .agents/skills/`);
    break;
  }

  case "list": {
    const skills = await $`ls ${SKILLS_DIR}`.text();
    console.log("\nAvailable skills:\n");
    for (const skill of skills.trim().split("\n").filter(Boolean)) {
      const content = await file(`${SKILLS_DIR}/${skill}`).text();
      const firstLine = content.split("\n")[0]?.replace(/^#\s*/, "") ?? skill;
      console.log(`  - ${skill.replace(".md", "")} — ${firstLine}`);
    }
    console.log();
    break;
  }

  default:
    console.log(`
Usage: mskills <command>

Commands:
  sync    Sync skills to .agents/skills/ (default)
  list    List available skills
`);
}
