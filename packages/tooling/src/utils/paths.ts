import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const PKG_NAME = "@myorg/tooling";

/**
 * Memoised `pkgRoot` results, keyed by the directory the walk started from.
 *
 * Twelve module-scope call sites resolve a config asset on import, so without
 * this the same walk runs a dozen times per process. The walk is ~20µs, so this
 * is about doing the work once rather than about speed — but it also means the
 * "not found" diagnostic below can only ever fire once.
 */
const pkgRootCache = new Map<string, string>();

/**
 * Absolute path to this package's root.
 *
 * Found by walking up from `start` to the nearest `package.json` that names
 * `@myorg/tooling`, rather than by counting `..` segments. A fixed `join(dir,
 * "..", "..")` is correct for `src/utils/` but wrong the moment bunup flattens
 * the build to a single `dist/cli.js` — there `../..` lands on `packages/`, not
 * the package root. Anchoring on the manifest makes both layouts work.
 *
 * Throws when no ancestor manifest matches. This used to fall back to `start`
 * "so the failure is a visible path error, not a crash" — but the resulting
 * path error surfaced three layers down as an ENOENT on a config file that
 * looked like it should exist, which is harder to diagnose than naming the
 * real cause here. Verified reachable: `pkgRoot("/tmp/orphan/sub")` over a tree
 * whose manifest is named something else silently returned the start directory.
 */
export function pkgRoot(start: string = import.meta.dir): string {
  const cached = pkgRootCache.get(start);
  if (cached !== undefined) return cached;

  let dir = start;
  while (true) {
    const manifest = join(dir, "package.json");
    if (existsSync(manifest)) {
      try {
        const pkg = JSON.parse(readFileSync(manifest, "utf8")) as { name?: string };
        if (pkg.name === PKG_NAME) {
          pkgRootCache.set(start, dir);
          return dir;
        }
      } catch {
        // Unreadable or malformed manifest — keep walking.
      }
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error(
    `Could not locate the ${PKG_NAME} package root: walked up from ${start} to the ` +
      `filesystem root without finding a package.json named "${PKG_NAME}". ` +
      `This module ships inside that package, so either it was copied out of the ` +
      `package or the package was renamed without updating PKG_NAME in src/utils/paths.ts.`,
  );
}

/** Memoised `repoRoot` results, keyed by the directory the walk started from. */
const repoRootCache = new Map<string, string>();

/**
 * Nearest ancestor directory whose `package.json` declares `workspaces` — the
 * monorepo root. Used by commands that must operate on the whole repo rather
 * than the current working directory.
 *
 * Unlike `pkgRoot` this keeps its fall-through to `start`: it is keyed on the
 * caller's cwd rather than on this file's location, so being invoked from
 * outside a monorepo is a legitimate situation rather than a broken install.
 */
export function repoRoot(start: string = process.cwd()): string {
  const cached = repoRootCache.get(start);
  if (cached !== undefined) return cached;

  let dir = start;
  while (true) {
    const manifest = join(dir, "package.json");
    if (existsSync(manifest)) {
      try {
        const pkg = JSON.parse(readFileSync(manifest, "utf8")) as { workspaces?: unknown };
        if (pkg.workspaces) {
          repoRootCache.set(start, dir);
          return dir;
        }
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
export const TOOLING_RELATIVE = "packages/tooling";

/** The shared config assets, relative to a repo root. */
export const CONFIGS_RELATIVE = `${TOOLING_RELATIVE}/src/configs`;

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
