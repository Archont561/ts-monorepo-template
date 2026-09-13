#!/usr/bin/env bun
import { join } from "node:path";
import { $, file } from "bun";

/**
 * Setup script for UnoCSS — run when unocss config is enabled.
 * - Config lives in configs/unocss/uno.config.ts (not root) — avoids root level file
 * - Uses `bunx unocss --config configs/unocss/uno.config.ts` CLI
 * - Handles index-unocss.html → index.html replacement
 * - Adds @myorg/unocss dep to example app
 */

const TARGET_DIR = process.cwd();

async function main() {
  console.log("\n🎨 Setting up UnoCSS (config via --config flag, no root file)...\n");

  // 1. Ensure config exists in configs/unocss/uno.config.ts (not root)
  const configPath = join(TARGET_DIR, "configs/unocss/uno.config.ts");
  if (!(await file(configPath).exists())) {
    console.log(`  ⚠️ Config not found at ${configPath}, creating...`);
    const scope = process.env.UNOCSS_SCOPE ?? "@myorg";
    const content = `import { baseConfig, defineConfig } from "./index.ts";

export default defineConfig({
  ...baseConfig,
  content: {
    filesystem: [
      "./apps/example/src/**/*.{html,js,ts,tsx}",
      "./apps/example/public/**/*.html",
      "./packages/*/src/**/*.{html,js,ts,tsx}",
    ],
  },
  cli: {
    entry: [
      {
        patterns: ["apps/example/src/**/*.{html,ts,tsx}", "apps/example/public/**/*.html"],
        outFile: "apps/example/public/uno.css",
      },
    ],
  },
});
`.replaceAll("@myorg", scope);
    await Bun.write(configPath, content);
    console.log(`  ✓ Created ${configPath}`);
  } else {
    console.log(`  ✓ Config exists at ${configPath} (used via --config flag)`);
  }

  // 2. Handle index-unocss.html → index.html replacement (no TEMPLATE-ONLY, via file deletion + mv)
  const publicDir = join(TARGET_DIR, "apps/example/public");
  const indexHtml = join(publicDir, "index.html");
  const indexUnocssHtml = join(publicDir, "index-unocss.html");

  if (await file(indexUnocssHtml).exists()) {
    await $`mv ${indexUnocssHtml} ${indexHtml}`.quiet();
    console.log(`  ✓ Replaced index.html with UnoCSS version (mv index-unocss.html → index.html)`);
  } else if (await file(indexHtml).exists()) {
    const content = await file(indexHtml).text();
    if (content.includes("UnoCSS")) {
      console.log(`  ✓ index.html already is UnoCSS version`);
    } else {
      console.log(
        `  ⚠️ index-unocss.html not found, index.html is plain — may already be scaffolded`,
      );
    }
  }

  // 3. Ensure example app has unocss dep and build:css script uses --config
  const appPkgPath = join(TARGET_DIR, "apps/example/package.json");
  if (await file(appPkgPath).exists()) {
    const pkg = await file(appPkgPath).json();
    const scope = process.env.UNOCSS_SCOPE ?? "@myorg";
    pkg.devDependencies = pkg.devDependencies ?? {};
    pkg.scripts = pkg.scripts ?? {};

    if (!pkg.devDependencies[`${scope}/unocss`]) {
      pkg.devDependencies[`${scope}/unocss`] = "workspace:*";
      console.log(`  ✓ Added ${scope}/unocss to apps/example`);
    }

    const expectedBuildCss = `bunx unocss --config ../../configs/unocss/uno.config.ts || echo 'UnoCSS not enabled'`;
    if (pkg.scripts["build:css"] !== expectedBuildCss) {
      pkg.scripts["build:css"] = expectedBuildCss;
      console.log(`  ✓ Updated build:css to use --config flag (no root file)`);
    }

    // CSS is built per app as part of its own build, never globally. The guard
    // keeps the script a no-op in monorepos scaffolded without UnoCSS.
    const expectedBuild =
      "test -f ../../configs/unocss/uno.config.ts && bun run build:css || echo 'UnoCSS not enabled, skipping CSS build'";
    if (pkg.scripts["build"] !== expectedBuild) {
      pkg.scripts["build"] = expectedBuild;
      console.log(`  ✓ Added build script to apps/example (per-app CSS build)`);
    }

    if (!pkg.scripts["build:css:watch"]) {
      pkg.scripts["build:css:watch"] =
        "bunx unocss --config ../../configs/unocss/uno.config.ts --watch || echo 'UnoCSS watch failed'";
    } else {
      // Update existing to remove --out-file (uses cli.entry in config)
      const expectedWatch =
        "bunx unocss --config ../../configs/unocss/uno.config.ts --watch || echo 'UnoCSS watch failed'";
      if (pkg.scripts["build:css:watch"] !== expectedWatch) {
        pkg.scripts["build:css:watch"] = expectedWatch;
      }
    }

    await Bun.write(appPkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // 4. UnoCSS is built per app/package, never globally — drop the root script
  // if a previous version of this setup left one behind.
  const rootPkgPath = join(TARGET_DIR, "package.json");
  if (await file(rootPkgPath).exists()) {
    const pkg = await file(rootPkgPath).json();
    if (pkg.scripts?.["build:css"]) {
      delete pkg.scripts["build:css"];
      await Bun.write(rootPkgPath, JSON.stringify(pkg, null, 2) + "\n");
      console.log(`  ✓ Removed root build:css (CSS is built by the app that owns it)`);
    }
  }

  // 5. Remove any stray root uno.config.ts if exists (avoid root level file)
  const rootUnoConfig = join(TARGET_DIR, "uno.config.ts");
  if (await file(rootUnoConfig).exists()) {
    await $`rm -f ${rootUnoConfig}`.quiet();
    console.log(`  ✓ Removed stray root uno.config.ts (avoid root level file)`);
  }

  console.log(`\n✅ UnoCSS setup complete — config via --config flag, no root file\n`);
  console.log(
    `   Usage: bun run build (apps/example builds its own CSS via build:css)\n` +
      `         bun --filter @myorg/example run build:css:watch\n`,
  );
}

if (import.meta.main) {
  await main();
}
