import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Where the Pages artifact is assembled. Every package that declares a `pages`
 * config is copied in here, so the workflow uploads one constant path and the
 * deploy step never needs to know which packages exist.
 */
export const PAGES_STAGING_DIR = ".pages";

export const PAGES_CONCURRENCY_GROUP = "pages";

/** Default directory inside a package when `pages` is `true`. */
export const PAGES_DEFAULT_DIR = "public";

/** Workspace globs scanned for packages that declare a Pages site. */
export const PAGES_WORKSPACE_GLOBS = ["apps/*", "packages/*"];

export type PagesTarget = {
  /** Package name, e.g. `@myorg/example`. */
  name: string;
  /** Package directory, e.g. `apps/example`. */
  dir: string;
  /** Directory that gets published, e.g. `apps/example/public`. */
  outDir: string;
  /**
   * Where it lands on the site: `""` when a single package owns the whole site,
   * otherwise the unscoped package name (`/example/`).
   */
  subpath: string;
};

/**
 * Shape accepted in a package.json:
 *
 * ```json
 * "pages": { "dir": "public" }   // explicit
 * "pages": "public"              // shorthand
 * "pages": true                  // convention: public/
 * ```
 */
export type PagesConfig = string | boolean | { dir?: string } | undefined;

/** Resolves a `pages` field to the directory it publishes (or null). */
export function pagesDir(value: PagesConfig): string | null {
  if (value === undefined || value === false || value === null) return null;
  if (value === true) return PAGES_DEFAULT_DIR;
  if (typeof value === "string") return value || PAGES_DEFAULT_DIR;
  if (typeof value === "object") return value.dir || PAGES_DEFAULT_DIR;
  return null;
}

function readPackage(dir: string): { name?: string; pages?: PagesConfig } | null {
  const path = join(dir, "package.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

/**
 * Discovers every workspace package that declares Pages output in its own
 * package.json. One package owns the site root; several are published under
 * their unscoped name so nothing overwrites anything.
 */
export function discoverPages(root: string = process.cwd()): PagesTarget[] {
  const found: Array<{ name: string; dir: string; outDir: string }> = [];

  for (const glob of PAGES_WORKSPACE_GLOBS) {
    const [base] = glob.split("*");
    const baseDir = join(root, base);
    if (!existsSync(baseDir)) continue;
    for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = `${base}${entry.name}`;
      const pkg = readPackage(join(root, dir));
      if (!pkg?.name) continue;
      const relative = pagesDir(pkg.pages);
      if (!relative) continue;
      found.push({ name: pkg.name, dir, outDir: `${dir}/${relative}` });
    }
  }

  found.sort((a, b) => a.name.localeCompare(b.name));
  const multiple = found.length > 1;
  return found.map((entry) => ({
    ...entry,
    subpath: multiple ? (entry.name.split("/").at(-1) ?? entry.name) : "",
  }));
}

/** Site-relative URL for a target, e.g. `/` or `/example/`. */
export function pagesUrlPath(target: PagesTarget): string {
  return target.subpath ? `/${target.subpath}/` : "/";
}
