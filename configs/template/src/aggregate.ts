#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { $, file, write } from "bun";
import { WORKFLOW_VARS } from "./vars";

/**
 * Regenerates CI workflows from the config packages.
 *
 * Everything is discovery-driven — there is no central registry:
 *
 * - `.github/workflows/ci.yml` is `configs/gh-actions/ci.base.yml` with the
 *   `{{STEPS}}` placeholder filled from every `configs/<dir>/ci.steps.yml`
 *   (sorted, concatenated).
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
    steps = (await Promise.all(fragments.map(async (p) => (await file(p).text()).trimEnd()))).join(
      "\n\n",
    );
  } else {
    steps = (await file(`${targetDir}/configs/changeset/${stepsFileName}`).text()).trimEnd();
  }

  // Support both {{STEPS}} and {{UPDATES}} placeholders
  const withSteps = base.replace("{{STEPS}}", `${steps}\n`).replace("{{UPDATES}}", `${steps}\n`);

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
 * `mdocs` (running inside the repo) keeps its behaviour; a scaffolder that has
 * already deleted `docs/` passes `false` instead of re-testing the pruned tree.
 */
export async function regenerateAll(
  targetDir: string,
  options: { templateDocsSite?: boolean } = {},
): Promise<void> {
  await mkdir(`${targetDir}/.github/workflows`, { recursive: true });
  await mkdir(`${targetDir}/.github`, { recursive: true });

  const exists = (relative: string) => file(`${targetDir}/${relative}`).exists();
  const pages = await exists("configs/pages/package.json");
  const templateDocsSite = options.templateDocsSite ?? (await exists("docs/.vitepress/config.mts"));

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
