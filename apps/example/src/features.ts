import { file } from "bun";

/**
 * App paths and opt-in feature detection.
 *
 * Every path is resolved from *this* module's location (`src/`), so the app root
 * is one level up: `public/` is `../public` from here. Spelling the relative
 * path out per call site is how the lookups drifted — `../../public/...` from
 * `src/` resolves to `apps/public/`, which does not exist, so every UnoCSS
 * lookup silently missed and `/uno.css` always served the "not built" fallback.
 *
 * Features are detected at runtime by file existence: the scaffolder deletes the
 * files of a config that was declined, so nothing has to be rebuilt or flagged.
 * The decisions themselves are pure functions, so both the "setup already ran"
 * and the "not yet" case stay testable regardless of which files are on disk.
 */

/** `apps/example/` — the app root that owns `public/` and `src/`. */
const APP_ROOT = new URL("../", import.meta.url);

/** Repository root — the monorepo that owns `configs/`. */
const REPO_ROOT = new URL("../../../", import.meta.url);

/** A file inside the app, e.g. `appFile("public/uno.css")`. */
export function appFile(path: string): ReturnType<typeof file> {
  return file(new URL(path, APP_ROOT));
}

/** A file at the repo root, e.g. `repoFile("configs/unocss/uno.config.ts")`. */
export function repoFile(path: string): ReturnType<typeof file> {
  return file(new URL(path, REPO_ROOT));
}

/** True when the HTML carries the utility-class page (plain and UnoCSS both ship). */
export function htmlHasUnocss(html: string): boolean {
  return html.includes("unocss") || html.includes("UnoCSS");
}

/**
 * UnoCSS is on when either page survives: `index-unocss.html` before the setup
 * script swaps it in, or `index.html` already carrying the utility-class version.
 */
export function unocssPageEnabled(hasUnocssPage: boolean, html: string): boolean {
  return hasUnocssPage || htmlHasUnocss(html);
}

/** Reads the pages and decides whether UnoCSS is enabled for this checkout. */
export async function hasUnocss(): Promise<boolean> {
  const [hasUnocssPage, html] = await Promise.all([
    appFile("public/index-unocss.html").exists(),
    appFile("public/index.html").text(),
  ]);
  return unocssPageEnabled(hasUnocssPage, html);
}

/** The UnoCSS config package — deleted by the scaffolder when UnoCSS is declined. */
export async function hasUnoConfig(): Promise<boolean> {
  try {
    return await repoFile("configs/unocss/uno.config.ts").exists();
  } catch {
    return false;
  }
}

/** Native bindings are available while the native routes exist. */
export async function hasNative(): Promise<boolean> {
  try {
    return await appFile("src/pages/api/native/index.ts").exists();
  } catch {
    return false;
  }
}

/** What this checkout can serve — reported by `/api` and logged at boot. */
export interface FeatureFlags {
  /** `munocss build` output is served at `/uno.css`. */
  unocss: boolean;
  /** The native routes are present. */
  native: boolean;
}

/**
 * Both flags in one call. The API index imports only this, so the native
 * half can be stripped by the scaffolder without leaving an unused import.
 */
export async function detectFeatures(): Promise<FeatureFlags> {
  const [unocssPage, native] = await Promise.all([hasUnocss(), hasNative()]);
  return { unocss: unocssPage || (await hasUnoConfig()), native };
}
