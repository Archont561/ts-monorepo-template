import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { COVERAGE_THRESHOLD } from "../index.ts";

/**
 * The coverage floor exists twice: as a percent for `mcoverage check` (CI) and as
 * a fraction for `bun test --coverage` (per-package, via the shared bunfig).
 * Nothing keeps them together — this test does, so a change to one that forgets
 * the other fails here instead of drifting silently.
 */

const BUNFIG = join(import.meta.dir, "../../bun-config/bunfig.toml");

/** `coverageThreshold = { lines = 0.80, functions = 0.80 }` → `{ lines: 0.8, … }`. */
function readBunfigThresholds(): Record<string, number> {
  const bunfig = readFileSync(BUNFIG, "utf8");
  const table = bunfig.match(/coverageThreshold\s*=\s*\{([^}]*)\}/);
  expect(table, `no coverageThreshold table in ${BUNFIG}`).not.toBeNull();

  const pairs = [...(table?.[1] ?? "").matchAll(/([A-Za-z]+)\s*=\s*([\d.]+)/g)];
  return Object.fromEntries(pairs.map(([, key, value]) => [key, Number(value)]));
}

describe("coverage threshold", () => {
  test("the bunfig gate mirrors COVERAGE_THRESHOLD", () => {
    const thresholds = readBunfigThresholds();
    expect(Object.keys(thresholds).sort()).toContain("lines");

    // The percent constant and the fraction in the bunfig are the same floor.
    expect(thresholds.lines * 100).toBeCloseTo(COVERAGE_THRESHOLD, 6);
  });

  test("one floor covers lines and functions", () => {
    const thresholds = readBunfigThresholds();
    expect(thresholds.functions).toBeCloseTo(thresholds.lines, 6);
    expect(thresholds.functions * 100).toBeCloseTo(COVERAGE_THRESHOLD, 6);
  });

  test("the floor is a sane percent", () => {
    expect(Number.isInteger(COVERAGE_THRESHOLD)).toBe(true);
    expect(COVERAGE_THRESHOLD).toBeGreaterThan(0);
    expect(COVERAGE_THRESHOLD).toBeLessThanOrEqual(100);
  });
});
