import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir } from "node:fs/promises";
import { $, file, write } from "bun";
import fc from "fast-check";
import { removeJsonEntry } from "../../src/manifest/editor";
import {
  type DiscoveredConfig,
  discoverConfigs,
  NATIVE_MODES,
  type ScaffoldMeta,
} from "../../src/scaffold/features";
import {
  collectScopeTargets,
  MonorepoScaffolder,
  stripMarkerBlocks,
} from "../../src/scaffold/pipeline";
import { REPO_ROOT } from "../helpers";

/**
 * Reads the synthetic `scaffold` blocks a test wrote into its fixture and hands
 * them to the scaffolder as an injected feature list.
 *
 * Discovery stopped reading the filesystem in R27 — it returns the `FEATURES`
 * registry — so writing `configs/<dir>/package.json` into a fixture no longer
 * reaches the scaffolder on its own. Tests that drive the removal engine with
 * their own metadata have to pass it explicitly; reading it back from the file
 * the test already wrote keeps each test's metadata in exactly one place.
 */
async function fixtureFeatures(workDir: string, ...dirs: string[]): Promise<DiscoveredConfig[]> {
  const features: DiscoveredConfig[] = [];
  for (const dir of dirs) {
    const pkg: { name: string; scaffold: ScaffoldMeta } = await file(
      `${workDir}/packages/${dir}/package.json`,
    ).json();
    features.push({ name: pkg.name, dir, meta: pkg.scaffold });
  }
  return features;
}

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
      const s = new MonorepoScaffolder({ configs: { styles: true, native: "publish" } });
      expect(s.configs).toEqual({ styles: true, native: "publish" });
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
          workspaces: ["apps/*", "packages/*", "packages/template", "template"],
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizePackageJson();

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg.workspaces).not.toContain("packages/template");
      expect(pkg.workspaces).not.toContain("template");
      expect(pkg.workspaces).toContain("apps/*");
    });

    test("preserves prepare script", async () => {
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          scripts: {
            prepare: "m setup lefthook && m changeset init",
          },
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizePackageJson();

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg.scripts.prepare).toContain("m setup");
      expect(pkg.scripts.prepare).toContain("m changeset");
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
      await mkdir(`${workDir}/packages/internal`, { recursive: true });
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
      await mkdir(`${workDir}/packages/internal`, { recursive: true });
      await write(
        `${workDir}/packages/internal/tsconfig.json`,
        JSON.stringify({ extends: "@myorg/tooling/library.json" }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const tsconfig = await file(`${workDir}/packages/internal/tsconfig.json`).json();
      expect(tsconfig.extends).toBe("@acme/tooling/library.json");
    });

    test("replaces in source imports", async () => {
      await mkdir(`${workDir}/apps/example/src/pages/api/greet`, {
        recursive: true,
      });
      await write(
        `${workDir}/apps/example/src/pages/api/greet/[name].ts`,
        `import { greet } from "@myorg/external";`,
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const src = await file(`${workDir}/apps/example/src/pages/api/greet/[name].ts`).text();
      expect(src).toContain('from "@acme/external"');
    });

    test("replaces scope in config package contents", async () => {
      await mkdir(`${workDir}/packages/tooling/src/configs`, { recursive: true });
      await write(
        `${workDir}/packages/tooling/src/configs/changeset.config.json`,
        JSON.stringify({
          ignore: ["@myorg/internal", "@myorg/bunup"],
        }),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const config = await file(
        `${workDir}/packages/tooling/src/configs/changeset.config.json`,
      ).json();
      expect(config.ignore).toContain("@acme/internal");
      expect(config.ignore).toContain("@acme/bunup");
    });

    test("replaces scope in lefthook setup script", async () => {
      await mkdir(`${workDir}/packages/tooling/src/configs`, { recursive: true });
      await write(
        `${workDir}/packages/tooling/src/configs/lefthook.yml`,
        "# hardcoding `@myorg` no more\n",
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@acme" });
      await s.replaceScopePlaceholders();

      const content = await file(`${workDir}/packages/tooling/src/configs/lefthook.yml`).text();
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
        `${workDir}/bootstrap.ts`,
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

      const content = await file(`${workDir}/bootstrap.ts`).text();
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
          "<!-- TEMPLATE-ONLY:START(styles) -->",
          "## Styling with UnoCSS",
          "<!-- TEMPLATE-ONLY:END(styles) -->",
        ].join("\n"),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, configs: { styles: false } });
      setDisabledScopes(s, ["template", "styles"]);
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

    test("keeps the indentation of the code around an indented block", async () => {
      // Regression: the marker line's indentation used to be left behind, so a
      // removed block glued it onto the next line and a kept block got its
      // first line indented twice.
      await write(
        `${workDir}/app.ts`,
        [
          "const routes = {",
          '  "/keep": () => 1,',
          "  // TEMPLATE-ONLY:START(native)",
          '  "/native": () => 2,',
          "  // TEMPLATE-ONLY:END(native)",
          "};",
          "",
          "const other = {",
          "  // TEMPLATE-ONLY:START(styles)",
          "  a: 1,",
          "  // TEMPLATE-ONLY:END(styles)",
          "};",
        ].join("\n"),
      );

      const removed = new MonorepoScaffolder({ targetDir: workDir });
      setDisabledScopes(removed, ["template", "native"]);
      await removed.stripTemplateMarkers();
      expect(await file(`${workDir}/app.ts`).text()).toContain(
        'const routes = {\n  "/keep": () => 1,\n};',
      );

      await write(
        `${workDir}/kept.ts`,
        [
          "const other = {",
          "  // TEMPLATE-ONLY:START(styles)",
          "  a: 1,",
          "  // TEMPLATE-ONLY:END(styles)",
          "};",
        ].join("\n"),
      );

      const kept = new MonorepoScaffolder({ targetDir: workDir, configs: { styles: true } });
      setDisabledScopes(kept, ["template"]);
      await kept.stripTemplateMarkers();
      expect(await file(`${workDir}/kept.ts`).text()).toContain("const other = {\n  a: 1,\n};");
    });
  });

  // ── removeTemplateFiles ──────────────────────────

  describe("removeTemplateFiles", () => {
    test("removes template-only test file", async () => {
      await mkdir(`${workDir}/tests`, { recursive: true });
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
    test("strips the committed scaffold bundle refs from .gitignore", async () => {
      await write(
        `${workDir}/.gitignore`,
        ["node_modules/", "!packages/tooling/dist/", "dist/", "TODO"].join("\n"),
      );

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizeTemplateRefs();

      const content = await file(`${workDir}/.gitignore`).text();
      expect(content).not.toContain("packages/tooling/dist");
      expect(content).toContain("node_modules/");
      expect(content).toContain("dist/");
      expect(content).toContain("TODO");
    });

    test("leaves the shared bunfig alone", async () => {
      // It used to carry `**/configs/template/**` coverage ignores that a
      // generated project had no use for. R27 dropped those with `configs/`, so
      // nothing in the shared bunfig is template-specific any more and the
      // sanitiser must not touch it.
      await mkdir(`${workDir}/packages/tooling/src/configs`, { recursive: true });
      const bunfig = ["ignore = [", '  "**/dist/**",', '  "dist",', "]"].join("\n");
      await write(`${workDir}/packages/tooling/src/configs/bunfig.toml`, bunfig);

      const s = new MonorepoScaffolder({ targetDir: workDir });
      await s.sanitizeTemplateRefs();

      const content = await file(`${workDir}/packages/tooling/src/configs/bunfig.toml`).text();
      expect(content).toBe(bunfig);
    });
  });

  // ── regenerateCI ─────────────────────────────────

  describe("regenerateCI", () => {
    test("splices step fragments into the base skeletons", async () => {
      await mkdir(`${workDir}/packages/gh-actions`, { recursive: true });
      await mkdir(`${workDir}/packages/apply`, { recursive: true });
      await mkdir(`${workDir}/packages/changeset`, { recursive: true });
      await write(
        `${workDir}/packages/gh-actions/ci.base.yml`,
        "name: CI\n\njobs:\n  verify:\n    steps:\n{{STEPS}}",
      );
      await write(
        `${workDir}/packages/gh-actions/release.base.yml`,
        "name: Release\n\njobs:\n  release:\n    steps:\n{{STEPS}}",
      );
      await write(`${workDir}/packages/apply/ci.steps.yml`, "      - run: bun run check");
      await write(
        `${workDir}/packages/changeset/release.steps.yml`,
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
    test("removes a disabled feature\u2019s extra removals", async () => {
      await mkdir(`${workDir}/packages/styles`, { recursive: true });
      await write(
        `${workDir}/packages/styles/package.json`,
        JSON.stringify({
          name: "@myorg/styles",
          scaffold: {
            default: false,
            flag: "styles",
            extraRemovals: ["style.config.ts"],
          },
        }),
      );
      await write(`${workDir}/style.config.ts`, "export default {}");
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          devDependencies: { "@myorg/styles": "workspace:*" },
        }),
      );

      const s = new MonorepoScaffolder({
        targetDir: workDir,
        configs: { styles: false },
        features: await fixtureFeatures(workDir, "styles"),
      });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/style.config.ts`)).toBe(false);
    });

    test("keeps enabled config intact", async () => {
      await mkdir(`${workDir}/packages/playwright`, { recursive: true });
      await write(
        `${workDir}/packages/playwright/package.json`,
        JSON.stringify({
          name: "@myorg/playwright",
          scaffold: { default: true, flag: "playwright" },
        }),
      );
      await write(`${workDir}/package.json`, JSON.stringify({ name: "test" }));

      const s = new MonorepoScaffolder({
        targetDir: workDir,
        configs: { playwright: true },
        features: await fixtureFeatures(workDir, "playwright"),
      });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/packages/playwright`)).toBe(true);
    });

    test("handles select-type with 'none' selection", async () => {
      await mkdir(`${workDir}/packages/native`, { recursive: true });
      await mkdir(`${workDir}/crates/core`, { recursive: true });
      await write(
        `${workDir}/packages/native/package.json`,
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

      const s = new MonorepoScaffolder({
        targetDir: workDir,
        configs: { native: "none" },
        features: await fixtureFeatures(workDir, "native"),
      });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/Cargo.toml`)).toBe(false);
      expect(await pathExists(`${workDir}/crates`)).toBe(false);
      expect(await pathExists(`${workDir}/Dockerfile`)).toBe(true);
    });

    test("removes app deps when config disabled", async () => {
      await mkdir(`${workDir}/packages/playwright`, { recursive: true });
      await mkdir(`${workDir}/apps/example`, { recursive: true });
      await write(
        `${workDir}/packages/playwright/package.json`,
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

      const s = new MonorepoScaffolder({
        targetDir: workDir,
        configs: { playwright: false },
        features: await fixtureFeatures(workDir, "playwright"),
      });
      await s.handleConfig();

      const appPkg = await file(`${workDir}/apps/example/package.json`).json();
      expect(appPkg.devDependencies["@myorg/playwright"]).toBeUndefined();
    });

    test("removes files matching glob patterns when config disabled", async () => {
      await mkdir(`${workDir}/packages/playwright`, { recursive: true });
      await mkdir(`${workDir}/apps/example/e2e`, { recursive: true });
      await mkdir(`${workDir}/apps/example/src`, { recursive: true });
      await write(
        `${workDir}/packages/playwright/package.json`,
        JSON.stringify({
          name: "@myorg/playwright",
          scaffold: {
            default: true,
            flag: "playwright",
            filePatternsToRemove: ["apps/example/e2e/**", "**/*.e2e.ts"],
          },
        }),
      );
      await write(`${workDir}/apps/example/e2e/test.spec.ts`, "test");
      await write(`${workDir}/apps/example/src/app.e2e.ts`, "test");
      await write(`${workDir}/apps/example/src/keep.ts`, "keep");
      await write(`${workDir}/package.json`, JSON.stringify({ name: "test" }));

      const s = new MonorepoScaffolder({
        targetDir: workDir,
        configs: { playwright: false },
        features: await fixtureFeatures(workDir, "playwright"),
      });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/apps/example/e2e/test.spec.ts`)).toBe(false);
      expect(await pathExists(`${workDir}/apps/example/src/app.e2e.ts`)).toBe(false);
      expect(await pathExists(`${workDir}/apps/example/src/keep.ts`)).toBe(true);
    });

    test("removes files matching regex patterns when config disabled", async () => {
      await mkdir(`${workDir}/packages/styles`, { recursive: true });
      await mkdir(`${workDir}/apps/example/src`, { recursive: true });
      await write(
        `${workDir}/packages/styles/package.json`,
        JSON.stringify({
          name: "@myorg/styles",
          scaffold: {
            default: false,
            flag: "styles",
            fileRegexesToRemove: ["style\\.config\\.ts$", ".*\\.generated\\..*", "styles"],
          },
        }),
      );
      await write(`${workDir}/style.config.ts`, "export default {}");
      await write(`${workDir}/apps/example/src/styles.generated.css`, ".test{}");
      await write(`${workDir}/apps/example/src/keep.ts`, "keep");
      await write(`${workDir}/package.json`, JSON.stringify({ name: "test" }));

      const s = new MonorepoScaffolder({
        targetDir: workDir,
        configs: { styles: false },
        features: await fixtureFeatures(workDir, "styles"),
      });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/style.config.ts`)).toBe(false);
      expect(await pathExists(`${workDir}/apps/example/src/styles.generated.css`)).toBe(false);
      expect(await pathExists(`${workDir}/apps/example/src/keep.ts`)).toBe(true);
    });

    test("removes files via both glob and regex in same config", async () => {
      await mkdir(`${workDir}/packages/skills`, { recursive: true });
      await mkdir(`${workDir}/.agents/skills`, { recursive: true });
      await write(
        `${workDir}/packages/skills/package.json`,
        JSON.stringify({
          name: "@myorg/skills",
          scaffold: {
            default: false,
            flag: "skills",
            filePatternsToRemove: [".agents/**"],
            fileRegexesToRemove: ["skills"],
          },
        }),
      );
      await write(`${workDir}/.agents/skills/test.md`, "skill");
      await write(`${workDir}/package.json`, JSON.stringify({ name: "test" }));

      const s = new MonorepoScaffolder({
        targetDir: workDir,
        configs: { skills: false },
        features: await fixtureFeatures(workDir, "skills"),
      });
      await s.handleConfig();

      expect(await pathExists(`${workDir}/.agents/skills/test.md`)).toBe(false);
    });

    test("self-destructs template-only configs and their scripts", async () => {
      await mkdir(`${workDir}/packages/template/src`, { recursive: true });
      await mkdir(`${workDir}/packages/tooling/tests`, { recursive: true });
      await mkdir(`${workDir}/packages/tooling/dist`, { recursive: true });
      await write(`${workDir}/packages/tooling/tests/harness.test.ts`, "test(() => {});\n");
      await mkdir(`${workDir}/packages/biome`, { recursive: true });
      await write(
        `${workDir}/packages/template/package.json`,
        JSON.stringify({
          name: "@myorg/template",
          scaffold: {
            default: "always",
            selfDestruct: true,
            scriptsToRemove: ["docs:sync", "docs:site", "docs:dev", "docs:build", "docs:preview"],
            extraRemovals: ["packages/tooling/tests", "packages/tooling/dist"],
          },
        }),
      );
      await write(
        `${workDir}/packages/biome/package.json`,
        JSON.stringify({
          name: "@myorg/biome",
          scaffold: { default: "always", flag: "biome" },
        }),
      );
      await write(
        `${workDir}/package.json`,
        JSON.stringify({
          name: "test",
          workspaces: ["packages/*"],
          scripts: {
            "docs:sync": "bun packages/tooling/src/scaffold/aggregator.ts",
            "docs:site": "m docs site",
            "docs:dev": "m turbo dev --filter=@myorg/template-docs",
          },
          devDependencies: { "@myorg/template": "workspace:*", "@myorg/biome": "workspace:*" },
        }),
      );

      const s = new MonorepoScaffolder({
        targetDir: workDir,
        features: await fixtureFeatures(workDir, "template", "biome"),
      });
      await s.handleConfig();

      // The feature's extraRemovals are the template-only parts of the tooling
      // package: the harness's own tests and the committed bundle.
      expect(await pathExists(`${workDir}/packages/tooling/tests`)).toBe(false);
      expect(await pathExists(`${workDir}/packages/tooling/dist`)).toBe(false);
      // A surviving feature's files are untouched.
      expect(await pathExists(`${workDir}/packages/biome`)).toBe(true);

      const pkg = await file(`${workDir}/package.json`).json();
      expect(pkg.scripts["docs:sync"]).toBeUndefined();
      expect(pkg.scripts["docs:site"]).toBeUndefined();
      expect(pkg.scripts["docs:dev"]).toBeUndefined();
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

  // ── removeJsonEntry (manifest editor) ────────────

  describe("removeJsonEntry", () => {
    const turbo = [
      "{",
      '  "$schema": "https://turborepo.dev/schema.json",',
      '  "tasks": {',
      '    "build": {',
      '      "dependsOn": ["^build"],',
      '      "outputs": ["dist/**", "public/generated.css"]',
      "    },",
      '    "test:e2e": {',
      '      "dependsOn": ["^build"],',
      '      "cache": false',
      "    },",
      '    "typecheck": {',
      '      "dependsOn": ["^build"]',
      "    }",
      "  }",
      "}",
      "",
    ].join("\n");

    test("removes a middle entry and its comma without reformatting", () => {
      const next = removeJsonEntry(turbo, "tasks.test:e2e");
      expect(next).not.toContain("test:e2e");
      // Serializing the rest would have reflowed arrays onto their own lines.
      expect(next).toContain('"dependsOn": ["^build"]');
      expect(next).toContain('"outputs": ["dist/**", "public/generated.css"]');
      expect(JSON.parse(next).tasks).toEqual({
        build: { dependsOn: ["^build"], outputs: ["dist/**", "public/generated.css"] },
        typecheck: { dependsOn: ["^build"] },
      });
    });

    test("removes the last entry and the preceding comma", () => {
      const next = removeJsonEntry(turbo, "tasks.typecheck");
      expect(next).not.toContain("typecheck");
      expect(next).toContain('"cache": false\n    }\n  }');
      expect(JSON.parse(next).tasks).toEqual({
        build: { dependsOn: ["^build"], outputs: ["dist/**", "public/generated.css"] },
        "test:e2e": { dependsOn: ["^build"], cache: false },
      });
    });

    test("leaves the source untouched for an unknown key", () => {
      expect(removeJsonEntry(turbo, "tasks.build:wasm")).toBe(turbo);
    });

    test("survives braces inside strings", () => {
      const source =
        '{\n  "a": {\n    "cmd": "echo {\\"x\\"}"\n  },\n  "b": {\n    "n": 1\n  }\n}\n';
      const next = removeJsonEntry(source, "a");
      expect(JSON.parse(next)).toEqual({ b: { n: 1 } });
    });
  });
  // ── Pure marker pass ─────────────────────────────

  describe("stripMarkerBlocks (pure)", () => {
    const disabled = new Set(["native"]);

    test("reports no change when the content carries no markers", () => {
      const source = "const a = 1;\n";
      expect(stripMarkerBlocks(source, disabled)).toEqual({ content: source, changed: false });
    });

    test("removes a block whose scopes are all disabled", () => {
      const source = [
        "start",
        "// TEMPLATE-ONLY:START(native)",
        "gone",
        "// TEMPLATE-ONLY:END(native)",
        "end",
        "",
      ].join("\n");
      expect(stripMarkerBlocks(source, disabled)).toEqual({
        content: "start\nend\n",
        changed: true,
      });
    });

    test("keeps a block with a scope that is still enabled, dropping only markers", () => {
      const source = [
        "start",
        "// TEMPLATE-ONLY:START(native, styles)",
        "kept",
        "// TEMPLATE-ONLY:END(native)",
        "end",
        "",
      ].join("\n");
      expect(stripMarkerBlocks(source, disabled).content).toBe("start\nkept\nend\n");
    });

    test("normalises the indentation and blank lines a removal leaves behind", () => {
      const source = [
        "if (x) {",
        "  // TEMPLATE-ONLY:START(native)",
        "  native();",
        "  // TEMPLATE-ONLY:END(native)",
        "}",
        "",
      ].join("\n");
      const { content, changed } = stripMarkerBlocks(source, disabled);
      expect(changed).toBe(true);
      expect(content).toBe("if (x) {\n}\n");
      expect(content).not.toMatch(/[ \t]+\n/);
      expect(content).not.toMatch(/\n{3,}/);
    });

    test("strips every marker style in one pass", () => {
      const source = [
        "# TEMPLATE-ONLY:START(native)",
        "yaml",
        "# TEMPLATE-ONLY:END(native)",
        "// TEMPLATE-ONLY:START(native)",
        "ts",
        "// TEMPLATE-ONLY:END(native)",
        "<!-- TEMPLATE-ONLY:START(native) -->",
        "html",
        "<!-- TEMPLATE-ONLY:END(native) -->",
        "tail",
        "",
      ].join("\n");
      expect(stripMarkerBlocks(source, disabled).content).toBe("tail\n");
    });

    test("is idempotent once the markers are gone", () => {
      const once = stripMarkerBlocks(
        "a\n// TEMPLATE-ONLY:START(native)\nb\n// TEMPLATE-ONLY:END(native)\nc\n",
        disabled,
      ).content;
      expect(stripMarkerBlocks(once, disabled)).toEqual({ content: once, changed: false });
    });

    test("removes custom declared marker blocks when scope is disabled", () => {
      const source = [
        "start",
        "<!-- styles:START -->",
        '<div class="flex">UnoCSS</div>',
        "<!-- styles:END -->",
        "end",
        "",
      ].join("\n");
      const { content, changed } = stripMarkerBlocks(source, new Set(["styles"]));
      expect(changed).toBe(true);
      expect(content).toBe("start\nend\n");
    });

    test("keeps custom declared marker content when scope is enabled", () => {
      const source = [
        "start",
        "// styles:START",
        'onSuccess: "m styles build",',
        "// styles:END",
        "end",
        "",
      ].join("\n");
      const { content, changed } = stripMarkerBlocks(source, new Set(["other"]));
      expect(changed).toBe(true);
      expect(content).toBe('start\nonSuccess: "m styles build",\nend\n');
    });

    test("handles inverted scope markers (!scope)", () => {
      const source = [
        "<!-- TEMPLATE-ONLY:START(styles) -->",
        '<div class="flex">UnoCSS</div>',
        "<!-- TEMPLATE-ONLY:END(styles) -->",
        "<!-- TEMPLATE-ONLY:START(!styles) -->",
        '<div id="greeting">Plain</div>',
        "<!-- TEMPLATE-ONLY:END(!styles) -->",
      ].join("\n");

      // When styles is disabled, !styles is kept
      const disabledRes = stripMarkerBlocks(source, new Set(["styles"]));
      expect(disabledRes.content.trim()).toBe('<div id="greeting">Plain</div>');

      // When styles is enabled, !styles is stripped
      const enabledRes = stripMarkerBlocks(source, new Set([]));
      expect(enabledRes.content.trim()).toBe('<div class="flex">UnoCSS</div>');
    });

    test("property: stripMarkerBlocks is idempotent for arbitrary text", () => {
      fc.assert(
        fc.property(fc.string(), (source) => {
          const first = stripMarkerBlocks(source, disabled);
          const second = stripMarkerBlocks(first.content, disabled);
          return second.changed === false && second.content === first.content;
        }),
      );
    });

    test("property: text without markers is unchanged", () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => !s.includes("START") && !s.includes("END")),
          (source) => {
            const res = stripMarkerBlocks(source, disabled);
            return res.changed === false && res.content === source;
          },
        ),
      );
    });
  });
  // ── Manifest edits keep their formatting ─────────

  describe("handleConfig formatting", () => {
    test("removals leave the surrounding manifests formatted as committed", async () => {
      await mkdir(`${workDir}/packages/tooling/src/configs`, { recursive: true });
      await write(
        `${workDir}/packages/demo/package.json`,
        `${JSON.stringify({
          name: "@myorg/demo",
          scaffold: {
            default: false,
            scriptsToRemove: ["demo"],
            turboTasksToRemove: ["demo"],
          },
        })}\n`,
      );
      await mkdir(`${workDir}/packages/tooling/src/configs`, { recursive: true });
      await write(
        `${workDir}/packages/tooling/src/configs/turbo.base.json`,
        '{\n  "tasks": {\n    "build": {\n      "dependsOn": ["^build"],\n      "outputs": ["dist/**"]\n    },\n    "demo": {\n      "dependsOn": ["build"]\n    }\n  }\n}\n',
      );
      await write(
        `${workDir}/package.json`,
        '{\n  "name": "demo",\n  "workspaces": ["packages/*"],\n  "scripts": {\n    "build": "m turbo build",\n    "demo": "mdemo"\n  },\n  "devDependencies": {\n    "@myorg/demo": "workspace:*",\n    "@myorg/internal": "workspace:*"\n  }\n}\n',
      );
      await mkdir(`${workDir}/packages/internal`, { recursive: true });
      await write(`${workDir}/packages/internal/package.json`, '{ "name": "@myorg/internal" }\n');

      const s = new MonorepoScaffolder({
        targetDir: workDir,
        scope: "@myorg",
        features: await fixtureFeatures(workDir, "demo"),
      });
      await s.handleConfig();

      const root = await file(`${workDir}/package.json`).text();
      expect(root).toContain('"workspaces": ["packages/*"]');
      expect(root).not.toContain("mdemo");
      expect(root).not.toContain("@myorg/demo");
      expect(root).toContain('"@myorg/internal": "workspace:*"');
      expect(JSON.parse(root).scripts).toEqual({ build: "m turbo build" });

      const turbo = await file(`${workDir}/packages/tooling/src/configs/turbo.base.json`).text();
      expect(turbo).toContain('"dependsOn": ["^build"]');
      expect(turbo).toContain('"outputs": ["dist/**"]');
      expect(turbo).not.toContain("demo");
      expect(JSON.parse(turbo).tasks).toEqual({
        build: { dependsOn: ["^build"], outputs: ["dist/**"] },
      });
    });
  });

  // ── Workspace reconciliation ─────────────────────

  describe("reconcileWorkspaces", () => {
    test("drops globs and workspace deps that no longer resolve, and reports them", async () => {
      await write(
        `${workDir}/package.json`,
        `${JSON.stringify(
          {
            workspaces: ["packages/*", "packages/native/npm/*"],
            devDependencies: { "@myorg/native": "workspace:*", citty: "^0.2.2" },
          },
          null,
          2,
        )}\n`,
      );
      await mkdir(`${workDir}/packages/internal`, { recursive: true });
      await write(
        `${workDir}/packages/internal/package.json`,
        `${JSON.stringify({ name: "@myorg/internal" })}\n`,
      );

      const s = new MonorepoScaffolder({ targetDir: workDir, scope: "@myorg" });
      const source = await file(`${workDir}/package.json`).text();
      const result = await callReconcile(s, source);

      expect(result.droppedWorkspaces).toEqual(["packages/native/npm/*"]);
      expect(result.droppedDependencies).toEqual(["@myorg/native"]);
      // The edited text keeps the committed formatting; only the drops are gone.
      const reconciled = JSON.parse(result.source) as {
        workspaces?: string[];
        devDependencies?: Record<string, string>;
      };
      expect(reconciled.workspaces).toEqual(["packages/*"]);
      expect(reconciled.devDependencies).toEqual({ citty: "^0.2.2" });
      expect(result.source).toContain('"workspaces": [\n    "packages/*"\n  ]');
    });
  });

  // ── Scope target discovery ───────────────────────

  describe("collectScopeTargets", () => {
    test("includes the static targets even in an empty tree", async () => {
      const targets = await collectScopeTargets(workDir);
      expect(targets).toContain("package.json");
      expect(targets).toContain("apps/example/src/index.ts");
      expect(targets).toContain("packages/external/src/native.ts");
    });

    test("discovers package docs, the shared config assets and the agents tree", async () => {
      await mkdir(`${workDir}/packages/demo`, { recursive: true });
      await mkdir(`${workDir}/apps/demo`, { recursive: true });
      await mkdir(`${workDir}/packages/tooling/src/configs`, { recursive: true });
      await mkdir(`${workDir}/.agents/skills/demo`, { recursive: true });
      await write(`${workDir}/packages/demo/README.md`, "@myorg/demo\n");
      await write(`${workDir}/apps/demo/AGENTS.md`, "@myorg/demo\n");
      await write(`${workDir}/packages/tooling/src/configs/demo.json`, '{ "a": "@myorg/demo" }\n');
      await write(`${workDir}/.agents/skills/demo/SKILL.md`, "@myorg/demo\n");
      // Non-text files are never rewritten, and node_modules is not walked.
      await write(`${workDir}/packages/demo/logo.png`, "@myorg/demo\n");
      await mkdir(`${workDir}/packages/demo/node_modules/x`, { recursive: true });
      await write(`${workDir}/packages/demo/node_modules/x/README.md`, "@myorg/demo\n");

      const targets = await collectScopeTargets(workDir);
      expect(targets).toContain("packages/demo/README.md");
      expect(targets).toContain("apps/demo/AGENTS.md");
      expect(targets).toContain("packages/tooling/src/configs/demo.json");
      expect(targets).toContain(".agents/skills/demo/SKILL.md");
      expect(targets).not.toContain("packages/demo/logo.png");
      expect(targets.some((p) => p.includes("node_modules"))).toBe(false);
    });

    test("visits every file at most once", async () => {
      await mkdir(`${workDir}/packages/demo`, { recursive: true });
      await mkdir(`${workDir}/apps/demo`, { recursive: true });
      await write(`${workDir}/packages/demo/README.md`, "@myorg/demo\n");
      const targets = await collectScopeTargets(workDir);
      expect(new Set(targets).size).toBe(targets.length);
    });
  });
});

interface ReconcileOutcome {
  /** The edited manifest text — the assertions parse it. */
  source: string;
  droppedWorkspaces: string[];
  droppedDependencies: string[];
}

/** `reconcileWorkspaces` is an implementation detail; the unit tests drive it directly. */
async function callReconcile(s: MonorepoScaffolder, source: string): Promise<ReconcileOutcome> {
  const target = s as unknown as { reconcileWorkspaces(s: string): Promise<ReconcileOutcome> };
  return target.reconcileWorkspaces(source);
}

function setDisabledScopes(s: MonorepoScaffolder, scopes: string[]): void {
  (s as unknown as { disabledScopes: Set<string> }).disabledScopes = new Set(scopes);
}

async function pathExists(path: string): Promise<boolean> {
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0;
}

// ── scaffold metadata vocabulary ─────────────────

describe("scaffold metadata", () => {
  const repoRoot = REPO_ROOT;

  test("the native select offers exactly the NATIVE_MODES values", async () => {
    const configs = await discoverConfigs(repoRoot);
    const native = configs.find((config) => config.meta.flag === "native");
    expect(native).toBeDefined();

    // Renaming a mode in one place and not the other is what this catches: the
    // select would offer a value that has no removal set (or vice versa).
    const modes = Object.values(NATIVE_MODES).sort();
    expect((native?.meta.options ?? []).map((option) => option.value).sort()).toEqual(modes);
    expect(Object.keys(native?.meta.removals ?? {}).sort()).toEqual(modes);
  });

  test("every select config defaults to one of its own options", async () => {
    const configs = await discoverConfigs(repoRoot);
    const selects = configs.filter((config) => config.meta.type === "select");
    expect(selects.length).toBeGreaterThan(0);

    for (const config of selects) {
      const values = (config.meta.options ?? []).map((option) => String(option.value));
      expect(values, config.name).toContain(String(config.meta.default));
      expect(values.length, config.name).toBeGreaterThan(0);
    }
  });

  test("a select config keys its removals by the values it offers", async () => {
    const configs = await discoverConfigs(repoRoot);
    const selects = configs.filter((config) => config.meta.type === "select");

    for (const config of selects) {
      const values = (config.meta.options ?? []).map((option) => String(option.value));
      for (const key of Object.keys(config.meta.removals ?? {})) {
        // A removal set keyed by a mode nobody can pick is dead configuration.
        expect(values, `${config.name} → ${key}`).toContain(key);
      }
    }
  });
});
