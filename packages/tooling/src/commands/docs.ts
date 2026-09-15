#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { cp, rm } from "node:fs/promises";

/** Staging dir m pages writes the built site to before deploy. Was
 * `@myorg/pages`'s PAGES_STAGING_DIR; inlined so this package has no configs/ dep. */
const PAGES_STAGING_DIR = ".pages";

import { spawnSync } from "bun";
import { regenerateAll } from "@/src/scaffold/aggregator";
import { defineCommand } from "@/src/utils/spawn";

/** The template-only VitePress app — a workspace like any other. */
const DOCS_APP = "apps/template-docs";
/** The bundled static site — also the Pages artifact root. */
const SITE_OUT = `${DOCS_APP}/dist`;
/** genhtml report as rendered by `m coverage html` (its default out dir). */
const COVERAGE_HTML_DIR = "coverage/html";

function run(cmd: string[]): number {
  console.log(`\n▸ ${cmd.join(" ")}`);
  const result = spawnSync({ cmd, stdout: "inherit", stderr: "inherit", stdin: "inherit" });
  return result.exitCode;
}

const main = defineCommand({
  meta: {
    name: "m docs",
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
        //    time, and the HTML report is folded into the artifact after the
        //    build (step 3).
        if (!args["skip-coverage"]) {
          const tests = run(["bun", "run", "coverage"]);
          if (tests !== 0) {
            console.error(`::error::bun run coverage failed (exit ${tests})`);
            process.exit(tests);
          }
        }
        run(["bun", "run", "m coverage", "setup"]);
        run(["bun", "run", "m coverage", "html"]);

        // 2. Docs — the app builds through Turbo like any other package (the
        //    root docs:build script is the filtered delegate), so the site
        //    itself stays a deterministic, cacheable task. Everything that is
        //    generated per run (coverage, the demo app) is assembled into the
        //    artifact afterwards instead of being a build input — gitignored
        //    files are invisible to Turbo's hash.
        const build = run(["bun", "run", "docs:build"]);
        if (build !== 0) {
          console.error(`::error::${DOCS_APP} build failed (exit ${build})`);
          process.exit(build);
        }

        // 3. Coverage report at /coverage/ — rendered before the build (the
        //    Status page links it) and copied in after it.
        if (existsSync(`${COVERAGE_HTML_DIR}/index.html`)) {
          await rm(`${SITE_OUT}/coverage`, { recursive: true, force: true });
          await cp(COVERAGE_HTML_DIR, `${SITE_OUT}/coverage`, { recursive: true });
          console.log(`✅ Coverage report copied to ${SITE_OUT}/coverage`);
        } else {
          console.warn(`⚠️ ${COVERAGE_HTML_DIR}/ not found — skipping /coverage/`);
        }

        // 4. Demo app at /example/ — the docs site is the single Pages
        //    artifact, so the app artifact is nested instead of deployed
        //    separately.
        if (!args["skip-app"]) {
          const app = run(["bun", "run", "m pages", "build"]);
          if (app !== 0) {
            console.error(`::error::m pages build failed (exit ${app})`);
            process.exit(app);
          }
          if (existsSync(PAGES_STAGING_DIR)) {
            await rm(`${SITE_OUT}/example`, { recursive: true, force: true });
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
    // the subcommand name (`m docs site` would read targetDir = "site").
    await regenerateAll((args.dir as string) || ".");
  },
});

export default main;
