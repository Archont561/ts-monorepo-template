/**
 * TEMPLATE-ONLY marker handling.
 *
 * Split out of `pipeline.ts` so the workflow generator can strip markers from
 * the fragments it ships without importing the scaffolder — `pipeline.ts`
 * imports `aggregator.ts`, so the dependency has to run the other way.
 * `pipeline.ts` re-exports everything here; the public surface is unchanged.
 */

/**
 * Text files that can carry marker blocks, and the three comment styles they use.
 *
 * The marker line's own indentation is part of each match: leaving it behind
 * glues it onto whatever follows (a kept block gets its first line
 * double-indented, a removed block leaves a whitespace-only line that
 * `biome check` rejects in the scaffolded project).
 */
const MARKER_EXTENSIONS = [".yml", ".yaml", ".ts", ".js", ".md", ".toml", ".html"];

export const MARKER_PATTERNS: readonly RegExp[] = [
  // YAML/TOML/shell
  /[ \t]*#[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,
  // TS/JS
  /[ \t]*\/\/[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*TEMPLATE-ONLY:END\([^)]*\)[^\n]*\n?/g,
  // HTML/MD
  /[ \t]*<!--[ \t]*TEMPLATE-ONLY:START\(([^)]+)\)[ \t]*-->([\s\S]*?)<!--[ \t]*TEMPLATE-ONLY:END\([^)]*\)[ \t]*-->[ \t]*\n?/g,
];

/**
 * Custom declared marker patterns, supporting e.g.:
 * `<!-- unocss:START --> ... <!-- unocss:END -->`
 * `// unocss:START ... // unocss:END`
 * `<!-- UNOCSS:START --> ... <!-- UNOCSS:END -->`
 */
export const CUSTOM_MARKER_PATTERNS: readonly RegExp[] = [
  // YAML/TOML/shell
  /[ \t]*#[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*#[ \t]*\1:END[^\n]*\n?/g,
  // TS/JS
  /[ \t]*\/\/[ \t]*([A-Za-z0-9_!-]+):START[^\n]*\n([\s\S]*?)[ \t]*\/\/[ \t]*\1:END[^\n]*\n?/g,
  // HTML/MD
  /[ \t]*<!--[ \t]*([A-Za-z0-9_!-]+):START[ \t]*-->([\s\S]*?)<!--[ \t]*\1:END[ \t]*-->[ \t]*\n?/g,
];

/**
 * Checks whether a scope is disabled.
 * Supports inverted scopes prefix `!` (e.g. `!unocss` is active when `unocss` is disabled).
 */
export function isScopeDisabled(scope: string, disabledScopes: ReadonlySet<string>): boolean {
  if (scope.startsWith("!")) {
    const base = scope.slice(1).trim();
    return !disabledScopes.has(base) && !disabledScopes.has(base.toLowerCase());
  }
  return disabledScopes.has(scope) || disabledScopes.has(scope.toLowerCase());
}

/** `find` argv for every marker-carrying file under `root`. */
export function markerFindArgs(root: string): string[] {
  // Bun's shell does not word-split interpolated strings, so the find
  // arguments must be spread as an array (one element per word).
  return [
    root,
    "-type",
    "f",
    "(",
    ...MARKER_EXTENSIONS.flatMap((ext, i) => [...(i > 0 ? ["-o"] : []), "-name", `*${ext}`]),
    ")",
    "-not",
    "-path",
    "*/node_modules/*",
    "-not",
    "-path",
    "*/dist/*",
    // The tooling package is the generator, not the project: its `src/ci/`
    // fragments carry TEMPLATE-ONLY markers on purpose, and stripping them here
    // would destroy the inputs a later `m docs` reads. This replaces the old
    // `*/configs/template/*` exclusion — same role, new location (R27).
    "-not",
    "-path",
    "*/packages/tooling/*",
  ];
}

/**
 * Pure marker pass: a block is removed entirely when ALL its scopes are
 * disabled; when any scope is enabled only the marker lines go and the content
 * is preserved. Whitespace left behind by a removal is normalised.
 *
 * Returns whether anything matched, so the caller can skip the write —
 * behaviour the file loop had before this was extracted.
 */
export function stripMarkerBlocks(
  content: string,
  disabledScopes: ReadonlySet<string>,
): { content: string; changed: boolean } {
  let next = content;
  let changed = false;

  for (const regex of MARKER_PATTERNS) {
    next = next.replace(regex, (_match, scopesStr: string, innerContent: string) => {
      const scopes = scopesStr.split(",").map((s) => s.trim());
      changed = true;
      const allDisabled = scopes.every((s) => isScopeDisabled(s, disabledScopes));
      return allDisabled ? "" : innerContent;
    });
  }

  for (const regex of CUSTOM_MARKER_PATTERNS) {
    next = next.replace(regex, (_match, marker: string, innerContent: string) => {
      if (marker.toUpperCase() === "TEMPLATE-ONLY") return _match;
      changed = true;
      const disabled = isScopeDisabled(marker, disabledScopes);
      return disabled ? "" : innerContent;
    });
  }

  if (!changed) return { content, changed };

  return {
    changed,
    content: next
      // Marker lines left over from a removal, e.g. an indented block that
      // was cut out whole.
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      // A block that ended the file leaves a blank tail behind.
      .replace(/\n{2,}$/, "\n"),
  };
}
