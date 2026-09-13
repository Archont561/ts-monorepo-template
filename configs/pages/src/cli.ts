#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { spawnSync } from "bun";
import { defineCommand, runMain } from "citty";
import { PAGES_ARTIFACT_PATH } from "../index.ts";

function run(cmd: string[]): number {
  const result = spawnSync({ cmd, stdout: "inherit", stderr: "inherit", stdin: "inherit" });
  return result.exitCode;
}

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

const buildCommand = defineCommand({
  meta: {
    name: "build",
    description: "Build the static site for GitHub Pages (bun run build + verify artifact dir)",
  },
  run() {
    console.log("📄 Building static site for GitHub Pages");

    // Every package builds its own assets — apps own their CSS build
    // (e.g. apps/example's build:css), so there is no global CSS step here.
    const exitCode = run(["bun", "run", "build"]);
    if (exitCode !== 0) {
      console.error(`::error::bun run build failed (exit ${exitCode})`);
      process.exit(exitCode);
    }

    if (!existsSync(PAGES_ARTIFACT_PATH)) {
      console.error(`::error::Pages artifact dir missing: ${PAGES_ARTIFACT_PATH}`);
      process.exit(1);
    }

    console.log(`✅ Pages artifact ready: ${PAGES_ARTIFACT_PATH}`);
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
  },
  async run({ args }) {
    const name = repoName();
    const owner = process.env.GITHUB_REPOSITORY_OWNER ?? "unknown";
    console.log(`🔧 Repo name: ${name ?? "(unknown)"}`);
    console.log(`   Default Pages URL: https://${owner}.github.io/${name ?? ""}`);

    if (!args.inject) return;
    if (!name) {
      console.error(
        "::error::cannot determine repo name — set GITHUB_REPOSITORY or add a git remote",
      );
      process.exit(1);
    }

    const indexPath = `${PAGES_ARTIFACT_PATH}/index.html`;
    if (!existsSync(indexPath)) {
      console.error(`::error::${indexPath} not found — build the site first (mpages build)`);
      process.exit(1);
    }

    const html = await Bun.file(indexPath).text();
    const rewritten = html.replaceAll(/(href|src)="\/(?!\/)/g, `$1="/${name}/`);
    if (rewritten === html) {
      console.log("   No absolute paths to rewrite");
      return;
    }
    await Bun.write(indexPath, rewritten);
    console.log(`   Rewrote absolute paths to /${name}/ in ${indexPath}`);
  },
});

const main = defineCommand({
  meta: {
    name: "mpages",
    version: "1.0.0",
    description: "GitHub Pages helper — builds the static site and configures the base path",
  },
  subCommands: { build: buildCommand, base: baseCommand },
});

runMain(main);
