import { afterEach, describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { $, file } from "bun";
import fc from "fast-check";
import {
  getRegisteredConfigs,
  type NativeMode,
  type ScaffoldSelection,
} from "../../src/scaffold/features";
import { TemplateHarness } from "../../src/scaffold/harness";
import { MonorepoScaffolder } from "../../src/scaffold/pipeline";

/**
 * Template combination tests — simulates common scaffolding flows
 * with every opt-in combination tested via data-driven matrix and fast-check.
 *
 * All packages metadata is dynamically discovered and autoregistered from
 * configs/package.json rather than hardcoded.
 */

const REPO_ROOT = resolve(import.meta.dir, "../../../..");
const registry = await getRegisteredConfigs(REPO_ROOT);
const {
  optInConfigs,
  alwaysConfigs,
  buildDisabledConfigs,
  buildEnabledConfigs,
  buildDefaultConfigs,
} = registry;

type ConfigMap = Record<string, ScaffoldSelection>;

interface TemplateCase {
  name: string;
  scope: string;
  configs: ConfigMap;
  expectations: {
    hasFiles?: string[];
    notHasFiles?: string[];
    ciContains?: string[];
    ciNotContains?: string[];
    hasWorkflows?: string[];
    notHasWorkflows?: string[];
    rootScripts?: string[];
    rootScriptsNot?: string[];
    /** Scripts that must exist in apps/example (per-app ownership). */
    appScripts?: string[];
  };
}

const COMMON_CASES: TemplateCase[] = [
  {
    name: "minimal — all opt-in disabled",
    scope: "@minimal",
    configs: buildDisabledConfigs(),
    expectations: {
      notHasFiles: [
        ...optInConfigs.map((c) => `configs/${c.dir}`),
        "packages/native",
        "apps/example/src/pages/api/native",
        "apps/example/e2e",
        "apps/template-docs",
        ".github/workflows/template-docs.yml",
      ],
      hasFiles: [
        ...alwaysConfigs.map((c) => `configs/${c.dir}`),
        ".editorconfig",
        ".gitattributes",
        ".github/CODEOWNERS",
        ".github/PULL_REQUEST_TEMPLATE.md",
        ".github/ISSUE_TEMPLATE/bug_report.yml",
      ],
      ciContains: ["bun run check", "bun run test", "bun run coverage", "Gitleaks"],
      ciNotContains: ["codeql", "trivy"],
      hasWorkflows: ["ci.yml", "release.yml", "dependabot.yml", "coverage.yml"],
      notHasWorkflows: ["pages.yml", "stale.yml"],
      rootScripts: ["build", "test", "coverage", "check"],
      rootScriptsNot: ["build:native", "build:wasm", "test:native", "test:e2e"],
    },
  },
  {
    name: "default — playwright + codeql enabled (template defaults)",
    scope: "@default",
    configs: buildDefaultConfigs(),
    expectations: {
      hasFiles: ["configs/playwright", "configs/codeql", "apps/example/e2e"],
      notHasFiles: ["configs/unocss", "packages/native", "configs/pages"],
      ciContains: ["test:e2e", "CodeQL", "Gitleaks", "bun run check"],
      ciNotContains: ["trivy"],
      hasWorkflows: ["ci.yml", "coverage.yml"],
      rootScripts: ["test:e2e"],
      rootScriptsNot: ["build:native"],
    },
  },
  {
    name: "full — all opt-in enabled",
    scope: "@full",
    configs: buildEnabledConfigs(),
    expectations: {
      hasFiles: [
        ...optInConfigs.map((c) => `configs/${c.dir}`),
        "packages/native",
        "apps/example/src/pages/api/native",
        "packages/native/rust-toolchain.toml",
        "packages/native/.cargo/config.toml",
      ],
      ciContains: ["test:e2e", "CodeQL", "Trivy", "Gitleaks", "m native napi:build"],
      hasWorkflows: ["ci.yml", "release.yml", "pages.yml", "stale.yml", "dependabot.yml"],
      notHasWorkflows: ["coverage.yml"],
      rootScripts: ["build:native", "build:wasm", "test:native", "test:e2e"],
      appScripts: ["build", "build:css"],
    },
  },
  {
    name: "docker — native=docker",
    scope: "@docker",
    configs: {
      ...buildDisabledConfigs(),
      native: "docker",
    },
    expectations: {
      hasFiles: [
        "packages/native",
        "packages/native/rust-toolchain.toml",
        "apps/example/Dockerfile",
      ],
      ciContains: ["m native napi:build", "m native typecheck"],
      rootScripts: ["build:native", "build:wasm"],
    },
  },
  {
    name: "pages + coverage — Pages enabled, coverage included at /coverage/",
    scope: "@pages",
    configs: {
      ...buildDisabledConfigs(),
      pages: true,
    },
    expectations: {
      hasFiles: ["configs/pages"],
      hasWorkflows: ["pages.yml"],
      notHasWorkflows: ["coverage.yml"],
      ciContains: ["coverage"],
    },
  },
  {
    name: "security — gitleaks + codeql + trivy + community",
    scope: "@sec",
    configs: {
      ...buildDisabledConfigs(),
      codeql: true,
      trivy: true,
    },
    expectations: {
      hasFiles: [
        "configs/gitleaks",
        "configs/codeql",
        "configs/trivy",
        "configs/community",
        ".github/CODEOWNERS",
        ".github/ISSUE_TEMPLATE/bug_report.yml",
      ],
      ciContains: ["Gitleaks", "CodeQL", "Trivy"],
      hasWorkflows: ["ci.yml"],
    },
  },
  {
    name: "unocss only",
    scope: "@unocss",
    configs: {
      ...buildDisabledConfigs(),
      unocss: true,
    },
    expectations: {
      hasFiles: ["configs/unocss", "apps/example/public/index.html"],
      rootScriptsNot: ["build:css"],
      appScripts: ["build", "build:css"],
    },
  },
  {
    name: "skills + devcontainer",
    scope: "@skills",
    configs: {
      ...buildDisabledConfigs(),
      skills: true,
      devcontainer: true,
    },
    expectations: {
      hasFiles: ["configs/skills", "configs/devcontainer", ".devcontainer", ".agents/skills"],
      notHasFiles: ["packages/native"],
    },
  },
  {
    name: "stale only",
    scope: "@stale",
    configs: {
      ...buildDisabledConfigs(),
      stale: true,
    },
    expectations: {
      hasFiles: ["configs/stale"],
      hasWorkflows: ["stale.yml"],
    },
  },
  {
    name: "badges + community always present",
    scope: "@badges",
    configs: buildDisabledConfigs(),
    expectations: {
      hasFiles: [
        "configs/badges",
        "configs/community",
        "configs/editorconfig",
        "configs/gitattributes",
        ".editorconfig",
        ".gitattributes",
        ".github/CODEOWNERS",
        ".github/PULL_REQUEST_TEMPLATE.md",
        ".github/ISSUE_TEMPLATE/bug_report.yml",
      ],
      ciContains: ["Gitleaks"],
    },
  },
];

describe("template cases — common flows with every combination", () => {
  let cleanup: (() => Promise<void>) | null = null;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
      cleanup = null;
    }
  });

  test.each(COMMON_CASES)(
    "$name",
    async (c) => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      const scaffolder = new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: c.scope,
        gitHooks: false,
        configs: c.configs,
      });
      await scaffolder.execute();

      // 1. No leaks — actual markers, not doc mentions
      const leaks = await scanForLeaks(result.templateDir);
      expect(leaks, `Leaks in ${c.name}: ${leaks.join(", ")}`).toEqual([]);

      // 1b. Template-only docs removed
      expect(
        await pathExists(`${result.templateDir}/docs`),
        `docs/ should be removed in ${c.name}`,
      ).toBe(false);
      expect(
        await pathExists(`${result.templateDir}/.github/workflows/template-docs.yml`),
        `template-docs.yml should be removed in ${c.name}`,
      ).toBe(false);

      // 2. Scope replaced in key packages
      if (await pathExists(`${result.templateDir}/packages/internal/package.json`)) {
        const internalPkg = await file(
          `${result.templateDir}/packages/internal/package.json`,
        ).json();
        expect(internalPkg.name).toBe(`${c.scope}/internal`);
      }
      if (await pathExists(`${result.templateDir}/packages/external/package.json`)) {
        const externalPkg = await file(
          `${result.templateDir}/packages/external/package.json`,
        ).json();
        expect(externalPkg.name).toBe(`${c.scope}/external`);
      }

      // 3. hasFiles / notHasFiles
      for (const rel of c.expectations.hasFiles ?? []) {
        expect(
          await pathExists(`${result.templateDir}/${rel}`),
          `Expected ${rel} to exist in ${c.name}`,
        ).toBe(true);
      }
      for (const rel of c.expectations.notHasFiles ?? []) {
        expect(
          await pathExists(`${result.templateDir}/${rel}`),
          `Expected ${rel} NOT to exist in ${c.name}`,
        ).toBe(false);
      }

      // 4. Workflows
      const ciPath = `${result.templateDir}/.github/workflows/ci.yml`;
      if (await pathExists(ciPath)) {
        const ci = await file(ciPath).text();
        expect(ci).not.toContain("{{STEPS}}");
        for (const needle of c.expectations.ciContains ?? []) {
          expect(ci.toLowerCase(), `CI should contain ${needle} in ${c.name}`).toContain(
            needle.toLowerCase(),
          );
        }
        for (const needle of c.expectations.ciNotContains ?? []) {
          expect(ci.toLowerCase(), `CI should NOT contain ${needle} in ${c.name}`).not.toContain(
            needle.toLowerCase(),
          );
        }
      }

      for (const wf of c.expectations.hasWorkflows ?? []) {
        const exists =
          (await pathExists(`${result.templateDir}/.github/workflows/${wf}`)) ||
          (await pathExists(`${result.templateDir}/.github/${wf}`));
        expect(exists, `Expected workflow ${wf} to exist in ${c.name}`).toBe(true);
      }
      for (const wf of c.expectations.notHasWorkflows ?? []) {
        const exists =
          (await pathExists(`${result.templateDir}/.github/workflows/${wf}`)) ||
          (await pathExists(`${result.templateDir}/.github/${wf}`));
        expect(exists, `Expected workflow ${wf} NOT to exist in ${c.name}`).toBe(false);
      }

      // 5. Root scripts
      const pkg = await file(`${result.templateDir}/package.json`).json();
      for (const s of c.expectations.rootScripts ?? []) {
        expect(pkg.scripts?.[s], `Expected root script ${s} in ${c.name}`).toBeDefined();
      }
      for (const s of c.expectations.rootScriptsNot ?? []) {
        expect(pkg.scripts?.[s], `Expected root script ${s} NOT in ${c.name}`).toBeUndefined();
      }

      // 5b. App scripts (per-app ownership, e.g. UnoCSS CSS build)
      const appPkg = await file(`${result.templateDir}/apps/example/package.json`).json();
      for (const s of c.expectations.appScripts ?? []) {
        expect(appPkg.scripts?.[s], `Expected apps/example script ${s} in ${c.name}`).toBeDefined();
      }

      // 5c. Pages is discovered from the package that declares it, so the
      // declaration has to survive scaffolding even when Pages is disabled.
      expect(appPkg.pages?.dir, `Expected apps/example to declare a pages dir in ${c.name}`).toBe(
        "public",
      );

      // 6. Badges — root README should have badges when badges config always
      const readme = await file(`${result.templateDir}/README.md`).text();
      expect(readme).toContain("# Monorepo");
      expect(readme).not.toContain("TEMPLATE-ONLY:START");
      expect(readme).not.toContain("TEMPLATE-ONLY:END");
      expect(readme).toContain("CI");
      expect(readme).toContain("Coverage");
    },
    { timeout: 60_000 },
  );

  test(
    "all boolean combinations — exhaustive for core 4 flags (playwright, unocss, pages, codeql)",
    async () => {
      const coreFlags = ["playwright", "unocss", "pages", "codeql"];
      const baseDisabled = buildDisabledConfigs();
      const combos: ConfigMap[] = [];
      for (let i = 0; i < 1 << coreFlags.length; i++) {
        const m: ConfigMap = { ...baseDisabled };
        coreFlags.forEach((f, idx) => {
          m[f] = !!(i & (1 << idx));
        });
        combos.push(m);
      }

      for (const cfg of combos) {
        const result = await new TemplateHarness({ skipInstall: true }).prepare();
        const scaffolder = new MonorepoScaffolder({
          targetDir: result.templateDir,
          scope: "@combo",
          gitHooks: false,
          configs: cfg,
        });
        await scaffolder.execute();
        const leaks = await scanForLeaks(result.templateDir);
        expect(leaks, `Leaks in combo ${JSON.stringify(cfg)}: ${leaks.join(", ")}`).toEqual([]);
        const ci = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
        expect(ci).not.toContain("{{STEPS}}");
        await result.cleanup();
      }
    },
    { timeout: 120_000 },
  );

  test.each(["none", "publish", "docker"] as const)(
    "native select options — %s",
    async (opt) => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      const scaffolder = new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@native-test",
        gitHooks: false,
        configs: { ...buildDisabledConfigs(), native: opt },
      });
      await scaffolder.execute();
      const hasNative = await pathExists(`${result.templateDir}/packages/native`);
      expect(await pathExists(`${result.templateDir}/.github/workflows/native.yml`)).toBe(
        opt !== "none",
      );
      if (opt === "none") {
        expect(hasNative).toBe(false);
      } else {
        expect(hasNative).toBe(true);
        expect(await pathExists(`${result.templateDir}/packages/native/rust-toolchain.toml`)).toBe(
          true,
        );
        expect(await pathExists(`${result.templateDir}/packages/native/.cargo/config.toml`)).toBe(
          true,
        );
        // Cargo workspace: virtual manifest + one crate per binding
        const workspace = await file(`${result.templateDir}/packages/native/Cargo.toml`).text();
        expect(workspace).toContain("[workspace]");
        expect(workspace).toContain('"crates/native"');
        const crate = await file(
          `${result.templateDir}/packages/native/crates/native/Cargo.toml`,
        ).text();
        expect(crate).toContain("cdylib");
        // npm package: napi config, and the scope rewritten everywhere
        const npmPkg = await file(
          `${result.templateDir}/packages/native/npm/native/package.json`,
        ).json();
        expect(npmPkg.napi.binaryName).toBe("native");
        expect(npmPkg.scripts.build).toBe("m native napi:build --only native");
        const tsconfig = await file(
          `${result.templateDir}/packages/native/npm/native/tsconfig.json`,
        ).text();
        expect(tsconfig).toContain("@native-test/tooling");
        expect(tsconfig).not.toContain("@myorg");
      }
      const leaks = await scanForLeaks(result.templateDir);
      expect(leaks, `Leaks in native=${opt}: ${leaks.join(", ")}`).toEqual([]);
      await result.cleanup();
    },
    { timeout: 60_000 },
  );

  test(
    "full matrix — 3 native x 2 pages x 2 codeql x 2 trivy = 24 combos quick",
    async () => {
      const nativeOpts = ["none", "publish", "docker"] as const;
      const boolOpts = [false, true];
      let count = 0;
      for (const native of nativeOpts) {
        for (const pages of boolOpts) {
          for (const codeql of boolOpts) {
            for (const trivy of boolOpts) {
              const result = await new TemplateHarness({ skipInstall: true }).prepare();
              const scaffolder = new MonorepoScaffolder({
                targetDir: result.templateDir,
                scope: "@matrix",
                gitHooks: false,
                configs: {
                  ...buildDisabledConfigs(),
                  native,
                  pages,
                  codeql,
                  trivy,
                },
              });
              await scaffolder.execute();
              const leaks = await scanForLeaks(result.templateDir);
              expect(
                leaks,
                `Leaks in matrix native=${native} pages=${pages} codeql=${codeql} trivy=${trivy}: ${leaks.join(", ")}`,
              ).toEqual([]);
              await result.cleanup();
              count++;
            }
          }
        }
      }
      expect(count).toBe(24);
    },
    { timeout: 180_000 },
  );

  // ── Property-Based Testing with fast-check ────────────

  describe("property-based template scaffolding with fast-check", () => {
    // Generate arbitrary ConfigMap from autoregistered package metadata
    const configArbitraries: Record<string, fc.Arbitrary<ScaffoldSelection>> = {};
    for (const c of optInConfigs) {
      if (c.type === "select" && c.options.length > 0) {
        configArbitraries[c.flag] = fc.constantFrom(
          ...(c.options as [NativeMode, ...NativeMode[]]),
        );
      } else {
        configArbitraries[c.flag] = fc.boolean();
      }
    }

    const arbitraryConfig = fc.record(configArbitraries);
    const arbitraryScope = fc.constantFrom("@acme", "@my-app", "@custom-org", "@tooling");

    test(
      "arbitrary config combinations satisfy monorepo invariants",
      async () => {
        await fc.assert(
          fc.asyncProperty(arbitraryConfig, arbitraryScope, async (cfg, scope) => {
            const result = await new TemplateHarness({ skipInstall: true }).prepare();
            try {
              const scaffolder = new MonorepoScaffolder({
                targetDir: result.templateDir,
                scope,
                gitHooks: false,
                configs: cfg,
              });
              await scaffolder.execute();

              // Invariant 1: No leaks of placeholder scope or template markers
              const leaks = await scanForLeaks(result.templateDir);
              expect(leaks).toEqual([]);

              // Invariant 2: Template-only artifacts removed
              expect(await pathExists(`${result.templateDir}/docs`)).toBe(false);
              expect(
                await pathExists(`${result.templateDir}/.github/workflows/template-docs.yml`),
              ).toBe(false);

              // Invariant 3: CI workflow has valid YAML and no un-spliced {{STEPS}}
              const ciPath = `${result.templateDir}/.github/workflows/ci.yml`;
              if (await pathExists(ciPath)) {
                const ci = await file(ciPath).text();
                expect(ci).not.toContain("{{STEPS}}");
              }

              // Invariant 4: Package directories correspond to enabled state
              for (const opt of optInConfigs) {
                const isEnabled =
                  opt.type === "select" ? cfg[opt.flag] !== "none" : Boolean(cfg[opt.flag]);
                const dirExists = await pathExists(`${result.templateDir}/configs/${opt.dir}`);
                expect(dirExists).toBe(isEnabled);
              }

              // Invariant 5: Root package.json valid and preserves essential scripts
              const rootPkg = await file(`${result.templateDir}/package.json`).json();
              expect(rootPkg.name).toBeDefined();
              expect(rootPkg.scripts?.test).toBeDefined();

              return true;
            } finally {
              await result.cleanup();
            }
          }),
          { numRuns: 6 },
        );
      },
      { timeout: 120_000 },
    );
  });
});

/**
 * Scans scaffolded tree for leaked template scope or actual marker blocks.
 * - @myorg should be fully replaced
 * - TEMPLATE-ONLY:START / END markers should be stripped (not just mentioned)
 *   We allow plain "TEMPLATE-ONLY" mentions in docs (e.g. "No TEMPLATE-ONLY")
 *   but disallow actual marker syntax.
 */
async function scanForLeaks(cwd: string): Promise<string[]> {
  const findArgs = [
    cwd,
    "-type",
    "f",
    "-not",
    "-path",
    "*/node_modules/*",
    "-not",
    "-path",
    "*/.git/*",
    "-not",
    "-path",
    "*/dist/*",
    "-not",
    "-path",
    "*/target/*",
    "-not",
    "-path",
    "*/.turbo/*",
    "-not",
    "-path",
    "*/.agents/skills.index.json", // index contains paths, not scope
  ];
  const result = await $`find ${findArgs}`.text();
  const leaks: string[] = [];
  for (const path of result.trim().split("\n").filter(Boolean)) {
    if (!/\.(json|ts|md|yml|yaml)$/.test(path)) continue;
    // Skip bun.lockb (binary)
    if (path.endsWith("bun.lockb")) continue;
    const target = file(path);
    if (!(await target.exists())) continue;
    let content: string;
    try {
      content = await target.text();
    } catch {
      continue;
    }
    if (content.includes("@myorg")) {
      leaks.push(`${path}: @myorg`);
    }
    if (content.includes("TEMPLATE-ONLY:START") || content.includes("TEMPLATE-ONLY:END")) {
      leaks.push(`${path}: TEMPLATE-ONLY marker`);
    }
    if (content.includes("configs/template")) {
      // configs/template is removed by the scaffolder, so a surviving reference
      // is a leak — with two deliberate exceptions below.
      if (!path.includes("configs/template")) {
        if (content.includes("configs/template/dist") || content.includes("!configs/template")) {
          leaks.push(`${path}: configs/template`);
        }
      }
    }
  }
  return leaks;
}

async function pathExists(path: string): Promise<boolean> {
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0;
}
