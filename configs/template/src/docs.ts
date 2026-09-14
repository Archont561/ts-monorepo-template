#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { cp } from "node:fs/promises";
import { PAGES_STAGING_DIR } from "@myorg/pages";
import { spawnSync } from "bun";
import { defineCommand, runMain } from "citty";
import { regenerateAll } from "./aggregate";

/** VitePress output dir — also the Pages artifact root. */
const SITE_OUT = "docs/.vitepress/dist";
/** Coverage HTML copied into the site by VitePress (docs/public/** → dist root). */
const COVERAGE_OUT = "docs/public/coverage";
/** Pages staging dir assembled by `mpages build`, nested at /example/. */

function run(cmd: string[]): number {
  console.log(`\n▸ ${cmd.join(" ")}`);
  const result = spawnSync({ cmd, stdout: "inherit", stderr: "inherit", stdin: "inherit" });
  return result.exitCode;
}

const main = defineCommand({
  meta: {
    name: "mdocs",
    version: "1.0.0",
    description:
      "Regenerate workflows from configs/* — static README/AGENTS with TEMPLATE-ONLY blocks",
  },
  args: {
    dir: {
      type: "string",
      description: "Target directory (default: .)",
      required: false,
      default: ".",
    },
  },
  subCommands: {
    site: defineCommand({
      meta: {
        name: "site",
        description: "Build one Pages artifact: docs + coverage report + demo app",
      },
      args: {
        "skip-coverage": {
          type: "boolean",
          description: "Reuse coverage/lcov.info instead of re-running the test suite",
          default: false,
        },
        "skip-app": {
          type: "boolean",
          description: "Skip building and copying the demo app to /example/",
          default: false,
        },
      },
      async run({ args }) {
        // 1. Coverage — the docs Status page reads coverage/lcov.info at build
        //    time, and the HTML report is served at /coverage/ from docs/public.
        if (!args["skip-coverage"]) {
          const tests = run(["bun", "run", "coverage"]);
          if (tests !== 0) {
            console.error(`::error::bun run coverage failed (exit ${tests})`);
            process.exit(tests);
          }
        }
        run(["bun", "run", "mcoverage", "setup"]);
        run(["bun", "run", "mcoverage", "html", "--out", COVERAGE_OUT]);

        // 2. Docs — VitePress empties dist/, so this must run before the app is
        //    copied in, and after the coverage report lands in docs/public.
        const build = run(["bun", "run", "docs:build"]);
        if (build !== 0) {
          console.error(`::error::docs:build failed (exit ${build})`);
          process.exit(build);
        }

        // 3. Demo app at /example/ — the docs site is the single Pages artifact,
        //    so the app artifact is nested instead of deployed separately.
        if (!args["skip-app"]) {
          const app = run(["bun", "run", "mpages", "build"]);
          if (app !== 0) {
            console.error(`::error::mpages build failed (exit ${app})`);
            process.exit(app);
          }
          if (existsSync(PAGES_STAGING_DIR)) {
            await cp(PAGES_STAGING_DIR, `${SITE_OUT}/example`, { recursive: true });
            console.log(`✅ Pages artifact copied to ${SITE_OUT}/example`);
          } else {
            console.warn(`⚠️ ${PAGES_STAGING_DIR}/ not found — skipping /example/`);
          }
        }

        console.log(`\n✅ Site ready: ${SITE_OUT}`);
        console.log("   /            docs");
        console.log("   /status      coverage, CI, versions");
        console.log("   /coverage/   HTML coverage report");
        if (!args["skip-app"]) console.log("   /example/    demo app");
        // citty would otherwise fall through to the root command, which
        // regenerates every workflow a second time.
        process.exit(0);
      },
    }),
  },
  async run({ args }) {
    // `--dir`, not a positional: a positional on the root command would swallow
    // the subcommand name (`mdocs site` would read targetDir = "site").
    await regenerateAll((args.dir as string) || ".");
  },
});

runMain(main);
