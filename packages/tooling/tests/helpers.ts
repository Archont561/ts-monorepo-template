import { resolve } from "node:path";

/**
 * Absolute path to the monorepo root, resolved from this module's location.
 *
 * Every test file used to spell this as `resolve(import.meta.dir, "../../../..")`
 * and get the depth wrong: tests/ is one level shallower than tests/scaffold/, so
 * the same literal is correct in one and not the other. Deriving it once, from a
 * file at a known depth, removes that class of mistake.
 *
 * Tests are never bundled, so `import.meta.dir` is stable here — unlike runtime
 * code, which must use `pkgRoot()`/`repoRoot()` from src/utils/paths.ts because
 * the bundler moves those files.
 */
export const REPO_ROOT = resolve(import.meta.dir, "../../..");

/** Absolute path to the tooling package itself. */
export const TOOLING_ROOT = resolve(import.meta.dir, "..");
