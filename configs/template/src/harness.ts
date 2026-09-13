import { cp, rm } from "node:fs/promises";
import { relative } from "node:path";
import { $ } from "bun";

/**
 * Compiles rsync-style include/exclude patterns into a matcher over a
 * forward-slash relative path (no leading slash), covering the subset of
 * rsync semantics the harness relies on:
 *   - patterns without "/"  → match any path segment (basename) anywhere
 *   - patterns with "/"     → match the full relative path, with "*" wildcards
 */
function makeMatcher(patterns: string[]): (rel: string) => boolean {
  const compiled = patterns.map((raw) => {
    const dirOnly = raw.endsWith("/");
    const pattern = dirOnly ? raw.slice(0, -1) : raw;
    return { pattern, anchored: pattern.includes("/") };
  });
  return (rel: string): boolean => {
    if (rel === "") return false;
    const segs = rel.split("/");
    for (const { pattern, anchored } of compiled) {
      if (anchored) {
        if (matchPath(pattern, segs)) return true;
      } else if (segs.includes(pattern)) {
        return true;
      }
    }
    return false;
  };
}

function matchPath(pattern: string, segs: string[]): boolean {
  const pSegs = pattern.split("/");
  if (pSegs.length !== segs.length) return false;
  return pSegs.every((p, i) => matchSegment(p, segs[i]));
}

function matchSegment(pattern: string, seg: string | undefined): boolean {
  if (seg === undefined) return false;
  if (!pattern.includes("*")) return pattern === seg;
  const escaped = pattern
    .split("*")
    .map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return new RegExp(`^${escaped}$`).test(seg);
}

export interface HarnessOptions {
  /** Absolute path to the template repo root (defaults to three levels up from this file). */
  templateRoot?: string;
  /** Additional rsync excludes beyond the defaults. */
  excludes?: string[];
  /**
   * Run `bun install` after copy. Defaults to false: installability is
   * validated by `bun create`'s own install pass in the output, and
   * pre-installing duplicates hundreds of MB per test.
   */
  skipInstall?: boolean;
}

export interface HarnessResult {
  /** Absolute path to the temporary template registry directory. */
  registryDir: string;
  /** Absolute path to the copied template inside the registry. */
  templateDir: string;
  /** Absolute path to the scaffolded output directory. */
  outputDir: string;
  /** Cleanup function — removes both registry and output directories. */
  cleanup: () => Promise<void>;
}

/**
 * Reusable harness for testing the template's `bun create` flow.
 *
 * Uses BUN_CREATE_DIR to point `bun create` at a temporary copy of the
 * template repo, then scaffolds a fresh project from it.
 *
 * Flow:
 *   1. Create temp registry dir (BUN_CREATE_DIR target).
 *   2. Copy template repo into <registry>/<template-name>/.
 *   3. Optionally `bun install` the copy (the committed dist bundle is kept).
 *   4. Return HarnessResult with paths and cleanup fn.
 *   5. Caller runs `bun create` with BUN_CREATE_DIR set.
 *   6. Caller runs assertions on outputDir.
 *   7. Caller invokes cleanup() to remove temp dirs.
 */
export class TemplateHarness {
  static readonly TEMPLATE_NAME = "myorg-monorepo";

  private readonly templateRoot: string;
  private readonly excludes: string[];
  private readonly skipInstall: boolean;

  constructor(options: HarnessOptions = {}) {
    // Assume this file is at configs/template/src/harness.ts
    // so the template root is ../../../
    this.templateRoot = options.templateRoot ?? `${import.meta.dir}/../../..`;
    this.excludes = [
      ".git",
      "node_modules",
      ".turbo",
      "coverage",
      "test-results",
      "playwright-report",
      "apps/*/dist",
      "apps/*/coverage",
      "target",
      ...(options.excludes ?? []),
    ];
    this.skipInstall = options.skipInstall ?? true;
  }

  /**
   * Prepares a temporary template registry and copies the template repo
   * into it. Returns paths and a cleanup function.
   */
  async prepare(): Promise<HarnessResult> {
    const registryDir = (await $`mktemp -d`.quiet().text()).trim();
    const outputDir = (await $`mktemp -d`.quiet().text()).trim();

    const templateDir = `${registryDir}/${TemplateHarness.TEMPLATE_NAME}`;

    // Copy the template repo into the registry, dropping build outputs and VCS
    // metadata. This replaces the previous `rsync` dependency with Bun's native
    // fs.cp (no external binary), keeping the harness portable across every
    // environment. The committed template bundle (configs/template/dist) is
    // explicitly included so it survives even if an exclude would drop it.
    const includePatterns = ["configs/template/dist/", "configs/template/dist/index.js"];
    const isIncluded = makeMatcher(includePatterns);
    const isExcluded = makeMatcher(this.excludes);
    await rm(templateDir, { recursive: true, force: true });
    await cp(this.templateRoot, templateDir, {
      recursive: true,
      force: true,
      filter: (src) => {
        const rel = relative(this.templateRoot, src ?? this.templateRoot);
        return isIncluded(rel) || !isExcluded(rel);
      },
    });

    // Optionally `bun install` the copy to pre-provision a fully installed
    // registry (off by default; used for bundling the registry copy).
    if (!this.skipInstall) {
      const templateShell = $.cwd(templateDir);
      await templateShell`git init -q`.quiet();
      await templateShell`bun install`.quiet();
    }

    // Remove the output dir — `bun create` recreates it fresh.
    await $`rm -rf ${outputDir}`.quiet();

    return {
      registryDir,
      templateDir,
      outputDir,
      cleanup: async () => {
        await $`rm -rf ${registryDir}`.quiet();
        await $`rm -rf ${outputDir}`.quiet();
      },
    };
  }

  /**
   * Runs `bun create <template-name> <output>` with BUN_CREATE_DIR set
   * to the registry directory. This triggers the full bun-create flow:
   * copy, then `bun-create.preinstall` (scaffold), then `bun install`.
   */
  async runBunCreate(result: HarnessResult): Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }> {
    const proc = Bun.spawn({
      cmd: ["bun", "create", TemplateHarness.TEMPLATE_NAME, "--yes", result.outputDir],
      env: {
        ...Bun.env,
        BUN_CREATE_DIR: result.registryDir,
      },
      stdout: "pipe",
      stderr: "pipe",
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    return { exitCode, stdout, stderr };
  }

  /**
   * Full end-to-end: prepare + bun create. Returns the output path and
   * the install result. The caller is responsible for calling cleanup()
   * on the returned result.
   */
  async createProject(): Promise<
    HarnessResult & {
      installResult: Awaited<ReturnType<TemplateHarness["runBunCreate"]>>;
    }
  > {
    const result = await this.prepare();
    const installResult = await this.runBunCreate(result);
    return { ...result, installResult };
  }
}
