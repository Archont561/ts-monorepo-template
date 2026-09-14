import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  coveragePattern,
  coverageReports,
  formatSigned,
  meetsThreshold,
  sumTotals,
  totals,
} from "../src/cli.ts";

/**
 * The coverage tool is what enforces the floor, so its parsing and its file
 * discovery are pinned here rather than trusted: both are the kind of code that
 * fails silently (a missing report reads as "nothing to check").
 */

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function makeTree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "coverage-fixture-"));
  roots.push(root);
  for (const [relative, contents] of Object.entries(files)) {
    const path = join(root, relative);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
  }
  return root;
}

/** Minimal but well-formed lcov records: LF = lines found, LH = lines hit. */
const lcov = (hit: number, found: number): string =>
  `SF:${join(tmpdir(), "src/index.ts")}\nDA:1,1\nLF:${found}\nLH:${hit}\nend_of_record\n`;

describe("lcov totals", () => {
  test("adds up every LF/LH record in the file", () => {
    const root = makeTree({
      "coverage/lcov.info": lcov(8, 10) + lcov(2, 1),
    });

    const result = totals(join(root, "coverage/lcov.info"));
    expect(result?.hit).toBe(10);
    expect(result?.found).toBe(11);
    expect(result?.percent).toBeCloseTo((10 / 11) * 100, 6);
  });

  test("a missing report is null, not zero", () => {
    const root = makeTree({});
    expect(totals(join(root, "coverage/lcov.info"))).toBeNull();
  });

  test("a report with no line data is null", () => {
    const root = makeTree({ "coverage/lcov.info": "SF:src/index.ts\nend_of_record\n" });
    expect(totals(join(root, "coverage/lcov.info"))).toBeNull();
  });

  test("sumTotals merges the per-report counts", () => {
    const root = makeTree({
      "app/coverage/lcov.info": lcov(9, 10),
      "configs/example-config/coverage/lcov.info": lcov(50, 50),
    });

    const merged = sumTotals([
      join(root, "app/coverage/lcov.info"),
      join(root, "configs/example-config/coverage/lcov.info"),
    ]);
    expect(merged?.hit).toBe(59);
    expect(merged?.found).toBe(60);
    expect(sumTotals([])).toBeNull();
  });

  test("the threshold is reached at equality, missed below", () => {
    expect(meetsThreshold(80, 80)).toBe(true);
    expect(meetsThreshold(79.99, 80)).toBe(false);
  });
});

describe("report discovery", () => {
  test("the pattern names the workspaces the gate reads", () => {
    expect(coveragePattern()).toBe("{packages,apps}/*/coverage/lcov.info");
    expect(coveragePattern(true)).toBe("{packages,apps,configs}/*/coverage/lcov.info");
  });

  test("packages and apps are picked up, configs only when asked", () => {
    const root = makeTree({
      "packages/internal/coverage/lcov.info": lcov(1, 2),
      "apps/example/coverage/lcov.info": lcov(1, 2),
      "configs/example-config/coverage/lcov.info": lcov(1, 2),
      "configs/other-config/coverage/lcov.info": lcov(1, 2),
    });

    const narrow = coverageReports(root);
    expect(narrow).toEqual([
      join(root, "apps/example/coverage/lcov.info"),
      join(root, "packages/internal/coverage/lcov.info"),
    ]);

    const wide = coverageReports(root, true);
    expect(wide).toHaveLength(4);
    expect(wide.filter((path) => path.includes("/configs/"))).toHaveLength(2);
    // The wide set is a superset — widening can only add lines to the gate.
    expect(wide).toEqual(expect.arrayContaining(narrow));
  });

  test("a workspace without a report is not invented", () => {
    const root = makeTree({ "packages/internal/package.json": "{}\n" });
    expect(coverageReports(root)).toEqual([]);
    expect(coverageReports(root, true)).toEqual([]);
  });
});

describe("report-only delta formatting", () => {
  test("a positive delta keeps its explicit plus", () => {
    expect(formatSigned(2.05, 2)).toBe("+2.05");
    expect(formatSigned(844, 0)).toBe("+844");
  });

  test("a zero delta reads as plus zero, not a drop", () => {
    expect(formatSigned(0, 2)).toBe("+0.00");
    expect(formatSigned(0, 0)).toBe("+0");
  });

  test("a drop is signed once, never rendered as +-", () => {
    // The dry run exists to show that widening the gate can hide a drop, so a
    // negative delta must print as `-10.00`, not `+-10.00`.
    expect(formatSigned(-10, 2)).toBe("-10.00");
    expect(formatSigned(-100, 0)).toBe("-100");
  });
});
