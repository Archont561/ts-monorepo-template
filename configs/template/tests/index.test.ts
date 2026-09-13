import { afterEach, describe, expect, test } from "bun:test";
import { $, file } from "bun";
import { TemplateHarness } from "../src/harness";
import { MonorepoScaffolder } from "../src/scaffolder";

/**
 * Integration tests for the full scaffolding pipeline. Each test copies the
 * real template repo (no node_modules) and drives MonorepoScaffolder against
 * the copy, validating the end state a generated project would have.
 */
describe("Scaffolder integration", () => {
  let cleanup: (() => Promise<void>) | null = null;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
      cleanup = null;
    }
  });

  test(
    "full pipeline on a temp copy produces a clean monorepo",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      const scaffolder = new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@integration-test",
        gitHooks: false,
        configs: { playwright: true, unocss: false },
      });
      await scaffolder.execute();

      // 1. Template package is fully removed.
      expect(await pathExists(`${result.templateDir}/configs/template`)).toBe(false);

      // 2. Root package.json is sanitized.
      const rootPkg = await file(`${result.templateDir}/package.json`).json();
      expect(rootPkg["bun-create"]).toBeUndefined();
      expect(rootPkg.devDependencies?.["@clack/prompts"]).toBeUndefined();
      expect(rootPkg.devDependencies?.["@myorg/template"]).toBeUndefined();
      expect(rootPkg.scripts?.["build:template"]).toBeUndefined();
      expect(rootPkg.scripts?.["docs:sync"]).toBeUndefined();
      expect(rootPkg.workspaces).not.toContain("configs/template");

      // 3. Prepare script still wires up lefthook + changeset on install.
      expect(rootPkg.scripts?.prepare).toContain("configs/lefthook/src/cli.ts");
      expect(rootPkg.scripts?.prepare).toContain("configs/changeset/src/cli.ts");

      // 4. Scope replacement reached workspace packages.
      const internalPkg = await file(`${result.templateDir}/packages/internal/package.json`).json();
      expect(internalPkg.name).toBe("@integration-test/internal");

      // 5. Enabled configs survive; disabled configs are removed.
      expect(await pathExists(`${result.templateDir}/configs/playwright`)).toBe(true);
      expect(await pathExists(`${result.templateDir}/configs/unocss`)).toBe(false);

      // 6. Scope replacement reached config package contents too.
      const changesetConfig = await file(
        `${result.templateDir}/configs/changeset/config.json`,
      ).text();
      expect(changesetConfig).not.toContain("@myorg");

      // 7. Template markers are stripped from surviving documents.
      const agentsMd = await file(`${result.templateDir}/AGENTS.md`).text();
      expect(agentsMd).not.toContain("TEMPLATE-ONLY");

      // 8. Docs and workflows are regenerated from the surviving config set.
      const readmeMd = await file(`${result.templateDir}/README.md`).text();
      expect(readmeMd).not.toContain("configs/template");
      const ciYml = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      expect(ciYml).not.toContain("{{STEPS}}");
      expect(ciYml).toContain("bun run check");

      // 9. No template scope or markers leak anywhere text-readable.
      expect(await scanForLeaks(result.templateDir)).toEqual([]);
    },
    { timeout: 60_000 },
  );

  test(
    "custom scope is applied across surviving files",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      const scaffolder = new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@custom-scope-xyz",
        gitHooks: false,
      });
      await scaffolder.execute();

      const files = [
        "packages/internal/package.json",
        "packages/external/package.json",
        "apps/example/package.json",
        "apps/example/tsconfig.json",
        "configs/changeset/config.json",
      ];
      for (const relPath of files) {
        const filePath = `${result.templateDir}/${relPath}`;
        const content = await file(filePath).text();
        expect(content).not.toContain("@myorg");
        expect(content).toContain("@custom-scope-xyz");
      }

      expect(await scanForLeaks(result.templateDir)).toEqual([]);
    },
    { timeout: 60_000 },
  );

  test(
    "disabling all opt-in configs removes their directories",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      const scaffolder = new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@myorg",
        gitHooks: false,
        configs: { playwright: false, unocss: false },
      });
      await scaffolder.execute();

      expect(await pathExists(`${result.templateDir}/configs/playwright`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/configs/unocss`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/configs/native`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/configs/skills`)).toBe(false);

      // Always-on configs remain.
      expect(await pathExists(`${result.templateDir}/configs/ts`)).toBe(true);
      expect(await pathExists(`${result.templateDir}/configs/bunup`)).toBe(true);
      expect(await pathExists(`${result.templateDir}/configs/biome`)).toBe(true);
      expect(await pathExists(`${result.templateDir}/configs/turbo`)).toBe(true);

      // Docs and workflows reflect the pruned set: e2e steps disappear with
      // Playwright, actionlint/lint steps stay.
      const agentsMd = await file(`${result.templateDir}/AGENTS.md`).text();
      expect(agentsMd).not.toContain("## E2E Testing");
      expect(agentsMd).not.toContain("## AI Agent Skills");
      expect(agentsMd).toContain("## Lint & Format");

      const ciYml = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      expect(ciYml).not.toContain("test:e2e");
      expect(ciYml).toContain("bun run check");
      expect(ciYml).toContain("bun run ci:lint");
    },
    { timeout: 60_000 },
  );

  test(
    "committed bundle scaffolds a copied template via its real entry point",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      // Drive the committed dist bundle — the exact artifact bun-create.preinstall
      // runs — against the copied repo, as the lifecycle hook does.
      const proc = Bun.spawn({
        cmd: ["bun", `${result.templateDir}/configs/template/dist/index.js`],
        cwd: result.templateDir,
        stdout: "pipe",
        stderr: "pipe",
      });
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;
      expect(exitCode, stderr).toBe(0);

      // Template package is fully removed.
      expect(await pathExists(`${result.templateDir}/configs/template`)).toBe(false);

      // Root package.json is sanitized; prepare still wires up lefthook + changeset.
      const rootPkg = await file(`${result.templateDir}/package.json`).json();
      expect(rootPkg["bun-create"]).toBeUndefined();
      expect(rootPkg.workspaces).not.toContain("configs/template");
      expect(rootPkg.scripts?.prepare).toContain("configs/lefthook/src/cli.ts");
      expect(rootPkg.scripts?.prepare).toContain("configs/changeset/src/cli.ts");
      expect(rootPkg.scripts?.["docs:sync"]).toBeUndefined();

      // The bundle regenerates docs and workflows from the pruned tree.
      const ciYml = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      expect(ciYml).not.toContain("{{STEPS}}");

      // Default pruning: Playwright kept, opt-in configs removed.
      expect(await pathExists(`${result.templateDir}/apps/example/playwright.config.ts`)).toBe(
        true,
      );
      expect(await pathExists(`${result.templateDir}/configs/unocss`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/configs/native`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/configs/skills`)).toBe(false);

      // The bundle scopes to @myorg by default, so template artifacts — not
      // the scope itself — must not leak into the generated project.
      expect(await scanForLeaks(result.templateDir, ["TEMPLATE-ONLY", "configs/template"])).toEqual(
        [],
      );
    },
    { timeout: 60_000 },
  );
});

/**
 * Scans the scaffolded tree for any leaked template scope or markers in
 * text-readable files (JSON/TS/Markdown/YAML). Bun.lock and binary outputs
 * are intentionally ignored: the lockfile is regenerated on the first
 * install in the generated project.
 */
async function scanForLeaks(
  cwd: string,
  needles: string[] = ["@myorg", "TEMPLATE-ONLY"],
): Promise<string[]> {
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
  ];
  const result = await $`find ${findArgs}`.text();
  const files = result.trim().split("\n").filter(Boolean);

  const leaks: string[] = [];
  for (const path of files) {
    if (!/\.(json|ts|md|yml|yaml)$/.test(path)) continue;
    const target = file(path);
    if (!(await target.exists())) continue;
    let content: string;
    try {
      content = await target.text();
    } catch {
      continue; // binary file
    }
    for (const needle of needles) {
      if (content.includes(needle)) {
        leaks.push(`${path}: ${needle}`);
      }
    }
  }
  return leaks;
}

async function pathExists(path: string): Promise<boolean> {
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0;
}
