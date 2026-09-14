import { afterEach, describe, expect, test } from "bun:test";
import { $, file } from "bun";
import type { ScaffoldSelection } from "../src/configs";
import { TemplateHarness } from "../src/harness";
import { MonorepoScaffolder } from "../src/scaffolder";

/**
 * Template combination tests — simulates common scaffolding flows
 * with every opt-in combination tested via data-driven matrix.
 *
 * Each case:
 * - Copies template repo (no node_modules) via TemplateHarness
 * - Runs MonorepoScaffolder with specific scope + configs
 * - Validates no leaks (@myorg, TEMPLATE-ONLY:START/END)
 * - Validates workflows generated correctly
 * - Validates package.json scripts, turbo tasks, file existence
 *
 * Run via `bun run test:template` (root) or `bun --filter @myorg/template test`.
 */

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
    configs: {
      playwright: false,
      unocss: false,
      native: "none",
      skills: false,
      devcontainer: false,
      pages: false,
      codeql: false,
      trivy: false,
      stale: false,
    },
    expectations: {
      notHasFiles: [
        "configs/playwright",
        "configs/unocss",
        "packages/native",
        "configs/skills",
        "configs/devcontainer",
        "configs/pages",
        "configs/codeql",
        "configs/trivy",
        "configs/stale",
        "apps/example/src/pages/api/native",
        "apps/example/e2e",
        "docs",
        ".github/workflows/template-docs.yml",
      ],
      hasFiles: [
        "configs/biome",
        "configs/bun-config",
        "configs/coverage",
        "configs/community",
        "configs/editorconfig",
        "configs/gitattributes",
        "configs/gitleaks",
        "configs/badges",
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
    configs: {
      playwright: true,
      unocss: false,
      native: "none",
      skills: false,
      devcontainer: false,
      pages: false,
      codeql: true,
      trivy: false,
      stale: false,
    },
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
    configs: {
      playwright: true,
      unocss: true,
      native: "publish",
      skills: true,
      devcontainer: true,
      pages: true,
      codeql: true,
      trivy: true,
      stale: true,
    },
    expectations: {
      hasFiles: [
        "configs/playwright",
        "configs/unocss",
        "packages/native",
        "configs/skills",
        "configs/devcontainer",
        "configs/pages",
        "configs/codeql",
        "configs/trivy",
        "configs/stale",
        "apps/example/src/pages/api/native",
        "packages/native/rust-toolchain.toml",
        "packages/native/.cargo/config.toml",
      ],
      ciContains: ["test:e2e", "CodeQL", "Trivy", "Gitleaks", "mnative napi:build"],
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
      playwright: false,
      unocss: false,
      native: "docker",
      skills: false,
      devcontainer: false,
      pages: false,
      codeql: false,
      trivy: false,
      stale: false,
    },
    expectations: {
      hasFiles: [
        "packages/native",
        "packages/native/rust-toolchain.toml",
        "apps/example/Dockerfile",
      ],
      ciContains: ["mnative napi:build", "mnative typecheck"],
      rootScripts: ["build:native", "build:wasm"],
    },
  },
  {
    name: "pages + coverage — Pages enabled, coverage included at /coverage/",
    scope: "@pages",
    configs: {
      playwright: false,
      unocss: false,
      native: "none",
      skills: false,
      devcontainer: false,
      pages: true,
      codeql: false,
      trivy: false,
      stale: false,
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
      playwright: false,
      unocss: false,
      native: "none",
      skills: false,
      devcontainer: false,
      pages: false,
      codeql: true,
      trivy: true,
      stale: false,
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
      playwright: false,
      unocss: true,
      native: "none",
      skills: false,
      devcontainer: false,
      pages: false,
      codeql: false,
      trivy: false,
      stale: false,
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
      playwright: false,
      unocss: false,
      native: "none",
      skills: true,
      devcontainer: true,
      pages: false,
      codeql: false,
      trivy: false,
      stale: false,
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
      playwright: false,
      unocss: false,
      native: "none",
      skills: false,
      devcontainer: false,
      pages: false,
      codeql: false,
      trivy: false,
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
    configs: {
      playwright: false,
      unocss: false,
      native: "none",
      skills: false,
      devcontainer: false,
      pages: false,
      codeql: false,
      trivy: false,
      stale: false,
    },
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

  for (const c of COMMON_CASES) {
    test(
      c.name,
      async () => {
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
          expect(
            appPkg.scripts?.[s],
            `Expected apps/example script ${s} in ${c.name}`,
          ).toBeDefined();
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
  }

  test(
    "all boolean combinations — exhaustive for core 4 flags (playwright, unocss, pages, codeql)",
    async () => {
      const flags = ["playwright", "unocss", "pages", "codeql"];
      const combos: ConfigMap[] = [];
      for (let i = 0; i < 1 << flags.length; i++) {
        const m: ConfigMap = {};
        flags.forEach((f, idx) => {
          m[f] = !!(i & (1 << idx));
        });
        m["native"] = "none";
        m["skills"] = false;
        m["devcontainer"] = false;
        m["trivy"] = false;
        m["stale"] = false;
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

  test(
    "native select options — none, publish, docker",
    async () => {
      for (const opt of ["none", "publish", "docker"] as const) {
        const result = await new TemplateHarness({ skipInstall: true }).prepare();
        const scaffolder = new MonorepoScaffolder({
          targetDir: result.templateDir,
          scope: "@native-test",
          gitHooks: false,
          configs: { native: opt, playwright: false, unocss: false, pages: false },
        });
        await scaffolder.execute();
        const hasNative = await pathExists(`${result.templateDir}/packages/native`);
        // The build-matrix workflow is generated with configs/native and deleted with it.
        expect(await pathExists(`${result.templateDir}/.github/workflows/native.yml`)).toBe(
          opt !== "none",
        );
        if (opt === "none") {
          expect(hasNative).toBe(false);
        } else {
          expect(hasNative).toBe(true);
          expect(
            await pathExists(`${result.templateDir}/packages/native/rust-toolchain.toml`),
          ).toBe(true);
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
          expect(npmPkg.scripts.build).toBe("mnative napi:build --only native");
          const tsconfig = await file(
            `${result.templateDir}/packages/native/npm/native/tsconfig.json`,
          ).text();
          expect(tsconfig).toContain("@native-test/ts");
          expect(tsconfig).not.toContain("@myorg");
        }
        const leaks = await scanForLeaks(result.templateDir);
        expect(leaks, `Leaks in native=${opt}: ${leaks.join(", ")}`).toEqual([]);
        await result.cleanup();
      }
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
                  native,
                  pages,
                  codeql,
                  trivy,
                  playwright: false,
                  unocss: false,
                  skills: false,
                  devcontainer: false,
                  stale: false,
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
