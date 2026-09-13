import { afterEach, describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { $, file } from "bun";

/** Minimal shape of a generated workflow, used to assert YAML validity. */
type WorkflowFile = { jobs?: Record<string, { steps?: unknown[] }> };

import { TemplateHarness } from "../src/harness";
import { MonorepoScaffolder } from "../src/scaffolder";

/**
 * Tests for `src/aggregate.ts` (`bun run docs:sync`), which regenerates
 * `.github/workflows/*.yml` from the config packages by discovery — no hardcoded registry.
 * Root README.md and AGENTS.md are now static reference files (not concatenated).
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
    "generates both workflows from configs",
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
      const first = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      await $`bun ${script} ${result.templateDir}`.quiet();
      const second = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();

      expect(second).toBe(first);
    },
    { timeout: 60_000 },
  );

  test(
    "generated workflows are valid YAML with steps nested under each job",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      await $`bun ${result.templateDir}/configs/template/src/aggregate.ts ${result.templateDir}`.quiet();

      for (const name of ["ci", "release", "pages", "stale"]) {
        const path = `${result.templateDir}/.github/workflows/${name}.yml`;
        if (!(await file(path).exists())) continue;

        const raw = await file(path).text();
        let parsed: WorkflowFile;
        try {
          parsed = Bun.YAML.parse(raw) as WorkflowFile;
        } catch (error) {
          throw new Error(`${name}.yml is not valid YAML: ${String(error)}`);
        }

        const jobs = Object.entries(parsed.jobs ?? {});
        expect(jobs.length, `${name}.yml has no jobs`).toBeGreaterThan(0);

        for (const [jobName, job] of jobs) {
          const steps = job.steps ?? [];
          expect(Array.isArray(steps), `${name}.yml → ${jobName} has no steps list`).toBe(true);
          expect(steps.length, `${name}.yml → ${jobName} has no steps`).toBeGreaterThan(0);
          for (const step of steps) {
            expect(
              step !== null && typeof step === "object",
              `${name}.yml → ${jobName} has a malformed step`,
            ).toBe(true);
          }
        }
      }
    },
    { timeout: 60_000 },
  );

  test(
    "step fragments are indented so they splice under a job's steps: key",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      const configsDir = `${result.templateDir}/configs`;
      const fragments = readdirSync(configsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) =>
          readdirSync(`${configsDir}/${entry.name}`)
            .filter((name) => name.endsWith(".steps.yml") || name === "dependabot.yml")
            .map((name) => `${configsDir}/${entry.name}/${name}`),
        )
        .sort();
      expect(fragments.length).toBeGreaterThan(0);

      // Fragments are concatenated verbatim into {{STEPS}}/{{UPDATES}}, which sit
      // at column 0 of a job's `steps:` list — a fragment line starting at column 0
      // silently produces a workflow GitHub refuses to parse.
      const unindented: string[] = [];
      for (const fragment of fragments) {
        const lines = (await file(fragment).text()).split("\n");
        for (const [index, line] of lines.entries()) {
          if (/^[^\s#]/.test(line)) {
            unindented.push(
              `${fragment.replace(`${result.templateDir}/`, "")}:${index + 1}: ${line}`,
            );
          }
        }
      }
      expect(unindented).toEqual([]);
    },
    { timeout: 60_000 },
  );

  test(
    "scaffold regenerates workflows from the surviving configs, README/AGENTS are static",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      // Template-only configs self-destruct; default pruning drops skills.
      const scaffolder = new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@agent-test",
        gitHooks: false,
        configs: { playwright: true, unocss: false },
      });
      await scaffolder.execute();

      expect(await pathExists(`${result.templateDir}/configs/template`)).toBe(false);

      // README and AGENTS are now static reference files, not concatenated.
      // They should still exist and have TEMPLATE-ONLY markers stripped (but may mention the term in docs).
      const agents = await file(`${result.templateDir}/AGENTS.md`).text();
      expect(agents).toContain("# AGENTS.md");
      expect(agents).not.toContain("TEMPLATE-ONLY:START");
      expect(agents).not.toContain("TEMPLATE-ONLY:END");
      // Should reference configs via links, not contain concatenated blocks
      expect(agents).not.toContain("<!-- AGENT:biome:START -->");

      const readme = await file(`${result.templateDir}/README.md`).text();
      expect(readme).toContain("# Monorepo");
      expect(readme).not.toContain("TypeScript Monorepo Template");
      expect(readme).not.toContain("TEMPLATE-ONLY:START");
      expect(readme).not.toContain("TEMPLATE-ONLY:END");
      expect(readme).not.toContain("<!-- PACKAGE:biome:START -->");
      // Should reference config docs
      expect(readme).toContain("configs/biome/README.md");

      const ci = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      expect(ci).not.toContain("{{STEPS}}");
      expect(ci).toContain("run: bun run test:e2e");

      expect(await scanForLeaks(result.templateDir)).toEqual([]);
    },
    { timeout: 60_000 },
  );

  test(
    "pages.yml and coverage.yml are skipped when the template-only docs site owns Pages",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      const aggregate = async (dir: string) => {
        const proc = Bun.spawn({
          cmd: ["bun", `${dir}/configs/template/src/aggregate.ts`, dir],
          stdout: "pipe",
          stderr: "pipe",
        });
        const stderr = await new Response(proc.stderr).text();
        expect(await proc.exited, stderr).toBe(0);
      };

      const pages = `${result.templateDir}/.github/workflows/pages.yml`;
      const coverage = `${result.templateDir}/.github/workflows/coverage.yml`;

      // docs/ present (this repo): template-docs.yml is the single deployer and
      // `mdocs site` publishes coverage at /coverage/ inside that artifact.
      expect(await file(`${result.templateDir}/docs/.vitepress/config.mts`).exists()).toBe(true);
      await aggregate(result.templateDir);
      expect(await file(pages).exists(), "pages.yml would fight template-docs.yml").toBe(false);
      expect(await file(coverage).exists(), "coverage.yml would fight template-docs.yml").toBe(
        false,
      );

      // No docs/ (a scaffolded monorepo): pages.yml is generated again, and
      // coverage rides along as /coverage/ inside the Pages artifact.
      await $`rm -rf ${result.templateDir}/docs`.quiet();
      await aggregate(result.templateDir);
      expect(await file(pages).exists(), "pages.yml must exist for a Pages opt-in").toBe(true);
      expect(await file(coverage).exists(), "coverage is included in pages.yml").toBe(false);
    },
    { timeout: 120_000 },
  );
});

async function scanForLeaks(
  cwd: string,
  needles: string[] = ["@myorg", "TEMPLATE-ONLY:START", "TEMPLATE-ONLY:END"],
): Promise<string[]> {
  const result =
    await $`find ${cwd} -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/target/*" -not -path "*/.turbo/*"`.text();
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
