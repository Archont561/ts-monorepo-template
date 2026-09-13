#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { $, file, write } from "bun";

/**
 * Regenerates the root docs and CI workflows from the config packages.
 *
 * Everything is discovery-driven — there is no central registry:
 *
 * - `AGENTS.md` is built from `configs/AGENT.md` (intro) plus one
 *   `<marker>:<dir>` block per `configs/<dir>/AGENT.md`, in sorted directory
 *   order, using the `AGENT` marker.
 * - `README.md` is built the same way from `configs/README.md` plus
 *   `configs/<dir>/README.md`, using the `PACKAGE` marker.
 * - `.github/workflows/ci.yml` is `configs/gh-actions/ci.base.yml` with the
 *   `{{STEPS}}` placeholder filled from every `configs/<dir>/ci.steps.yml`
 *   (sorted, concatenated).
 * - `.github/workflows/release.yml` is `configs/gh-actions/release.base.yml`
 *   with `{{STEPS}}` filled from `configs/changeset/release.steps.yml`.
 *
 * Once generated, the root files are derived artifacts — edit the config docs
 * and skeletons, then run `bun run docs:sync`.
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
 * the `{{STEPS}}` placeholder. `stepsFileName === "ci.steps.yml"` aggregates
 * every config's fragment; anything else names a single file under
 * `configs/<dir>/`.
 */
export async function aggregateWorkflow(
  targetDir: string,
  baseFileName: string,
  stepsFileName: string,
): Promise<void> {
  const base = await file(`${targetDir}/configs/gh-actions/${baseFileName}`).text();

  let steps: string;
  if (stepsFileName === "ci.steps.yml") {
    const found =
      await $`find ${targetDir}/configs -mindepth 2 -maxdepth 2 -name ${stepsFileName} -type f`.text();
    const fragments = found.trim().split("\n").filter(Boolean).sort();
    steps = (await Promise.all(fragments.map(async (p) => (await file(p).text()).trimEnd()))).join(
      "\n\n",
    );
  } else {
    steps = (await file(`${targetDir}/configs/changeset/${stepsFileName}`).text()).trimEnd();
  }

  const rendered = base.replace("{{STEPS}}", `${steps}\n`).replace(/\n{3,}/g, "\n\n");
  const outputPath = `${targetDir}/.github/workflows/${baseFileName.replace(".base.yml", ".yml")}`;
  await write(outputPath, rendered);
  console.log(`✅ generated ${outputPath}`);
}

export async function regenerateAll(targetDir: string): Promise<void> {
  await aggregateMarkdown(targetDir, "AGENT.md", "AGENTS.md", "AGENT");
  await aggregateMarkdown(targetDir, "README.md", "README.md", "PACKAGE");
  await mkdir(`${targetDir}/.github/workflows`, { recursive: true });
  await aggregateWorkflow(targetDir, "ci.base.yml", "ci.steps.yml");
  await aggregateWorkflow(targetDir, "release.base.yml", "release.steps.yml");
}

const targetDir = process.argv[2] ?? ".";
if (import.meta.main) {
  await regenerateAll(targetDir);
}
