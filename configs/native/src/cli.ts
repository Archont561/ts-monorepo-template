#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineCommand, runMain, spawnTool } from "@myorg/citty";
import { which } from "bun";
import {
  DEFAULT_NATIVE_SCOPE,
  NATIVE_DIR,
  NATIVE_NPM_DIR,
  NATIVE_TARGETS,
  NATIVE_WASM_TARGET,
  nativePackageDir,
} from "../index.ts";
import { discoverBuildable, discoverCrates, discoverPackages, findNativeRoot } from "./discover.ts";
import { addWorkspaceMember, writeCrate } from "./templates.ts";

/**
 * mnative — Cargo + napi-rs wrapper for the `packages/native` workspace.
 *
 * Cargo commands run against the whole workspace; napi commands run once per
 * npm package, each pointed at its own crate. The workspace is discovered from
 * disk, so `mnative` works from the repo root or from any package directory
 * (turbo runs it with cwd = the package).
 */

const ROOT = findNativeRoot();
const WORKSPACE_DIR = join(ROOT, NATIVE_DIR);

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

/**
 * The native workspace is optional (`native=none` prunes it), so every cargo
 * and napi call has to be a no-op when it is absent — otherwise the root
 * scripts would need `test -f packages/native/...` guards again.
 */
function nativeExistsOrWarn(): boolean {
  if (existsSync(join(WORKSPACE_DIR, "Cargo.toml"))) return true;
  console.warn(`⚠️ ${NATIVE_DIR}/Cargo.toml not present, skipping (enable the native config)`);
  return false;
}

function runCargo(args: string[], opts: { cwd?: string } = {}): number {
  if (!nativeExistsOrWarn() || !cargoExistsOrWarn()) return 0;
  return spawnTool(["cargo", ...args], { cwd: opts.cwd ?? WORKSPACE_DIR });
}

function napiBin(): string {
  return Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/scripts/index.js"));
}

type NapiOptions = {
  /** Build a single package (turbo builds each package separately). */
  only?: string;
  /** Rust target triple. */
  target?: string;
  /** Build a foreign Linux target from a Linux host. */
  cross?: boolean;
  /** Run the napi CLI with `--dry-run` where supported. */
  dryRun?: boolean;
};

/** Shared path flags every per-package napi invocation needs. */
function packageFlags(pkg: { name: string; crateDir: string; dir: string }): string[] {
  return [
    "--cwd",
    ROOT,
    "--manifest-path",
    `${pkg.crateDir}/Cargo.toml`,
    "--package-json-path",
    `${pkg.dir}/package.json`,
    "--output-dir",
    pkg.dir,
  ];
}

/**
 * Runs a napi subcommand once per npm package.
 *
 * Returns the first non-zero exit code so turbo/CI fail on any package.
 */
function runNapiPerPackage(
  args: string[],
  options: NapiOptions = {},
  extraFlags: (pkg: { name: string; dir: string }) => string[] = () => [],
): number {
  if (!nativeExistsOrWarn() || !cargoExistsOrWarn()) return 0;

  const all = discoverBuildable(ROOT);
  const packages = options.only ? all.filter((pkg) => pkg.name === options.only) : all;

  if (packages.length === 0) {
    console.warn(
      options.only
        ? `⚠️ No napi package named "${options.only}" in ${NATIVE_DIR}/${NATIVE_NPM_DIR} — skipping`
        : `⚠️ No napi packages in ${NATIVE_DIR}/${NATIVE_NPM_DIR} — skipping`,
    );
    return 0;
  }

  let failed = 0;
  for (const pkg of packages) {
    console.log(`\n▸ ${pkg.name}: ${pkg.crateDir} → ${pkg.dir}`);
    const exitCode = spawnTool(
      [
        "bun",
        napiBin(),
        ...args,
        ...packageFlags(pkg),
        ...extraFlags(pkg),
        ...(options.target ? ["--target", options.target] : []),
        ...(options.cross ? ["--use-napi-cross"] : []),
        ...(options.dryRun ? ["--dry-run"] : []),
      ],
      { cwd: ROOT },
    );
    if (exitCode !== 0) {
      failed = exitCode;
      console.error(`::error::${args.join(" ")} failed for ${pkg.name} (exit ${exitCode})`);
    }
  }
  return failed;
}

function runNapi(args: string[], cwd: string = WORKSPACE_DIR): number {
  if (!nativeExistsOrWarn() || !cargoExistsOrWarn()) return 0;
  return spawnTool(["bun", napiBin(), ...args], { cwd });
}

/** WASI builds need a linker from the SDK; CI installs it, laptops often don't. */
function warnIfWasiMissing(): void {
  if (!process.env.WASI_SDK_PATH) {
    console.warn(
      "⚠️ WASI_SDK_PATH is not set — install the WASI SDK if the wasm target fails to link\n" +
        "   (CI does it for you; locally: https://github.com/WebAssembly/wasi-sdk/releases)",
    );
  }
}

const napiArgs = {
  only: { type: "string", description: "Build a single package (by directory name)" },
  target: { type: "string", description: "Rust target triple, e.g. aarch64-unknown-linux-gnu" },
  cross: {
    type: "boolean",
    description: "Cross-compile with napi's bundled toolchain",
    default: false,
  },
} as const;

const checkCommand = defineCommand({
  meta: { name: "check", description: "cargo check --workspace (fast type-check)" },
  run() {
    process.exit(runCargo(["check", "--workspace"]));
  },
});

const clippyCommand = defineCommand({
  meta: {
    name: "clippy",
    description: "cargo clippy --workspace --all-targets -- -D warnings",
  },
  run() {
    process.exit(runCargo(["clippy", "--workspace", "--all-targets", "--", "-D", "warnings"]));
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
  run() {
    process.exit(runCargo(["fmt", "--all", "--", "--check"]));
  },
});

const testCommand = defineCommand({
  meta: { name: "test", description: "cargo test --workspace (run Rust tests)" },
  run() {
    process.exit(runCargo(["test", "--workspace"]));
  },
});

const buildCommand = defineCommand({
  meta: { name: "build", description: "cargo build --workspace (debug)" },
  run() {
    process.exit(runCargo(["build", "--workspace"]));
  },
});

const buildReleaseCommand = defineCommand({
  meta: { name: "build:release", description: "cargo build --workspace --release (lto, strip)" },
  run() {
    process.exit(runCargo(["build", "--workspace", "--release"]));
  },
});

const buildCiCommand = defineCommand({
  meta: { name: "build:ci", description: "cargo build --workspace --profile ci" },
  run() {
    process.exit(runCargo(["build", "--workspace", "--profile", "ci"]));
  },
});

const treeCommand = defineCommand({
  meta: { name: "tree", description: "cargo tree (dependency tree)" },
  run() {
    process.exit(runCargo(["tree", ...process.argv.slice(3)]));
  },
});

const updateCommand = defineCommand({
  meta: { name: "update", description: "cargo update (update dependencies)" },
  run() {
    process.exit(runCargo(["update", ...process.argv.slice(3)]));
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
    process.exit(runCargo(["nextest", "run", ...process.argv.slice(3)]));
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
      process.exit(
        runCargo(["llvm-cov", "--workspace", "--lcov", "--output-path", "coverage/rust-lcov.info"]),
      );
    }
    process.exit(runCargo(["llvm-cov", ...raw]));
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
    process.exit(runCargo(["deny", ...process.argv.slice(3)]));
  },
});

const typecheckCommand = defineCommand({
  meta: { name: "typecheck", description: "Type-check every npm package (skips when absent)" },
  run() {
    if (!nativeExistsOrWarn()) process.exit(0);
    const packages = discoverPackages(ROOT).filter((pkg) =>
      existsSync(join(ROOT, pkg.dir, "tsconfig.json")),
    );
    if (packages.length === 0) {
      console.warn(`⚠️ No npm packages to type-check in ${NATIVE_DIR}/${NATIVE_NPM_DIR}`);
      process.exit(0);
    }
    let failed = 0;
    for (const pkg of packages) {
      console.log(`▸ typecheck ${pkg.name}`);
      // mtsc from the package dir keeps every path in the tsconfig relative.
      const exitCode = spawnTool(["bun", "run", "typecheck"], { cwd: join(ROOT, pkg.dir) });
      if (exitCode !== 0) failed = exitCode;
    }
    process.exit(failed);
  },
});

/**
 * The CI build matrix: every target this template can build that at least one
 * npm package actually declares in `napi.targets`.
 *
 * CI prints it with `mnative matrix --gha` and feeds it straight into
 * `strategy.matrix`, so the runner/container mapping lives here — next to the
 * `napi.targets` written into each package — instead of being duplicated in
 * workflow YAML.
 */
function buildMatrix(root: string): { include: Record<string, unknown>[] } {
  const declared = new Set<string>();
  for (const pkg of discoverBuildable(root)) {
    for (const target of pkg.targets) declared.add(target);
  }

  const include = NATIVE_TARGETS.filter(
    (spec) => declared.size === 0 || declared.has(spec.target),
  ).map((spec) => {
    const entry: Record<string, unknown> = { target: spec.target, runner: spec.runner };
    if (spec.container) entry.container = spec.container;
    if (spec.wasi) entry.wasi = true;
    return entry;
  });

  return { include };
}

const matrixCommand = defineCommand({
  meta: {
    name: "matrix",
    description: "Print the CI build matrix (supported targets the packages declare)",
  },
  args: {
    json: { type: "boolean", description: "Pretty-print JSON (default)", default: true },
    gha: {
      type: "boolean",
      description: "Print `key=value` lines ready for $GITHUB_OUTPUT",
      default: false,
    },
  },
  run({ args }) {
    const matrix = buildMatrix(ROOT);
    if (args.gha) {
      console.log(`targets=${JSON.stringify(matrix)}`);
      console.log(`has_targets=${matrix.include.length > 0}`);
    } else {
      console.log(JSON.stringify(matrix, null, 2));
    }
    process.exit(0);
  },
});

const listCommand = defineCommand({
  meta: { name: "list", description: "List crates and the npm packages built from them" },
  args: {
    json: { type: "boolean", description: "Print JSON", default: false },
  },
  run({ args }) {
    if (!nativeExistsOrWarn()) process.exit(0);

    const crates = discoverCrates(ROOT);
    const packages = discoverBuildable(ROOT);
    const packageNames = new Set(packages.map((pkg) => pkg.name));

    if (args.json) {
      console.log(JSON.stringify({ root: ROOT, crates, packages }, null, 2));
      process.exit(0);
    }

    console.log(`\n🦀 ${NATIVE_DIR} (workspace root: ${ROOT})\n`);
    console.log("  crates/");
    for (const crate of crates) {
      const role = crate.binding ? "cdylib → npm package" : "pure Rust";
      const deps = crate.uses.length ? ` (uses ${crate.uses.join(", ")})` : "";
      const published = crate.binding && !packageNames.has(crate.name) ? "  ⚠️ no npm package" : "";
      console.log(`    ${crate.name.padEnd(14)} ${role}${deps}${published}`);
    }
    console.log("\n  npm/");
    if (packages.length === 0) {
      console.log("    (none — add a cdylib crate with `mnative add <name>`)");
    }
    for (const pkg of packages) {
      console.log(
        `    ${pkg.name.padEnd(14)} ${pkg.crateDir}  binary: ${pkg.binaryName}.<platform>.node`,
      );
      console.log(`    ${" ".repeat(14)} targets: ${pkg.targets.join(", ")}`);
    }
    console.log("");
    process.exit(0);
  },
});

/**
 * npm scope for a newly added package: `--scope` wins, then the scope the
 * existing packages already use (a scaffolded monorepo renames `@myorg` to the
 * user's own scope, and `mnative add` must not reintroduce the template's),
 * then `NATIVE_SCOPE`, then the template default.
 */
async function resolveScope(explicit?: string): Promise<string> {
  if (explicit) return explicit;

  const first = discoverPackages(ROOT)[0];
  if (first) {
    try {
      const manifest = (await Bun.file(join(ROOT, first.dir, "package.json")).json()) as {
        name?: string;
      };
      const prefix = manifest.name?.split("/")[0];
      if (prefix?.startsWith("@")) return prefix;
    } catch {
      // Unreadable manifest — fall through to the env/default scope.
    }
  }

  return process.env.NATIVE_SCOPE ?? DEFAULT_NATIVE_SCOPE;
}

const addCommand = defineCommand({
  meta: {
    name: "add",
    description: "Add a crate (and, for bindings, its npm package) to the workspace",
  },
  args: {
    name: {
      type: "positional",
      description: "Crate name — also the npm package name",
      required: true,
    },
    pure: {
      type: "boolean",
      description: "Pure Rust crate: no cdylib, no npm package",
      default: false,
    },
    uses: { type: "string", description: "Comma-separated sibling crates to depend on" },
    scope: { type: "string", description: "npm scope (default: the scope in packages/native)" },
  },
  async run({ args }) {
    if (!nativeExistsOrWarn()) process.exit(1);

    const name = String(args.name);
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
      console.error(`❌ Invalid crate name "${name}" — use lowercase letters, digits and hyphens`);
      process.exit(1);
    }

    const spec = {
      name,
      binding: !args.pure,
      uses: args.uses
        ? String(args.uses)
            .split(",")
            .map((dep) => dep.trim())
            .filter(Boolean)
        : [],
      sample: "arithmetic" as const,
    };

    const scope = await resolveScope(args.scope as string | undefined);

    await writeCrate(ROOT, spec, { scope });
    await addWorkspaceMember(ROOT, name);
    console.log(`\n✅ Added ${args.pure ? "pure Rust crate" : "crate + npm package"} "${name}"`);
    console.log(`   crate:   ${NATIVE_DIR}/crates/${name}/`);
    if (!args.pure) console.log(`   package: ${nativePackageDir(name)}/`);
    console.log(`\n   Run: bun install && mnative check\n`);
    process.exit(0);
  },
});

const napiBuildCommand = defineCommand({
  meta: { name: "napi:build", description: "napi build --platform --release (one per package)" },
  args: napiArgs,
  run({ args }) {
    process.exit(
      runNapiPerPackage(["build", "--platform", "--release"], {
        only: args.only as string,
        target: args.target as string,
        cross: Boolean(args.cross),
      }),
    );
  },
});

const napiBuildDebugCommand = defineCommand({
  meta: { name: "napi:build:debug", description: "napi build (debug, one per package)" },
  args: napiArgs,
  run({ args }) {
    process.exit(
      runNapiPerPackage(["build"], {
        only: args.only as string,
        target: args.target as string,
        cross: Boolean(args.cross),
      }),
    );
  },
});

const napiBuildWasmCommand = defineCommand({
  meta: {
    name: "napi:build:wasm",
    description: `napi build --target ${NATIVE_WASM_TARGET} (one per package)`,
  },
  args: { only: napiArgs.only },
  run({ args }) {
    warnIfWasiMissing();
    process.exit(
      runNapiPerPackage(["build", "--platform", "--release", "--target", NATIVE_WASM_TARGET], {
        only: args.only as string,
      }),
    );
  },
});

const createNpmDirsCommand = defineCommand({
  meta: {
    name: "create-npm-dirs",
    description: "Generate the per-platform npm packages (run in CI, not committed)",
  },
  args: { only: napiArgs.only, "dry-run": { type: "boolean", default: false } },
  run({ args }) {
    process.exit(
      runNapiPerPackage(
        ["create-npm-dirs"],
        { only: args.only as string, dryRun: Boolean(args["dry-run"]) },
        () => ["--npm-dir", `${NATIVE_DIR}/${NATIVE_NPM_DIR}`],
      ),
    );
  },
});

const artifactsCommand = defineCommand({
  meta: {
    name: "artifacts",
    description: "Copy CI artifacts (.node/.wasm) into the npm packages",
  },
  args: {
    only: napiArgs.only,
    dir: {
      type: "string",
      description: "Directory holding the downloaded artifacts",
      default: "artifacts",
    },
  },
  run({ args }) {
    process.exit(
      runNapiPerPackage(["artifacts"], { only: args.only as string }, (pkg) => [
        "--npm-dir",
        `${NATIVE_DIR}/${NATIVE_NPM_DIR}`,
        "--output-dir",
        String(args.dir ?? "artifacts"),
        // WASI builds also ship a worker/loader; napi copies them from here.
        "--build-output-dir",
        pkg.dir,
      ]),
    );
  },
});

const napiCommand = defineCommand({
  meta: { name: "napi", description: "Run napi-rs CLI (passthrough, cwd = the workspace)" },
  run() {
    process.exit(runNapi(process.argv.slice(3)));
  },
});

const main = defineCommand({
  meta: {
    name: "mnative",
    version: "1.0.0",
    description:
      "Native Rust bindings via Cargo + napi-rs — one Cargo workspace in packages/native with a crate per Rust unit and an npm package per napi binding.",
  },
  subCommands: {
    list: listCommand,
    matrix: matrixCommand,
    add: addCommand,
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
    "create-npm-dirs": createNpmDirsCommand,
    artifacts: artifactsCommand,
    napi: napiCommand,
  },
  run() {
    const raw = process.argv.slice(2);
    if (raw.length === 0) {
      console.log(`
mnative — Cargo + napi-rs wrapper (${NATIVE_DIR})

Usage:
  mnative <command> [args]

Workspace:
  list                 crates + npm packages discovered in ${NATIVE_DIR}
  add <name>           new crate + npm package (--pure for Rust-only, --uses shared)
  typecheck            tsc --noEmit in every npm package

Cargo (whole workspace, run in ${NATIVE_DIR}):
  check                cargo check --workspace
  clippy               cargo clippy --workspace --all-targets -- -D warnings
  fmt / fmt:check      cargo fmt --all [-- --check]
  test                 cargo test --workspace
  build                cargo build --workspace
  build:release        cargo build --workspace --release (lto, strip)
  build:ci             cargo build --workspace --profile ci
  tree / update / doc  cargo passthrough
  nextest              cargo nextest run
  llvm-cov             cargo llvm-cov --lcov → coverage/rust-lcov.info
  audit / deny         cargo audit / cargo deny

NAPI (once per npm package):
  napi:build           napi build --platform --release
  napi:build:debug     napi build (debug)
  napi:build:wasm      napi build --target ${NATIVE_WASM_TARGET}
  create-npm-dirs      generate the per-platform package dirs (CI)
  artifacts            copy downloaded artifacts into the packages (CI)
  matrix [--gha]       print the CI build matrix
  napi [args]          passthrough to @napi-rs/cli

  --only <pkg>         run for a single package (turbo builds each one)
  --target <triple>    build one target (CI matrix)
  --cross              cross-compile with napi's bundled toolchain

Examples:
  mnative list
  mnative matrix --gha        # in CI: feeds strategy.matrix
  mnative add parser
  mnative add shared --pure
  mnative napi:build --only native
  mnative napi:build --target aarch64-unknown-linux-gnu --cross
`);
      process.exit(0);
    }
    const first = raw[0];
    const known = Object.keys(main.subCommands || {});
    if (!known.includes(first) && !first.startsWith("-")) {
      // Unknown command: pass it straight through to cargo.
      process.exit(runCargo(raw));
    }
  },
});

runMain(main);
