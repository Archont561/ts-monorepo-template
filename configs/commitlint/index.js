const { existsSync, readdirSync, readFileSync } = require("node:fs");
const { join } = require("node:path");

/**
 * Scopes that are not packages: cross-cutting concerns you cannot point at a
 * single workspace. `config` covers "several configs/* packages at once".
 */
const EXTRA_SCOPES = ["ci", "config", "deps", "release", "repo", "template"];

/** Fallback when the root package.json cannot be read (e.g. run outside root). */
const FALLBACK_SCOPES = ["ci", "config", "deps", "example", "external", "internal", "release"];

/**
 * One scope per workspace package, unscoped: `@myorg/pages` -> `pages`.
 *
 * Derived instead of hardcoded so adding a package never breaks commits — the
 * enum used to be a fixed list that rejected valid scopes for new packages.
 */
function packageScopes() {
  try {
    const root = JSON.parse(readFileSync("package.json", "utf8"));
    const scopes = [];
    for (const pattern of root.workspaces ?? []) {
      const base = pattern.split("*")[0]?.replace(/\/$/, "");
      if (!base || !existsSync(base)) continue;
      for (const entry of readdirSync(base, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        try {
          const pkg = JSON.parse(readFileSync(join(base, entry.name, "package.json"), "utf8"));
          if (pkg.name) scopes.push(pkg.name.replace(/^@[^/]+\//, ""));
        } catch {
          // Not a workspace package (no manifest) — skip it.
        }
      }
    }
    return scopes;
  } catch {
    return [];
  }
}

const scopes = [...new Set([...EXTRA_SCOPES, ...packageScopes(), ...FALLBACK_SCOPES])].sort();

module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", scopes],
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "test", "chore", "ci", "perf"],
    ],
  },
};
