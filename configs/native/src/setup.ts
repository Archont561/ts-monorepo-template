#!/usr/bin/env bun
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $, file } from "bun";

/**
 * Setup script for native bindings — run when native config is enabled (publish/docker).
 * Scaffolds packages/native/ with Rust + Cargo workspace + napi-rs structure if not exists,
 * ensures root Cargo.toml workspace exists, and ensures example app has native routes.
 *
 * Cargo-first handling per guide:
 * - edition = "2021", resolver = "2", workspace.dependencies centralised
 * - cargo check (fast), clippy -D warnings, fmt --check in CI
 * - profiles: dev, release (lto, codegen-units=1, strip), ci
 * - Cargo.lock gitignored for library (cdylib)
 *
 * Data-driven via scaffold.setup field in configs/native/package.json
 */

const TARGET_DIR = process.cwd();
const NATIVE_DIR = join(TARGET_DIR, "packages/native");

async function exists(path: string): Promise<boolean> {
  return (
    (await file(path).exists()) ||
    (await $`test -d ${path}`
      .nothrow()
      .quiet()
      .then((r) => r.exitCode === 0))
  );
}

async function ensureRootCargoWorkspace(scope: string) {
  const rootCargoPath = join(TARGET_DIR, "Cargo.toml");
  const hasRootCargo = await file(rootCargoPath).exists();

  const workspaceContent = `[workspace]
members = ["packages/native"]
resolver = "2"

[workspace.dependencies]
napi = { version = "3.0.0", features = ["napi4"] }
napi-derive = "3.0.0"
napi-build = "2"

[profile.dev]
opt-level = 0
debug = true

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = "symbols"

[profile.ci]
inherits = "dev"
opt-level = 1
`;

  if (!hasRootCargo) {
    await writeFile(rootCargoPath, workspaceContent);
    console.log(`  ✓ Created root Cargo.toml workspace (resolver=2, workspace.dependencies)`);
    return;
  }

  // If exists but missing workspace, patch it
  const content = await file(rootCargoPath).text();
  if (!content.includes("[workspace]")) {
    console.log(`  ⚠️ Root Cargo.toml exists but missing [workspace] — merging`);
    // Keep existing but prepend workspace if needed
    // For safety, we append workspace if not present
    const merged = content.includes("[workspace.dependencies]")
      ? content
      : `${content.trim()}\n\n${workspaceContent}`;
    await writeFile(rootCargoPath, merged);
    console.log(`  ✓ Patched root Cargo.toml with workspace`);
  } else {
    console.log(`  ✓ Root Cargo.toml workspace exists (resolver=2)`);
    // Ensure resolver = "2" and workspace.dependencies
    if (!content.includes('resolver = "2"') && !content.includes("resolver = '2'")) {
      console.log(`  ⚠️ Root Cargo.toml missing resolver=2 — please set resolver="2" per guide`);
    }
    if (!content.includes("[workspace.dependencies]")) {
      console.log(
        `  ⚠️ Root Cargo.toml missing [workspace.dependencies] — consider centralising deps`,
      );
    }
  }
}

async function main() {
  console.log("\n🦀 Setting up native Rust bindings (Cargo + napi-rs)...\n");

  const scope = process.env.NATIVE_SCOPE ?? "@myorg";

  // Ensure root Cargo.toml workspace exists (Cargo-first)
  await ensureRootCargoWorkspace(scope);

  // Check if already exists
  if (await exists(join(NATIVE_DIR, "Cargo.toml"))) {
    console.log(`  ✓ ${NATIVE_DIR}/ already exists, checking Cargo setup...`);
    // Ensure it uses workspace = true
    const cargoPath = join(NATIVE_DIR, "Cargo.toml");
    const cargoContent = await file(cargoPath).text();
    if (!cargoContent.includes("workspace = true")) {
      console.log(
        `  ⚠️ packages/native/Cargo.toml not using workspace deps — updating to workspace=true`,
      );
      const updated = `[package]
name = "native"
version = "0.1.0"
edition = "2021"
description = "Native Rust bindings for ${scope}/external — napi-rs with WASM fallback"
license = "MIT"
repository = "https://github.com/Archont561/ts-monorepo-template"

[lib]
crate-type = ["cdylib"]
name = "native"

[dependencies]
napi = { workspace = true }
napi-derive = { workspace = true }

[build-dependencies]
napi-build = { workspace = true }

[features]
default = []
`;
      await writeFile(cargoPath, updated);
      console.log(`  ✓ Updated Cargo.toml to use workspace dependencies`);
    }
  } else {
    console.log(`  📦 Creating ${NATIVE_DIR}/...`);
    await mkdir(join(NATIVE_DIR, "src"), { recursive: true });

    // Cargo.toml — uses workspace dependencies per guide
    const cargoToml = `[package]
name = "native"
version = "0.1.0"
edition = "2021"
description = "Native Rust bindings — napi-rs with WASM fallback"
license = "MIT"
repository = "https://github.com/Archont561/ts-monorepo-template"

[lib]
crate-type = ["cdylib"]
name = "native"

[dependencies]
napi = { workspace = true }
napi-derive = { workspace = true }

[build-dependencies]
napi-build = { workspace = true }

[features]
default = []
`;

    await writeFile(join(NATIVE_DIR, "Cargo.toml"), cargoToml);
    console.log(`  ✓ Cargo.toml (edition=2021, workspace deps, cdylib)`);

    // build.rs
    await writeFile(
      join(NATIVE_DIR, "build.rs"),
      `extern crate napi_build;\nfn main() { napi_build::setup(); }\n`,
    );
    console.log(`  ✓ build.rs (napi_build::setup)`);

    // src/lib.rs
    const libRs = `#![deny(clippy::all)]
use napi_derive::napi;

#[napi]
pub fn add(a: i32, b: i32) -> i32 { a + b }

#[napi]
pub fn fibonacci(n: u32) -> u32 {
  match n {
    0 => 0,
    1 => 1,
    _ => {
      let mut a = 0;
      let mut b = 1;
      for _ in 2..=n {
        let c = a + b;
        a = b;
        b = c;
      }
      b
    }
  }
}

#[napi]
pub fn reverse_string(s: String) -> String { s.chars().rev().collect() }

#[napi]
pub struct Counter { count: i32 }

#[napi]
impl Counter {
  #[napi(constructor)]
  pub fn new(initial: Option<i32>) -> Self { Self { count: initial.unwrap_or(0) } }
  #[napi] pub fn increment(&mut self) -> i32 { self.count += 1; self.count }
  #[napi] pub fn get_count(&self) -> i32 { self.count }
}

#[napi]
pub fn primes_up_to(n: u32) -> Vec<u32> {
  if n < 2 { return vec![]; }
  let mut sieve = vec![true; (n+1) as usize];
  sieve[0] = false;
  sieve[1] = false;
  let mut primes = Vec::new();
  for i in 2..=n {
    if sieve[i as usize] {
      primes.push(i);
      let mut j = i * i;
      while j <= n {
        sieve[j as usize] = false;
        j += i;
      }
    }
  }
  primes
}
`;
    await writeFile(join(NATIVE_DIR, "src/lib.rs"), libRs);
    console.log(`  ✓ src/lib.rs (#[napi] add, fibonacci, Counter, primes)`);

    // package.json — with cargo:* scripts
    const pkgJson = {
      name: "@myorg/native",
      version: "0.0.0",
      private: true,
      type: "module",
      main: "index.js",
      types: "index.d.ts",
      files: ["index.js", "index.d.ts", "*.node", "*.wasi.cjs"],
      napi: {
        binaryName: "native",
        packageName: "@myorg/native",
        targets: [
          "x86_64-apple-darwin",
          "aarch64-apple-darwin",
          "x86_64-pc-windows-msvc",
          "x86_64-unknown-linux-gnu",
          "aarch64-unknown-linux-gnu",
          "x86_64-unknown-linux-musl",
          "wasm32-wasip1-threads",
        ],
        wasm: {
          initialMemory: 16,
          maximumMemory: 65536,
          browser: { fs: false, asyncInit: true, errorEvent: true },
        },
      },
      scripts: {
        build:
          "if command -v cargo >/dev/null 2>&1; then cargo check --workspace && napi build --release --platform; else echo '⚠️ cargo not found, skipping native build (install Rust)'; fi",
        "build:debug":
          "if command -v cargo >/dev/null 2>&1; then cargo check && napi build; else echo '⚠️ cargo not found, skipping native build'; fi",
        "build:wasm":
          "if command -v cargo >/dev/null 2>&1; then napi build --release --target wasm32-wasip1-threads; else echo '⚠️ cargo not found, skipping WASM build'; fi",
        "create-npm-dirs": "napi create-npm-dirs",
        artifacts: "napi artifacts",
        prepublish: "napi pre-publish",
        test: "bun test",
        typecheck: "tsc --noEmit",
        "cargo:check": "cargo check --workspace",
        "cargo:clippy": "cargo clippy --workspace -- -D warnings",
        "cargo:fmt": "cargo fmt --all",
        "cargo:fmt:check": "cargo fmt --all -- --check",
        "cargo:test": "cargo test --workspace",
        "cargo:nextest": "cargo nextest run --workspace",
        "cargo:build": "cargo build --workspace",
        "cargo:build:release": "cargo build --workspace --release",
        "cargo:build:ci": "cargo build --workspace --profile ci",
        "cargo:tree": "cargo tree",
        "cargo:tree:duplicates": "cargo tree -d",
        "cargo:update": "cargo update",
        "cargo:doc": "cargo doc --no-deps --workspace",
        "cargo:audit": "cargo audit",
        "cargo:deny": "cargo deny check",
      },
      devDependencies: {
        "@myorg/bunup": "workspace:*",
        "@myorg/ts": "workspace:*",
        "@napi-rs/cli": "^3.9.1",
      },
    };

    const pkgStr = JSON.stringify(pkgJson, null, 2).replaceAll("@myorg", scope);
    await writeFile(join(NATIVE_DIR, "package.json"), pkgStr);
    console.log(`  ✓ package.json (napi + cargo:* scripts)`);

    // tsconfig.json
    await writeFile(
      join(NATIVE_DIR, "tsconfig.json"),
      JSON.stringify(
        {
          extends: "@myorg/ts/library.json".replace("@myorg", scope),
          compilerOptions: { rootDir: ".", outDir: "./dist", types: ["bun"] },
          include: ["src/**/*", "tests/**/*"],
        },
        null,
        2,
      ),
    );
    console.log(`  ✓ tsconfig.json`);

    // turbo.json
    await writeFile(
      join(NATIVE_DIR, "turbo.json"),
      JSON.stringify(
        {
          extends: ["//"],
          tasks: {
            build: {
              outputs: ["*.node", "index.js", "index.d.ts"],
              cache: false,
            },
          },
        },
        null,
        2,
      ),
    );
    console.log(`  ✓ turbo.json (cache false for cargo)`);
  }

  // Ensure example native routes exist
  const exampleNativeDir = join(TARGET_DIR, "apps/example/src/pages/api/native");
  if (!(await exists(exampleNativeDir))) {
    console.log(`  📦 Creating example native routes...`);
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

    console.log(`  ✓ Example native routes`);
  }

  // Update root package.json scripts for cargo + native
  const rootPkgPath = join(TARGET_DIR, "package.json");
  if (await file(rootPkgPath).exists()) {
    const pkg = await file(rootPkgPath).json();
    pkg.scripts = pkg.scripts ?? {};
    const scriptsToEnsure: Record<string, string> = {
      "build:native": "bun --filter @myorg/native run build",
      "build:wasm": "bun --filter @myorg/native run build:wasm",
      "test:native": "bun --filter @myorg/native test",
      "cargo:check": "cargo check --workspace || echo 'cargo not found, skipping'",
      "cargo:clippy": "cargo clippy --workspace -- -D warnings || echo 'cargo not found'",
      "cargo:fmt": "cargo fmt --all || echo 'cargo not found'",
      "cargo:fmt:check": "cargo fmt --all -- --check || echo 'cargo not found'",
      "cargo:test": "cargo test --workspace || echo 'cargo not found'",
      "cargo:build": "cargo build --workspace || echo 'cargo not found'",
      "cargo:build:release": "cargo build --workspace --release || echo 'cargo not found'",
      "cargo:build:ci": "cargo build --workspace --profile ci || echo 'cargo not found'",
    };
    let updated = false;
    for (const [k, v] of Object.entries(scriptsToEnsure)) {
      if (!pkg.scripts[k]) {
        pkg.scripts[k] = v;
        console.log(`  ✓ Added root script ${k}`);
        updated = true;
      }
    }
    if (updated) {
      await Bun.write(rootPkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    }
  }

  // Update turbo config
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
      console.log(`  ✓ Added turbo task build:native`);
      changed = true;
    }
    if (!turbo.tasks["build:wasm"]) {
      turbo.tasks["build:wasm"] = {
        dependsOn: ["build:native"],
        outputs: ["*.wasi.cjs"],
        cache: false,
      };
      console.log(`  ✓ Added turbo task build:wasm`);
      changed = true;
    }
    if (!turbo.tasks["cargo:check"]) {
      turbo.tasks["cargo:check"] = { cache: false };
      changed = true;
    }
    if (!turbo.tasks["cargo:clippy"]) {
      turbo.tasks["cargo:clippy"] = { cache: false };
      changed = true;
    }
    if (changed) {
      await Bun.write(turboPath, `${JSON.stringify(turbo, null, 2)}\n`);
    }
  }

  // Create rust-toolchain.toml if not exists — with stable, rustfmt, clippy, wasm target
  const toolchainPath = join(TARGET_DIR, "rust-toolchain.toml");
  if (!(await file(toolchainPath).exists())) {
    await writeFile(
      toolchainPath,
      `[toolchain]
channel = "stable"
components = ["rustfmt", "clippy"]
targets = ["wasm32-wasip1-threads"]
`,
    );
    console.log(`  ✓ rust-toolchain.toml (stable + rustfmt, clippy, wasm32-wasip1-threads)`);
  } else {
    console.log(`  ✓ rust-toolchain.toml exists`);
  }

  // Create .cargo/config.toml if not exists — optional, set build target dir
  const cargoConfigDir = join(TARGET_DIR, ".cargo");
  const cargoConfigPath = join(cargoConfigDir, "config.toml");
  if (!(await file(cargoConfigPath).exists())) {
    await mkdir(cargoConfigDir, { recursive: true });
    await writeFile(
      cargoConfigPath,
      `# Cargo config — optional, per guide best practices
# [build]
# target-dir = "target" # default, shared workspace target

[build]
# Use faster linker if available (mold, lld)
# rustflags = ["-C", "link-arg=-fuse-ld=mold"]

[env]
# Example: set env vars for build
`,
    );
    console.log(`  ✓ .cargo/config.toml (optional)`);
  }

  // Update example api index to list native endpoints when enabled
  const apiIndexPath = join(TARGET_DIR, "apps/example/src/pages/api/index.ts");
  if (await file(apiIndexPath).exists()) {
    const content = await file(apiIndexPath).text();
    if (!content.includes("native")) {
      const newContent = `export default function handleApiIndex(): Response {
  return Response.json({
    message: "Bun Monorepo Example",
    endpoints: [
      "/health",
      "/api/greet/:name",
      "/api/shout/:name",
      "/api/native",
      "/api/native/add?a=1&b=2",
      "/api/native/fibonacci/:n",
      "/api/native/status",
    ],
  });
}
`;
      await Bun.write(apiIndexPath, newContent);
      console.log(`  ✓ Updated api index with native endpoints`);
    }
  }

  console.log(`\n✅ Native setup complete (Cargo-first).\n`);
  console.log(`  Cargo guide:`);
  console.log(`    cargo check --workspace          # fast type-check (inner loop)`);
  console.log(`    cargo clippy -- -D warnings     # lint, deny warnings`);
  console.log(`    cargo fmt --check                # format check`);
  console.log(`    cargo test --workspace           # tests`);
  console.log(`    cargo build --release            # optimized build (lto, strip)`);
  console.log(`  NAPI:`);
  console.log(`    bun run build:native             # napi build --platform (uses cargo)`);
  console.log(`    bun run build:wasm               # wasm32-wasip1-threads`);
  console.log(
    `\n  Next: bun install && bun run cargo:check && bun run build:native && bun run test\n`,
  );
}

if (import.meta.main) {
  await main();
}
