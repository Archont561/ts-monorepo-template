#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { $, file, write } from "bun";
import { WORKFLOW_VARS } from "./vars";

/**
 * Regenerates CI workflows from the config packages.
 *
 * Everything is discovery-driven — there is no central registry:
 *
 * - `.github/workflows/ci.yml` is `configs/gh-actions/ci.base.yml`, which has
 *   one job per concern. Every `configs/<dir>/ci.steps.yml` says which job it
 *   belongs to with a `# SECTION: <name>` comment, and its steps are spliced at
 *   the matching marker in the base (see `routeSections`). Jobs left with
 *   nothing but the shared bootstrap are removed, and the gate job's `needs` is
 *   rewritten to match.
 * - `.github/workflows/release.yml` is `configs/gh-actions/release.base.yml`
 *   with `{{STEPS}}` filled from every `configs/<dir>/release.steps.yml`
 *   (sorted, concatenated).
 * - `.github/workflows/pages.yml` is `configs/gh-actions/pages.base.yml`
 *   with `{{STEPS}}` filled from every `configs/<dir>/pages.steps.yml`
 *   (sorted, concatenated) — GitHub Pages deployment.
 * - `.github/workflows/coverage.yml` is `configs/gh-actions/coverage.base.yml`
 *   with `{{STEPS}}` filled from `coverage.steps.yml` — LCOV + HTML + artifact + Pages.
 * - `.github/dependabot.yml` is `configs/gh-actions/dependabot.base.yml`
 *   with `{{UPDATES}}` filled from every `configs/<dir>/dependabot.yml`
 *   (sorted, concatenated) — Dependabot version updates.
 * Step fragments may use `{{NAME}}` placeholders (`{{BUN_VERSION}}`,
 *   `{{NATIVE_DIR}}`, `{{APP_DOCKERFILE}}`, ...) that are filled from
 *   `configs/template/src/vars.ts`, so paths and versions have one source.
 * - `.github/workflows/dependabot-auto-merge.yml` is
 *   `configs/gh-actions/dependabot-auto-merge.base.yml` with `{{STEPS}}`
 *   filled from `dependabot-auto-merge.steps.yml`.
 *
 * Root README.md and AGENTS.md are now static reference files (not concatenated)
 * that list configs via links. They have TEMPLATE-ONLY blocks for template vs
 * monorepo descriptions and are NOT regenerated here.
 *
 * Run from the repository root: `bun run docs:sync`.
 * A target directory may be passed as an argument for testing:
 * `bun configs/template/src/aggregate.ts <targetDir>`.
 */

/** Matches a `# SECTION: <name>` routing comment in a base or a step fragment. */
const SECTION_MARKER = /^[ \t]*#[ \t]*SECTION:[ \t]*([A-Za-z0-9_-]+)[ \t]*$/;

/** A line that opens a job entry under `jobs:`. */
const JOB_HEADER = /^ {2}([A-Za-z0-9_-]+):$/;

/** The section a line declares, or null when it is not a routing comment. */
function sectionOf(line: string): string | null {
  return SECTION_MARKER.exec(line)?.[1] ?? null;
}

/** The job a line opens under `jobs:`, or null for any other line. */
function jobOf(line: string): string | null {
  return JOB_HEADER.exec(line)?.[1] ?? null;
}

/** Job everything else waits on; also where untagged fragment steps land. */
const CI_ROOT_JOB = "quality";

/** Job that collapses the run into one status for branch protection. */
const CI_GATE_JOB = "gate";

/** Jobs dropped when their section receives no steps. */
const CI_PRUNABLE_JOBS = ["coverage", "security", "native", "e2e"] as const;

/** One run of steps a fragment contributes to one job. */
interface SectionChunk {
  section: string;
  text: string;
}

/**
 * Splits a step fragment at its `# SECTION:` comments.
 *
 * Fragments are handled as raw text throughout — parsing and re-emitting YAML
 * would drop the comments that carry the TEMPLATE-ONLY scope markers and reflow
 * the `run: |` blocks. Text before the first marker belongs to `fallback`.
 */
function splitSections(raw: string, fallback: string): SectionChunk[] {
  const chunks: SectionChunk[] = [];
  let section = fallback;
  let buffer: string[] = [];

  const flush = (): void => {
    // Drop blank lines at the edges but never the leading indentation: a chunk's
    // first line carries the 6-space indent that puts it under a job's `steps:`.
    const text = buffer
      .join("\n")
      .replace(/^(?:[ \t]*\n)+/, "")
      .replace(/\s+$/, "");
    if (text) chunks.push({ section, text });
    buffer = [];
  };

  for (const line of raw.split("\n")) {
    const declared = sectionOf(line);
    if (declared) {
      flush();
      section = declared;
      continue;
    }
    buffer.push(line);
  }
  flush();
  return chunks;
}

/** Does this skeleton route steps by section rather than by `{{STEPS}}`? */
function isSectioned(base: string): boolean {
  return base.split("\n").some((line) => SECTION_MARKER.test(line));
}

/**
 * Replaces every `# SECTION: <name>` line in the skeleton with the steps routed
 * to it, and reports which sections actually received steps.
 */
function routeSections(
  base: string,
  fragmentTexts: readonly string[],
): { rendered: string; filled: Set<string> } {
  const bySection = new Map<string, string[]>();
  for (const fragment of fragmentTexts) {
    for (const chunk of splitSections(fragment, CI_ROOT_JOB)) {
      const list = bySection.get(chunk.section) ?? [];
      list.push(chunk.text);
      bySection.set(chunk.section, list);
    }
  }

  const declared = new Set<string>();
  const filled = new Set<string>();
  const lines: string[] = [];

  for (const line of base.split("\n")) {
    const section = sectionOf(line);
    if (!section) {
      lines.push(line);
      continue;
    }
    declared.add(section);
    const steps = bySection.get(section);
    if (steps?.length) {
      filled.add(section);
      lines.push(steps.join("\n\n"));
    }
  }

  // A fragment pointing at a job the skeleton does not define would otherwise
  // vanish silently — the exact failure this routing is meant to prevent.
  for (const section of bySection.keys()) {
    if (!declared.has(section)) {
      console.log(`⚠️ No "# SECTION: ${section}" in the CI skeleton — steps dropped`);
    }
  }

  return { rendered: lines.join("\n"), filled };
}

/** Deletes the named job blocks, so a job with no steps never reaches GitHub. */
function pruneJobs(rendered: string, remove: ReadonlySet<string>): string {
  if (remove.size === 0) return rendered;

  const kept: string[] = [];
  let skipping = false;
  for (const line of rendered.split("\n")) {
    const job = jobOf(line);
    if (job) skipping = remove.has(job);
    else if (/^\S/.test(line)) skipping = false;
    if (!skipping) kept.push(line);
  }
  return kept.join("\n");
}

/**
 * Rewrites the gate job's `needs`. GitHub rejects a `needs` entry that names no
 * job, so pruning a job without updating this list fails validation.
 */
function rewriteGateNeeds(rendered: string, survivors: readonly string[]): string {
  const lines = rendered.split("\n");
  let inGate = false;

  for (const [index, line] of lines.entries()) {
    const job = jobOf(line);
    if (job) inGate = job === CI_GATE_JOB;
    else if (/^\S/.test(line)) inGate = false;
    if (inGate && /^ {4}needs: \[[^\]]*\]$/.test(line)) {
      lines[index] = `    needs: [${survivors.join(", ")}]`;
      break;
    }
  }
  return lines.join("\n");
}

/** The checkout/setup/cache/install preamble every CI job starts with. */
async function readBootstrap(targetDir: string): Promise<string> {
  const path = `${targetDir}/configs/gh-actions/ci.bootstrap.yml`;
  if (!(await file(path).exists())) return "";
  return (await file(path).text()).trimEnd();
}

/**
 * Renders a workflow skeleton, splicing the matching step fragments into
 * the `{{STEPS}}` placeholder. Both ci.steps.yml and release.steps.yml
 * aggregate from every config's fragment; legacy single-file mode is
 * kept for backward compat.
 */
export async function aggregateWorkflow(
  targetDir: string,
  baseFileName: string,
  stepsFileName: string,
): Promise<void> {
  // Base file discovery: prefer gh-actions for backward compat, but also allow
  // self-contained configs to own their base (e.g. configs/pages/pages.base.yml)
  let basePath = `${targetDir}/configs/gh-actions/${baseFileName}`;
  if (!(await file(basePath).exists())) {
    const foundBases =
      await $`find ${targetDir}/configs -mindepth 2 -maxdepth 3 -name ${baseFileName} -type f`.text();
    const first = foundBases.trim().split("\n").filter(Boolean).sort()[0];
    if (first) {
      basePath = first;
    } else {
      console.log(`⚠️ Skipping ${baseFileName} — base not found (config disabled)`);
      return;
    }
  }
  const base = await file(basePath).text();

  let fragmentTexts: string[] = [];
  let steps: string;
  if (
    stepsFileName === "ci.steps.yml" ||
    stepsFileName === "release.steps.yml" ||
    stepsFileName === "pages.steps.yml" ||
    stepsFileName === "coverage.steps.yml" ||
    stepsFileName === "dependabot.yml" ||
    stepsFileName === "dependabot-auto-merge.steps.yml" ||
    stepsFileName === "stale.steps.yml" ||
    stepsFileName === "native.steps.yml"
  ) {
    const found =
      await $`find ${targetDir}/configs -mindepth 2 -maxdepth 2 -name ${stepsFileName} -type f`.text();
    const fragments = found.trim().split("\n").filter(Boolean).sort();
    fragmentTexts = await Promise.all(fragments.map(async (p) => (await file(p).text()).trimEnd()));
    steps = fragmentTexts.join("\n\n");
  } else {
    steps = (await file(`${targetDir}/configs/changeset/${stepsFileName}`).text()).trimEnd();
  }

  let withSteps: string;
  if (stepsFileName === "ci.steps.yml" && isSectioned(base)) {
    // CI is the only workflow with more than one job, so it is the only one that
    // routes by section; the rest keep splicing into a single {{STEPS}}.
    const filled = routeSections(
      base.replaceAll("{{BOOTSTRAP}}", await readBootstrap(targetDir)),
      fragmentTexts,
    );
    const remove = new Set(CI_PRUNABLE_JOBS.filter((job) => !filled.filled.has(job)));
    const survivors = [CI_ROOT_JOB, ...CI_PRUNABLE_JOBS.filter((job) => !remove.has(job))];
    withSteps = rewriteGateNeeds(pruneJobs(filled.rendered, remove), survivors);
  } else {
    // Support both {{STEPS}} and {{UPDATES}} placeholders
    withSteps = base.replace("{{STEPS}}", `${steps}\n`).replace("{{UPDATES}}", `${steps}\n`);
  }

  // {{BUN_VERSION}}, {{NATIVE_DIR}}, {{APP_DOCKERFILE}}, ... — fragments are
  // static YAML, so anything that has a single source of truth in TypeScript
  // is interpolated here instead of being repeated in every step file.
  let rendered = withSteps;
  for (const [name, value] of Object.entries(WORKFLOW_VARS)) {
    rendered = rendered.replaceAll(`{{${name}}}`, value);
  }
  rendered = rendered.replace(/\n{3,}/g, "\n\n");

  // Determine output path based on base file name
  let outputPath: string;
  if (baseFileName === "dependabot.base.yml") {
    outputPath = `${targetDir}/.github/dependabot.yml`;
  } else {
    outputPath = `${targetDir}/.github/workflows/${baseFileName.replace(".base.yml", ".yml")}`;
  }

  await write(outputPath, rendered);
  console.log(`✅ generated ${outputPath}`);
}

/** How a generated workflow should be treated on this pass. */
type WorkflowOutcome = "generate" | "remove" | "skip";

/** What the surrounding tree looks like — computed once, read by every spec. */
interface WorkflowContext {
  /** `configs/pages` survived the removal pass. */
  pages: boolean;
  /** `configs/coverage` survived. */
  coverage: boolean;
  /** `packages/native` survived. */
  native: boolean;
  /** `configs/dependabot` or `configs/gh-actions` survived. */
  dependabot: boolean;
  /** `configs/stale` survived. */
  stale: boolean;
  /** The template's own docs site deploys Pages — never true inside a scaffold. */
  templateDocsSite: boolean;
  /** Pages owns the Pages site, so no standalone `pages.yml` is generated. */
  pagesDeploysToSite: boolean;
}

/**
 * One workflow the generator owns: the skeleton it renders, the config whose
 * survival decides whether it is generated, and the stale file to clean up
 * when it is not.
 *
 * `skip` exists because an absent config is not always grounds for a cleanup —
 * a removed coverage config must not delete a `coverage.yml` that belongs to
 * something else, which is what the original `if (coverageConfigExists)` guard
 * spelled out inline.
 */
interface WorkflowSpec {
  base: string;
  steps: string;
  outcome: (ctx: WorkflowContext) => WorkflowOutcome;
  /** File to delete when the outcome is `remove`, relative to the target dir. */
  stale?: string;
  /** Parenthesised log suffix; omit it to remove silently. */
  reason?: (ctx: WorkflowContext) => string;
}

/**
 * Every workflow the repo and the scaffolds share, in generation order.
 *
 * `dependabot.base.yml` renders to `.github/dependabot.yml` rather than into
 * `.github/workflows/` — `aggregateWorkflow` derives that itself.
 */
const WORKFLOWS: readonly WorkflowSpec[] = [
  { base: "ci.base.yml", steps: "ci.steps.yml", outcome: () => "generate" },
  { base: "release.base.yml", steps: "release.steps.yml", outcome: () => "generate" },
  {
    base: "pages.base.yml",
    steps: "pages.steps.yml",
    outcome: (ctx) => (ctx.pagesDeploysToSite ? "generate" : "remove"),
    stale: ".github/workflows/pages.yml",
    reason: (ctx) => (ctx.templateDocsSite ? "template docs site deploys Pages" : "pages disabled"),
  },
  {
    base: "coverage.base.yml",
    steps: "coverage.steps.yml",
    outcome: (ctx) => {
      if (!ctx.coverage) return "skip";
      return ctx.pagesDeploysToSite || ctx.templateDocsSite ? "remove" : "generate";
    },
    stale: ".github/workflows/coverage.yml",
    reason: (ctx) =>
      ctx.templateDocsSite
        ? "coverage published by the docs site"
        : "coverage included in pages.yml",
  },
  {
    base: "native.base.yml",
    steps: "native.steps.yml",
    outcome: (ctx) => (ctx.native ? "generate" : "remove"),
    stale: ".github/workflows/native.yml",
    reason: () => "native disabled",
  },
  {
    base: "dependabot.base.yml",
    steps: "dependabot.yml",
    outcome: (ctx) => (ctx.dependabot ? "generate" : "skip"),
  },
  {
    base: "dependabot-auto-merge.base.yml",
    steps: "dependabot-auto-merge.steps.yml",
    outcome: (ctx) => (ctx.dependabot ? "generate" : "skip"),
  },
  {
    base: "stale.base.yml",
    steps: "stale.steps.yml",
    outcome: (ctx) => (ctx.stale ? "generate" : "remove"),
    stale: ".github/workflows/stale.yml",
  },
];

/** Generates, cleans up or leaves one workflow alone. */
async function syncWorkflow(
  targetDir: string,
  spec: WorkflowSpec,
  ctx: WorkflowContext,
): Promise<void> {
  const outcome = spec.outcome(ctx);
  if (outcome === "skip") return;
  if (outcome === "generate") {
    await aggregateWorkflow(targetDir, spec.base, spec.steps);
    return;
  }

  if (!spec.stale) return;
  const stale = `${targetDir}/${spec.stale}`;
  if (!(await file(stale).exists())) return;

  await $`rm -rf ${stale}`.quiet();
  const reason = spec.reason?.(ctx);
  if (reason) console.log(`🗑️ Removed ${stale} (${reason})`);
}

/**
 * Regenerates every workflow the surviving configs ask for.
 *
 * `templateDocsSite` defaults to testing for the template's own docs site, so
 * `m docs` (running inside the repo) keeps its behaviour; a scaffolder that has
 * already deleted `apps/template-docs/` passes `false` instead of re-testing
 * the pruned tree.
 */
export async function regenerateAll(
  targetDir: string,
  options: { templateDocsSite?: boolean } = {},
): Promise<void> {
  await mkdir(`${targetDir}/.github/workflows`, { recursive: true });
  await mkdir(`${targetDir}/.github`, { recursive: true });

  const exists = (relative: string) => file(`${targetDir}/${relative}`).exists();
  const pages = await exists("configs/pages/package.json");
  const templateDocsSite =
    options.templateDocsSite ?? (await exists("apps/template-docs/.vitepress/config.mts"));

  const ctx: WorkflowContext = {
    pages,
    coverage: await exists("configs/coverage/package.json"),
    native: await exists("configs/native/package.json"),
    dependabot:
      (await exists("configs/dependabot/package.json")) ||
      (await exists("configs/gh-actions/package.json")),
    stale: await exists("configs/stale/package.json"),
    templateDocsSite,
    pagesDeploysToSite: pages && !templateDocsSite,
  };

  for (const spec of WORKFLOWS) {
    await syncWorkflow(targetDir, spec, ctx);
  }
}

const targetDir = process.argv[2] ?? ".";
if (import.meta.main) {
  await regenerateAll(targetDir);
}
