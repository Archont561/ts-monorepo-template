import { afterEach, describe, expect, test } from "bun:test";
import { readdirSync, statSync } from "node:fs";
import { sep } from "node:path";
import { $, file, Glob } from "bun";
import { REPO_ROOT } from "@/tests/helpers";

/** Minimal shape of a generated workflow, used to assert YAML validity. */
type WorkflowFile = { jobs?: Record<string, { steps?: unknown[] }> };

/** The subset of a job the multi-job CI assertions read. */
type CIJob = {
  steps?: unknown[];
  needs?: string | string[];
  if?: string;
  permissions?: Record<string, string>;
};
type CIWorkflow = { jobs: Record<string, CIJob> };

import { regenerateAll } from "@/src/scaffold/aggregator";
import { getRegisteredConfigs } from "@/src/scaffold/features";
import { TemplateHarness } from "@/src/scaffold/harness";
import { MonorepoScaffolder } from "@/src/scaffold/pipeline";

const registry = await getRegisteredConfigs(REPO_ROOT);

/** A job the generated CI must contain — throws so the failure names the job. */
function jobOf(ci: CIWorkflow, name: string): CIJob {
  const job = ci.jobs[name];
  if (!job) throw new Error(`the generated CI has no "${name}" job`);
  return job;
}

/** Reads every file under `dir` into a sorted `{ relativePath: contents }` map. */
async function snapshotTree(dir: string): Promise<Record<string, string>> {
  const snapshot: Record<string, string> = {};
  for (const entry of readdirSync(dir, { recursive: true }).map(String).sort()) {
    const path = `${dir}/${entry}`;
    if (statSync(path).isFile()) {
      snapshot[entry] = await file(path).text();
    }
  }
  return snapshot;
}

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
    "regenerateCI and docs:sync are the same generator — a second pass must be a no-op",
    async () => {
      // `MonorepoScaffolder.regenerateCI()` and `m docs`'s `regenerateAll()` used to be two
      // hand-maintained copies, and had already drifted apart: a scaffolded repo whose owner
      // later ran `m docs` could get workflows that differ from the ones it shipped with.
      // Both callers now delegate to `regenerateAll`; this locks the wiring in place by
      // running the *other* entry point over a scaffolded tree and demanding identical bytes.
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      await new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@agent-test",
        gitHooks: false,
        configs: { playwright: true },
      }).execute();

      const githubDir = `${result.templateDir}/.github`;
      const before = await snapshotTree(githubDir);
      expect(Object.keys(before).length).toBeGreaterThan(0);

      await regenerateAll(result.templateDir);

      expect(await snapshotTree(githubDir)).toEqual(before);
    },
    { timeout: 60_000 },
  );

  test(
    "generates both workflows from configs",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      const proc = Bun.spawn({
        cmd: [
          "bun",
          `${result.templateDir}/packages/tooling/src/scaffold/aggregator.ts`,
          result.templateDir,
        ],
        stdout: "pipe",
        stderr: "pipe",
      });
      const stderr = await new Response(proc.stderr).text();
      expect(await proc.exited, stderr).toBe(0);

      const ci = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      expect(ci).not.toContain("{{STEPS}}");
      // Version-agnostic on purpose: the checkout action is pinned to a major,
      // but which major is the audit's business, not this generator's.
      expect(ci).toMatch(/actions\/checkout@v\d+/);
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

      const script = `${result.templateDir}/packages/tooling/src/scaffold/aggregator.ts`;
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

      await $`bun ${result.templateDir}/packages/tooling/src/scaffold/aggregator.ts ${result.templateDir}`.quiet();

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

      // R27: fragments moved out of the per-feature config packages and into
      // the tooling package's ci/ tree. The base skeletons and the bootstrap are
      // deliberately column-0 documents, so only the spliceable fragments are
      // checked here.
      const ciDir = `${result.templateDir}/packages/tooling/src/ci`;
      const fragments = [...new Glob("**/*.yml").scanSync({ cwd: ciDir, onlyFiles: true })]
        .filter(
          (name) =>
            name.endsWith(".steps.yml") ||
            name.startsWith("standalone/") ||
            name.startsWith("sections/"),
        )
        .map((name) => `${ciDir}/${name}`)
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
        configs: { playwright: true },
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
      // The per-config READMEs are gone with configs/ (R27); the README now
      // points at the package that owns every shared config.
      expect(readme).toContain("packages/tooling");

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
          cmd: ["bun", `${dir}/packages/tooling/src/scaffold/aggregator.ts`, dir],
          stdout: "pipe",
          stderr: "pipe",
        });
        const stderr = await new Response(proc.stderr).text();
        expect(await proc.exited, stderr).toBe(0);
      };

      const pages = `${result.templateDir}/.github/workflows/pages.yml`;
      const coverage = `${result.templateDir}/.github/workflows/coverage.yml`;

      // Docs app present (this repo): template-docs.yml is the single deployer
      // and `m docs site` publishes coverage at /coverage/ inside that artifact.
      expect(
        await file(`${result.templateDir}/apps/template-docs/.vitepress/config.mts`).exists(),
      ).toBe(true);
      await aggregate(result.templateDir);
      expect(await file(pages).exists(), "pages.yml would fight template-docs.yml").toBe(false);
      expect(await file(coverage).exists(), "coverage.yml would fight template-docs.yml").toBe(
        false,
      );

      // No docs app (a scaffolded monorepo): pages.yml is generated again, and
      // coverage rides along as /coverage/ inside the Pages artifact.
      await $`rm -rf ${result.templateDir}/apps/template-docs`.quiet();
      await aggregate(result.templateDir);
      expect(await file(pages).exists(), "pages.yml must exist for a Pages opt-in").toBe(true);
      expect(await file(coverage).exists(), "coverage is included in pages.yml").toBe(false);
    },
    { timeout: 120_000 },
  );

  test(
    "CI is split into parallel jobs behind a gate",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      await new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@agent-test",
        gitHooks: false,
        configs: registry.buildEnabledConfigs(),
      }).execute();

      const ci = Bun.YAML.parse(
        await file(`${result.templateDir}/.github/workflows/ci.yml`).text(),
      ) as CIWorkflow;

      // quality is the root; the rest fan out from it so a native build failure
      // cannot hold up coverage or e2e.
      expect(Object.keys(ci.jobs).sort()).toEqual(
        ["coverage", "e2e", "gate", "native", "quality", "security"].sort(),
      );
      expect(jobOf(ci, "quality").needs).toBeUndefined();
      for (const name of ["coverage", "security", "native", "e2e"] as const) {
        expect(jobOf(ci, name).needs, `${name} must wait on quality`).toBe("quality");
      }

      // The gate is what branch protection requires, so it has to see every run.
      const gate = jobOf(ci, "gate");
      expect(gate.if).toBe("always()");
      expect([...(gate.needs ?? [])].sort()).toEqual(
        ["coverage", "e2e", "native", "quality", "security"].sort(),
      );

      // Each job installs for itself, and carries only the scopes it uses.
      for (const [name, job] of Object.entries(ci.jobs)) {
        if (name === "gate") continue;
        const names = (job.steps ?? []).map((s) => (s as { name?: string }).name);
        expect(names, `${name} is missing the shared bootstrap`).toContain("Install Dependencies");
      }
      expect(jobOf(ci, "security").permissions?.["security-events"]).toBe("write");
      expect(jobOf(ci, "quality").permissions?.["security-events"]).toBeUndefined();

      // No marker or placeholder survives into the generated file.
      const raw = await file(`${result.templateDir}/.github/workflows/ci.yml`).text();
      expect(raw).not.toMatch(/^\s*#\s*SECTION:/m);
      expect(raw).not.toContain("{{BOOTSTRAP}}");
    },
    { timeout: 120_000 },
  );

  test(
    "a job with no steps left is pruned, and the gate stops waiting on it",
    async () => {
      const result = await new TemplateHarness({ skipInstall: true }).prepare();
      cleanup = result.cleanup;

      // Everything opt-in off: no Playwright config and no native config survive,
      // so the e2e and native sections receive no steps at all.
      await new MonorepoScaffolder({
        targetDir: result.templateDir,
        scope: "@agent-test",
        gitHooks: false,
        configs: registry.buildDisabledConfigs(),
      }).execute();

      const path = `${result.templateDir}/.github/workflows/ci.yml`;
      const ci = Bun.YAML.parse(await file(path).text()) as CIWorkflow;

      expect(Object.keys(ci.jobs).sort()).toEqual(
        ["coverage", "gate", "quality", "security"].sort(),
      );

      // A `needs` entry naming a pruned job fails GitHub's workflow validation,
      // so the gate's list has to shrink with the jobs.
      expect([...(jobOf(ci, "gate").needs ?? [])].sort()).toEqual(
        ["coverage", "quality", "security"].sort(),
      );

      // Every surviving job still has steps — an empty one is a parse-time smell
      // and burns a runner.
      for (const [name, job] of Object.entries(ci.jobs)) {
        expect((job.steps ?? []).length, `${name} has no steps`).toBeGreaterThan(0);
      }
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
    // TEMPLATE-ONLY markers inside the tooling package are the generator's own
    // inputs: `m ci` regenerates workflows from those fragments later, so the
    // markers have to survive. The placeholder scope does not get that pass.
    const isToolingSource = path.includes(`${sep}packages${sep}tooling${sep}`);
    for (const needle of needles) {
      if (isToolingSource && needle.startsWith("TEMPLATE-ONLY:")) continue;
      if (content.includes(needle)) leaks.push(`${path}: ${needle}`);
    }
  }
  return leaks;
}

async function pathExists(path: string): Promise<boolean> {
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0;
}
