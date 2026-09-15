import { afterEach, describe, expect, test } from "bun:test";
import { sep } from "node:path";
import { $, file } from "bun";
import { TemplateHarness } from "@/src/scaffold/harness";
import { MonorepoScaffolder } from "@/src/scaffold/pipeline";

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

      // A pending changeset is the template's release state — it must not
      // reach the generated project (it would leak the placeholder scope and
      // invent a changelog entry the project never authored).
      await file(`${result.templateDir}/.changeset/pending-template-change.md`).write(
        '---\n"@myorg/external": patch\n---\n\nUnreleased template work.\n',
      );

      const scaffolder = new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@integration-test",
        gitHooks: false,
        configs: { playwright: true },
      });
      await scaffolder.execute();

      // 1. The toolchain ships, minus its template-only half: the harness's own
      //    tests and the committed bundle (the template feature's extraRemovals).
      expect(await pathExists(`${result.templateDir}/packages/tooling/src`)).toBe(true);
      expect(await pathExists(`${result.templateDir}/packages/tooling/tests`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/packages/tooling/dist`)).toBe(false);

      // 2. Root package.json is sanitized.
      const rootPkg = await file(`${result.templateDir}/package.json`).json();
      expect(rootPkg["bun-create"]).toBeUndefined();
      expect(rootPkg.devDependencies?.["@clack/prompts"]).toBeUndefined();
      expect(rootPkg.devDependencies?.["@myorg/template"]).toBeUndefined();
      expect(rootPkg.scripts?.["build:template"]).toBeUndefined();
      expect(rootPkg.scripts?.["docs:sync"]).toBeUndefined();

      // The docs app is template-only, so the VitePress toolchain must not
      // leak — neither the app directory nor its root script delegates.
      expect(rootPkg.devDependencies?.vitepress).toBeUndefined();
      expect(rootPkg.scripts?.["docs:dev"]).toBeUndefined();
      expect(rootPkg.scripts?.["docs:build"]).toBeUndefined();
      expect(rootPkg.scripts?.["docs:preview"]).toBeUndefined();
      expect(rootPkg.scripts?.["docs:site"]).toBeUndefined();
      expect(await pathExists(`${result.templateDir}/apps/template-docs`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/.github/workflows/template-docs.yml`)).toBe(
        false,
      );
      expect(rootPkg.workspaces).not.toContain("packages/template");

      // 3. Prepare script still wires up lefthook + changeset on install.
      expect(rootPkg.scripts?.prepare).toContain("m setup");
      expect(rootPkg.scripts?.prepare).toContain("m changeset");

      // 4. Scope replacement reached workspace packages.
      const internalPkg = await file(`${result.templateDir}/packages/internal/package.json`).json();
      expect(internalPkg.name).toBe("@integration-test/internal");

      // 5. Enabled configs survive; disabled configs are removed.
      expect(await pathExists(`${result.templateDir}/apps/example/e2e`)).toBe(true);

      // 6. Scope replacement reached the shared config assets too.
      const changesetConfig = await file(
        `${result.templateDir}/packages/tooling/src/configs/changeset.config.json`,
      ).text();
      expect(changesetConfig).not.toContain("@myorg");

      // 6b. Pending changesets are pruned — only the config survives them.
      expect(await pathExists(`${result.templateDir}/.changeset/config.json`)).toBe(true);
      expect(await pathExists(`${result.templateDir}/.changeset/pending-template-change.md`)).toBe(
        false,
      );

      // 7. Template markers are stripped from surviving documents (markers, not doc mentions).
      const agentsMd = await file(`${result.templateDir}/AGENTS.md`).text();
      expect(agentsMd).not.toContain("TEMPLATE-ONLY:START");
      expect(agentsMd).not.toContain("TEMPLATE-ONLY:END");

      // 8. Docs and workflows are regenerated from the surviving config set.
      const readmeMd = await file(`${result.templateDir}/README.md`).text();
      expect(readmeMd).not.toContain("packages/tooling/dist");
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
        "packages/tooling/src/configs/changeset.config.json",
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
        configs: { playwright: false },
      });
      await scaffolder.execute();

      expect(await pathExists(`${result.templateDir}/apps/example/e2e`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/packages/native`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/.agents/skills`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/.devcontainer`)).toBe(false);

      // Always-on shared assets remain, now inside the tooling package.
      for (const asset of ["biome.json", "bunfig.toml", "turbo.base.json"]) {
        expect(
          await pathExists(`${result.templateDir}/packages/tooling/src/configs/${asset}`),
        ).toBe(true);
      }

      // Docs and workflows reflect the pruned set: e2e steps disappear with
      // Playwright, actionlint/lint steps stay. AGENTS.md is now reference-based.
      const agentsMd = await file(`${result.templateDir}/AGENTS.md`).text();
      // No dead links into the deleted config packages. The shared-config path
      // `packages/tooling/src/configs/` is legitimate and stays.
      expect(agentsMd).not.toContain("](configs/");
      expect(agentsMd).toContain("packages/tooling");

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

      // Pin the owner: resolving it from the local git identity would be
      // environment-dependent (and here matches the template's owner, which
      // would hide a broken rewrite).
      process.env.SCAFFOLD_OWNER = "acme";

      // Drive the committed dist bundle — the exact artifact bun-create.preinstall
      // runs — against the copied repo, as the lifecycle hook does.
      const proc = Bun.spawn({
        cmd: ["bun", `${result.templateDir}/packages/tooling/dist/scaffold/run.js`],
        cwd: result.templateDir,
        stdout: "pipe",
        stderr: "pipe",
      });
      const stderr = await new Response(proc.stderr).text();
      const exitCode = await proc.exited;
      expect(exitCode, stderr).toBe(0);

      // The template-only half of the toolchain is gone.
      expect(await pathExists(`${result.templateDir}/packages/tooling/tests`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/packages/tooling/dist`)).toBe(false);

      // Root package.json is sanitized; prepare still wires up lefthook + changeset.
      const rootPkg = await file(`${result.templateDir}/package.json`).json();
      expect(rootPkg["bun-create"]).toBeUndefined();
      expect(rootPkg.workspaces).not.toContain("packages/template");
      expect(rootPkg.scripts?.prepare).toContain("m setup");
      expect(rootPkg.scripts?.prepare).toContain("m changeset");
      expect(rootPkg.scripts?.["docs:sync"]).toBeUndefined();

      // The bundle regenerates docs and workflows from the pruned tree.
      const ciYml = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      expect(ciYml).not.toContain("{{STEPS}}");

      // Default pruning: Playwright kept, opt-in configs removed.
      expect(await pathExists(`${result.templateDir}/apps/example/playwright.config.ts`)).toBe(
        true,
      );
      expect(await pathExists(`${result.templateDir}/packages/native`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/.agents/skills`)).toBe(false);
      expect(await pathExists(`${result.templateDir}/.devcontainer`)).toBe(false);

      // The bundle scopes to @myorg by default, so template artifacts — not
      // the scope itself — must not leak into the generated project.
      // The template's own repo URLs (badges, Cargo.toml, CODEOWNERS) are
      // rewritten to the new project — only the "bun create <template>"
      // instructions keep pointing at it.
      expect(
        await scanForLeaks(result.templateDir, [
          "TEMPLATE-ONLY:START",
          "TEMPLATE-ONLY:END",
          // No bare "configs/" needle: since R27 the shared config assets live at
          // `packages/tooling/src/configs/`, so the string is a substring of a
          // real path, and the R27 migration notes in this package legitimately
          // discuss the deleted tree. Dead references were swept and checked by
          // hand instead.
          "github.com/Archont561/ts-monorepo-template",
          "@Archont561",
        ]),
      ).toEqual([]);
    },
    { timeout: 60_000 },
  );
});

/**
 * Scans the scaffolded tree for any leaked template scope or markers in
 * text-readable files (JSON/TS/Markdown/YAML). Bun.lock and binary outputs
 * are intentionally ignored: the lockfile is regenerated on the first
 * install in the generated project.
 * Checks for actual marker syntax, not doc mentions of TEMPLATE-ONLY.
 */
async function scanForLeaks(
  cwd: string,
  needles: string[] = ["@myorg", "TEMPLATE-ONLY:START", "TEMPLATE-ONLY:END"],
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
    "-not",
    "-path",
    "*/dist/*",
    "-not",
    "-path",
    "*/target/*",
    "-not",
    "-path",
    "*/.turbo/*",
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
    // TEMPLATE-ONLY markers inside the tooling package are the generator's own
    // inputs: `m ci` regenerates workflows from those fragments in the generated
    // project too, so the markers have to survive. The aggregator strips the
    // marked blocks at generate time using the recorded selections.
    const isToolingSource = path.includes(`${sep}packages${sep}tooling${sep}`);
    // `packages/tooling/src/configs/` is the real home of the shared tool
    // config, so the bare `configs/` needle must not fire on it. Mask it out
    // before matching rather than special-casing every needle.
    const NEUTRALISED_CONFIGS_PATH = "packages/tooling/src/configs/";
    const masked = content.split(NEUTRALISED_CONFIGS_PATH).join("\u0000");
    for (const needle of needles) {
      if (isToolingSource && needle.startsWith("TEMPLATE-ONLY:")) continue;
      if (masked.includes(needle)) {
        leaks.push(`${path}: ${needle}`);
      }
    }
  }
  return leaks;
}

async function pathExists(path: string): Promise<boolean> {
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0;
}
