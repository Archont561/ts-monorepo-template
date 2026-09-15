import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const PKG_NAME = "@myorg/tooling";

/**
 * Absolute path to this package's root.
 *
 * Found by walking up from `start` to the nearest `package.json` that names
 * `@myorg/tooling`, rather than by counting `..` segments. A fixed `join(dir,
 * "..", "..")` is correct for `src/utils/` but wrong the moment bunup flattens
 * the build to a single `dist/cli.js` — there `../..` lands on `packages/`, not
 * the package root. Anchoring on the manifest makes both layouts work.
 */
export function pkgRoot(start: string = import.meta.dir): string {
  let dir = start;
  while (true) {
    const manifest = join(dir, "package.json");
    if (existsSync(manifest)) {
      try {
        const pkg = JSON.parse(readFileSync(manifest, "utf8")) as { name?: string };
        if (pkg.name === PKG_NAME) return dir;
      } catch {
        // Unreadable or malformed manifest — keep walking.
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Should be unreachable: this file ships inside the package. Fall back to the
  // caller's directory so the failure is a visible path error, not a crash.
  return start;
}

/**
 * Nearest ancestor directory whose `package.json` declares `workspaces` — the
 * monorepo root. Used by commands that must operate on the whole repo rather
 * than the current working directory.
 */
export function repoRoot(start: string = process.cwd()): string {
  let dir = start;
  while (true) {
    const manifest = join(dir, "package.json");
    if (existsSync(manifest)) {
      try {
        const pkg = JSON.parse(readFileSync(manifest, "utf8")) as { workspaces?: unknown };
        if (pkg.workspaces) return dir;
      } catch {
        // Unreadable or malformed manifest — keep walking.
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return start;
    dir = parent;
  }
}

/**
 * Where the consolidated config assets live inside a repository, relative to
 * its root — the same directory `configDir()` resolves to, spelled as a path.
 *
 * Setup scripts need this because they run against a *target* repository rather
 * than against this package: they are spawned from the template's copy of
 * tooling with `cwd` set to the project being scaffolded, so `pkgRoot()` would
 * resolve to the wrong tree.
 */
export const CONFIGS_RELATIVE = "packages/tooling/src/configs";

/** Directory holding the consolidated config assets. */
export function configDir(): string {
  return join(pkgRoot(), "src", "configs");
}

/**
 * Absolute path to a consolidated config asset, e.g.
 * `resolveConfig("turbo.base.json")` → `<pkg>/src/configs/turbo.base.json`.
 *
 * Replaces the `import.meta.dir`-relative paths the per-config CLIs used
 * (`${import.meta.dir}/../turbo.base.json`), which no longer resolve now that
 * every asset lives in one shared directory.
 */
export function resolveConfig(filename: string): string {
  return join(configDir(), filename);
}

/**
 * Absolute path to any file under this package's `src/` tree, e.g.
 * `resolveSrc("ci", "ci.base.yml")` → `<pkg>/src/ci/ci.base.yml`.
 */
export function resolveSrc(...segments: string[]): string {
  return join(pkgRoot(), "src", ...segments);
}

/**
 * Directory of the curated skill files that `m skills sync` installs. Mirrors
 * `${import.meta.dir}/../skills` in the original `m skills`.
 */
export function curatedSkillsDir(): string {
  return join(pkgRoot(), "skills");
}
