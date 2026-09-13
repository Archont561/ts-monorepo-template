#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { spawnSync, which } from "bun";
import { defineCommand, runMain } from "citty";

const NATIVE_DIR = `${import.meta.dir}/../../../packages/native`;

function hasCargo(): boolean {
  return !!which("cargo");
}

function cargoExistsOrWarn(): boolean {
  if (!hasCargo()) {
    console.warn("⚠️ cargo not found, skipping (install Rust: https://rustup.rs)");
    return false;
  }
  return true;
}

function runCargo(args: string[], opts: { cwd?: string } = {}): number {
  if (!cargoExistsOrWarn()) return 0;
  const cwd = opts.cwd ?? NATIVE_DIR;
  // Check if manifest exists in cwd, else fallback to root (should not happen after refactor)
  const result = spawnSync({
    cmd: ["cargo", ...args],
    cwd,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  return result.exitCode;
}

function runNapi(args: string[]): number {
  if (!cargoExistsOrWarn()) return 0;
  // napi bin from @napi-rs/cli
  const napiBin = Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/scripts/index.js"));
  const result = spawnSync({
    cmd: ["bun", napiBin, ...args],
    cwd: NATIVE_DIR,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  return result.exitCode;
}

const checkCommand = defineCommand({
  meta: { name: "check", description: "cargo check (fast type-check, no codegen)" },
  run() {
    process.exit(runCargo(["check"]));
  },
});

const clippyCommand = defineCommand({
  meta: { name: "clippy", description: "cargo clippy -- -D warnings (lint, deny warnings)" },
  run() {
    process.exit(runCargo(["clippy", "--", "-D", "warnings"]));
  },
});

const fmtCommand = defineCommand({
  meta: { name: "fmt", description: "cargo fmt --all (format write)" },
  run() {
    process.exit(runCargo(["fmt", "--all"]));
  },
});

const fmtCheckCommand = defineCommand({
  meta: { name: "fmt:check", description: "cargo fmt --all -- --check (format check)" },
  args: {
    check: { type: "boolean", description: "alias", default: false },
  },
  run() {
    process.exit(runCargo(["fmt", "--all", "--", "--check"]));
  },
});

const testCommand = defineCommand({
  meta: { name: "test", description: "cargo test (run Rust tests)" },
  run() {
    process.exit(runCargo(["test"]));
  },
});

const buildCommand = defineCommand({
  meta: { name: "build", description: "cargo build (debug build)" },
  run() {
    process.exit(runCargo(["build"]));
  },
});

const buildReleaseCommand = defineCommand({
  meta: { name: "build:release", description: "cargo build --release (optimized, lto, strip)" },
  run() {
    process.exit(runCargo(["build", "--release"]));
  },
});

const buildCiCommand = defineCommand({
  meta: { name: "build:ci", description: "cargo build --profile ci (fast CI profile)" },
  run() {
    process.exit(runCargo(["build", "--profile", "ci"]));
  },
});

const treeCommand = defineCommand({
  meta: { name: "tree", description: "cargo tree (dependency tree)" },
  run() {
    const raw = process.argv.slice(3);
    process.exit(runCargo(["tree", ...raw]));
  },
});

const updateCommand = defineCommand({
  meta: { name: "update", description: "cargo update (update dependencies)" },
  run() {
    const raw = process.argv.slice(3);
    process.exit(runCargo(["update", ...raw]));
  },
});

const docCommand = defineCommand({
  meta: { name: "doc", description: "cargo doc --no-deps (generate docs)" },
  run() {
    process.exit(runCargo(["doc", "--no-deps"]));
  },
});

const nextestCommand = defineCommand({
  meta: { name: "nextest", description: "cargo nextest run (faster parallel tests)" },
  run() {
    const raw = process.argv.slice(3);
    process.exit(runCargo(["nextest", "run", ...raw]));
  },
});

const llvmCovCommand = defineCommand({
  meta: {
    name: "llvm-cov",
    description: "cargo llvm-cov --lcov (Rust coverage, requires cargo-llvm-cov)",
  },
  run() {
    const raw = process.argv.slice(3);
    if (raw.length === 0) {
      process.exit(runCargo(["llvm-cov", "--lcov", "--output-path", "coverage/rust-lcov.info"]));
    } else {
      process.exit(runCargo(["llvm-cov", ...raw]));
    }
  },
});

const auditCommand = defineCommand({
  meta: { name: "audit", description: "cargo audit (security audit)" },
  run() {
    process.exit(runCargo(["audit"]));
  },
});

const denyCommand = defineCommand({
  meta: { name: "deny", description: "cargo deny check (license/ban check)" },
  run() {
    const raw = process.argv.slice(3);
    process.exit(runCargo(["deny", ...raw]));
  },
});

const typecheckCommand = defineCommand({
  meta: {
    name: "typecheck",
    description: "Type-check packages/native (skips when the package is absent)",
  },
  run() {
    if (!existsSync("packages/native/package.json")) {
      console.warn("⚠️ packages/native not present, skipping typecheck");
      process.exit(0);
    }
    // Running in the package dir keeps this scope-agnostic — there is no
    // @scope/native name to rewrite when the template is scaffolded.
    const result = spawnSync({
      cmd: ["bun", "run", "typecheck"],
      cwd: "packages/native",
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    });
    process.exit(result.exitCode);
  },
});

const napiBuildCommand = defineCommand({
  meta: { name: "napi:build", description: "napi build --release --platform (native .node)" },
  run() {
    if (!hasCargo()) {
      console.warn("⚠️ cargo not found, skipping native build");
      process.exit(0);
    }
    // cargo check first, then napi build
    const check = runCargo(["check"]);
    if (check !== 0) process.exit(check);
    process.exit(runNapi(["build", "--release", "--platform"]));
  },
});

const napiBuildDebugCommand = defineCommand({
  meta: { name: "napi:build:debug", description: "napi build (debug)" },
  run() {
    if (!hasCargo()) {
      console.warn("⚠️ cargo not found, skipping");
      process.exit(0);
    }
    const check = runCargo(["check"]);
    if (check !== 0) process.exit(check);
    process.exit(runNapi(["build"]));
  },
});

const napiBuildWasmCommand = defineCommand({
  meta: { name: "napi:build:wasm", description: "napi build --target wasm32-wasip1-threads" },
  run() {
    if (!hasCargo()) {
      console.warn("⚠️ cargo not found, skipping WASM build");
      process.exit(0);
    }
    process.exit(runNapi(["build", "--release", "--target", "wasm32-wasip1-threads"]));
  },
});

const napiCommand = defineCommand({
  meta: { name: "napi", description: "Run napi-rs CLI (passthrough)" },
  run() {
    const raw = process.argv.slice(3);
    process.exit(runNapi(raw));
  },
});

const main = defineCommand({
  meta: {
    name: "mnative",
    version: "1.0.0",
    description:
      "Native Rust bindings via Cargo + napi-rs — no root Cargo.toml needed, uses packages/native/Cargo.toml. Wraps cargo check/clippy/fmt/test/build + napi build.",
  },
  subCommands: {
    check: checkCommand,
    clippy: clippyCommand,
    fmt: fmtCommand,
    "fmt:check": fmtCheckCommand,
    test: testCommand,
    build: buildCommand,
    "build:release": buildReleaseCommand,
    "build:ci": buildCiCommand,
    tree: treeCommand,
    update: updateCommand,
    doc: docCommand,
    nextest: nextestCommand,
    "llvm-cov": llvmCovCommand,
    audit: auditCommand,
    deny: denyCommand,
    typecheck: typecheckCommand,
    "napi:build": napiBuildCommand,
    "napi:build:debug": napiBuildDebugCommand,
    "napi:build:wasm": napiBuildWasmCommand,
    napi: napiCommand,
  },
  run() {
    // If no subcommand, show help + support direct cargo passthrough
    const raw = process.argv.slice(2);
    if (raw.length === 0) {
      console.log(`
mnative — Cargo + napi-rs wrapper (packages/native)

Usage:
  mnative <command> [args]

Cargo commands:
  check              cargo check (fast type-check)
  clippy             cargo clippy -- -D warnings
  fmt                cargo fmt --all
  fmt:check          cargo fmt --all -- --check
  test               cargo test
  build              cargo build
  build:release      cargo build --release (lto, strip)
  build:ci           cargo build --profile ci
  tree [args]        cargo tree
  update [args]      cargo update
  doc                cargo doc --no-deps

NAPI commands:
  napi:build         cargo check && napi build --release --platform
  napi:build:debug   cargo check && napi build
  napi:build:wasm    napi build --target wasm32-wasip1-threads
  napi [args]        passthrough to @napi-rs/cli

Examples:
  mnative check
  mnative clippy
  mnative fmt:check
  mnative test
  mnative napi:build
  mnative napi build --help

All cargo commands run in packages/native (self-contained Cargo.toml, no root Cargo.toml).
`);
      process.exit(0);
    }
    // If first arg is unknown, try to run as cargo passthrough
    const first = raw[0];
    const known = Object.keys(main.subCommands || {});
    if (!known.includes(first) && !first.startsWith("-")) {
      // Passthrough to cargo
      process.exit(runCargo(raw));
    }
  },
});

runMain(main);
