import { describe, expect, test } from "bun:test";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { FEATURES } from "../../src/scaffold/features";
import { resolveSrc } from "../../src/utils/paths";

/**
 * The `ciFiles` declarations in the registry are the aggregator's only map from
 * a feature to the workflow fragments it contributes. They replaced a
 * `find <target>/configs -name '<steps>.yml'` scan, so a wrong or missing entry
 * is no longer self-correcting: the fragment is simply never rendered, and the
 * generated workflow loses those steps with nothing to complain.
 *
 * These assertions are about the `src/ci/` tree itself rather than about
 * `configs/`, so they keep holding after R27 deletes that directory.
 */

const CI_ROOT = resolveSrc("ci");

/** Every `.yml` under `src/ci/`, as paths relative to that root. */
function ciTree(dir: string = CI_ROOT): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...ciTree(full));
    else if (entry.endsWith(".yml")) found.push(relative(CI_ROOT, full));
  }
  return found.sort();
}

/** Forward-slash form, so the comparisons do not depend on the platform. */
const toPosix = (p: string): string => p.split(/[\\/]/).join("/");

/** Every declared fragment, with the feature that declared it. */
function declared(): { feature: string; file: string }[] {
  const out: { feature: string; file: string }[] = [];
  for (const feature of FEATURES) {
    for (const file of feature.ciFiles ?? []) out.push({ feature: feature.dir, file });
  }
  return out;
}

describe("CI fragment registry", () => {
  test("every declared fragment exists under src/ci/", () => {
    const missing = declared()
      .filter(({ file }) => {
        try {
          return !statSync(join(CI_ROOT, file)).isFile();
        } catch {
          return true;
        }
      })
      .map(({ feature, file }) => `${feature} -> ${file}`);
    expect(missing).toEqual([]);
  });

  test("every file under src/ci/ is claimed by some feature", () => {
    // An unclaimed fragment is dead weight that silently stops being rendered
    // the moment something starts selecting by ciFiles instead of scanning.
    const claimed = new Set(declared().map(({ file }) => file));
    const unclaimed = ciTree().filter((file) => !claimed.has(toPosix(file)));
    expect(unclaimed).toEqual([]);
  });

  test("no fragment is claimed by two features", () => {
    // Two owners would mean the same steps rendered twice into one job.
    const seen = new Map<string, string>();
    const conflicts: string[] = [];
    for (const { feature, file } of declared()) {
      const previous = seen.get(file);
      if (previous) conflicts.push(`${file}: ${previous} and ${feature}`);
      else seen.set(file, feature);
    }
    expect(conflicts).toEqual([]);
  });

  test("every fragment fits the naming convention the aggregator dispatches on", () => {
    // The aggregator distinguishes a workflow base from a step contribution by
    // filename, so the convention is load-bearing rather than cosmetic. Four
    // shapes are recognised: a base, a step fragment, a routed section, and the
    // dependabot updates list (which fills {{UPDATES}}, not {{STEPS}}).
    const SHARED = new Set(["ci.bootstrap.yml"]);
    const offenders: string[] = [];
    for (const file of ciTree()) {
      const posix = toPosix(file);
      const base = posix.split("/").pop() ?? "";
      const recognised =
        SHARED.has(posix) ||
        /\.base\.yml$/.test(base) ||
        /\.steps\.yml$/.test(base) ||
        base === "dependabot.yml" ||
        posix.startsWith("sections/");
      if (!recognised) offenders.push(posix);
    }
    expect(offenders).toEqual([]);
  });

  test("every feature that owns a base also contributes its steps", () => {
    // A base with no steps renders a workflow with an empty job. `stale` is the
    // documented exception: its base is a complete standalone workflow.
    const offenders: string[] = [];
    for (const feature of FEATURES) {
      const files = feature.ciFiles ?? [];
      const bases = files.filter((f) => f.endsWith(".base.yml"));
      if (bases.length === 0) continue;
      // Steps arrive either as a `*.steps.yml` fragment spliced into {{STEPS}}
      // or as a `sections/*.yml` chunk routed into a job of ci.yml.
      const hasSteps = files.some((f) => f.endsWith(".steps.yml") || f.startsWith("sections/"));
      // A lone base is a complete standalone workflow (stale.base.yml).
      const isSelfContained = files.length === 1;
      if (!hasSteps && !isSelfContained) offenders.push(feature.dir);
    }
    expect(offenders).toEqual([]);
  });
});
