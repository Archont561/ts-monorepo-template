import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $, file, spawnSync } from "bun";
import {
  addJsonArrayValue,
  readJson,
  removeJsonEntry,
  setJsonBlock,
  setJsonValue,
  updateManifestFile,
} from "@/src/manifest/editor";
// Setup scripts run inside a freshly copied project, before `bun install`, so
// they cannot resolve workspace packages by name — the shared editor and the
// path helpers are imported by relative path instead.
import { CONFIGS_RELATIVE } from "@/src/utils/paths";
import {
  DEFAULT_NATIVE_CRATES,
  DEFAULT_NATIVE_SCOPE,
  NATIVE_DIR,
  NATIVE_WORKSPACE_GLOB,
  type NativeCrateSpec,
  nativeCrateDir,
  nativePackageDir,
} from "./native-shared";
import {
  addWorkspaceMember,
  cargoConfigToml,
  nativeGitignore,
  rustToolchainToml,
  workspaceCargoToml,
  writeBridgeNode,
  writeCrate,
} from "./native-templates";

/**
 * Setup script for native bindings — run when the native config is enabled.
 *
 * Scaffolds the **Cargo workspace at the repo root** with one crate per Rust
 * unit and one npm package per napi binding under `packages/native/npm`:
 *
 * ```
 * Cargo.toml            virtual workspace (members: crates/*)
 * rust-toolchain.toml
 * .cargo/config.toml
 * crates/native/        cdylib binding
 * packages/native/
 * └── npm/native/       @scope/native — platform packages are generated in CI
 * ```
 *
 * Supports any number of crates: add one with `m native add <name>` (or
 * `m native add shared --pure` for a crate with no Node-API surface). Cargo runs
 * against the whole workspace; napi runs per package.
 *
 * Registered as the `native` feature's setup step in the registry (`FEATURES`).
 */

const TARGET_DIR = process.cwd();
/** Rewritten by the scaffolder (and by CI/local git) — never a real repo. */
const REPO_PLACEHOLDER = "Archont561/ts-monorepo-template";
const NATIVE_ROOT = join(TARGET_DIR, NATIVE_DIR);
const REPO_URL = repositoryUrl();
/** Rewritten by the scaffolder — the npm scope every generated manifest uses. */
const SCOPE = process.env.NATIVE_SCOPE ?? DEFAULT_NATIVE_SCOPE;

const ROOT_PACKAGE_JSON = join(TARGET_DIR, "package.json");
const TURBO_BASE = join(TARGET_DIR, CONFIGS_RELATIVE, "turbo.base.json");
const EXAMPLE_NATIVE_DIR = join(TARGET_DIR, "apps/example/src/pages/api/native");

const WORKSPACE_MANIFEST = join(TARGET_DIR, "Cargo.toml");
const TOOLCHAIN = join(TARGET_DIR, "rust-toolchain.toml");
const CARGO_CONFIG = join(TARGET_DIR, ".cargo/config.toml");
const NATIVE_GITIGNORE = join(NATIVE_ROOT, ".gitignore");

/** Root scripts the workspace needs, and the m native command each one runs. */
const ROOT_SCRIPTS: Record<string, string> = {
  "build:native": "m native napi:build",
  "build:wasm": "m native napi:build:wasm",
  "test:native": "m native test",
};

/** Turbo tasks for the native builds — cargo stays uncached. */
/**
 * The two tasks as JSON text in the style of `turbo.base.json` — short arrays
 * stay inline there, which is exactly what a re-serialized object would lose.
 */
const TURBO_TASKS: Record<string, string> = {
  "build:native": `{
  "dependsOn": ["^build"],
  "outputs": ["*.node", "index.js", "index.d.ts"],
  "cache": false
}`,
  "build:wasm": `{
  "dependsOn": ["build:native"],
  "outputs": ["*.wasi.cjs", "*.wasi-browser.js", "*.wasm"],
  "cache": false
}`,
};

/** The example routes, written verbatim — they talk to @scope/native via external. */
const EXAMPLE_ROUTES: Record<string, string> = {
  "index.ts": `// TEMPLATE-ONLY:START(native)
export default function handleNativeIndex(): Response {
  return Response.json({
    message: "Native bindings (Rust via napi-rs) with JS fallback",
    endpoints: [
      "/api/native/add?a=1&b=2",
      "/api/native/fibonacci/:n",
      "/api/native/primes/:n",
      "/api/native/reverse?text=hello",
      "/api/native/status",
    ],
  });
}
// TEMPLATE-ONLY:END(native)
`,
  "add.ts": `// TEMPLATE-ONLY:START(native)
import { addFallback, addSync, isNativeAvailable } from "@myorg/external";
export default async function handleNativeAdd(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const a = Number(url.searchParams.get("a") ?? "1");
  const b = Number(url.searchParams.get("b") ?? "2");
  const result = addSync(a, b);
  return Response.json({ a, b, result, fallback: addFallback(a,b), native: isNativeAvailable() ? "rust" : "js-fallback" });
}
// TEMPLATE-ONLY:END(native)
`,
  "status.ts": `// TEMPLATE-ONLY:START(native)
import { isNativeAvailable } from "@myorg/external";
export default async function handleNativeStatus(): Promise<Response> {
  let nativeBinding: unknown = null;
  try {
    // @ts-expect-error optional
    const mod = await import("@myorg/native");
    nativeBinding = Object.keys(mod);
  } catch {}
  return Response.json({ isNativeAvailable: isNativeAvailable(), nativeBinding });
}
// TEMPLATE-ONLY:END(native)
`,
};

async function exists(path: string): Promise<boolean> {
  return (await file(path).exists()) || (await $`test -d ${path}`.nothrow().quiet()).exitCode === 0;
}

/**
 * Repository URL for the generated manifests.
 *
 * Prefers the repo Actions is running in, then the local git remote, so a
 * project never inherits the template's URL. Falls back to an obvious
 * placeholder the scaffolder rewrites.
 */
function repositoryUrl(): string {
  const fromEnv = process.env.GITHUB_REPOSITORY;
  if (fromEnv) return `https://github.com/${fromEnv}`;

  const remote = spawnSync(["git", "config", "--get", "remote.origin.url"], { stdout: "pipe" })
    .stdout?.toString()
    .trim();
  if (remote) {
    const match = remote.match(/github\.com[:/]([^/]+)\/(.+?)(\.git)?$/);
    if (match) return `https://github.com/${match[1]}/${match[2]}`;
  }

  return `https://github.com/${REPO_PLACEHOLDER}`;
}

/** Relative-to-root logging, so the output never leaks absolute temp paths. */
function relative(path: string): string {
  return path.replace(`${TARGET_DIR}/`, "");
}

/**
 * Moves a legacy single-crate `packages/native/{src,build.rs,Cargo.toml}`
 * package into `crates/<name>/` so projects scaffolded before the workspace
 * shape pick up the new layout on setup.
 */
async function migrateLegacyCrate(name: string): Promise<boolean> {
  const legacyManifest = join(NATIVE_ROOT, "Cargo.toml");
  if (!(await file(legacyManifest).exists())) return false;
  const content = await file(legacyManifest).text();
  if (!content.includes("[package]")) return false;

  const crateDir = join(TARGET_DIR, nativeCrateDir(name));
  if (await exists(crateDir)) return false;

  console.log(`  📦 Migrating the single-crate layout into crates/${name}/...`);
  await mkdir(join(crateDir, "src"), { recursive: true });
  await $`cp -r ${join(NATIVE_ROOT, "src")} ${join(crateDir, "src")} 2>/dev/null`.nothrow().quiet();
  if (await file(join(NATIVE_ROOT, "build.rs")).exists()) {
    await $`mv ${join(NATIVE_ROOT, "build.rs")} ${join(crateDir, "build.rs")}`.quiet();
  }
  await $`rm -rf ${join(NATIVE_ROOT, "src")}`.quiet();
  await $`rm -f ${legacyManifest}`.quiet();

  // The npm package used to live at the workspace root — move it under npm/.
  const legacyPackage = join(NATIVE_ROOT, "package.json");
  const packageDir = join(TARGET_DIR, nativePackageDir(name));
  if ((await file(legacyPackage).exists()) && !(await file(packageDir).exists())) {
    await mkdir(packageDir, { recursive: true });
    await $`mv ${legacyPackage} ${join(packageDir, "package.json")}`.quiet();
    for (const extra of ["tsconfig.json", "turbo.json", "README.md"]) {
      if (await file(join(NATIVE_ROOT, extra)).exists()) {
        await $`mv ${join(NATIVE_ROOT, extra)} ${join(packageDir, extra)}`.quiet();
      }
    }
    if (await exists(join(NATIVE_ROOT, "tests"))) {
      await mkdir(join(packageDir, "tests"), { recursive: true });
      await $`sh -c 'mv ${join(NATIVE_ROOT, "tests")}/* ${join(packageDir, "tests")}/ 2>/dev/null'`
        .nothrow()
        .quiet();
      await $`rm -rf ${join(NATIVE_ROOT, "tests")}`.quiet();
    }
  }
  console.log(`  ✓ Moved crate + npm package under crates/ + packages/native/npm/`);
  return true;
}

/**
 * Moves a legacy `packages/native/{Cargo.toml,rust-toolchain.toml,.cargo,crates}`
 * Cargo workspace up to the repo root. Projects scaffolded by earlier template
 * versions owned the whole Rust tree under `packages/native`; the Cargo
 * workspace root is the repo root now.
 */
async function migrateLegacyWorkspace(): Promise<void> {
  const legacyManifest = join(NATIVE_ROOT, "Cargo.toml");
  if (!(await file(legacyManifest).exists()) || (await file(WORKSPACE_MANIFEST).exists())) {
    return;
  }
  if (await file(join(TARGET_DIR, nativeCrateDir("native"), "Cargo.toml")).exists()) return;

  console.log("  📦 Moving the Cargo workspace from packages/native/ to the repo root...");
  await $`mv ${legacyManifest} ${WORKSPACE_MANIFEST}`.quiet();

  const legacyCrates = join(NATIVE_ROOT, "crates");
  if (await exists(legacyCrates)) {
    await mkdir(join(TARGET_DIR, "crates"), { recursive: true });
    await $`sh -c 'cp -a ${legacyCrates}/. ${join(TARGET_DIR, "crates")}/'`.quiet();
    await $`rm -rf ${legacyCrates}`.quiet();
  }

  const legacyToolchain = join(NATIVE_ROOT, "rust-toolchain.toml");
  if ((await file(legacyToolchain).exists()) && !(await file(TOOLCHAIN).exists())) {
    await $`mv ${legacyToolchain} ${TOOLCHAIN}`.quiet();
  }

  if (await exists(join(NATIVE_ROOT, ".cargo"))) {
    await mkdir(join(TARGET_DIR, ".cargo"), { recursive: true });
    await $`sh -c 'cp -a ${join(NATIVE_ROOT, ".cargo")}/. ${join(TARGET_DIR, ".cargo")}/'`.quiet();
    await $`rm -rf ${join(NATIVE_ROOT, ".cargo")}`.quiet();
  }

  console.log("  ✓ packages/native/Cargo.toml + crates/ + .cargo/ → repo root");
}

/** Brings a project that predates the repo-root Cargo workspace onto the layout. */
async function migrateLegacyLayout(): Promise<void> {
  for (const spec of DEFAULT_NATIVE_CRATES) {
    await migrateLegacyCrate(spec.name);
  }
  await migrateLegacyWorkspace();
}

/** Writes the crates + npm packages that are missing, leaving existing ones alone. */
async function writeCrates(): Promise<NativeCrateSpec[]> {
  const crates: NativeCrateSpec[] = [];
  for (const spec of DEFAULT_NATIVE_CRATES) {
    const crateDir = join(TARGET_DIR, nativeCrateDir(spec.name));
    if (await exists(join(crateDir, "Cargo.toml"))) {
      console.log(`  ✓ ${nativeCrateDir(spec.name)}/ exists`);
    } else {
      const written = await writeCrate(TARGET_DIR, spec, { scope: SCOPE, repository: REPO_URL });
      console.log(
        `  ✓ ${relative(written.crate)}/ (crate)${written.package ? ` + ${relative(written.package)}/ (npm)` : ""}`,
      );
    }
    crates.push(spec);
  }
  return crates;
}

/** Bridge node — the single Turbo package for every pure Rust crate. Refreshed
 * from the templates on every setup so it can never drift.
 */
async function syncBridgeNode(): Promise<void> {
  await writeBridgeNode(TARGET_DIR, { scope: SCOPE, repository: REPO_URL });
  console.log("  ✓ crates/ (pure-Rust bridge node @ packages/native/npm side untouched)");
}

/** Virtual workspace manifest — members are re-synced, never clobbered. */
async function syncWorkspaceManifest(crates: NativeCrateSpec[]): Promise<void> {
  if (await file(WORKSPACE_MANIFEST).exists()) {
    for (const spec of crates) await addWorkspaceMember(TARGET_DIR, spec.name);
    console.log("  ✓ Cargo.toml (members synced)");
    return;
  }

  await writeFile(
    WORKSPACE_MANIFEST,
    workspaceCargoToml(crates, { scope: SCOPE, repository: REPO_URL }),
  );
  console.log("  ✓ Cargo.toml (virtual workspace, resolver 3)");
}

/** Toolchain pin at the repo root — write the default unless one exists. */
async function setupToolchain(): Promise<void> {
  if (await file(TOOLCHAIN).exists()) return;

  await writeFile(TOOLCHAIN, rustToolchainToml());
  console.log("  ✓ rust-toolchain.toml (stable + wasm32-wasip1-threads)");
}

/** Cargo config lives at the repo root, next to the workspace manifest. */
async function setupCargoConfig(): Promise<void> {
  if (await file(CARGO_CONFIG).exists()) return;

  await mkdir(join(TARGET_DIR, ".cargo"), { recursive: true });
  await writeFile(CARGO_CONFIG, cargoConfigToml());
  console.log("  ✓ .cargo/config.toml");
}

async function ensureNativeGitignore(): Promise<void> {
  if (await file(NATIVE_GITIGNORE).exists()) return;

  await writeFile(NATIVE_GITIGNORE, nativeGitignore());
  console.log("  ✓ packages/native/.gitignore (target/, generated loaders, npm/*-*/)");
}

interface RootManifest {
  scripts?: Record<string, string>;
  workspaces?: string[];
}

/** Root package.json — link the npm packages into the Bun workspace. */
async function linkNpmPackages(): Promise<void> {
  await updateManifestFile(ROOT_PACKAGE_JSON, (source) => {
    const pkg = readJson<RootManifest>(source);
    let next = source;

    if (!(pkg.workspaces ?? []).includes(NATIVE_WORKSPACE_GLOB)) {
      console.log(`  ✓ Added workspace glob ${NATIVE_WORKSPACE_GLOB}`);
      next = addJsonArrayValue(next, "workspaces", NATIVE_WORKSPACE_GLOB);
    }

    // The bridge node is a single package (not a glob) so the crates dir
    // itself is never treated as a workspace member.
    const bridgeEntry = "crates";
    if (!(pkg.workspaces ?? []).includes(bridgeEntry)) {
      console.log(`  ✓ Added workspace entry ${bridgeEntry} (pure-Rust bridge node)`);
      next = addJsonArrayValue(next, "workspaces", bridgeEntry);
    }

    for (const [name, command] of Object.entries(ROOT_SCRIPTS)) {
      if (pkg.scripts?.[name] === command) continue;
      console.log(`  ✓ Set root script ${name} → ${command}`);
      next = setJsonValue(next, `scripts.${name}`, command);
    }

    for (const name of Object.keys(pkg.scripts ?? {})) {
      const command = pkg.scripts?.[name] ?? "";
      if (!name.startsWith("cargo:") || !command.includes("bun --filter")) continue;
      console.log(`  🗑️ Removed root script ${name} (cargo goes through m native)`);
      next = removeJsonEntry(next, `scripts.${name}`);
    }

    return next;
  });
}

/** Turbo tasks — one build per npm package, cargo stays uncached. */
async function ensureTurboTasks(): Promise<void> {
  await updateManifestFile(TURBO_BASE, (source) => {
    const turbo = readJson<{ tasks?: Record<string, unknown> }>(source);
    let next = source;

    for (const [name, task] of Object.entries(TURBO_TASKS)) {
      if (turbo.tasks?.[name]) continue;
      console.log(`  ✓ Added turbo task ${name}`);
      next = setJsonBlock(next, `tasks.${name}`, task);
    }

    return next;
  });
}

/** Example routes — unchanged, they talk to @scope/native through external. */
async function writeExampleRoutes(): Promise<void> {
  if (await exists(EXAMPLE_NATIVE_DIR)) return;

  console.log("  📦 Creating example native routes...");
  // The per-endpoint folders exist for future pages; the routes themselves sit
  // flat in the folder above them.
  await mkdir(join(EXAMPLE_NATIVE_DIR, "fibonacci"), { recursive: true });
  await mkdir(join(EXAMPLE_NATIVE_DIR, "primes"), { recursive: true });

  for (const [name, contents] of Object.entries(EXAMPLE_ROUTES)) {
    await writeFile(join(EXAMPLE_NATIVE_DIR, name), contents);
  }
  console.log("  ✓ Example native routes");
}

function printNextSteps(): void {
  console.log("\n✅ Native setup complete (Cargo workspace at the repo root + napi-rs).\n");
  console.log("  Layout:");
  console.log(`    Cargo.toml                       virtual workspace`);
  console.log(`    crates/<name>/                   one crate per Rust unit`);
  console.log(`    ${NATIVE_DIR}/npm/<name>/        one npm package per binding\n`);
  console.log("  Commands:");
  console.log("    m native list              # crates + packages");
  console.log("    m native add <name>        # add a crate (+ npm package)");
  console.log("    m native add shared --pure # pure Rust crate, no Node-API");
  console.log("    m native check             # cargo check --workspace");
  console.log("    m native napi:build        # build every package's .node");
  console.log("    m native napi:build:wasm   # wasm32-wasip1-threads\n");
  console.log("  Next: bun install && m native check && bun run build:native\n");
}

async function main() {
  console.log(
    "\n🦀 Setting up native Rust bindings (Cargo workspace at the repo root + napi-rs)...\n",
  );
  console.log("  Mode: Cargo workspace at ./ (crates/* + packages/native/npm/*)");
  console.log("  CLI: m native (cargo + napi wrapper)\n");

  await mkdir(NATIVE_ROOT, { recursive: true });

  await migrateLegacyLayout();
  const crates = await writeCrates();
  await syncWorkspaceManifest(crates);
  await syncBridgeNode();
  await setupToolchain();
  await setupCargoConfig();
  await ensureNativeGitignore();
  await linkNpmPackages();
  await ensureTurboTasks();
  await writeExampleRoutes();
  printNextSteps();
}

if (import.meta.main) {
  await main();
}
