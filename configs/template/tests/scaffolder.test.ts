import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { $, file, write } from "bun";
import { MonorepoScaffolder } from "../src/scaffolder";

describe("MonorepoScaffolder (unit)", () => {
  let workDir: string;

  beforeEach(async () => {
    workDir = (await $`mktemp -d -t scaffold-unit.XXXXXX`.quiet().text()).trim();
  });

  afterEach(async () => {
    await $`rm -rf ${workDir}`.quiet();
  });

  // ── Constructor ──────────────────────────────────

  describe("constructor", () => {
    test("applies default options", () => {
      const s = new MonorepoScaffolder();
      expect(s.targetDir).toBe(".");
      expect(s.scope).toBe("@myorg");
      expect(s.gitHooks).toBe(true);
      expect(s.configs).toEqual({});
    });

    test("accepts custom scope", () => {
      const s = new MonorepoScaffolder({ scope: "@acme" });
      expect(s.scope).toBe("@acme");
    });

    test("accepts custom targetDir", () => {
      const s = new MonorepoScaffolder({ targetDir: "/tmp/foo" });
      expect(s.targetDir).toBe("/tmp/foo");
    });

    test("overrides gitHooks default", () => {
      const s = new MonorepoScaffolder({ gitHooks: false });
      expect(s.gitHooks).toBe(false);
    });

    test("stores opt-in config selections", () => {
      const s = new MonorepoScaffolder({ configs: { unocss: true, native: "publish" } });
      expect(s.configs).toEqual({ unocss: true, native: "publish" });
    });
  });

  // ── sanitizePackageJson ──────────────────────────

  describe("sanitizePackageJson", () => {
    test("removes bun-create block", async () => {
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          "bun-create": { preinstall: "echo hi" },
          scripts: { build: "turbo build" },
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizePackageJson();

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg["bun-create"]).toBeUndefined();
      expect(pkg.scripts.build).toBe("turbo build");
    });

    test("removes template-only scripts", async () => {
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          scripts: {
            build: "turbo build",
            "build:template": "bun run --filter @myorg/template build",
            "search:tools": "rg template",
            "docs:sync": "bun configs/template/src/aggregate.ts",
          },
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizePackageJson();

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg.scripts["build:template"]).toBeUndefined();
      expect(pkg.scripts["search:tools"]).toBeUndefined();
      expect(pkg.scripts.build).toBe("turbo build");
    });

    test("removes @clack/prompts and template workspace deps", async () => {
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          devDependencies: {
            "@clack/prompts": "latest",
            "@myorg/template": "workspace:*",
            turbo: "latest",
          },
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizePackageJson();

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg.devDependencies["@clack/prompts"]).toBeUndefined();
      expect(pkg.devDependencies["@myorg/template"]).toBeUndefined();
      expect(pkg.devDependencies.turbo).toBe("latest");
    });

    test("removes template from workspaces", async () => {
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          workspaces: ["apps/*", "packages/*", "configs/*", "configs/template", "template"],
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizePackageJson();

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg.workspaces).not.toContain("configs/template");
      expect(pkg.workspaces).not.toContain("template");
      expect(pkg.workspaces).toContain("apps/*");
    });

    test("preserves prepare script", async () => {
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          scripts: {
            prepare: "bun configs/lefthook/setup.ts && bun configs/changeset/init.ts",
          },
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizePackageJson();

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg.scripts.prepare).toContain("configs/lefthook/setup.ts");
      expect(pkg.scripts.prepare).toContain("configs/changeset/init.ts");
    });

    test("handles missing package.json gracefully", async () => {
      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizePackageJson();
    });

    test("preserves other package.json fields", async () => {
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          version: "1.0.0",
          license: "MIT",
          "bun-create": { preinstall: "..." },
          engines: { bun: ">=1.0.0" },
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizePackageJson();

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg.name).toBe("test");
      expect(pkg.version).toBe("1.0.0");
      expect(pkg.license).toBe("MIT");
      expect(pkg.engines.bun).toBe(">=1.0.0");
    });
  });

  // ── replaceScopePlaceholders ─────────────────────

  describe("replaceScopePlaceholders", () => {
    test("replaces @myorg with custom scope in package.json", async () => {
      await $`mkdir -p ${workDir}/packages/internal`.quiet();
      await write(
        `${workDir}/packages/internal/package.json`,
        JSON.stringify({
          name: "@myorg/internal",
          devDependencies: { "@myorg/ts": "workspace:*" },
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const pkg = await file(`${workDir}/packages/internal/package.json`).json();
      expect(pkg.name).toBe("@acme/internal");
      expect(pkg.devDependencies["@acme/ts"]).toBe("workspace:*");
    });

    test("replaces in tsconfig.json extends paths", async () => {
      await $`mkdir -p ${workDir}/packages/internal`.quiet();
      await write(
        `${workDir}/packages/internal/tsconfig.json`,
        JSON.stringify({ extends: "@myorg/ts/library.json" }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const tsconfig = await file(`${workDir}/packages/internal/tsconfig.json`).json();
      expect(tsconfig.extends).toBe("@acme/ts/library.json");
    });

    test("replaces in source imports", async () => {
      await $`mkdir -p ${workDir}/apps/example/src`.quiet();
      await write(
        `${workDir}/apps/example/src/routes.ts`,
        `import { greet } from "@myorg/external";`,
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const src = await file(`${workDir}/apps/example/src/routes.ts`).text();
      expect(src).toContain('from "@acme/external"');
    });

    test("replaces scope in config package contents", async () => {
      await $`mkdir -p ${workDir}/configs/changeset`.quiet();
      await write(
        `${workDir}/configs/changeset/config.json`,
        JSON.stringify({
          ignore: ["@myorg/internal", "@myorg/bunup"],
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const config = await file(`${workDir}/configs/changeset/config.json`).json();
      expect(config.ignore).toContain("@acme/internal");
      expect(config.ignore).toContain("@acme/bunup");
    });

    test("replaces scope in lefthook setup script", async () => {
      await $`mkdir -p ${workDir}/configs/lefthook`.quiet();
      await write(`${workDir}/configs/lefthook/setup.ts`, "// hardcoding `@myorg` no more\n");

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const content = await file(`${workDir}/configs/lefthook/setup.ts`).text();
      expect(content).toContain("@acme");
      expect(content).not.toContain("@myorg");
    });

    test("skips files without placeholder", async () => {
      await write(`${workDir}/README.md`, "# Hello World\nNo scope here.");

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const content = await file(`${workDir}/README.md`).text();
      expect(content).toBe("# Hello World\nNo scope here.");
    });

    test("replaces multiple occurrences in same file", async () => {
      await write(`${workDir}/AGENTS.md`, "@myorg/one and @myorg/two and @myorg/three");

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@x" });
      await s.replaceScopePlaceholders();

      const content = await file(`${workDir}/AGENTS.md`).text();
      expect(content).toBe("@x/one and @x/two and @x/three");
    });
  });

  // ── stripTemplateMarkers ─────────────────────────

  describe("stripTemplateMarkers", () => {
    test("removes template-scoped YAML blocks", async () => {
      await write(
        `${workDir}/test.yml`,
        [
          "steps:",
          "  - run: echo keep",
          "  # TEMPLATE-ONLY:START(template)",
          "  - run: echo remove",
          "  # TEMPLATE-ONLY:END(template)",
          "  - run: echo also-keep",
        ].join("\n"),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.stripTemplateMarkers();

      const content = await file(`${workDir}/test.yml`).text();
      expect(content).toContain("echo keep");
      expect(content).toContain("echo also-keep");
      expect(content).not.toContain("echo remove");
      expect(content).not.toContain("TEMPLATE-ONLY");
    });

    test("removes template-scoped Markdown blocks", async () => {
      await write(
        `${workDir}/AGENTS.md`,
        [
          "# Rules",
          "<!-- TEMPLATE-ONLY:START(template) -->",
          "Template-only rule",
          "<!-- TEMPLATE-ONLY:END(template) -->",
          "Always-visible rule",
        ].join("\n"),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.stripTemplateMarkers();

      const content = await file(`${workDir}/AGENTS.md`).text();
      expect(content).toContain("Always-visible rule");
      expect(content).not.toContain("Template-only rule");
      expect(content).not.toContain("TEMPLATE-ONLY");
    });

    test("removes TypeScript comment blocks", async () => {
      await write(
        `${workDir}/setup.ts`,
        [
          "const keep = 1;",
          "// TEMPLATE-ONLY:START(template)",
          "const remove = 2;",
          "// TEMPLATE-ONLY:END(template)",
          "const alsoKeep = 3;",
        ].join("\n"),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.stripTemplateMarkers();

      const content = await file(`${workDir}/setup.ts`).text();
      expect(content).toContain("keep = 1");
      expect(content).toContain("alsoKeep = 3");
      expect(content).not.toContain("remove = 2");
    });

    test("preserves content when scope is enabled", async () => {
      await write(
        `${workDir}/AGENTS.md`,
        [
          "# Rules",
          "<!-- TEMPLATE-ONLY:START(playwright) -->",
          "## E2E Testing",
          "Use Playwright.",
          "<!-- TEMPLATE-ONLY:END(playwright) -->",
        ].join("\n"),
      );

      // Default disabled scopes contain only "template", so features like
      // playwright are treated as enabled and their content survives.
      const s = new MonorepoScaffolder({ targetDir: workDir, configs: { playwright: true } });
      await s.stripTemplateMarkers();

      const content = await file(`${workDir}/AGENTS.md`).text();
      expect(content).toContain("## E2E Testing");
      expect(content).toContain("Use Playwright.");
      expect(content).not.toContain("TEMPLATE-ONLY");
    });

    test("removes block when feature scope is disabled", async () => {
      await write(
        `${workDir}/AGENTS.md`,
        [
          "<!-- TEMPLATE-ONLY:START(unocss) -->",
          "## Styling with UnoCSS",
          "<!-- TEMPLATE-ONLY:END(unocss) -->",
        ].join("\n"),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, configs: { unocss: false } });
      setDisabledScopes(s, ["template", "unocss"]);
      await s.stripTemplateMarkers();

      const content = await file(`${workDir}/AGENTS.md`).text();
      expect(content).not.toContain("Styling with UnoCSS");
      expect(content).not.toContain("TEMPLATE-ONLY");
    });

    test("collapses excessive blank lines after stripping", async () => {
      await write(
        `${workDir}/test.md`,
        [
          "Line 1",
          "",
          "<!-- TEMPLATE-ONLY:START(template) -->",
          "Remove me",
          "<!-- TEMPLATE-ONLY:END(template) -->",
          "",
          "",
          "",
          "Line 2",
        ].join("\n"),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.stripTemplateMarkers();

      const content = await file(`${workDir}/test.md`).text();
      expect(content).not.toMatch(/\n{3,}/);
    });
  });

  // ── removeTemplateFiles ──────────────────────────

  describe("removeTemplateFiles", () => {
    test("removes template-only test file", async () => {
      await $`mkdir -p ${workDir}/tests`.quiet();
      await write(`${workDir}/tests/template.test.ts`, "export {}");

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.removeTemplateFiles();

      expect(await pathExists(`${workDir}/tests/template.test.ts`)).toBe(false);
    });

    test("succeeds when file does not exist", async () => {
      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.removeTemplateFiles();
    });
  });

  // ── sanitizeTemplateRefs ─────────────────────────

  describe("sanitizeTemplateRefs", () => {
    test("strips configs/template refs from .gitignore", async () => {
      await write(
        `${workDir}/.gitignore`,
        ["node_modules/", "!configs/template/dist/", "dist/", "TODO"].join("\n"),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizeTemplateRefs();

      const content = await file(`${workDir}/.gitignore`).text();
      expect(content).not.toContain("configs/template");
      expect(content).toContain("node_modules/");
      expect(content).toContain("dist/");
      expect(content).toContain("TODO");
    });

    test("strips configs/template refs from bunfig ignore patterns", async () => {
      await $`mkdir -p ${workDir}/configs/bun-config`.quiet();
      await write(
        `${workDir}/configs/bun-config/bunfig.toml`,
        ["ignore = [", '  "**/configs/template/**",', '  "dist",', "]"].join("\n"),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizeTemplateRefs();

      const content = await file(`${workDir}/configs/bun-config/bunfig.toml`).text();
      expect(content).not.toContain("configs/template");
      expect(content).toContain("dist");
    });
  });

  // ── regenerateDocs ──────────────────────────────

  describe("regenerateDocs", () => {
    test("writes AGENTS.md and README.md with sections from present configs", async () => {
      await $`mkdir -p ${workDir}/configs/apply ${workDir}/configs/zeta ${workDir}/configs/missing`.quiet();
      await write(`${workDir}/configs/AGENT.md`, "# AGENTS.md\nIntro.");
      await write(`${workDir}/configs/README.md`, "# Repo\nIntro.");
      await write(`${workDir}/configs/apply/AGENT.md`, "## Apply Section");
      await write(`${workDir}/configs/apply/README.md`, "# apply package");
      await write(`${workDir}/configs/zeta/AGENT.md`, "## Zeta Section");

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.regenerateDocs();

      const agents = await file(`${workDir}/AGENTS.md`).text();
      expect(agents.startsWith("<!-- AUTO-GENERATED from configs/*/AGENT.md -->")).toBe(true);
      expect(agents).toContain("# AGENTS.md");
      expect(agents.indexOf("<!-- AGENT:apply:START -->")).toBeLessThan(
        agents.indexOf("<!-- AGENT:zeta:START -->"),
      );
      expect(agents).toContain("## Zeta Section");

      const readme = await file(`${workDir}/README.md`).text();
      expect(readme).toContain("<!-- PACKAGE:apply:START -->");
      expect(readme).toContain("# apply package");
      // Configs without a README.md contribute no PACKAGE section.
      expect(readme).not.toContain("PACKAGE:zeta");
    });

    test("omits configs whose doc files are missing", async () => {
      await $`mkdir -p ${workDir}/configs/apply ${workDir}/configs/solo`.quiet();
      await write(`${workDir}/configs/AGENT.md`, "# AGENTS.md\nIntro.");
      await write(`${workDir}/configs/README.md`, "# Repo\nIntro.");
      // `apply` ships both docs; `solo` ships only AGENT.md.
      await write(`${workDir}/configs/apply/AGENT.md`, "## Apply Section");
      await write(`${workDir}/configs/apply/README.md`, "# apply package");
      await write(`${workDir}/configs/solo/AGENT.md`, "## Solo Section");

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.regenerateDocs();

      const agents = await file(`${workDir}/AGENTS.md`).text();
      expect(agents).toContain("<!-- AGENT:apply:START -->");
      expect(agents).toContain("<!-- AGENT:solo:START -->");

      const readme = await file(`${workDir}/README.md`).text();
      expect(readme).toContain("<!-- PACKAGE:apply:START -->");
      expect(readme).not.toContain("PACKAGE:solo");
    });
  });

  // ── regenerateCI ─────────────────────────────────

  describe("regenerateCI", () => {
    test("splices step fragments into the base skeletons", async () => {
      await $`mkdir -p ${workDir}/configs/gh-actions ${workDir}/configs/apply ${workDir}/configs/changeset`.quiet();
      await write(
        `${workDir}/configs/gh-actions/ci.base.yml`,
        "name: CI\n\njobs:\n  verify:\n    steps:\n{{STEPS}}",
      );
      await write(
        `${workDir}/configs/gh-actions/release.base.yml`,
        "name: Release\n\njobs:\n  release:\n    steps:\n{{STEPS}}",
      );
      await write(`${workDir}/configs/apply/ci.steps.yml`, "      - run: bun run check");
      await write(
        `${workDir}/configs/changeset/release.steps.yml`,
        "      - uses: changesets/action@v1",
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.regenerateCI();

      const ci = await file(`${workDir}/.github/workflows/ci.yml`).text();
      expect(ci).not.toContain("{{STEPS}}");
      expect(ci).toContain("bun run check");

      const release = await file(`${workDir}/.github/workflows/release.yml`).text();
      expect(release).not.toContain("{{STEPS}}");
      expect(release).toContain("changesets/action@v1");
    });
  });

  // ── handleConfig ─────────────────────────────────

  describe("handleConfig", () => {
    test("removes disabled confirm config directory and extra removals", async () => {
      await $`mkdir -p ${workDir}/configs/unocss`.quiet();
      await write(
        `${workDir}/configs/unocss/package.json`,
        JSON.stringify({
          name: "@myorg/unocss",
          scaffold: {
            default: false,
            flag: "unocss",
            extraRemovals: ["uno.config.ts"],
          },
        }),
      );
      await write(`${workDir}/uno.config.ts`, "export default {}");
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          devDependencies: { "@myorg/unocss": "workspace:*" },
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, configs: { unocss: false } });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/configs/unocss`)).toBe(false);
      expect(await pathExists(`${workDir}/uno.config.ts`)).toBe(false);
    });

    test("keeps enabled config intact", async () => {
      await $`mkdir -p ${workDir}/configs/playwright`.quiet();
      await write(
        `${workDir}/configs/playwright/package.json`,
        JSON.stringify({
          name: "@myorg/playwright",
          scaffold: { default: true, flag: "playwright" },
        }),
      );
      await write(`${workDir}/package.json`, JSON.stringify({ name: "test" }));

      const s = new MonorepoScaffolder({ targetDir: workDir, configs: { playwright: true } });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/configs/playwright`)).toBe(true);
    });

    test("handles select-type with 'none' selection", async () => {
      await $`mkdir -p ${workDir}/configs/native ${workDir}/crates/core`.quiet();
      await write(
        `${workDir}/configs/native/package.json`,
        JSON.stringify({
          name: "@myorg/native",
          scaffold: {
            default: "none",
            flag: "native",
            type: "select",
            removals: {
              none: { extraRemovals: ["Cargo.toml", "crates"] },
              publish: { extraRemovals: ["Dockerfile"] },
            },
          },
        }),
      );
      await write(`${workDir}/Cargo.toml`, "[workspace]");
      await write(`${workDir}/Dockerfile`, "FROM oven/bun:1");
      await write(`${workDir}/package.json`, JSON.stringify({ name: "test" }));

      const s = new MonorepoScaffolder({ targetDir: workDir, configs: { native: "none" } });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/Cargo.toml`)).toBe(false);
      expect(await pathExists(`${workDir}/crates`)).toBe(false);
      expect(await pathExists(`${workDir}/Dockerfile`)).toBe(true);
    });

    test("removes app deps when config disabled", async () => {
      await $`mkdir -p ${workDir}/configs/playwright ${workDir}/apps/example`.quiet();
      await write(
        `${workDir}/configs/playwright/package.json`,
        JSON.stringify({
          name: "@myorg/playwright",
          scaffold: {
            default: true,
            flag: "playwright",
            appDepsToRemove: ["@myorg/playwright"],
          },
        }),
      );
      await write(
        `${workDir}/apps/example/package.json`,
        JSON.stringify({
          name: "example",
          devDependencies: { "@myorg/playwright": "workspace:*" },
        }),
      );
      await write(`${workDir}/package.json`, JSON.stringify({ name: "test" }));

      const s = new MonorepoScaffolder({ targetDir: workDir, configs: { playwright: false } });
      await s.handleConfig();

      const appPkg = await file(`${workDir}/apps/example/package.json`).json();
      expect(appPkg.devDependencies["@myorg/playwright"]).toBeUndefined();
    });

    test("self-destructs template-only configs and their scripts", async () => {
      await $`mkdir -p ${workDir}/configs/template/src ${workDir}/configs/biome`.quiet();
      await write(
        `${workDir}/configs/template/package.json`,
        JSON.stringify({
          name: "@myorg/template",
          scaffold: {
            default: "always",
            selfDestruct: true,
            scriptsToRemove: ["docs:sync"],
          },
        }),
      );
      await write(
        `${workDir}/configs/biome/package.json`,
        JSON.stringify({
          name: "@myorg/biome",
          scaffold: { default: "always", flag: "biome" },
        }),
      );
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          scripts: { "docs:sync": "bun configs/template/src/aggregate.ts" },
          devDependencies: { "@myorg/template": "workspace:*", "@myorg/biome": "workspace:*" },
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/configs/template`)).toBe(false);
      expect(await pathExists(`${workDir}/configs/biome`)).toBe(true);

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg.scripts["docs:sync"]).toBeUndefined();
      expect(pkg.devDependencies["@myorg/template"]).toBeUndefined();
      expect(pkg.devDependencies["@myorg/biome"]).toBe("workspace:*");
    });
  });

  // ── setupGitHooks ────────────────────────────────

  describe("setupGitHooks", () => {
    test("initializes git repo when none exists", async () => {
      const s = new MonorepoScaffolder({ targetDir: workDir, gitHooks: true });
      await s.setupGitHooks();

      expect(await pathExists(`${workDir}/.git`)).toBe(true);
    });

    test("skips git init when gitHooks disabled", async () => {
      const s = new MonorepoScaffolder({ targetDir: workDir, gitHooks: false });
      await s.setupGitHooks();

      expect(await pathExists(`${workDir}/.git`)).toBe(false);
    });

    test("does not reinitialize existing git repo", async () => {
      await $`git -C ${workDir} init -q`.quiet();

      const before = await file(`${workDir}/.git/HEAD`).text();
      await Bun.sleep(10);

      const s = new MonorepoScaffolder({ targetDir: workDir, gitHooks: true });
      await s.setupGitHooks();

      const after = await file(`${workDir}/.git/HEAD`).text();
      expect(after).toBe(before);
    });
  });
});

function setDisabledScopes(s: MonorepoScaffolder, scopes: string[]): void {
  (s as unknown as { disabledScopes: Set<string> }).disabledScopes = new Set(scopes);
}

async function pathExists(path: string): Promise<boolean> {
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0;
}
