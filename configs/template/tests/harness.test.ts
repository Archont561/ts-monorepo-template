import { afterAll, describe, expect, test } from "bun:test";
import { $ } from "bun";
import { TemplateHarness } from "../src/harness";

const completed: string[] = [];

afterAll(async () => {
  await Promise.all(
    completed.map(async (dir) => {
      await $`rm -rf ${dir}`.quiet();
    }),
  );
});

/**
 * Unit tests for the harness's path operations. The rsync copy itself is
 * fast (source only, no node_modules) so these run quickly in the root
 * `bun run test` suite.
 */
describe("TemplateHarness (unit)", () => {
  test("exposes the template name used for bun create", () => {
    expect(TemplateHarness.TEMPLATE_NAME).toBe("myorg-monorepo");
  });

  test("prepare creates a registry dir and pre-removes the output dir", async () => {
    const result = await new TemplateHarness({ skipInstall: true }).prepare();
    completed.push(result.registryDir, result.outputDir);

    expect(await pathExists(result.registryDir)).toBe(true);
    expect(await pathExists(result.outputDir)).toBe(false);
  });

  test("prepare copies the repo into the registry with the template name", async () => {
    const result = await new TemplateHarness({ skipInstall: true }).prepare();
    completed.push(result.registryDir, result.outputDir);

    expect(await pathExists(`${result.templateDir}/package.json`)).toBe(true);
    expect(await pathExists(`${result.templateDir}/README.md`)).toBe(true);
  });

  test("keeps the committed template bundle in the copy", async () => {
    const result = await new TemplateHarness({ skipInstall: true }).prepare();
    completed.push(result.registryDir, result.outputDir);

    // The scaffolder runs from this bundle (bun-create.preinstall), so it
    // must survive the rsync excludes.
    expect(await pathExists(`${result.templateDir}/configs/template/dist/index.js`)).toBe(true);
  });

  test("excludes node_modules and .git by default", async () => {
    const result = await new TemplateHarness({ skipInstall: true }).prepare();
    completed.push(result.registryDir, result.outputDir);

    expect(await pathExists(`${result.templateDir}/node_modules`)).toBe(false);
    expect(await pathExists(`${result.templateDir}/.git`)).toBe(false);
    expect(await pathExists(`${result.templateDir}/.turbo`)).toBe(false);
  });

  test("honors custom excludes", async () => {
    const result = await new TemplateHarness({
      skipInstall: true,
      excludes: ["docs", "README.md"],
    }).prepare();
    completed.push(result.registryDir, result.outputDir);

    expect(await pathExists(`${result.templateDir}/docs`)).toBe(false);
    expect(await pathExists(`${result.templateDir}/README.md`)).toBe(false);
    expect(await pathExists(`${result.templateDir}/package.json`)).toBe(true);
  });

  test("cleanup removes registry and output directories", async () => {
    const result = await new TemplateHarness({ skipInstall: true }).prepare();

    await result.cleanup();

    expect(await pathExists(result.registryDir)).toBe(false);
    expect(await pathExists(result.outputDir)).toBe(false);
  });

  test("cleanup removes output directory contents", async () => {
    const result = await new TemplateHarness({ skipInstall: true }).prepare();

    await $`mkdir -p ${result.outputDir}`.quiet();
    await Bun.write(`${result.outputDir}/marker`, "x");

    await result.cleanup();

    expect(await pathExists(result.outputDir)).toBe(false);
  });

  test("cleanup is idempotent", async () => {
    const result = await new TemplateHarness({ skipInstall: true }).prepare();

    await result.cleanup();
    await result.cleanup();
  });
});

async function pathExists(path: string): Promise<boolean> {
  return (await $`test -e ${path}`.nothrow().quiet()).exitCode === 0;
}
