import { mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, file, write } from "bun";
import { defineCommand, runCommand } from "citty";
import { curatedSkillsDir, pkgRoot } from "../utils/paths";

/** Scope the curated skills are written with — rewritten by the scaffolder. */
const DEFAULT_SKILLS_SCOPE = "@myorg";

const CURATED_DIR = curatedSkillsDir();
const CLI_ENTRY = `${pkgRoot()}/src/cli.ts`;
const TARGET_DIR = `${process.cwd()}/.agents/skills`;
const INDEX_FILE = `${process.cwd()}/.agents/skills.index.json`;

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
  // Capture groups are string|undefined under noUncheckedIndexedAccess even
  // though the pattern guarantees both.
  const yaml = match[1] ?? "";
  const body = match[2] ?? "";
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
    return { name: frontmatter.name, description: frontmatter.description, path: filePath };
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

const syncCommand = defineCommand({
  meta: { name: "sync", description: "Sync curated skills to .agents/skills/ + validate + index" },
  run: async () => {
    const scope = process.env.SKILLS_SCOPE || process.env.SCOPE || DEFAULT_SKILLS_SCOPE;
    const placeholder = DEFAULT_SKILLS_SCOPE;
    await mkdir(TARGET_DIR, { recursive: true });
    console.log(
      `\n📦 Syncing curated skills from ${CURATED_DIR} to ${TARGET_DIR}/ (scope: ${scope})\n`,
    );

    let count = 0;
    try {
      const entries = await readdir(CURATED_DIR, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = join(CURATED_DIR, entry.name);
        if (entry.isDirectory()) {
          const destDir = join(TARGET_DIR, entry.name);
          await mkdir(destDir, { recursive: true });
          // Copy then replace scope in copied files
          await $`cp -r ${srcPath}/* ${destDir}/`.quiet().catch(() => {});
          // Replace placeholder in all md files under destDir
          if (scope !== placeholder) {
            const files = await $`find ${destDir} -type f -name "*.md"`.text().catch(() => "");
            for (const f of files.trim().split("\n").filter(Boolean)) {
              try {
                const c = await file(f).text();
                if (c.includes(placeholder)) {
                  await write(f, c.replaceAll(placeholder, scope));
                }
              } catch {}
            }
          }
          count++;
          console.log(`  ✓ ${entry.name}/`);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const name = entry.name.replace(/\.md$/, "");
          const destDir = join(TARGET_DIR, name);
          await mkdir(destDir, { recursive: true });
          let content = await file(srcPath).text();
          if (scope !== placeholder) {
            content = content.replaceAll(placeholder, scope);
          }
          const hasFrontmatter = content.startsWith("---");
          if (hasFrontmatter) {
            await write(join(destDir, "SKILL.md"), content);
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

    console.log(`\n✅ Synced ${count} curated skills to .agents/skills/\n`);

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

    const index: SkillMeta[] = [];
    for (const f of skillFiles) {
      const meta = await validateSkillFile(f);
      if (meta) {
        index.push({ ...meta, path: f.replace(`${process.cwd()}/`, "") });
      }
    }
    await mkdir(`${process.cwd()}/.agents`, { recursive: true });
    await write(INDEX_FILE, `${JSON.stringify(index, null, 2)}\n`);
    console.log(`📄 Built ${INDEX_FILE} with ${index.length} skills\n`);

    if (invalid > 0) process.exit(1);
  },
});

const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List installed skills (curated + vendored + skills.sh)",
    alias: ["ls"],
  },
  run: async () => {
    console.log(`\n📚 Skills in ${TARGET_DIR}/:\n`);
    try {
      const entries = await readdir(TARGET_DIR, { withFileTypes: true });
      if (entries.length === 0) {
        console.log(
          "  (no skills installed — run `bun run skills:sync` or `bun run skills:add`)\n",
        );
      } else {
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          const skillMd = join(TARGET_DIR, entry.name, "SKILL.md");
          const meta = await validateSkillFile(skillMd).catch(() => null);
          if (meta) {
            console.log(`  - ${meta.name} — ${meta.description} (${entry.name}/)`);
          } else {
            console.log(`  - ${entry.name}/ — (no SKILL.md)`);
          }
        }
      }
    } catch {
      console.log("  (no .agents/skills/ dir — run `bun run skills:sync`)\n");
    }

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

    console.log(`🔍 skills.sh installed (project):\n`);
    await $`npx skills list -p`
      .quiet()
      .then(async (p) => {
        const out = p.stdout.toString();
        console.log(out || "  (none or skills CLI not available)");
      })
      .catch(() => {
        console.log("  (skills CLI not available or no project skills)");
      });
    console.log();
  },
});

const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Add skill via skills.sh (e.g. vercel-labs/agent-skills)",
    alias: ["a"],
  },
  args: {
    package: {
      type: "positional",
      description: "Skill package (e.g. vercel-labs/agent-skills or https://skills.sh/p/<id>)",
      required: true,
    },
  },
  run: async ({ args }) => {
    const pkg = args.package as string;
    console.log(`\n📦 Adding skill package via skills.sh: ${pkg}\n`);
    console.log(`> npx skills add ${pkg} -p --agent * -y\n`);

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
    await $`bun ${CLI_ENTRY} skills sync`.quiet().catch(() => {});
    await $`npx skills experimental_sync -p`.quiet().catch(() => {});

    console.log(`\n✅ Done. Review changes in .agents/skills/ before committing.\n`);
  },
});

const updateCommand = defineCommand({
  meta: { name: "update", description: "Update skills via skills.sh", alias: ["upgrade"] },
  args: {
    skills: { type: "positional", description: "Skills to update (default: all)", required: false },
  },
  run: async ({ args }) => {
    const skills = (args.skills as string) ?? "";
    const skillArgs = skills ? [skills] : [];
    console.log(`\n🔄 Updating skills via skills.sh: ${skillArgs.join(" ") || "(all)"}\n`);

    const cmd = ["npx", "skills", "update", ...skillArgs, "-p", "-y"];
    console.log(`> ${cmd.join(" ")}\n`);
    const proc = Bun.spawn({ cmd, cwd: process.cwd(), stdout: "inherit", stderr: "inherit" });
    const exit = await proc.exited;
    if (exit !== 0) {
      console.error(`\n❌ skills update failed with exit ${exit}\n`);
      process.exit(exit);
    }

    console.log(`\n✅ Updated, rebuilding index...\n`);
    await $`bun ${CLI_ENTRY} skills sync`.quiet().catch(() => {});
  },
});

const validateCommand = defineCommand({
  meta: { name: "validate", description: "Validate all SKILL.md frontmatter (name, description)" },
  run: async () => {
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
            `  ✓ ${meta.name} — ${meta.description} (${f.replace(`${process.cwd()}/`, "")})`,
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
  },
});

const indexCommand = defineCommand({
  meta: { name: "index", description: "Build .agents/skills.index.json" },
  run: async () => {
    console.log(`\n📄 Building ${INDEX_FILE}...\n`);
    const files = await findAllSkillMd(TARGET_DIR);
    const index: SkillMeta[] = [];
    for (const f of files) {
      const meta = await validateSkillFile(f);
      if (meta) {
        index.push({ ...meta, path: f.replace(`${process.cwd()}/`, "") });
      }
    }
    await mkdir(`${process.cwd()}/.agents`, { recursive: true });
    await write(INDEX_FILE, `${JSON.stringify(index, null, 2)}\n`);
    console.log(`✅ Built index with ${index.length} skills:\n`);
    for (const s of index) {
      console.log(`  - ${s.name}: ${s.description}`);
    }
    console.log(`\n📄 ${INDEX_FILE}\n`);
  },
});

const initCommand = defineCommand({
  meta: { name: "init", description: "Init new skill via skills.sh" },
  args: {
    name: { type: "positional", description: "Skill name", required: false, default: "my-skill" },
  },
  run: async ({ args }) => {
    const name = (args.name as string) ?? "my-skill";
    console.log(`\n📝 Initializing skill: ${name}\n`);
    const proc = Bun.spawn({
      cmd: ["npx", "skills", "init", name],
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
    });
    await proc.exited;
  },
});

const removeCommand = defineCommand({
  meta: { name: "remove", description: "Remove skills via skills.sh", alias: ["rm"] },
  args: {
    skills: { type: "positional", description: "Skills to remove", required: true },
  },
  run: async ({ args }) => {
    const skills = args.skills as string;
    const skillList = skills.split(",").map((s) => s.trim());
    console.log(`\n🗑️ Removing skills: ${skillList.join(", ")}\n`);
    const proc = Bun.spawn({
      cmd: ["npx", "skills", "remove", ...skillList, "-p", "-y"],
      cwd: process.cwd(),
      stdout: "inherit",
      stderr: "inherit",
    });
    await proc.exited;
  },
});

const main = defineCommand({
  meta: {
    name: "mskills",
    version: "1.0.0",
    description:
      "AI agent skills management via skills.sh + curated skills — sync, list, add, update, validate, index",
  },
  subCommands: {
    sync: syncCommand,
    list: listCommand,
    add: addCommand,
    update: updateCommand,
    validate: validateCommand,
    index: indexCommand,
    init: initCommand,
    remove: removeCommand,
  },
  run: async ({ args }) => {
    // Default to sync if no subcommand
    if (!args._ || (Array.isArray(args._) && args._.length === 0)) {
      await runCommand(syncCommand, { rawArgs: [] });
    }
  },
});

export default main;
