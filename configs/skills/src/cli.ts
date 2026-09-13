#!/usr/bin/env bun
import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, file, write } from "bun";

/**
 * m-prefixed skills CLI — manages AI-agent skills via skills.sh + local curated skills.
 *
 * Skills live in:
 * - Curated: configs/skills/skills/<name>/SKILL.md (committed, source of truth for template)
 * - Vendored: .agents/skills/<name>/SKILL.md (synced, can be committed for reproducibility)
 *
 * Each SKILL.md requires YAML frontmatter with `name` and `description`.
 *
 * Commands:
 * - sync      Copy curated skills to .agents/skills/ + validate + index
 * - list      List installed skills in .agents/skills/
 * - add <pkg> Install via `npx skills add <pkg>` (skills.sh) then sync
 * - update    Update via `npx skills update`
 * - validate  Validate all SKILL.md frontmatter
 * - index     Build .agents/skills.index.json
 */

const CURATED_DIR = `${import.meta.dir}/../skills`;
const TARGET_DIR = `${process.cwd()}/.agents/skills`;
const INDEX_FILE = `${process.cwd()}/.agents/skills.index.json`;

const command = process.argv[2] ?? "sync";
const args = process.argv.slice(3);

interface SkillMeta {
  name: string;
  description: string;
  path: string;
  source?: string;
}

function parseFrontmatter(
  content: string,
): { frontmatter: Record<string, string>; body: string } | null {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;
  const [, yaml, body] = match;
  const frontmatter: Record<string, string> = {};
  for (const line of yaml.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const value = line
      .slice(colon + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) frontmatter[key] = value;
  }
  return { frontmatter, body };
}

async function validateSkillFile(filePath: string): Promise<SkillMeta | null> {
  try {
    const content = await file(filePath).text();
    const parsed = parseFrontmatter(content);
    if (!parsed) {
      console.error(`❌ ${filePath}: missing YAML frontmatter (---)`);
      return null;
    }
    const { frontmatter } = parsed;
    if (!frontmatter.name) {
      console.error(`❌ ${filePath}: missing frontmatter 'name'`);
      return null;
    }
    if (!frontmatter.description) {
      console.error(`❌ ${filePath}: missing frontmatter 'description'`);
      return null;
    }
    return {
      name: frontmatter.name,
      description: frontmatter.description,
      path: filePath,
    };
  } catch (e) {
    console.error(`❌ ${filePath}: ${(e as Error).message}`);
    return null;
  }
}

async function findAllSkillMd(dir: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const sub = await findAllSkillMd(fullPath);
        results.push(...sub);
      } else if (entry.name === "SKILL.md" || entry.name.endsWith(".md")) {
        results.push(fullPath);
      }
    }
  } catch {}
  return results;
}

switch (command) {
  case "sync": {
    await mkdir(TARGET_DIR, { recursive: true });
    console.log(`\n📦 Syncing curated skills from ${CURATED_DIR} to ${TARGET_DIR}/\n`);

    // Handle both old flat structure and new folder/SKILL.md structure
    let count = 0;
    try {
      const entries = await readdir(CURATED_DIR, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = join(CURATED_DIR, entry.name);
        if (entry.isDirectory()) {
          // New structure: <name>/SKILL.md
          const destDir = join(TARGET_DIR, entry.name);
          await mkdir(destDir, { recursive: true });
          await $`cp -r ${srcPath}/* ${destDir}/`.quiet().catch(() => {});
          count++;
          console.log(`  ✓ ${entry.name}/`);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          // Legacy flat: convert to folder/SKILL.md
          const name = entry.name.replace(/\.md$/, "");
          const destDir = join(TARGET_DIR, name);
          await mkdir(destDir, { recursive: true });
          const content = await file(srcPath).text();
          // If already has frontmatter, keep, else add
          const hasFrontmatter = content.startsWith("---");
          if (hasFrontmatter) {
            await $`cp ${srcPath} ${destDir}/SKILL.md`.quiet();
          } else {
            const wrapped = `---\nname: ${name}\ndescription: ${name} skill\n---\n\n${content}`;
            await write(join(destDir, "SKILL.md"), wrapped);
          }
          count++;
          console.log(`  ✓ ${name}/ (from legacy ${entry.name})`);
        }
      }
    } catch (e) {
      console.error(`  No curated dir: ${CURATED_DIR}`, e);
    }

    // Also sync any skills already in .agents/skills that came from skills.sh
    // (don't overwrite, just ensure they exist)

    console.log(`\n✅ Synced ${count} curated skills to .agents/skills/\n`);

    // Validate
    console.log(`🔍 Validating skills in ${TARGET_DIR}/...\n`);
    const skillFiles = await findAllSkillMd(TARGET_DIR);
    let valid = 0;
    let invalid = 0;
    for (const f of skillFiles) {
      const meta = await validateSkillFile(f);
      if (meta) {
        valid++;
        console.log(`  ✓ ${meta.name} — ${meta.description}`);
      } else {
        invalid++;
      }
    }
    console.log(`\n${invalid === 0 ? "✅" : "⚠️"}  ${valid} valid, ${invalid} invalid\n`);

    // Index
    const index: SkillMeta[] = [];
    for (const f of skillFiles) {
      const meta = await validateSkillFile(f);
      if (meta) {
        index.push({
          ...meta,
          path: f.replace(`${process.cwd()}/`, ""),
        });
      }
    }
    await mkdir(`${process.cwd()}/.agents`, { recursive: true });
    await write(INDEX_FILE, JSON.stringify(index, null, 2) + "\n");
    console.log(`📄 Built ${INDEX_FILE} with ${index.length} skills\n`);

    if (invalid > 0) process.exit(1);
    break;
  }

  case "list":
  case "ls": {
    console.log(`\n📚 Skills in ${TARGET_DIR}/:\n`);
    try {
      const entries = await readdir(TARGET_DIR, { withFileTypes: true });
      if (entries.length === 0) {
        console.log(
          "  (no skills installed — run `bun run skills:sync` or `bun run skills:add`)\n",
        );
        break;
      }
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const skillMd = join(TARGET_DIR, entry.name, "SKILL.md");
        const meta = await validateSkillFile(skillMd).catch(() => null);
        if (meta) {
          console.log(`  - ${meta.name} — ${meta.description} (${entry.name}/)`);
        } else {
          // Try legacy .md
          const files = await readdir(join(TARGET_DIR, entry.name)).catch(() => []);
          const md = files.find((f) => f.endsWith(".md"));
          if (md) {
            console.log(`  - ${entry.name} — (legacy ${md})`);
          } else {
            console.log(`  - ${entry.name}/ — (no SKILL.md)`);
          }
        }
      }
    } catch {
      console.log("  (no .agents/skills/ dir — run `bun run skills:sync`)\n");
    }

    // Also show curated
    console.log(`\n📦 Curated skills in ${CURATED_DIR}/:\n`);
    try {
      const entries = await readdir(CURATED_DIR, { withFileTypes: true });
      for (const entry of entries) {
        const name = entry.isDirectory() ? entry.name : entry.name.replace(/\.md$/, "");
        console.log(`  - ${name}`);
      }
    } catch {
      console.log("  (no curated dir)");
    }
    console.log();

    // Show skills.sh installed
    console.log(`🔍 skills.sh installed (project):\n`);
    await $`npx skills list -p`
      .quiet()
      .then(async (p) => {
        const out = await new Response(p.stdout).text().catch(() => "");
        console.log(out || "  (none or skills CLI not available)");
      })
      .catch(() => {
        console.log("  (skills CLI not available or no project skills)");
      });
    console.log();
    break;
  }

  case "add":
  case "a": {
    const pkg = args[0];
    if (!pkg) {
      console.error(
        "\n❌ Usage: mskills add <package>\n  e.g. mskills add vercel-labs/agent-skills\n       mskills add https://skills.sh/p/<pack-id>\n",
      );
      process.exit(1);
    }
    console.log(`\n📦 Adding skill package via skills.sh: ${pkg}\n`);
    console.log(`> npx skills add ${pkg} -p --agent * -y\n`);

    // Run skills.sh add in repo root, project-level, all agents
    const proc = Bun.spawn({
      cmd: ["npx", "skills", "add", pkg, "-p", "--agent", "*", "-y"],
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
    });
    const exit = await proc.exited;
    if (exit !== 0) {
      console.error(`\n❌ skills add failed with exit ${exit}\n`);
      process.exit(exit);
    }

    console.log(`\n✅ Added ${pkg}, syncing to .agents/skills/...\n`);
    // After add, skills.sh should have installed to .agents/skills/ or agent dirs
    // Run sync to ensure curated + vendored are merged and indexed
    await $`bun ${import.meta.dir}/cli.ts sync`
      .quiet()
      .then(() => {})
      .catch(() => {});
    // Also run experimental_sync if available
    await $`npx skills experimental_sync -p`.quiet().catch(() => {});

    console.log(`\n✅ Done. Review changes in .agents/skills/ before committing.\n`);
    console.log(
      `> [!CAUTION] Review skill content before use; skills.sh cannot guarantee safety.\n`,
    );
    break;
  }

  case "update":
  case "upgrade": {
    const skills = args;
    const skillArgs = skills.length > 0 ? skills : [];
    console.log(`\n🔄 Updating skills via skills.sh: ${skillArgs.join(" ") || "(all)"}\n`);
    console.log(`> npx skills update ${skillArgs.join(" ")} -p -y\n`);

    const cmd = ["npx", "skills", "update", ...skillArgs, "-p", "-y"];
    const proc = Bun.spawn({
      cmd,
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
    });
    const exit = await proc.exited;
    if (exit !== 0) {
      console.error(`\n❌ skills update failed with exit ${exit}\n`);
      process.exit(exit);
    }

    console.log(`\n✅ Updated, rebuilding index...\n`);
    await $`bun ${import.meta.dir}/cli.ts sync`.quiet().catch(() => {});
    break;
  }

  case "validate": {
    console.log(`\n🔍 Validating all SKILL.md files...\n`);
    const dirs = [CURATED_DIR, TARGET_DIR];
    let totalValid = 0;
    let totalInvalid = 0;

    for (const dir of dirs) {
      console.log(`📁 ${dir}:\n`);
      const files = await findAllSkillMd(dir);
      if (files.length === 0) {
        console.log("  (no skills found)\n");
        continue;
      }
      for (const f of files) {
        const meta = await validateSkillFile(f);
        if (meta) {
          totalValid++;
          console.log(
            `  ✓ ${meta.name} — ${meta.description} (${f.replace(process.cwd() + "/", "")})`,
          );
        } else {
          totalInvalid++;
        }
      }
      console.log();
    }

    console.log(
      `${totalInvalid === 0 ? "✅" : "❌"} Validation: ${totalValid} valid, ${totalInvalid} invalid\n`,
    );
    if (totalInvalid > 0) process.exit(1);
    break;
  }

  case "index": {
    console.log(`\n📄 Building ${INDEX_FILE}...\n`);
    const files = await findAllSkillMd(TARGET_DIR);
    const index: SkillMeta[] = [];
    for (const f of files) {
      const meta = await validateSkillFile(f);
      if (meta) {
        index.push({
          ...meta,
          path: f.replace(`${process.cwd()}/`, ""),
        });
      }
    }
    await mkdir(`${process.cwd()}/.agents`, { recursive: true });
    await write(INDEX_FILE, JSON.stringify(index, null, 2) + "\n");
    console.log(`✅ Built index with ${index.length} skills:\n`);
    for (const s of index) {
      console.log(`  - ${s.name}: ${s.description}`);
    }
    console.log(`\n📄 ${INDEX_FILE}\n`);
    break;
  }

  case "init": {
    const name = args[0] ?? "my-skill";
    console.log(`\n📝 Initializing skill: ${name}\n`);
    console.log(`> npx skills init ${name}\n`);
    const proc = Bun.spawn({
      cmd: ["npx", "skills", "init", name],
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
    });
    await proc.exited;
    break;
  }

  case "remove":
  case "rm": {
    const skills = args;
    if (skills.length === 0) {
      console.error("\n❌ Usage: mskills remove <skill...>\n");
      process.exit(1);
    }
    console.log(`\n🗑️ Removing skills: ${skills.join(", ")}\n`);
    console.log(`> npx skills remove ${skills.join(" ")} -p -y\n`);
    const proc = Bun.spawn({
      cmd: ["npx", "skills", "remove", ...skills, "-p", "-y"],
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
    });
    await proc.exited;
    break;
  }

  default:
    console.log(`
Usage: mskills <command> [args]

Commands:
  sync              Sync curated skills to .agents/skills/ + validate + index (default)
  list, ls          List installed skills (curated + vendored + skills.sh)
  add <package>     Add via skills.sh (e.g. vercel-labs/agent-skills)
  update [skills]   Update via skills.sh (all or specific)
  validate          Validate all SKILL.md frontmatter (name, description)
  index             Build .agents/skills.index.json
  init <name>       Init new skill via skills.sh
  remove <skills>   Remove skills via skills.sh

Examples:
  mskills sync
  mskills list
  mskills add vercel-labs/agent-skills
  mskills add https://skills.sh/p/<pack-id>
  mskills update
  mskills validate
  mskills index

Docs: https://skills.sh
`);
}
