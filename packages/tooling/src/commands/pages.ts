import { existsSync } from "node:fs";
import { cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { Glob, spawnSync } from "bun";
import { defineCommand, spawnTool } from "../utils/spawn";
import {
  discoverPages,
  PAGES_COVERAGE_SUBDIR,
  PAGES_STAGING_DIR,
  type PagesTarget,
  pagesUrlPath,
} from "./pages-shared";

/**
 * Repo name for a GitHub Pages project site, e.g. "org/my-app" -> "my-app".
 * Prefers the Actions-provided GITHUB_REPOSITORY, falls back to git remote.
 */
function repoName(): string | undefined {
  const fromEnv = process.env.GITHUB_REPOSITORY?.split("/")[1];
  if (fromEnv) return fromEnv;

  const remote = spawnSync({
    cmd: ["git", "config", "--get", "remote.origin.url"],
    stdout: "pipe",
  });
  const url = remote.stdout?.toString().trim();
  if (!url) return undefined;
  return url
    .replace(/\.git$/, "")
    .split("/")
    .at(-1);
}

function ownerName(): string | undefined {
  const fromEnv = process.env.GITHUB_REPOSITORY?.split("/")[0];
  if (fromEnv) return fromEnv;
  const remote = spawnSync({
    cmd: ["git", "config", "--get", "remote.origin.url"],
    stdout: "pipe",
  });
  const url = remote.stdout?.toString().trim();
  const match = url?.replace(/\.git$/, "").match(/[:/]([^/:]+)\/[^/]+$/);
  return match?.[1];
}

/** Copies each declared Pages directory into the staging dir. */
async function stage(root: string, targets: PagesTarget[]): Promise<void> {
  await rm(join(root, PAGES_STAGING_DIR), { recursive: true, force: true });

  for (const target of targets) {
    const source = join(root, target.outDir);
    if (!existsSync(source)) {
      console.error(`::error::${target.name} declares "${target.outDir}" but it does not exist`);
      process.exit(1);
    }
    const destination = target.subpath
      ? join(root, PAGES_STAGING_DIR, target.subpath)
      : join(root, PAGES_STAGING_DIR);
    await cp(source, destination, { recursive: true });
    console.log(
      `📦 ${target.name}: ${target.outDir} → ${PAGES_STAGING_DIR}${pagesUrlPath(target)}`,
    );
  }

  // Mirrors @myorg/coverage's COVERAGE_HTML. Kept as a literal on purpose:
  // Pages is usable without the coverage config, so it cannot depend on it.
  const COVERAGE_HTML_DIR = "coverage/html";
  // Coverage is rendered by `mcoverage pages` into coverage/html; folding it in
  // here keeps the step order in the workflow irrelevant.
  const coverageHtml = join(root, COVERAGE_HTML_DIR);
  if (existsSync(join(coverageHtml, "index.html"))) {
    await cp(coverageHtml, join(root, PAGES_STAGING_DIR, PAGES_COVERAGE_SUBDIR), {
      recursive: true,
    });
    console.log(
      `📊 ${COVERAGE_HTML_DIR} → ${PAGES_STAGING_DIR}/${PAGES_COVERAGE_SUBDIR} (served at /coverage/)`,
    );
  }

  const index = join(root, PAGES_STAGING_DIR, "index.html");
  if (!existsSync(index)) {
    console.warn(
      `⚠️ No index.html at the site root (${PAGES_STAGING_DIR}/) — check the pages config`,
    );
  }
}

const listCommand = defineCommand({
  meta: { name: "list", description: "Show which packages declare a Pages site" },
  run() {
    const targets = discoverPages();
    if (targets.length === 0) {
      console.log("No package declares a pages config in its package.json");
      process.exit(0);
    }
    for (const target of targets) {
      console.log(
        `${target.name.padEnd(24)} ${target.outDir.padEnd(28)} → ${pagesUrlPath(target)}`,
      );
    }
    process.exit(0);
  },
});

const buildCommand = defineCommand({
  meta: {
    name: "build",
    description: "Build the site and assemble the Pages artifact from declared packages",
  },
  run() {
    console.log("📄 Building static site for GitHub Pages");

    // Every package builds its own assets — apps own their CSS build
    // (e.g. apps/example's munocss build), so there is no global CSS step here.
    const exitCode = spawnTool(["bun", "run", "build"]);
    if (exitCode !== 0) {
      console.error(`::error::bun run build failed (exit ${exitCode})`);
      process.exit(exitCode);
    }

    const targets = discoverPages();
    if (targets.length === 0) {
      console.error(
        `::error::Pages is enabled but no package declares "pages" in its package.json (e.g. "pages": { "dir": "public" })`,
      );
      process.exit(1);
    }

    stage(process.cwd(), targets).then(() => {
      console.log(`✅ Pages artifact ready: ${PAGES_STAGING_DIR}/`);
      process.exit(0);
    });
  },
});

const baseCommand = defineCommand({
  meta: {
    name: "base",
    description: "Report (or inject) the base path for a GitHub Pages project site",
  },
  args: {
    inject: {
      type: "boolean",
      description: "Rewrite absolute href/src in the built HTML to include the base path",
      default: false,
    },
    json: {
      type: "boolean",
      description: "Print { owner, repo, base, url } as JSON",
      default: false,
    },
  },
  async run({ args }) {
    const name = repoName();
    const owner = ownerName() ?? "unknown";
    const url = name ? `https://${owner.toLowerCase()}.github.io/${name}` : undefined;

    if (args.json) {
      console.log(
        JSON.stringify({
          owner: name ? owner : null,
          repo: name ?? null,
          base: name ? `/${name}` : null,
          url: url ?? null,
        }),
      );
      return;
    }

    console.log(`🔧 Repo name: ${name ?? "(unknown)"}`);
    console.log(`   Default Pages URL: ${url ?? "(unknown)"}`);

    if (!args.inject) return;
    if (!name) {
      console.error(
        "::error::cannot determine repo name — set GITHUB_REPOSITORY or add a git remote",
      );
      process.exit(1);
    }

    // Root-document targets only: a target published at /<subpath>/ serves its
    // own assets relative to itself, so rewriting them to /<repo>/ would break.
    const targets = discoverPages();
    const rootTargets = targets.filter((target) => target.subpath === "");
    if (rootTargets.length === 0) {
      console.log("   No root-level Pages target — nothing to rewrite");
      return;
    }

    let rewritten = 0;
    for (const file of new Glob(`${PAGES_STAGING_DIR}/**/*.html`).scanSync(".")) {
      const html = await Bun.file(file).text();
      const next = html.replaceAll(/(href|src)="\/(?!\/)/g, `$1="/${name}/`);
      if (next === html) continue;
      await Bun.write(file, next);
      rewritten++;
    }
    console.log(`   Rewrote absolute paths to /${name}/ in ${rewritten} file(s)`);
  },
});

const main = defineCommand({
  meta: {
    name: "mpages",
    version: "1.0.0",
    description: "GitHub Pages helper — discovers declared sites, builds and stages the artifact",
  },
  subCommands: { build: buildCommand, base: baseCommand, list: listCommand },
});

export default main;
