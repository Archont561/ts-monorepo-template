#!/usr/bin/env bun
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $, file } from "bun";

/**
 * Setup script for UnoCSS — run when unocss config is enabled.
 * - Ensures uno.config.ts exists at root (extends @myorg/unocss baseConfig)
 * - Handles index-unocss.html → index.html replacement
 * - Adds @myorg/unocss dep to example app
 */

const TARGET_DIR = process.cwd();

async function main() {
  console.log("\n🎨 Setting up UnoCSS...\n");

  // 1. Ensure uno.config.ts at root
  const unoConfigPath = join(TARGET_DIR, "uno.config.ts");
  if (!(await file(unoConfigPath).exists())) {
    const scope = process.env.UNOCSS_SCOPE ?? "@myorg";
    const content = `import { baseConfig, defineConfig } from "${scope}/unocss";

export default defineConfig({
  ...baseConfig,
  content: {
    filesystem: [
      "./apps/example/src/**/*.{html,js,ts,tsx}",
      "./apps/example/public/**/*.html",
      "./packages/*/src/**/*.{html,js,ts,tsx}",
    ],
  },
});
`;
    await writeFile(unoConfigPath, content);
    console.log(`  ✓ Created ${unoConfigPath}`);
  } else {
    console.log(`  ✓ uno.config.ts already exists`);
  }

  // 2. Handle index-unocss.html → index.html replacement
  const publicDir = join(TARGET_DIR, "apps/example/public");
  const indexHtml = join(publicDir, "index.html");
  const indexUnocssHtml = join(publicDir, "index-unocss.html");

  if (await file(indexUnocssHtml).exists()) {
    // When unocss enabled: index-unocss.html replaces index.html (rename/move)
    // Per spec: opt-out → delete index-unocss.html, opt-in → replace index.html
    await $`mv ${indexUnocssHtml} ${indexHtml}`.quiet();
    console.log(`  ✓ Replaced index.html with UnoCSS version (mv index-unocss.html → index.html)`);
  } else if (await file(indexHtml).exists()) {
    const content = await file(indexHtml).text();
    if (content.includes("unocss") || content.includes("UnoCSS")) {
      console.log(`  ✓ index.html already is UnoCSS version`);
    } else {
      console.log(
        `  ⚠️ index-unocss.html not found and index.html is plain — may already be scaffolded`,
      );
    }
  } else {
    console.log(`  ⚠️ No index.html found, skipping replacement`);
  }

  // 3. Ensure example app has unocss dep
  const appPkgPath = join(TARGET_DIR, "apps/example/package.json");
  if (await file(appPkgPath).exists()) {
    const pkg = await file(appPkgPath).json();
    const scope = process.env.UNOCSS_SCOPE ?? "@myorg";
    pkg.devDependencies = pkg.devDependencies ?? {};
    if (!pkg.devDependencies[`${scope}/unocss`]) {
      pkg.devDependencies[`${scope}/unocss`] = "workspace:*";
      await Bun.write(appPkgPath, JSON.stringify(pkg, null, 2) + "\n");
      console.log(`  ✓ Added ${scope}/unocss to apps/example`);
    }
  }

  // 4. Ensure example src/index.ts handles uno.css route
  const exampleIndexPath = join(TARGET_DIR, "apps/example/src/index.ts");
  if (await file(exampleIndexPath).exists()) {
    const content = await file(exampleIndexPath).text();
    if (!content.includes("uno.css")) {
      // Inject uno.css route handling
      const withUno = content.replace(
        "  // Tier 1: Fixed fast-path routes",
        `  // Tier 1: Fixed fast-path routes
  // UnoCSS generated CSS (when enabled)
  routes: {
    "/health": () => new Response("OK", { status: 200 }),
    "/uno.css": async () => {
      try {
        const cssFile = Bun.file(new URL("../public/uno.css", import.meta.url));
        if (await cssFile.exists()) {
          return new Response(await cssFile.text(), {
            headers: { "Content-Type": "text/css" },
          });
        }
      } catch {}
      return new Response("/* UnoCSS not built — run bunx unocss */", {
        headers: { "Content-Type": "text/css" },
      });
    },
  },

  // Tier 1b: Fixed fast-path routes (kept for backward compat)
  routes: {`,
      );
      // Only apply if not already patched
      if (withUno !== content && !content.includes("/uno.css")) {
        // Simpler: prepend uno.css handling to fetch
        // We'll rewrite file to include uno.css handling
        const newContent = `import { FileSystemRouter, serve } from "bun";

const router = new FileSystemRouter({
  style: "nextjs",
  dir: \`\${import.meta.dir}/pages\`,
});

const server = serve({
  port: 3000,

  routes: {
    "/health": () => new Response("OK", { status: 200 }),
    "/uno.css": async () => {
      try {
        const cssFile = Bun.file(new URL("../../public/uno.css", import.meta.url));
        if (await cssFile.exists()) {
          return new Response(await cssFile.text(), {
            headers: { "Content-Type": "text/css" },
          });
        }
      } catch {}
      return new Response("/* UnoCSS: run bunx unocss to generate */", {
        headers: { "Content-Type": "text/css" },
      });
    },
  },

  async fetch(req) {
    const match = router.match(req);
    if (!match) {
      return new Response("Not Found", { status: 404 });
    }

    try {
      const mod = await import(match.filePath);
      return await mod.default(req, match.params);
    } catch (error) {
      console.error(\`Error executing route \${match.pathname}:\`, error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

console.log(\`🚀 http://localhost:\${server.port}\`);
`;
        await Bun.write(exampleIndexPath, newContent);
        console.log(`  ✓ Updated apps/example/src/index.ts with /uno.css route`);
      }
    }
  }

  console.log(`\n✅ UnoCSS setup complete\n`);
}

if (import.meta.main) {
  await main();
}
