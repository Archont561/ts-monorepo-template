import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pkgRoot, repoRoot, resolveConfig } from "@/src/utils/paths";
import { TOOLING_ROOT } from "./helpers";

/**
 * `pkgRoot()` is the one piece of path logic that has to survive bunup
 * flattening `src/utils/paths.ts` into `dist/cli.js`, so both layouts are
 * exercised against a synthetic tree rather than only against this checkout —
 * in this checkout only the source layout is ever the live one.
 */

/** A throwaway package tree: `<root>/package.json` plus the given subdirectory. */
function fakePackage(subdir: string): { root: string; start: string } {
  const root = mkdtempSync(join(tmpdir(), "pkgroot-"));
  mkdirSync(join(root, subdir), { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ name: "@myorg/tooling" }));
  return { root, start: join(root, subdir) };
}

describe("pkgRoot", () => {
  test("resolves this package from the source layout", () => {
    expect(pkgRoot()).toBe(TOOLING_ROOT);
    expect(existsSync(join(pkgRoot(), "package.json"))).toBe(true);
  });

  test("resolves from src/utils/ — two levels under the package root", () => {
    const { root, start } = fakePackage("src/utils");
    expect(pkgRoot(start)).toBe(root);
    rmSync(root, { recursive: true, force: true });
  });

  test("resolves from dist/ — one level under, which is why a fixed ../.. is wrong", () => {
    const { root, start } = fakePackage("dist");
    expect(pkgRoot(start)).toBe(root);
    // The regression this guards: counting segments lands on the parent instead.
    expect(join(start, "..", "..")).not.toBe(root);
    rmSync(root, { recursive: true, force: true });
  });

  test("names the cause instead of returning a path that does not exist", () => {
    const root = mkdtempSync(join(tmpdir(), "pkgroot-orphan-"));
    mkdirSync(join(root, "sub"), { recursive: true });
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "some-other-package" }));

    // This used to fall through to `start`, and the failure surfaced much later
    // as an ENOENT on a config file that looked like it ought to be there.
    expect(() => pkgRoot(join(root, "sub"))).toThrow(/Could not locate the @myorg\/tooling/);
    rmSync(root, { recursive: true, force: true });
  });

  test("walks once per start directory, not once per call", () => {
    const { root, start } = fakePackage("dist");
    expect(pkgRoot(start)).toBe(root);

    // Definitive rather than incidental: with the manifest deleted a second
    // walk could not possibly produce the same answer, so a cached one is the
    // only way this still passes.
    rmSync(join(root, "package.json"));
    expect(pkgRoot(start)).toBe(root);
    rmSync(root, { recursive: true, force: true });
  });
});

describe("repoRoot", () => {
  test("finds the monorepo root from this checkout", () => {
    const root = repoRoot(TOOLING_ROOT);
    expect(existsSync(join(root, "bun.lock"))).toBe(true);
    expect(existsSync(join(root, "packages/tooling/package.json"))).toBe(true);
  });

  test("falls back to the start directory outside a monorepo", () => {
    // Unlike pkgRoot this is not an error: repoRoot is keyed on the caller's
    // cwd, and being run outside a workspace is legitimate.
    const root = mkdtempSync(join(tmpdir(), "reporoot-"));
    expect(repoRoot(root)).toBe(root);
    rmSync(root, { recursive: true, force: true });
  });
});

describe("resolveConfig", () => {
  test("every consolidated config asset resolves to a file that exists", () => {
    const assets = [
      "actionlint.yaml",
      "app.json",
      "base.json",
      "biome.json",
      "bunfig.toml",
      "changeset.config.json",
      "commitlint.config.cjs",
      "devcontainer.json",
      "lefthook.base.yml",
      "library.json",
      "turbo.base.json",
    ];
    const missing = assets.filter((name) => !existsSync(resolveConfig(name)));
    expect(missing).toEqual([]);
  });
});
