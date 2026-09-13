#!/usr/bin/env bun
import { existsSync, mkdirSync, readFileSync, renameSync } from "node:fs";
import { cp } from "node:fs/promises";
import { spawnSync, which } from "bun";
import { defineCommand, runMain } from "citty";

const LCOV = "coverage/lcov.info";
const RUST_LCOV = "coverage/rust-lcov.info";
const HTML_DIR = "coverage/html";
const PAGES_DIR = "apps/example/public/coverage";

function run(cmd: string[], opts: { cwd?: string } = {}): number {
  const result = spawnSync({
    cmd,
    cwd: opts.cwd,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  return result.exitCode;
}

function has(tool: string): boolean {
  return Boolean(which(tool));
}

type Totals = { hit: number; found: number; percent: number };

/**
 * Reads LF/LH records straight out of the LCOV file. The previous shell
 * version shelled out to `lcov --summary | awk | bc`, which made the check
 * fail outright whenever lcov was not installed.
 */
function totals(path: string = LCOV): Totals | null {
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

/** Installs lcov (which ships genhtml) if it is missing. Never fails the job. */
function installTools(): void {
  if (has("lcov") && has("genhtml")) {
    console.log("✅ lcov already installed");
    return;
  }
  let code = 1;
  if (process.platform === "darwin") {
    code = run(["brew", "install", "lcov"]);
  } else {
    const apt = has("sudo") ? ["sudo", "apt-get"] : ["apt-get"];
    code = run([...apt, "update"]) === 0 ? run([...apt, "install", "-y", "lcov"]) : 1;
  }
  if (code === 0) {
    console.log("✅ lcov installed");
  } else {
    console.warn("⚠️ lcov install failed — HTML reports will be skipped (threshold check still runs)");
  }
}

function generateHtml(): void {
  if (!existsSync(LCOV)) {
    console.warn(`⚠️ ${LCOV} not found — skipping HTML report`);
    return;
  }
  if (!has("genhtml")) {
    console.warn("⚠️ genhtml not found — run `mcoverage setup` first (HTML report skipped)");
    return;
  }
  const code = run([
    "genhtml",
    LCOV,
    "--output-directory",
    HTML_DIR,
    "--title",
    "Coverage Report",
    "--show-details",
    "--highlight",
    "--legend",
  ]);
  if (code === 0) {
    console.log(`\n✅ HTML report: ${HTML_DIR}/index.html`);
  }
  process.exit(code);
}

const setupCommand = defineCommand({
  meta: { name: "setup", description: "Install lcov/genhtml if missing (apt-get on Linux, brew on macOS)" },
  run() {
    installTools();
    process.exit(0);
  },
});

const htmlCommand = defineCommand({
  meta: { name: "html", description: "Generate HTML report via genhtml from coverage/lcov.info" },
  run() {
    generateHtml();
    process.exit(0);
  },
});

const checkCommand = defineCommand({
  meta: { name: "check", description: "Check coverage threshold (default 80%) against coverage/lcov.info" },
  args: {
    threshold: { type: "string", description: "Threshold percent", default: "80" },
  },
  run({ args }) {
    const result = totals();
    if (!result) {
      console.warn(`⚠️ ${LCOV} not found or has no line data — skipping threshold check`);
      return;
    }
    const threshold = Number((args.threshold as string) ?? "80");
    const percent = Number(result.percent.toFixed(2));
    console.log(`Line coverage: ${percent}% (${result.hit}/${result.found} lines) — threshold ${threshold}%`);
    if (percent < threshold) {
      console.error(`::error::Coverage ${percent}% is below ${threshold}% threshold`);
      process.exit(1);
    }
    console.log(`✅ Coverage ${percent}% meets threshold`);
    process.exit(0);
  },
});

const collectCommand = defineCommand({
  meta: {
    name: "collect",
    description: "Collect JS coverage (bun run coverage) + Rust coverage (mnative llvm-cov), then merge",
  },
  run() {
    run(["bun", "run", "coverage"]);

    const hasNative = existsSync("packages/native/Cargo.toml");
    if (!hasNative || !has("cargo-llvm-cov")) {
      console.warn("⚠️ cargo-llvm-cov not installed — skipping Rust coverage");
      process.exit(0);
    }

    console.log("🦀 Collecting Rust coverage via mnative llvm-cov");
    run(["mnative", "llvm-cov", "--lcov", "--output-path", `../../${RUST_LCOV}`]);
    if (!existsSync(RUST_LCOV)) {
      process.exit(0);
    }

    if (!existsSync(LCOV)) {
      renameSync(RUST_LCOV, LCOV);
      process.exit(0);
    }
    if (has("lcov")) {
      const merged = "coverage/merged.lcov";
      const code = run([
        "lcov",
        "--add-tracefile",
        LCOV,
        "--add-tracefile",
        RUST_LCOV,
        "--output-file",
        merged,
      ]);
      if (code === 0) {
        renameSync(merged, LCOV);
        console.log("✅ Merged Rust + JS coverage");
        process.exit(0);
      }
    }
    console.warn(`⚠️ lcov not available — Rust coverage kept at ${RUST_LCOV}`);
  },
});

const pagesCommand = defineCommand({
  meta: {
    name: "pages",
    description: "Publish the HTML report into the Pages artifact dir (served at /coverage/)",
  },
  async run() {
    if (!existsSync(LCOV)) {
      console.log("ℹ️ No coverage data — collecting first");
      run(["bun", "run", "coverage"]);
    }
    if (!existsSync(LCOV)) {
      console.warn("⚠️ Still no coverage/lcov.info — skipping Pages coverage");
      process.exit(0);
    }

    installTools();
    generateHtml();
    if (!existsSync(HTML_DIR)) {
      console.warn(`⚠️ No HTML report at ${HTML_DIR} — skipping Pages coverage`);
      process.exit(0);
    }

    mkdirSync(PAGES_DIR, { recursive: true });
    await cp(HTML_DIR, PAGES_DIR, { recursive: true });
    console.log(`✅ Coverage published to ${PAGES_DIR} (served at /coverage/)`);
    process.exit(0);
  },
});

const mergeCommand = defineCommand({
  meta: { name: "merge", description: "Merge {packages,apps}/*/coverage/lcov.info via lcov --add-tracefile" },
  run() {
    if (!has("lcov")) {
      console.error("❌ lcov not found — run `mcoverage setup` first");
      process.exit(1);
    }
    const glob = new Bun.Glob("{packages,apps}/*/coverage/lcov.info");
    const files = Array.from(glob.scanSync()).filter(Boolean);
    if (files.length === 0) {
      console.warn("No per-package lcov.info found");
      process.exit(0);
    }
    console.log(`Merging ${files.length} files:`, files);
    const args = files
      .flatMap((f) => ["--add-tracefile", f])
      .concat(["--output-file", "coverage/merged.lcov"]);
    const result = run(["lcov", ...args]);
    if (result === 0) {
      console.log("✅ Merged: coverage/merged.lcov");
      run([
        "genhtml",
        "coverage/merged.lcov",
        "--output-directory",
        HTML_DIR,
        "--title",
        "Coverage Report",
        "--show-details",
        "--highlight",
        "--legend",
      ]);
    }
    process.exit(result);
  },
});

const summaryCommand = defineCommand({
  meta: { name: "summary", description: "Show coverage summary" },
  run() {
    if (has("lcov") && existsSync(LCOV)) {
      process.exit(run(["lcov", "--summary", LCOV]));
    }
    const result = totals();
    if (!result) {
      console.warn(`⚠️ ${LCOV} not found`);
      process.exit(0);
    }
    console.log(`lines: ${result.percent.toFixed(1)}% (${result.hit}/${result.found})`);
    process.exit(0);
  },
});

const main = defineCommand({
  meta: {
    name: "mcoverage",
    version: "1.0.0",
    description: "Coverage reporting — collect, HTML, threshold check, merge, Pages publishing",
  },
  subCommands: {
    setup: setupCommand,
    collect: collectCommand,
    html: htmlCommand,
    check: checkCommand,
    pages: pagesCommand,
    merge: mergeCommand,
    summary: summaryCommand,
  },
  run() {
    console.log(`
mcoverage — LCOV coverage reporting

Usage:
  mcoverage <command>

Commands:
  setup              Install lcov/genhtml if missing
  collect            Collect JS + Rust coverage and merge them
  html               genhtml coverage/lcov.info → coverage/html/
  check [--threshold 80]  Fail if line coverage is below the threshold
  pages              Publish coverage/html into the Pages artifact dir
  merge              Merge {packages,apps}/*/coverage/lcov.info via lcov
  summary            Print a coverage summary

Examples:
  mcoverage setup && mcoverage check --threshold 90
  mcoverage collect && mcoverage html
`);
  },
});

runMain(main);
