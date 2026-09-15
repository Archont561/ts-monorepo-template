import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { which } from "bun";
import { defineCommand, spawnTool } from "../utils/spawn";
import {
  COVERAGE_HTML,
  COVERAGE_LCOV,
  COVERAGE_RUST_LCOV,
  COVERAGE_THRESHOLD,
} from "./coverage-shared";

// Rendered here; `m pages build` folds it into the Pages artifact (see pages command).
const COVERAGE_HTML_INDEX = `${COVERAGE_HTML}/index.html`;

function has(tool: string): boolean {
  return Boolean(which(tool));
}

export type Totals = { hit: number; found: number; percent: number };

/**
 * Reads LF/LH records straight out of the COVERAGE_LCOV file. The previous shell
 * version shelled out to `lcov --summary | awk | bc`, which made the check
 * fail outright whenever lcov was not installed.
 */
export function totals(path: string = COVERAGE_LCOV): Totals | null {
  if (!existsSync(path)) return null;
  let hit = 0;
  let found = 0;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.startsWith("LF:")) found += Number(line.slice(3));
    else if (line.startsWith("LH:")) hit += Number(line.slice(3));
  }
  if (!found) return null;
  return { hit, found, percent: (hit / found) * 100 };
}

/**
 * Adds up the per-file totals. This is an approximation of `lcov --add-tracefile`
 * — a source file measured in two reports would be counted twice — but the
 * reports cover disjoint workspaces, which is what the merge relies on.
 */
export function sumTotals(paths: string[]): Totals | null {
  let hit = 0;
  let found = 0;
  for (const path of paths) {
    const report = totals(path);
    if (!report) continue;
    hit += report.hit;
    found += report.found;
  }
  if (!found) return null;
  return { hit, found, percent: (hit / found) * 100 };
}

/** The workspace kinds whose per-package reports feed the merged file. */
export const REPORT_DIRS = ["packages", "apps"] as const;

/**
 * `{packages,apps}/*​/coverage/lcov.info`.
 *
 * The pattern is built in one place because both the glob scan and the
 * `lcov-result-merger` command line need exactly the same set.
 *
 * There used to be a third workspace kind (`configs/*`) that could be widened
 * into the pattern with `--include-configs`. R27 deleted it: the shared config
 * assets now live inside `packages/tooling`, which `packages` already covers, so
 * the flag had nothing left to widen and was removed with the directory.
 */
export function coveragePattern(): string {
  return `{${[...REPORT_DIRS].join(",")}}/*/coverage/lcov.info`;
}

/** Every report the merge would consume, sorted for a stable log line. */
export function coverageReports(root = "."): string[] {
  const glob = new Bun.Glob(coveragePattern());
  return Array.from(glob.scanSync({ cwd: root }))
    .filter(Boolean)
    .map((relative) => (root === "." ? relative : `${root}/${relative}`))
    .sort();
}

/** The gate is met when the measured percent reaches the threshold. */
export function meetsThreshold(percent: number, threshold: number): boolean {
  return percent >= threshold;
}

/**
 * Formats a delta with an explicit sign: `+2.05`, `-10.00`. A hardcoded `+`
 * prefix rendered a drop as `+-10.00` — and the report-only dry run exists to
 * show drops, so the sign has to be computed, not assumed.
 */
export function formatSigned(value: number, digits: number): string {
  return `${value < 0 ? "-" : "+"}${Math.abs(value).toFixed(digits)}`;
}

/** A workspace package that can produce a coverage report. */
export type CoveragePackage = {
  /** Unscoped package name — slug-safe for Codecov component ids. */
  name: string;
  /** Workspace-relative directory, e.g. `packages/internal`. */
  dir: string;
};

/**
 * Every workspace package that runs tests (a `test` or `coverage` script),
 * from the same roots the merge reads. `codecov.yml` is generated from this
 * list, so its components always match the packages that actually exist —
 * including after scaffolding prunes or the user adds one.
 */
export function coveragePackages(root = "."): CoveragePackage[] {
  const found: CoveragePackage[] = [];
  for (const base of [...REPORT_DIRS]) {
    const baseDir = join(root, base);
    if (!existsSync(baseDir)) continue;
    for (const entry of readdirSync(baseDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const pkgPath = join(baseDir, entry.name, "package.json");
      if (!existsSync(pkgPath)) continue;
      let pkg: { name?: string; scripts?: Record<string, string> };
      try {
        pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      } catch {
        continue;
      }
      if (!pkg.name || !(pkg.scripts?.test || pkg.scripts?.coverage)) continue;
      found.push({ name: pkg.name.replace(/^@[^/]+\//, ""), dir: `${base}/${entry.name}` });
    }
  }
  return found.sort((a, b) => a.dir.localeCompare(b.dir));
}

/**
 * The root `codecov.yml`, rendered from the discovered packages.
 *
 * One merged upload (no flags) feeds both the project total and the
 * per-package components — components are defined entirely here and need no
 * upload-time tagging, which is what keeps CI free of per-package upload
 * steps that would drift whenever the workspace changes. `flag_management`
 * stays configured so per-package flagged uploads can be added later without
 * touching this file.
 */
export function renderCodecovYaml(packages: CoveragePackage[], threshold: number): string {
  const lines = [
    "# Generated by `m coverage sync` (packages/tooling) — do not edit.",
    "# Refreshed on every `bun install` (prepare) and by `bun run docs:sync`.",
    "codecov:",
    "  require_ci_to_pass: true",
    "  notify:",
    "    wait_for_ci: true",
    "",
    "coverage:",
    "  precision: 2",
    "  round: down",
    '  range: "70...100"',
    "  status:",
    "    # Overall monorepo gate — mirrors COVERAGE_THRESHOLD.",
    "    project:",
    "      default:",
    `        target: ${threshold}%`,
    "        threshold: 1%",
    "    # Patch coverage on PRs.",
    "    patch:",
    "      default:",
    `        target: ${threshold}%`,
    "        threshold: 5%",
    "",
    "flag_management:",
    "  default_rules:",
    "    carryforward: true",
    "    statuses:",
    "      - type: project",
    `        target: ${threshold}%`,
    "        threshold: 1%",
    "",
    "component_management:",
    "  default_rules:",
    "    statuses:",
    "      - type: project",
    `        target: ${threshold}%`,
    "        threshold: 2%",
    "  individual_components:",
  ];
  for (const pkg of packages) {
    lines.push(
      `    - component_id: ${pkg.name}`,
      `      name: ${pkg.dir}`,
      "      paths:",
      `        - "${pkg.dir}/**"`,
    );
  }
  lines.push(
    "",
    "comment:",
    '  layout: "reach,diff,flags,components,tree"',
    "  behavior: default",
    "  require_changes: true",
    "  show_carryforward_flags: true",
    "",
  );
  return lines.join("\n");
}

/** One row of the step-summary table: a package and its report totals. */
export type SummaryRow = { dir: string; totals: Totals | null };

/**
 * The `$GITHUB_STEP_SUMMARY` table: one row per package report plus the
 * merged total. Rendered by `m coverage summary --markdown`.
 */
export function renderSummaryMarkdown(rows: SummaryRow[], merged: Totals | null): string {
  const pct = (t: Totals | null) => (t ? `${t.percent.toFixed(2)}% (${t.hit}/${t.found})` : "—");
  return [
    "## 📊 Coverage Summary",
    "",
    "| Package | Lines |",
    "|---------|-------|",
    ...rows.map((row) => `| \`${row.dir}\` | ${pct(row.totals)} |`),
    ...(merged ? [`| **merged** | **${pct(merged)}** |`] : []),
    "",
  ].join("\n");
}

/** Installs lcov (which ships genhtml) if it is missing. Never fails the job. */
function installTools(): void {
  if (has("lcov") && has("genhtml")) {
    console.log("✅ lcov already installed");
    return;
  }
  let code = 1;
  if (process.platform === "darwin") {
    code = spawnTool(["brew", "install", "lcov"]);
  } else {
    const apt = has("sudo") ? ["sudo", "apt-get"] : ["apt-get"];
    code = spawnTool([...apt, "update"]) === 0 ? spawnTool([...apt, "install", "-y", "lcov"]) : 1;
  }
  if (code === 0) {
    console.log("✅ lcov installed");
  } else {
    console.warn(
      "⚠️ lcov install failed — HTML reports will be skipped (threshold check still runs)",
    );
  }
}

function generateHtml(outDir: string = COVERAGE_HTML): void {
  if (!existsSync(COVERAGE_LCOV)) {
    console.warn(`⚠️ ${COVERAGE_LCOV} not found — skipping HTML report`);
    return;
  }
  if (!has("genhtml")) {
    console.warn("⚠️ genhtml not found — run `m coverage setup` first (HTML report skipped)");
    return;
  }
  mkdirSync(outDir, { recursive: true });
  const code = spawnTool([
    "genhtml",
    COVERAGE_LCOV,
    "--output-directory",
    outDir,
    "--title",
    "Coverage Report",
    "--show-details",
    "--highlight",
    "--legend",
  ]);
  if (code === 0) {
    console.log(`\n✅ HTML report: ${outDir}/index.html`);
  }
  process.exit(code);
}

const setupCommand = defineCommand({
  meta: {
    name: "setup",
    description: "Install lcov/genhtml if missing (apt-get on Linux, brew on macOS)",
  },
  run() {
    installTools();
    process.exit(0);
  },
});

const htmlCommand = defineCommand({
  meta: {
    name: "html",
    description: "Generate HTML report via genhtml from coverage/lcov.info",
  },
  args: {
    out: {
      type: "string",
      description: `Output directory (default: ${COVERAGE_HTML})`,
      default: COVERAGE_HTML,
    },
  },
  run({ args }) {
    generateHtml((args.out as string) || COVERAGE_HTML);
    process.exit(0);
  },
});

const checkCommand = defineCommand({
  meta: {
    name: "check",
    description: `Check coverage threshold (default ${COVERAGE_THRESHOLD}%) against coverage/lcov.info`,
  },
  args: {
    // The default comes from COVERAGE_THRESHOLD so the CLI and CI enforce the
    // same number; hardcoding it here made the constant decorative.
    threshold: {
      type: "string",
      description: "Threshold percent",
      default: String(COVERAGE_THRESHOLD),
    },
  },
  run({ args }) {
    const result = totals();
    if (!result) {
      console.warn(`⚠️ ${COVERAGE_LCOV} not found or has no line data — skipping threshold check`);
      return;
    }
    const threshold = Number((args.threshold as string) ?? COVERAGE_THRESHOLD);
    const percent = result.percent;
    console.log(
      `Line coverage: ${percent.toFixed(2)}% (${result.hit}/${result.found} lines) — threshold ${threshold}%`,
    );
    if (!meetsThreshold(percent, threshold)) {
      console.error(`::error::Coverage ${percent.toFixed(2)}% is below ${threshold}% threshold`);
      process.exit(1);
    }
    console.log(`✅ Coverage ${percent.toFixed(2)}% meets threshold`);
    process.exit(0);
  },
});

const collectCommand = defineCommand({
  meta: {
    name: "collect",
    description:
      "Collect JS coverage (bun run coverage) + Rust coverage (m native llvm-cov), then merge",
  },
  run() {
    spawnTool(["bun", "run", "coverage"]);

    const hasNative = existsSync("packages/native/Cargo.toml");
    if (!hasNative || !has("cargo-llvm-cov")) {
      console.warn("⚠️ cargo-llvm-cov not installed — skipping Rust coverage");
      process.exit(0);
    }

    console.log("🦀 Collecting Rust coverage via m native llvm-cov");
    spawnTool(["m native", "llvm-cov", "--lcov", "--output-path", `../../${COVERAGE_RUST_LCOV}`]);
    if (!existsSync(COVERAGE_RUST_LCOV)) {
      process.exit(0);
    }

    if (!existsSync(COVERAGE_LCOV)) {
      renameSync(COVERAGE_RUST_LCOV, COVERAGE_LCOV);
      process.exit(0);
    }
    if (has("lcov")) {
      const merged = "coverage/merged.lcov";
      const code = spawnTool([
        "lcov",
        "--add-tracefile",
        COVERAGE_LCOV,
        "--add-tracefile",
        COVERAGE_RUST_LCOV,
        "--output-file",
        merged,
      ]);
      if (code === 0) {
        renameSync(merged, COVERAGE_LCOV);
        console.log("✅ Merged Rust + JS coverage");
        process.exit(0);
      }
    }
    console.warn(`⚠️ lcov not available — Rust coverage kept at ${COVERAGE_RUST_LCOV}`);
  },
});

const pagesCommand = defineCommand({
  meta: {
    name: "pages",
    description: "Publish the HTML report into the Pages artifact dir (served at /coverage/)",
  },
  async run() {
    if (!existsSync(COVERAGE_LCOV)) {
      console.log("ℹ️ No coverage data — collecting first");
      spawnTool(["bun", "run", "coverage"]);
    }
    if (!existsSync(COVERAGE_LCOV)) {
      console.warn("⚠️ Still no coverage/lcov.info — skipping Pages coverage");
      process.exit(0);
    }

    installTools();
    generateHtml();
    if (!existsSync(COVERAGE_HTML_INDEX)) {
      console.warn(`⚠️ No HTML report at ${COVERAGE_HTML} — skipping Pages coverage`);
      process.exit(0);
    }

    console.log(
      `✅ Coverage HTML ready at ${COVERAGE_HTML}/ — \`m pages build\` folds it into the Pages artifact (served at /coverage/)`,
    );
    process.exit(0);
  },
});

const mergeCommand = defineCommand({
  meta: {
    name: "merge",
    description: "Merge per-package lcov.info reports into coverage/lcov.info",
  },
  args: {
    output: {
      type: "string",
      description: "Merged output file (default: coverage/lcov.info)",
      default: COVERAGE_LCOV,
    },
    reportOnly: {
      type: "boolean",
      description: "Print the merged totals and the delta, write nothing",
      default: false,
    },
  },
  run({ args }) {
    const files = coverageReports(".");
    if (files.length === 0) {
      console.warn("No per-package lcov.info found — nothing to merge");
      process.exit(0);
    }

    const output = (args.output as string) || COVERAGE_LCOV;
    if (args.reportOnly) {
      const totals = sumTotals(files);
      const formatted = totals
        ? `${totals.percent.toFixed(2)}% (${totals.hit}/${totals.found} lines)`
        : "no data";
      console.log("Report-only: the merge would measure");
      console.log(`  ${files.length} report(s) → ${formatted}`);
      process.exit(0);
    }

    mkdirSync(dirname(output), { recursive: true });
    console.log(`Merging ${files.length} report(s) → ${output}`);

    // lcov-result-merger first: it is a JS package, so merging works on a plain
    // `bun install` with no lcov binary (CI installs one, laptops often do not).
    let merger: string | null = null;
    try {
      merger = Bun.fileURLToPath(
        import.meta.resolve("lcov-result-merger/bin/lcov-result-merger.js"),
      );
    } catch {
      merger = null;
    }
    if (merger) {
      const code = spawnTool(["bun", merger, coveragePattern(), output, "--prepend-source-files"]);
      if (code === 0) {
        console.log(`✅ Merged: ${output}`);
        process.exit(0);
      }
      console.warn("⚠️ lcov-result-merger failed — falling back to lcov --add-tracefile");
    }

    if (!has("lcov")) {
      console.error("❌ lcov not found — run `m coverage setup` first");
      process.exit(1);
    }
    const merged = "coverage/merged.lcov";
    const addArgs = files.flatMap((f) => ["--add-tracefile", f]).concat(["--output-file", merged]);
    if (spawnTool(["lcov", ...addArgs]) !== 0) {
      console.error("❌ Coverage merge failed");
      process.exit(1);
    }
    renameSync(merged, output);
    console.log(`✅ Merged: ${output}`);
    process.exit(0);
  },
});

const summaryCommand = defineCommand({
  meta: {
    name: "summary",
    description: "Show coverage summary (--json for scripts, --markdown for step summaries)",
  },
  args: {
    json: { type: "boolean", description: "Print JSON instead of a human-readable line" },
    markdown: {
      type: "boolean",
      description: "Print a per-package markdown table (for $GITHUB_STEP_SUMMARY)",
    },
  },
  run({ args }) {
    const result = totals();
    if (args.markdown) {
      // One row per package report, then the merged total — the same set the
      // merge consumes, so the table and the gate can never disagree.
      const rows = coverageReports(".").map((report) => ({
        dir: report.replace(/\/coverage\/lcov\.info$/, ""),
        totals: totals(report),
      }));
      console.log(renderSummaryMarkdown(rows, result));
      process.exit(0);
    }
    if (args.json) {
      // Always parse the COVERAGE_LCOV ourselves: --json is consumed by scripts and the
      // docs data loader, so it must not depend on lcov being installed.
      console.log(
        JSON.stringify({
          source: COVERAGE_LCOV,
          available: Boolean(result),
          lines: {
            hit: result?.hit ?? 0,
            found: result?.found ?? 0,
            percent: result ? Number(result.percent.toFixed(2)) : 0,
          },
        }),
      );
      process.exit(0);
    }
    if (has("lcov") && existsSync(COVERAGE_LCOV)) {
      process.exit(spawnTool(["lcov", "--summary", COVERAGE_LCOV]));
    }
    if (!result) {
      console.warn(`⚠️ ${COVERAGE_LCOV} not found`);
      process.exit(0);
    }
    console.log(`lines: ${result.percent.toFixed(1)}% (${result.hit}/${result.found})`);
    process.exit(0);
  },
});

const syncCommand = defineCommand({
  meta: {
    name: "sync",
    description: "Regenerate the root codecov.yml from the workspace package list",
  },
  args: {
    output: {
      type: "string",
      description: "Output file (default: codecov.yml)",
      default: "codecov.yml",
    },
  },
  run({ args }) {
    const output = (args.output as string) || "codecov.yml";
    const packages = coveragePackages(".");
    writeFileSync(output, renderCodecovYaml(packages, COVERAGE_THRESHOLD));
    console.log(
      `✅ ${output} — ${packages.length} component(s): ${packages.map((p) => p.dir).join(", ")}`,
    );
    process.exit(0);
  },
});

const main = defineCommand({
  meta: {
    name: "m coverage",
    version: "1.0.0",
    description:
      "Coverage reporting — collect, merge, HTML, threshold check, Codecov, Pages publishing",
  },
  subCommands: {
    setup: setupCommand,
    collect: collectCommand,
    html: htmlCommand,
    check: checkCommand,
    pages: pagesCommand,
    merge: mergeCommand,
    summary: summaryCommand,
    sync: syncCommand,
  },
  run() {
    console.log(`
m coverage — COVERAGE_LCOV coverage reporting

Usage:
  m coverage <command>

Commands:
  setup              Install lcov/genhtml if missing
  collect            Collect JS + Rust coverage and merge them
  html [--out DIR]   genhtml coverage/lcov.info → DIR (default coverage/html/)
  check [--threshold 80]  Fail if line coverage is below the threshold
  pages              Publish coverage/html into the Pages artifact dir
  merge              Merge {packages,apps}/*/coverage/lcov.info via lcov
  summary [--json|--markdown]   Print a coverage summary (--json for scripts/docs, --markdown for step summaries)
  sync [--output FILE]   Regenerate the root codecov.yml from the package list

Examples:
  m coverage setup && m coverage check --threshold 90
  m coverage collect && m coverage html
`);
  },
});

export default main;
