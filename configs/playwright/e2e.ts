#!/usr/bin/env bun
import { file, spawnSync } from "bun";

/**
 * m-prefixed Playwright E2E CLI.
 *
 * Skips gracefully (exit 0) when no browser is installed, and runs
 * `playwright test` against the shared config at `apps/example/playwright.config.ts`
 * so it works from the repository root.
 */
const { chromium, firefox, webkit } = await import("@playwright/test");

const types: Record<string, unknown> = { chromium, firefox, webkit };

const missing: string[] = [];
for (const [name, browser] of Object.entries(types)) {
  try {
    const path = (browser as { executablePath(): string }).executablePath();
    if (!(await file(path).exists())) {
      missing.push(name);
    }
  } catch {
    missing.push(name);
  }
}

if (missing.length > 0) {
  console.log(`\nE2E skipped: browser(s) not installed (${missing.join(", ")}).`);
  console.log("Run `bunx playwright install` to download them.\n");
  process.exit(0);
}

let repoRoot: string | null = null;
let dir = import.meta.dir;
while (dir !== "/") {
  const pkg = file(`${dir}/package.json`);
  if (await pkg.exists()) {
    try {
      const json = await pkg.json();
      if (Array.isArray(json.workspaces)) {
        repoRoot = dir;
        break;
      }
    } catch {
      // not a valid root manifest, keep walking up
    }
  }
  dir = dir.slice(0, dir.lastIndexOf("/")) || "/";
}

const configPath =
  repoRoot && (await file(`${repoRoot}/apps/example/playwright.config.ts`).exists())
    ? `${repoRoot}/apps/example/playwright.config.ts`
    : null;

const args = process.argv.slice(2);
const playwright = Bun.fileURLToPath(import.meta.resolve("@playwright/test/cli.js"));
const cmd = ["bun", playwright, "test", ...(configPath ? ["--config", configPath] : []), ...args];

const proc = spawnSync({
  cmd,
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

process.exit(proc.exitCode);
