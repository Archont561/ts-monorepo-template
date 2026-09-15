import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { $, write } from "bun";
import { defineCommand, rawArgsAfter, runMain } from "@/src/utils/spawn";

/**
 * Regenerates the root lefthook.yml as a one-line wrapper around the shared
 * config, then installs the Git hooks.
 *
 * The wrapper points at this package's own copy of lefthook.base.yml rather
 * than a config owned by a separate package, so it survives R27 deleting
 * configs/. Naming the shared file `.base.yml` also leaves `lefthook.yml` free
 * as the project's own extension point.
 */
export async function msetup(target = "lefthook"): Promise<void> {
  if (target !== "lefthook") {
    throw new Error(`Unknown setup target '${target}' (expected "lefthook")`);
  }

  const shared = "node_modules/@myorg/tooling/src/configs/lefthook.base.yml";
  await write("lefthook.yml", `extends:\n  - ${shared}\n`);

  const result = await $`bunx lefthook install`.quiet().nothrow();
  if (result.exitCode !== 0) {
    // Not fatal — `bun install` runs this in `prepare`, and a checkout without
    // a git directory (CI, a tarball) legitimately cannot install hooks. But it
    // must not be silent, or hooks quietly stop running and nobody notices.
    const stderr = result.stderr.toString().trim();
    console.warn("⚠️ lefthook install failed — Git hooks are not active.");
    if (stderr) console.warn(`   ${stderr.split("\n").join("\n   ")}`);
    console.warn("   Re-run manually with: m setup lefthook");
    return;
  }

  const installed = await installedHooks();
  if (installed.length === 0) {
    console.warn("⚠️ lefthook installed no hooks — is this a Git repository?");
    return;
  }
  console.log(`✅ lefthook hooks active: ${installed.join(", ")}`);
}

/** Hooks lefthook actually wired up, read back from `.git/hooks`. */
async function installedHooks(): Promise<string[]> {
  let names: string[];
  try {
    names = (await readdir(join(await gitDir(), "hooks"))) as string[];
  } catch {
    return [];
  }
  return names.filter((n) => !n.endsWith(".sample") && !n.endsWith(".old")).sort();
}

/** `.git`, or the real git dir when this is a worktree or a submodule. */
async function gitDir(): Promise<string> {
  const result = await $`git rev-parse --git-dir`.quiet().nothrow();
  if (result.exitCode !== 0) return ".git";
  // Relative to cwd, which for `m setup` is always the repo root.
  const dir = result.stdout.toString().trim();
  return dir || ".git";
}

const lefthookCommand = defineCommand({
  meta: { name: "lefthook", description: "Regenerate lefthook.yml wrapper and install Git hooks" },
  args: {
    target: {
      type: "positional",
      description: "Setup target (default: lefthook)",
      required: false,
      default: "lefthook",
    },
  },
  async run({ args }) {
    await msetup((args.target as string) ?? "lefthook");
  },
});

const binsCommand = defineCommand({
  meta: {
    name: "bins",
    description: "Link m-bins into node_modules/.bin (handled by bun install)",
  },
  run() {
    console.log("Bins are linked automatically on bun install via workspaces. Nothing to do.");
  },
});

const main = defineCommand({
  meta: {
    name: "setup",
    version: "1.0.0",
    description: "Setup CLI — regenerates lefthook.yml, installs hooks, ensures changeset config",
  },
  subCommands: { lefthook: lefthookCommand, bins: binsCommand },
  args: {
    target: {
      type: "positional",
      description: "Target (lefthook, bins, or empty for full setup)",
      required: false,
    },
  },
  async run({ args }) {
    const raw = rawArgsAfter("setup");
    const target = (args.target as string | undefined) ?? raw[0] ?? "lefthook";

    if (target === "lefthook") {
      await msetup("lefthook");
      return;
    }
    if (target === "bins") {
      return;
    }

    // Default: full setup
    await msetup("lefthook");
    // Dynamic: importing ./changeset statically would run its module-scope
    // passthrough while this command is what the user actually asked for.
    const { minit } = await import("./changeset");
    await minit("changeset").catch(() => {});
  },
});

if (import.meta.main) {
  runMain(main);
}

export default main;
