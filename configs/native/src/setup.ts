#!/usr/bin/env bun
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $, file, spawnSync } from "bun";
import {
  DEFAULT_NATIVE_CRATES,
  NATIVE_DIR,
  NATIVE_WORKSPACE_GLOB,
  type NativeCrateSpec,
  nativeCrateDir,
  nativePackageDir,
} from "../index.ts";
import {
  addWorkspaceMember,
  cargoConfigToml,
  nativeGitignore,
  rustToolchainToml,
  workspaceCargoToml,
  writeCrate,
} from "./templates.ts";

/**
 * Setup script for native bindings — run when the native config is enabled.
 *
 * Scaffolds `packages/native` as a **Cargo workspace** with one crate per Rust
 * unit and one npm package per napi binding:
 *
 * ```
 * packages/native/
 * ├── Cargo.toml        virtual workspace (members: crates/*)
 * ├── rust-toolchain.toml
 * ├── .cargo/config.toml
 * ├── .gitignore
 * ├── crates/native/    cdylib binding
 * └── npm/native/       @scope/native — platform packages are generated in CI
 * ```
 *
 * Supports any number of crates: add one with `mnative add <name>` (or
 * `mnative add shared --pure` for a crate with no Node-API surface). Cargo runs
 * against the whole workspace; napi runs per package.
 *
 * Data-driven via `scaffold.setup` in configs/native/package.json.
 */

const TARGET_DIR = process.cwd();
/** Rewritten by the scaffolder (and by CI/local git) — never a real repo. */
const REPO_PLACEHOLDER = "Archont561/ts-monorepo-template";
const NATIVE_ROOT = join(TARGET_DIR, NATIVE_DIR);
const REPO_URL = repositoryUrl();
const scope = process.env.NATIVE_SCOPE ?? "@myorg";

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

/**
 * Moves a pre-workspace `packages/native/{src,build.rs,Cargo.toml}` package
 * into `crates/<name>/` so older projects pick up the new shape on setup.
 */
async function migrateLegacyCrate(name: string): Promise<boolean> {
  const manifest = join(NATIVE_ROOT, "Cargo.toml");
  if (!(await file(manifest).exists())) return false;
  const content = await file(manifest).text();
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
  await $`rm -f ${manifest}`.quiet();

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
  console.log(`  ✓ Moved crate + npm package under packages/native/`);
  return true;
}

async function main() {
  console.log("\n🦀 Setting up native Rust bindings (Cargo workspace + napi-rs)...\n");
  console.log(`  Mode: Cargo workspace at ${NATIVE_DIR}/ (crates/* + npm/*)`);
  console.log("  CLI: mnative (cargo + napi wrapper)\n");

  await mkdir(NATIVE_ROOT, { recursive: true });

  // 1. Crates + npm packages (migrating the old single-crate layout first).
  for (const spec of DEFAULT_NATIVE_CRATES) {
    await migrateLegacyCrate(spec.name);
  }

  const crates: NativeCrateSpec[] = [];
  for (const spec of DEFAULT_NATIVE_CRATES) {
    const crateDir = join(TARGET_DIR, nativeCrateDir(spec.name));
    if (await exists(join(crateDir, "Cargo.toml"))) {
      console.log(`  ✓ ${nativeCrateDir(spec.name)}/ exists`);
    } else {
      const written = await writeCrate(TARGET_DIR, spec, { scope, repository: REPO_URL });
      console.log(
        `  ✓ ${written.crate.replace(`${TARGET_DIR}/`, "")}/ (crate)${written.package ? ` + ${written.package.replace(`${TARGET_DIR}/`, "")}/ (npm)` : ""}`,
      );
    }
    crates.push(spec);
  }

  // 2. Virtual workspace manifest — members are re-synced, never clobbered.
  const workspaceManifest = join(NATIVE_ROOT, "Cargo.toml");
  if (await file(workspaceManifest).exists()) {
    for (const spec of crates) await addWorkspaceMember(TARGET_DIR, spec.name);
    console.log("  ✓ packages/native/Cargo.toml (members synced)");
  } else {
    await writeFile(workspaceManifest, workspaceCargoToml(crates, { scope, repository: REPO_URL }));
    console.log("  ✓ packages/native/Cargo.toml (virtual workspace, resolver 3)");
  }

  // 3. Toolchain + cargo config + gitignore, all self-contained.
  const toolchainPath = join(NATIVE_ROOT, "rust-toolchain.toml");
  const rootToolchainPath = join(TARGET_DIR, "rust-toolchain.toml");
  if (!(await file(toolchainPath).exists())) {
    if (await file(rootToolchainPath).exists()) {
      await writeFile(toolchainPath, await file(rootToolchainPath).text());
      await $`rm -f ${rootToolchainPath}`.quiet();
      console.log("  ✓ Moved rust-toolchain.toml into packages/native/");
    } else {
      await writeFile(toolchainPath, rustToolchainToml());
      console.log("  ✓ packages/native/rust-toolchain.toml (stable + wasm32-wasip1-threads)");
    }
  }

  const cargoConfigDir = join(NATIVE_ROOT, ".cargo");
  const cargoConfigPath = join(cargoConfigDir, "config.toml");
  const rootCargoConfigPath = join(TARGET_DIR, ".cargo", "config.toml");
  if (!(await file(cargoConfigPath).exists())) {
    await mkdir(cargoConfigDir, { recursive: true });
    await writeFile(
      cargoConfigPath,
      (await file(rootCargoConfigPath).exists())
        ? await file(rootCargoConfigPath).text()
        : cargoConfigToml(),
    );
    console.log("  ✓ packages/native/.cargo/config.toml");
  }
  if (await file(rootCargoConfigPath).exists()) {
    await $`rm -f ${rootCargoConfigPath}`.quiet();
    await $`rmdir ${join(TARGET_DIR, ".cargo")}`.nothrow().quiet();
  }

  const gitignorePath = join(NATIVE_ROOT, ".gitignore");
  if (!(await file(gitignorePath).exists())) {
    await writeFile(gitignorePath, nativeGitignore());
    console.log("  ✓ packages/native/.gitignore (target/, generated loaders, npm/*-*/)");
  }

  // 4. Root package.json — link the npm packages into the Bun workspace.
  const rootPkgPath = join(TARGET_DIR, "package.json");
  if (await file(rootPkgPath).exists()) {
    const pkg = await file(rootPkgPath).json();
    let updated = false;

    pkg.workspaces = Array.isArray(pkg.workspaces) ? pkg.workspaces : [];
    if (!pkg.workspaces.includes(NATIVE_WORKSPACE_GLOB)) {
      pkg.workspaces = [...pkg.workspaces, NATIVE_WORKSPACE_GLOB];
      console.log(`  ✓ Added workspace glob ${NATIVE_WORKSPACE_GLOB}`);
      updated = true;
    }

    pkg.scripts = pkg.scripts ?? {};
    const scriptsToEnsure: Record<string, string> = {
      "build:native": "mnative napi:build",
      "build:wasm": "mnative napi:build:wasm",
      "test:native": "mnative test",
    };
    for (const [k, v] of Object.entries(scriptsToEnsure)) {
      if (pkg.scripts[k] !== v) {
        pkg.scripts[k] = v;
        console.log(`  ✓ Set root script ${k} → ${v}`);
        updated = true;
      }
    }
    for (const k of Object.keys(pkg.scripts)) {
      if (k.startsWith("cargo:") && pkg.scripts[k].includes("bun --filter")) {
        delete pkg.scripts[k];
        console.log(`  🗑️ Removed root script ${k} (cargo goes through mnative)`);
        updated = true;
      }
    }

    if (updated) {
      await Bun.write(rootPkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    }
  }

  // 5. Turbo tasks — one build per npm package, cargo stays uncached.
  const turboPath = join(TARGET_DIR, "configs/turbo/turbo.base.json");
  if (await file(turboPath).exists()) {
    const turbo = await file(turboPath).json();
    turbo.tasks = turbo.tasks ?? {};
    let changed = false;
    if (!turbo.tasks["build:native"]) {
      turbo.tasks["build:native"] = {
        dependsOn: ["^build"],
        outputs: ["*.node", "index.js", "index.d.ts"],
        cache: false,
      };
      console.log("  ✓ Added turbo task build:native");
      changed = true;
    }
    if (!turbo.tasks["build:wasm"]) {
      turbo.tasks["build:wasm"] = {
        dependsOn: ["build:native"],
        outputs: ["*.wasi.cjs", "*.wasi-browser.js", "*.wasm"],
        cache: false,
      };
      console.log("  ✓ Added turbo task build:wasm");
      changed = true;
    }
    if (changed) {
      await Bun.write(turboPath, `${JSON.stringify(turbo, null, 2)}\n`);
    }
  }

  // 6. Example routes — unchanged, they talk to @scope/native through external.
  const exampleNativeDir = join(TARGET_DIR, "apps/example/src/pages/api/native");
  if (!(await exists(exampleNativeDir))) {
    console.log("  📦 Creating example native routes...");
    await mkdir(join(exampleNativeDir, "fibonacci"), { recursive: true });
    await mkdir(join(exampleNativeDir, "primes"), { recursive: true });

    await writeFile(
      join(exampleNativeDir, "index.ts"),
      `// TEMPLATE-ONLY:START(native)
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
    );

    await writeFile(
      join(exampleNativeDir, "add.ts"),
      `// TEMPLATE-ONLY:START(native)
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
    );

    await writeFile(
      join(exampleNativeDir, "status.ts"),
      `// TEMPLATE-ONLY:START(native)
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
    );

    console.log("  ✓ Example native routes");
  }

  console.log("\n✅ Native setup complete (Cargo workspace + napi-rs).\n");
  console.log("  Layout:");
  console.log(`    ${NATIVE_DIR}/Cargo.toml       virtual workspace`);
  console.log(`    ${NATIVE_DIR}/crates/<name>/   one crate per Rust unit`);
  console.log(`    ${NATIVE_DIR}/npm/<name>/      one npm package per binding\n`);
  console.log("  Commands:");
  console.log("    mnative list              # crates + packages");
  console.log("    mnative add <name>        # add a crate (+ npm package)");
  console.log("    mnative add shared --pure # pure Rust crate, no Node-API");
  console.log("    mnative check             # cargo check --workspace");
  console.log("    mnative napi:build        # build every package's .node");
  console.log("    mnative napi:build:wasm   # wasm32-wasip1-threads\n");
  console.log("  Next: bun install && mnative check && bun run build:native\n");
}

if (import.meta.main) {
  await main();
}
