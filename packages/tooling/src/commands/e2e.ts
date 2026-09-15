import { file, spawnSync } from "bun";
import { repoRoot } from "../utils/paths";
import { defineCommand, rawArgsAfter } from "../utils/spawn";

const main = defineCommand({
  meta: {
    name: "m e2e",
    version: "1.0.0",
    description:
      "Playwright E2E with browser detection — auto-skips if browsers missing, uses shared config",
  },
  args: {
    args: { type: "positional", description: "Playwright test args", required: false },
  },
  async run() {
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

    const root = repoRoot();

    const configPath = (await file(`${root}/apps/example/playwright.config.ts`).exists())
      ? `${root}/apps/example/playwright.config.ts`
      : null;

    const args = rawArgsAfter("e2e");
    const playwright = Bun.fileURLToPath(import.meta.resolve("@playwright/test/cli.js"));
    const cmd = [
      "bun",
      playwright,
      "test",
      ...(configPath ? ["--config", configPath] : []),
      ...args,
    ];

    const proc = spawnSync({
      cmd,
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    });

    process.exit(proc.exitCode);
  },
});

export default main;
