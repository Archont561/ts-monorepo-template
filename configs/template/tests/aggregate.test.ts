import { afterEach, describe, expect, test } from "bun:test";
import { $, file } from "bun";
import { TemplateHarness } from "../src/harness";
import { MonorepoScaffolder } from "../src/scaffolder";

/**
 * Tests for `src/aggregate.ts` (`bun run docs:sync`), which regenerates the
 * root AGENTS.md, README.md, and `.github/workflows/*.yml` from the config
 * packages by discovery — no hardcoded registry.
 */
describe("aggregate", () => {
  let cleanup: (() => Promise<void>) | null = null;

  afterEach(async () => {
    if (cleanup) {
      await cleanup();
      cleanup = null;
    }
  });

  test(
    "generates AGENTS.md, README.md, and both workflows from configs",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      const proc = Bun.spawn({
        cmd: ["bun", `${result.templateDir}/configs/template/src/aggregate.ts`, result.templateDir],
        stdout: "pipe",
        stderr: "pipe",
      });
      const stderr = await new Response(proc.stderr).text();
      expect(await proc.exited, stderr).toBe(0);

      const agents = await file(`${result.templateDir}/AGENTS.md`).text();
      expect(agents.startsWith("<!-- AUTO-GENERATED from configs/*/AGENT.md -->")).toBe(true);
      expect(agents).toContain("# AGENTS.md");
      for (const dir of [
        "ts",
        "bunup",
        "turbo",
        "biome",
        "bun-config",
        "playwright",
        "lefthook",
        "commitlint",
        "changeset",
        "gh-actions",
        "skills",
        "template",
      ]) {
        expect(agents).toContain(`<!-- AGENT:${dir}:START -->`);
        expect(agents).toContain(`<!-- AGENT:${dir}:END -->`);
      }
      // The unified aggregator no longer emits TEMPLATE-ONLY markers.
      expect(agents).not.toContain("TEMPLATE-ONLY:START");

      const readme = await file(`${result.templateDir}/README.md`).text();
      expect(readme.startsWith("<!-- AUTO-GENERATED from configs/*/README.md -->")).toBe(true);
      expect(readme).toContain("<!-- PACKAGE:ts:START -->");
      expect(readme).toContain("<!-- PACKAGE:template:START -->");

      const ci = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      expect(ci).not.toContain("{{STEPS}}");
      expect(ci).toContain("actions/checkout@v4");
      expect(ci).toContain("bun run check");
      expect(ci).toContain("bun run ci:lint");
      expect(ci).toContain("run: bun run test:e2e");

      const release = await file(`${result.templateDir}/.github/workflows/release.yml`).text();
      expect(release).not.toContain("{{STEPS}}");
      expect(release).toContain("changesets/action@v1");
      expect(release).toContain("!env.ACT");
    },
    { timeout: 60_000 },
  );

  test(
    "is idempotent",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      const script = `${result.templateDir}/configs/template/src/aggregate.ts`;
      await $`bun ${script} ${result.templateDir}`.quiet();
      const first = await file(`${result.templateDir}/AGENTS.md`).text();
      await $`bun ${script} ${result.templateDir}`.quiet();
      const second = await file(`${result.templateDir}/AGENTS.md`).text();

      expect(second).toBe(first);
    },
    { timeout: 60_000 },
  );

  test(
    "scaffold regenerates docs and workflows from the surviving configs",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      // Teamplate-only configs self-destruct; default pruning drops skills.
      const scaffolder = new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@agent-test",
        gitHooks: false,
        configs: { playwright: true, unocss: false },
      });
      await scaffolder.execute();

      expect(await pathExists(`${result.templateDir}/configs/template`)).toBe(false);

      const agents = await file(`${result.templateDir}/AGENTS.md`).text();
      expect(agents).not.toContain("configs/template");
      expect(agents).not.toContain("## Scaffolding (Template Development Only)");
      expect(agents).not.toContain("## AI Agent Skills");
      expect(agents).toContain("## E2E Testing");
      expect(agents).not.toContain("TEMPLATE-ONLY");

      const readme = await file(`${result.templateDir}/README.md`).text();
      expect(readme).not.toContain("configs/template");

      const ci = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      expect(ci).not.toContain("{{STEPS}}");
      expect(ci).toContain("run: bun run test:e2e");

      expect(await scanForLeaks(result.templateDir)).toEqual([]);
    },
    { timeout: 60_000 },
  );
});

async function scanForLeaks(
  cwd: string,
  needles: string[] = ["@myorg", "TEMPLATE-ONLY"],
): Promise<string[]> {
  const result =
    await $`find ${cwd} -type f -not -path "*/node_modules/*" -not -path "*/.git/*"`.text();
  const leaks: string[] = [];
  for (const path of result.trim().split("\n").filter(Boolean)) {
    if (!/\.(json|ts|md|yml|yaml)$/.test(path)) continue;
    const target = file(path);
    if (!(await target.exists())) continue;
    let content: string;
    try {
      content = await target.text();
    } catch {
      continue;
    }
    for (const needle of needles) {
      if (content.includes(needle)) leaks.push(`${path}: ${needle}`);
    }
  }
  return leaks;
}

async function pathExists(path: string): Promise<boolean> {
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0;
}
