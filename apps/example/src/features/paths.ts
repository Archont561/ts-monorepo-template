import { file } from "bun";

/**
 * App paths, resolved once.
 *
 * Every path is resolved from *this* module's location, so the app root is two
 * levels up: `public/` is `../../public` from `features/`. Spelling the relative
 * path out per call site is how the lookups drifted — `../../public/...` from
 * `src/` resolved to `apps/public/`, which does not exist, so every lookup
 * silently missed and the feature flags were always reported as off.
 */

/**
 * `apps/example/` — the app root that owns `public/` and `src/`.
 *
 * Exported so nothing else in the app has to spell a `../../` chain to reach it.
 * The `/dist/` branch matters: the built bundle sits one level shallower than
 * the source, so a single relative path is wrong in one of the two.
 */
export const APP_ROOT = new URL(
  import.meta.url.includes("/dist/") ? "../" : "../../",
  import.meta.url,
);

/** Repository root — the monorepo that owns `packages/` and `apps/`. */
export const REPO_ROOT = new URL(
  import.meta.url.includes("/dist/") ? "../../../" : "../../../../",
  import.meta.url,
);

/** A file inside the app, e.g. `appFile("public/index.html")`. */
export function appFile(path: string): ReturnType<typeof file> {
  return file(new URL(path, APP_ROOT));
}

/** A file at the repo root, e.g. `repoFile("packages/tooling/src/configs/biome.json")`. */
export function repoFile(path: string): ReturnType<typeof file> {
  return file(new URL(path, REPO_ROOT));
}

/**
 * Where a feature looks for its files.
 *
 * Injectable so a test can point a provider at a fixture directory instead of
 * this checkout — the failure mode when the real paths are wrong is silence.
 */
export interface FeatureFiles {
  /** A file inside the app. */
  app(path: string): ReturnType<typeof file>;
  /** A file at the repository root. */
  repo(path: string): ReturnType<typeof file>;
}

/** The real app: everything relative to this module. */
export const APP_FILES: FeatureFiles = { app: appFile, repo: repoFile };
