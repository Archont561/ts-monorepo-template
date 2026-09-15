import { join } from "node:path";
import { $, file } from "bun";
// Setup scripts run inside a freshly copied project, before `bun install`, so
// they cannot resolve workspace packages by name — the shared editor is
// imported by path, and `configs/manifest` is an always-on config.
import { readJson, removeJsonEntry, setJsonValue, updateManifestFile } from "../manifest/editor";

/**
 * Setup script for UnoCSS — run when unocss config is enabled.
 * - Config lives in configs/unocss/uno.config.ts (not root) — avoids root level file
 * - Uses `bunx unocss --config configs/unocss/uno.config.ts` CLI
 * - Handles index-unocss.html → index.html replacement
 * - Adds @myorg/unocss dep to example app
 */

const TARGET_DIR = process.cwd();
/** Rewritten by the scaffolder — keeps the unocss CLI call scope-correct. */
const SCOPE = process.env.UNOCSS_SCOPE ?? "@myorg";

/** The app owns its CSS build; the CLI reads `cli.entry` from the config file. */
const BUILD_CSS_SCRIPT = "munocss build";
const WATCH_CSS_SCRIPT = "munocss watch";

const CONFIG_PATH = join(TARGET_DIR, "configs/unocss/uno.config.ts");

/** Content of `configs/unocss/uno.config.ts` when the package had to create it. */
function defaultConfig(): string {
  return `import { baseConfig, defineConfig } from "./unocss-shared";

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
`.replaceAll("@myorg", SCOPE);
}

/** Ensures the config exists in `configs/unocss/` — never at the repo root. */
async function ensureConfig(): Promise<void> {
  if (await file(CONFIG_PATH).exists()) {
    console.log(`  ✓ Config exists at ${CONFIG_PATH} (used via --config flag)`);
    return;
  }

  console.log(`  ⚠️ Config not found at ${CONFIG_PATH}, creating...`);
  await Bun.write(CONFIG_PATH, defaultConfig());
  console.log(`  ✓ Created ${CONFIG_PATH}`);
}

/**
 * Swaps the UnoCSS page in — the plain page is a separate file, so the swap is a
 * rename rather than a template marker.
 */
async function swapIndexHtml(): Promise<void> {
  const publicDir = join(TARGET_DIR, "apps/example/public");
  const indexHtml = join(publicDir, "index.html");
  const indexUnocssHtml = join(publicDir, "index-unocss.html");

  if (await file(indexUnocssHtml).exists()) {
    await $`mv ${indexUnocssHtml} ${indexHtml}`.quiet();
    console.log(`  ✓ Replaced index.html with UnoCSS version (mv index-unocss.html → index.html)`);
    return;
  }

  if (!(await file(indexHtml).exists())) return;

  const content = await file(indexHtml).text();
  if (content.includes("UnoCSS")) {
    console.log(`  ✓ index.html already is UnoCSS version`);
  } else {
    console.log(`  ⚠️ index-unocss.html not found, index.html is plain — may already be scaffolded`);
  }
}

interface AppManifest {
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

/** Gives the example app the unocss dependency and the per-app CSS scripts. */
async function wireExampleApp(): Promise<void> {
  const appPkgPath = join(TARGET_DIR, "apps/example/package.json");

  await updateManifestFile(appPkgPath, (source) => {
    const pkg = readJson<AppManifest>(source);
    let next = source;

    if (!pkg.devDependencies?.[`${SCOPE}/unocss`]) {
      console.log(`  ✓ Added ${SCOPE}/unocss to apps/example`);
    }
    next = setJsonValue(next, `devDependencies.${SCOPE}/unocss`, "workspace:*");

    // munocss owns the shared config path, so scripts stay one-liners and
    // degrade to a no-op in monorepos scaffolded without UnoCSS.
    if (pkg.scripts?.["build:css"] !== BUILD_CSS_SCRIPT) {
      console.log(`  ✓ Updated build:css to use munocss`);
    }
    next = setJsonValue(next, "scripts.build:css", BUILD_CSS_SCRIPT);

    if (pkg.scripts?.build !== "mbunup" && pkg.scripts?.build !== BUILD_CSS_SCRIPT) {
      console.log(`  ✓ Added build script to apps/example (per-app CSS build)`);
      next = setJsonValue(next, "scripts.build", BUILD_CSS_SCRIPT);
    }

    next = setJsonValue(next, "scripts.build:css:watch", WATCH_CSS_SCRIPT);

    return next;
  });
}

/** CSS is built per app/package, never globally — drop a stale root script. */
async function dropRootCssScript(): Promise<void> {
  const rootPkgPath = join(TARGET_DIR, "package.json");

  await updateManifestFile(rootPkgPath, (source) => {
    if (!readJson<AppManifest>(source).scripts?.["build:css"]) return source;

    console.log(`  ✓ Removed root build:css (CSS is built by the app that owns it)`);
    return removeJsonEntry(source, "scripts.build:css");
  });
}

/** Config lives in `configs/unocss/` — an older setup may have left one at the root. */
async function removeStrayRootConfig(): Promise<void> {
  const rootUnoConfig = join(TARGET_DIR, "uno.config.ts");
  if (!(await file(rootUnoConfig).exists())) return;

  await $`rm -f ${rootUnoConfig}`.quiet();
  console.log(`  ✓ Removed stray root uno.config.ts (avoid root level file)`);
}

function printNextSteps(): void {
  console.log(`\n✅ UnoCSS setup complete — config via the munocss CLI, no root file\n`);
  console.log(
    `   Usage: bun run build (apps/example builds its own CSS via munocss)\n` +
      `         bun --filter @myorg/example run build:css:watch\n`,
  );
}

async function main() {
  console.log("\n🎨 Setting up UnoCSS (config via --config flag, no root file)...\n");

  await ensureConfig();
  await swapIndexHtml();
  await wireExampleApp();
  await dropRootCssScript();
  await removeStrayRootConfig();

  printNextSteps();
}

if (import.meta.main) {
  await main();
}
