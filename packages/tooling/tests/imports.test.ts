import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { $ } from "bun";
import { REPO_ROOT } from "./helpers";

/**
 * Enforces the import rule documented in the root AGENTS.md: `./relative`,
 * `@/path`, or a package name — and nothing else.
 *
 * The `../` form is the one worth a test rather than a review comment. It is
 * silently wrong the moment a file moves one level: the failure is a missed
 * lookup or a wrong file, not a compile error. 73 specifiers across 41 files
 * were migrated to `@/` in one pass; this keeps them migrated.
 *
 * The regexes below match module specifiers only — `from "…"`, `import "…"`,
 * `import("…")`, `require("…")`. Matching any quoted `../…` would be wrong:
 * filesystem paths legitimately use it (`new URL("../../", import.meta.url)`
 * in apps/example/src/features/paths.ts, `Bun.file("../../Cargo.toml")` in the
 * native tests), and rewriting those to `@/` would break them.
 */

// Matches a relative specifier (`./x`, `../x`) or an alias specifier (`@/x`).
// The `@/` alternative must require the slash: `@myorg/external` is a package,
// not an alias, and must not be captured here.
const Q = String.raw`["'](?<spec>(?:\.\.?/|@/)[^"']*)["']`;
const SPECIFIER_PATTERNS = [
  new RegExp(String.raw`\bfrom\s*` + Q, "g"),
  new RegExp(String.raw`\bimport\s*` + Q, "g"),
  new RegExp(String.raw`\bimport\s*\(\s*` + Q, "g"),
  new RegExp(String.raw`\brequire\s*\(\s*` + Q, "g"),
];

/** Every tracked TypeScript file, excluding build output. */
async function trackedTsFiles(): Promise<string[]> {
  // No pathspec: an unquoted `*.ts` would be globbed by the shell against the
  // cwd rather than handed to git as a pattern.
  const out = await $`git ls-files`.cwd(REPO_ROOT).nothrow().quiet();
  return out
    .text()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => /\.(ts|tsx|mts)$/.test(l) && !l.includes("/dist/"));
}

/** The package root for a file: nearest ancestor tsconfig carrying the alias. */
function packageRoot(file: string): string | null {
  let dir = dirname(resolve(REPO_ROOT, file));
  while (true) {
    const tsconfig = join(dir, "tsconfig.json");
    if (existsSync(tsconfig) && readFileSync(tsconfig, "utf8").includes('"@/*"')) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** Every relative or aliased module specifier in a file, with its line number. */
function specifiers(file: string): Array<{ line: number; spec: string }> {
  const found: Array<{ line: number; spec: string }> = [];
  const lines = readFileSync(join(REPO_ROOT, file), "utf8").split("\n");
  lines.forEach((text, i) => {
    for (const pattern of SPECIFIER_PATTERNS) {
      // matchAll clones the regex, so the shared /g patterns keep no state
      // between files the way a reused lastIndex would.
      for (const match of text.matchAll(pattern)) {
        const spec = match.groups?.spec;
        if (spec) found.push({ line: i + 1, spec });
      }
    }
  });
  return found;
}

/** Does `@/x/y` name a real module? Tries the extensions TS resolves. */
function aliasResolves(root: string, spec: string): boolean {
  const rel = spec.slice("@/".length);
  const base = join(root, rel);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.d.ts`,
    `${base}.json`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  return candidates.some((c) => existsSync(c));
}

describe("import forms", () => {
  test("no tracked TypeScript file imports through a ../ chain", async () => {
    const files = await trackedTsFiles();
    expect(files.length).toBeGreaterThan(50);

    const offenders: string[] = [];
    for (const file of files) {
      for (const { line, spec } of specifiers(file)) {
        if (spec.startsWith("../")) offenders.push(`${file}:${line}  ${spec}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  test("every @/ specifier resolves to a file that exists", async () => {
    const files = await trackedTsFiles();
    const unresolved: string[] = [];
    let checked = 0;

    for (const file of files) {
      for (const { line, spec } of specifiers(file)) {
        if (!spec.startsWith("@/")) continue;
        checked += 1;
        const root = packageRoot(file);
        if (!root) {
          unresolved.push(`${file}:${line}  ${spec} — no tsconfig with an @/* alias`);
          continue;
        }
        if (!aliasResolves(root, spec)) {
          unresolved.push(`${file}:${line}  ${spec} — nothing at ${root}/${spec.slice(2)}`);
        }
      }
    }

    // Guards against a vacuous pass if the scan ever stops matching.
    expect(checked).toBeGreaterThan(50);
    expect(unresolved).toEqual([]);
  });

  test("every workspace package declares the @/* alias", async () => {
    const out = await $`git ls-files`.cwd(REPO_ROOT).nothrow().quiet();
    const tsconfigs = out
      .text()
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.endsWith("tsconfig.json") && !l.includes("src/configs"));
    expect(tsconfigs.length).toBeGreaterThan(0);

    const missing = tsconfigs.filter(
      (f) => !readFileSync(join(REPO_ROOT, f), "utf8").includes('"@/*"'),
    );
    expect(missing).toEqual([]);
  });
});
