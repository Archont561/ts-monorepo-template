import { APP_FILES, type FeatureFiles } from "./paths";
import type { FeatureProvider } from "./provider";

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

/** Reads the pages and decides whether the UnoCSS page survived. */
export async function hasUnocss(files: FeatureFiles = APP_FILES): Promise<boolean> {
  const [hasUnocssPage, html] = await Promise.all([
    files.app("public/index-unocss.html").exists(),
    files.app("public/index.html").text(),
  ]);
  return unocssPageEnabled(hasUnocssPage, html);
}

/** The UnoCSS config package — deleted by the scaffolder when UnoCSS is declined. */
export async function hasUnoConfig(files: FeatureFiles = APP_FILES): Promise<boolean> {
  try {
    return await files.repo("packages/tooling/src/configs/uno.config.ts").exists();
  } catch {
    return false;
  }
}

/** UnoCSS is served at `/uno.css` whenever the page or the config survived. */
export function unocssProvider(files: FeatureFiles = APP_FILES): FeatureProvider {
  return {
    name: "unocss",
    enabled: async () => (await hasUnocss(files)) || (await hasUnoConfig(files)),
    endpoints: () => ["/uno.css"],
  };
}

/** The provider the app uses. */
export const unocss: FeatureProvider = unocssProvider();
