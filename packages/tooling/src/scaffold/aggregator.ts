#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { $, file, write } from "bun";
import { resolveSrc } from "@/src/utils/paths";
import {
  type ConfigMap,
  DEFAULT_SCOPE,
  disabledScopesFor,
  enabledDirsFor,
  FEATURES,
  readRecordedScope,
  readRecordedSelections,
} from "./features";
import { stripMarkerBlocks } from "./markers";
import { WORKFLOW_VARS } from "./vars";

/**
 * Regenerates CI workflows from the skeletons and fragments this package ships.
 *
 * Nothing is discovered in the target tree. Each feature declares the files it
 * contributes under `src/ci/` in its `ciFiles` entry, and the caller says which
 * features are enabled:
 *
 * - `src/ci/ci.base.yml` has one job per concern. Every `sections/<name>.yml`
 *   says which job it belongs to with a `# SECTION: <name>` comment, and its
 *   steps are spliced at the matching marker (see `routeSections`). Jobs left
 *   with nothing but the shared bootstrap are removed, and the gate job's
 *   `needs` is rewritten to match.
 * - Every other workflow splices its `*.steps.yml` fragments into a single
 *   `{{STEPS}}` (`{{UPDATES}}` for dependabot).
 * - A feature may own a workflow outright by declaring a `*.base.yml`
 *   (coverage, pages, native, stale, dependabot); `ci.base.yml`,
 *   `release.base.yml` and the `ci.bootstrap.yml` preamble belong to
 *   `gh-actions`.
 *
 * Enablement used to be inferred from the filesystem: the scaffolder deleted
 * `configs/<feature>/` and this generator collected whatever
 * `find <target>/configs -name '<steps>.yml'` still returned. R27 deletes that
 * directory, so the set is passed in instead — and a generated project records
 * it, so regenerating its workflows later reproduces them.
 *
 * Step fragments may use `{{NAME}}` placeholders (`{{BUN_VERSION}}`,
 * `{{NATIVE_DIR}}`, `{{APP_DOCKERFILE}}`, ...) filled from `vars.ts`, so paths
 * and versions have one source.
 *
 * Root README.md and AGENTS.md are static reference files (not concatenated)
 * with TEMPLATE-ONLY blocks; they are NOT regenerated here.
 *
 * Run from the repository root: `m docs`.
 * A target directory may be passed as an argument for testing:
 * `bun packages/tooling/src/scaffold/aggregator.ts <targetDir>`.
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

/**
 * How one generation pass is scoped and finished.
 *
 * Every field is optional because the in-repo pass (`m docs`) wants none of
 * them: all features on, and the emitted workflows keep their TEMPLATE-ONLY
 * markers and `@myorg` placeholders so the template stays scaffoldable.
 */
export interface AggregateOptions {
  /**
   * Feature dirs whose fragments take part. Defaults to every feature.
   *
   * This is what decides whether a disabled feature reaches a workflow — it
   * replaces the old arrangement where the scaffolder deleted
   * `configs/<feature>/` and enablement was inferred from what survived.
   */
  enabled?: ReadonlySet<string>;
  /** Overrides the `apps/template-docs` probe. A scaffold passes `false`. */
  templateDocsSite?: boolean;
  /**
   * Applied to each rendered workflow immediately before it is written.
   *
   * Required when generating into a scaffold. The fragments ship inside this
   * package, so they arrive with their TEMPLATE-ONLY markers and `@myorg`
   * placeholders intact — and generation runs after the scaffolder's tree-wide
   * marker and scope passes, which could never reach files outside the target
   * tree anyway.
   */
  postProcess?: (rendered: string) => string;
}

/** Every feature — what an unrestricted pass (this repo, `m docs`) includes. */
function allFeatures(): ReadonlySet<string> {
  return new Set(FEATURES.map((feature) => feature.dir));
}

/** Absolute path of one `src/ci/` fragment from its registry-relative form. */
function ciPath(relative: string): string {
  return resolveSrc("ci", ...relative.split("/"));
}

/** Does this declared fragment contribute to the workflow `stepsFileName` names? */
function contributes(relative: string, stepsFileName: string): boolean {
  // CI is the odd one out: its steps are not a `<name>.steps.yml` file but a
  // `sections/<feature>.yml` chunk per feature, each carrying its own
  // `# SECTION:` marker. The WORKFLOWS spec still calls the pair
  // `ci.steps.yml`, so that name selects the whole `sections/` directory.
  if (stepsFileName === "ci.steps.yml") return relative.startsWith("sections/");
  return (relative.split("/").pop() ?? "") === stepsFileName;
}

/**
 * Every enabled feature's contribution to one workflow, in registry order.
 *
 * Registry order is alphabetical by feature dir, which is the order the old
 * `find … | sort` produced over `configs/<dir>/<steps>.yml`, so the rendered
 * workflows are byte-identical to the ones the directory scan generated.
 */
async function collectFragments(
  stepsFileName: string,
  enabled: ReadonlySet<string>,
): Promise<string[]> {
  const texts: string[] = [];
  for (const feature of FEATURES) {
    if (!enabled.has(feature.dir)) continue;
    for (const relative of feature.ciFiles ?? []) {
      if (!contributes(relative, stepsFileName)) continue;
      texts.push((await file(ciPath(relative)).text()).trimEnd());
    }
  }
  return texts;
}

/**
 * The skeleton for a workflow: whichever enabled feature declared a `ciFiles`
 * entry with this filename, or null when none did.
 */
async function resolveBase(
  baseFileName: string,
  enabled: ReadonlySet<string>,
): Promise<string | null> {
  for (const feature of FEATURES) {
    if (!enabled.has(feature.dir)) continue;
    for (const relative of feature.ciFiles ?? []) {
      if ((relative.split("/").pop() ?? "") === baseFileName) return ciPath(relative);
    }
  }
  return null;
}

/** The checkout/setup/cache/install preamble every CI job starts with. */
async function readBootstrap(): Promise<string> {
  const path = ciPath("ci.bootstrap.yml");
  if (!(await file(path).exists())) return "";
  return (await file(path).text()).trimEnd();
}

/**
 * The finishing pass a generated project needs, derived from what it recorded.
 *
 * Undefined inside this repository: its workflows keep their TEMPLATE-ONLY
 * markers and `@myorg` placeholders, because that is what makes it
 * scaffoldable.
 */
async function defaultPostProcess(
  targetDir: string,
  recorded: ConfigMap | null,
): Promise<((rendered: string) => string) | undefined> {
  if (!recorded) return undefined;

  const disabled = disabledScopesFor(FEATURES, recorded);
  const scope = await readRecordedScope(targetDir);
  return (rendered: string): string => {
    const { content } = stripMarkerBlocks(rendered, disabled);
    return scope ? content.replaceAll(DEFAULT_SCOPE, scope) : content;
  };
}

/**
 * Renders a workflow skeleton, splicing the enabled features' step fragments
 * into the `{{STEPS}}` (or `{{UPDATES}}`) placeholder.
 */
export async function aggregateWorkflow(
  targetDir: string,
  baseFileName: string,
  stepsFileName: string,
  options: AggregateOptions = {},
): Promise<void> {
  const enabled = options.enabled ?? allFeatures();

  const basePath = await resolveBase(baseFileName, enabled);
  if (!basePath) {
    console.log(`⚠️ Skipping ${baseFileName} — no enabled feature declares it`);
    return;
  }
  const base = await file(basePath).text();

  const fragmentTexts = await collectFragments(stepsFileName, enabled);
  const steps = fragmentTexts.join("\n\n");

  let withSteps: string;
  if (stepsFileName === "ci.steps.yml" && isSectioned(base)) {
    // CI is the only workflow with more than one job, so it is the only one that
    // routes by section; the rest keep splicing into a single {{STEPS}}.
    const filled = routeSections(
      base.replaceAll("{{BOOTSTRAP}}", await readBootstrap()),
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

  await write(outputPath, options.postProcess ? options.postProcess(rendered) : rendered);
  console.log(`✅ generated ${outputPath}`);
}

/** How a generated workflow should be treated on this pass. */
type WorkflowOutcome = "generate" | "remove" | "skip";

/** Which features are on — computed once, read by every spec. */
interface WorkflowContext {
  /** The `pages` feature is enabled. */
  pages: boolean;
  /** The `coverage` feature is enabled. */
  coverage: boolean;
  /** The `native` feature is enabled. */
  native: boolean;
  /** The `dependabot` or `gh-actions` feature is enabled. */
  dependabot: boolean;
  /** The `stale` feature is enabled. */
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
    // The offline sandbox bundle exists to rebuild the vendored cargo tree, so
    // it only makes sense alongside the native feature (which owns Cargo.lock).
    base: "sandbox.base.yml",
    steps: "sandbox.steps.yml",
    outcome: (ctx) => (ctx.native ? "generate" : "remove"),
    stale: ".github/workflows/sandbox.yml",
    reason: () => "native disabled — no Cargo.lock to bundle",
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
  options: AggregateOptions,
): Promise<void> {
  const outcome = spec.outcome(ctx);
  if (outcome === "skip") return;
  if (outcome === "generate") {
    await aggregateWorkflow(targetDir, spec.base, spec.steps, options);
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
 * Regenerates every workflow the enabled features ask for.
 *
 * A scaffold records the selections it was built from, so regenerating its
 * workflows later reproduces them. This repository records nothing, which is
 * the signal that every feature is on and the markers stay put.
 *
 * `templateDocsSite` defaults to testing for the template's own docs site, so
 * `m docs` (running inside the repo) keeps its behaviour; a scaffolder that has
 * already deleted `apps/template-docs/` passes `false` instead of re-testing
 * the pruned tree.
 */
export async function regenerateAll(
  targetDir: string,
  options: AggregateOptions = {},
): Promise<void> {
  await mkdir(`${targetDir}/.github/workflows`, { recursive: true });
  await mkdir(`${targetDir}/.github`, { recursive: true });

  const recorded = await readRecordedSelections(targetDir);
  const enabled =
    options.enabled ?? (recorded ? enabledDirsFor(FEATURES, recorded) : allFeatures());
  const postProcess = options.postProcess ?? (await defaultPostProcess(targetDir, recorded));
  const pages = enabled.has("pages");
  const templateDocsSite =
    options.templateDocsSite ??
    (await file(`${targetDir}/apps/template-docs/.vitepress/config.mts`).exists());

  const ctx: WorkflowContext = {
    pages,
    coverage: enabled.has("coverage"),
    native: enabled.has("native"),
    dependabot: enabled.has("dependabot") || enabled.has("gh-actions"),
    stale: enabled.has("stale"),
    templateDocsSite,
    pagesDeploysToSite: pages && !templateDocsSite,
  };

  for (const spec of WORKFLOWS) {
    await syncWorkflow(targetDir, spec, ctx, { ...options, enabled, postProcess });
  }
}

const targetDir = process.argv[2] ?? ".";
if (import.meta.main) {
  await regenerateAll(targetDir);
}
