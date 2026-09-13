#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { $, file, write } from "bun";

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

export async function aggregateMarkdown(
  targetDir: string,
  fileName: string,
  outputFileName: string,
  marker: string,
): Promise<void> {
  const configsDir = `${targetDir}/configs`;
  const found =
    await $`find ${configsDir} -mindepth 2 -maxdepth 2 -name ${fileName} -type f`.text();
  const files = found.trim().split("\n").filter(Boolean).sort();

  const blocks: string[] = [];
  for (const absolutePath of files) {
    const name = absolutePath.split("/").at(-2);
    const content = (await file(absolutePath).text()).trimEnd();
    blocks.push(
      [`<!-- ${marker}:${name}:START -->`, content, `<!-- ${marker}:${name}:END -->`].join("\n"),
    );
  }

  const intro = (await file(`${configsDir}/${fileName}`).text()).trim();
  const output = [
    `<!-- AUTO-GENERATED from configs/*/${fileName} -->`,
    intro,
    "",
    blocks.join("\n\n"),
    "",
  ].join("\n");

  await write(`${targetDir}/${outputFileName}`, `${output}\n`);
  console.log(`✅ generated ${targetDir}/${outputFileName} (${blocks.length} sections)`);
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
  const basePath = `${targetDir}/configs/gh-actions/${baseFileName}`;
  if (!(await file(basePath).exists())) {
    console.log(`⚠️ Skipping ${baseFileName} — base not found (config disabled)`);
    return;
  }
  const base = await file(basePath).text();

  let steps: string;
  if (
    stepsFileName === "ci.steps.yml" ||
    stepsFileName === "release.steps.yml" ||
    stepsFileName === "pages.steps.yml" ||
    stepsFileName === "coverage.steps.yml" ||
    stepsFileName === "dependabot.yml" ||
    stepsFileName === "dependabot-auto-merge.steps.yml"
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
  const rendered = base
    .replace("{{STEPS}}", `${steps}\n`)
    .replace("{{UPDATES}}", `${steps}\n`)
    .replace(/\n{3,}/g, "\n\n");

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

export async function regenerateAll(targetDir: string): Promise<void> {
  await mkdir(`${targetDir}/.github/workflows`, { recursive: true });
  await mkdir(`${targetDir}/.github`, { recursive: true });
  await aggregateWorkflow(targetDir, "ci.base.yml", "ci.steps.yml");
  await aggregateWorkflow(targetDir, "release.base.yml", "release.steps.yml");
  // Only generate pages.yml if pages config is enabled (exists)
  const pagesConfigExists = await file(`${targetDir}/configs/pages/package.json`).exists();
  if (pagesConfigExists) {
    await aggregateWorkflow(targetDir, "pages.base.yml", "pages.steps.yml");
  } else {
    // Ensure no stale pages.yml remains when pages disabled
    const pagesWorkflow = `${targetDir}/.github/workflows/pages.yml`;
    if (await file(pagesWorkflow).exists()) {
      await $`rm -rf ${pagesWorkflow}`.quiet();
      console.log(`🗑️ Removed ${pagesWorkflow} (pages disabled)`);
    }
  }
  // Coverage workflow: standalone coverage Pages when pages disabled, otherwise coverage is included in pages.yml via pages.steps
  const coverageConfigExists = await file(`${targetDir}/configs/coverage/package.json`).exists();
  const pagesExistsForCoverage = pagesConfigExists;
  if (coverageConfigExists) {
    if (!pagesExistsForCoverage) {
      // No pages app — deploy coverage HTML as standalone Pages site
      await aggregateWorkflow(targetDir, "coverage.base.yml", "coverage.steps.yml");
    } else {
      // Pages app exists — coverage is included at /coverage/ via pages.steps.yml
      // Remove stale standalone coverage.yml if it exists (to avoid Pages conflict)
      const coverageWorkflow = `${targetDir}/.github/workflows/coverage.yml`;
      if (await file(coverageWorkflow).exists()) {
        await $`rm -rf ${coverageWorkflow}`.quiet();
        console.log(`🗑️ Removed ${coverageWorkflow} (coverage included in pages.yml)`);
      }
    }
  }
  // Dependabot is always generated (always config), but check existence for safety
  const dependabotConfigExists = await file(
    `${targetDir}/configs/dependabot/package.json`,
  ).exists();
  const ghActionsExists = await file(`${targetDir}/configs/gh-actions/package.json`).exists();
  if (dependabotConfigExists || ghActionsExists) {
    await aggregateWorkflow(targetDir, "dependabot.base.yml", "dependabot.yml");
    await aggregateWorkflow(
      targetDir,
      "dependabot-auto-merge.base.yml",
      "dependabot-auto-merge.steps.yml",
    );
  }
}

const targetDir = process.argv[2] ?? ".";
if (import.meta.main) {
  await regenerateAll(targetDir);
}
