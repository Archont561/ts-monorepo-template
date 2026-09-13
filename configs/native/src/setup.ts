#!/usr/bin/env bun
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $, file } from "bun";

/**
 * Setup script for native bindings — run when native config is enabled (publish/docker).
 * Scaffolds packages/native/ with self-contained Cargo.toml + napi-rs structure.
 *
 * Refactored: No root Cargo.toml — packages/native/Cargo.toml is standalone
 * (edition 2021, direct deps, profiles dev/release/ci). All cargo operations
 * via mnative CLI (configs/native/src/cli.ts) or bun --filter @myorg/native.
 *
 * Cargo-first handling:
 * - edition = "2021"
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

async function main() {
  console.log("\n🦀 Setting up native Rust bindings (Cargo + napi-rs)...\n");
  console.log("  Mode: self-contained (no root Cargo.toml, packages/native/Cargo.toml only)");
  console.log("  CLI: mnative (cargo wrapper) + napi\n");

  const scope = process.env.NATIVE_SCOPE ?? "@myorg";

  // Check if already exists
  if (await exists(join(NATIVE_DIR, "Cargo.toml"))) {
    console.log(`  ✓ ${NATIVE_DIR}/ already exists, checking Cargo setup...`);
    const cargoPath = join(NATIVE_DIR, "Cargo.toml");
    const cargoContent = await file(cargoPath).text();

    // Migrate from workspace=true to standalone if needed
    if (cargoContent.includes("workspace = true")) {
      console.log(`  ⚠️ Migrating Cargo.toml from workspace=true to standalone...`);
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
napi = { version = "3.0.0", features = ["napi4"] }
napi-derive = "3.0.0"

[build-dependencies]
napi-build = "2"

[features]
default = []

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
      await writeFile(cargoPath, updated);
      console.log(`  ✓ Updated Cargo.toml to standalone (no workspace)`);
    } else if (!cargoContent.includes("[profile.release]")) {
      console.log(`  ⚠️ Adding missing profiles to Cargo.toml`);
      const withProfiles =
        cargoContent.trim() +
        `

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
      await writeFile(cargoPath, withProfiles);
      console.log(`  ✓ Added profiles`);
    }
  } else {
    console.log(`  📦 Creating ${NATIVE_DIR}/...`);
    await mkdir(join(NATIVE_DIR, "src"), { recursive: true });

    // Cargo.toml — self-contained (no workspace)
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
napi = { version = "3.0.0", features = ["napi4"] }
napi-derive = "3.0.0"

[build-dependencies]
napi-build = "2"

[features]
default = []

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

    await writeFile(join(NATIVE_DIR, "Cargo.toml"), cargoToml);
    console.log(`  ✓ Cargo.toml (edition=2021, standalone, cdylib, profiles)`);

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

    // package.json — all cargo via mnative CLI (single source of truth)
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
          browser: { fs: false, asyncInit: true },
        },
      },
      scripts: {
        build: "mnative napi:build",
        "build:debug": "mnative napi:build:debug",
        "build:wasm": "mnative napi:build:wasm",
        "create-npm-dirs": "mnative napi create-npm-dirs",
        artifacts: "mnative napi artifacts",
        prepublish: "mnative napi pre-publish",
        test: "mbun test",
        typecheck: "mtsc --noEmit",
        "cargo:check": "mnative check",
        "cargo:clippy": "mnative clippy",
        "cargo:fmt": "mnative fmt",
        "cargo:fmt:check": "mnative fmt:check",
        "cargo:test": "mnative test",
        "cargo:nextest": "mnative nextest",
        "cargo:build": "mnative build",
        "cargo:build:release": "mnative build:release",
        "cargo:build:ci": "mnative build:ci",
        "cargo:tree": "mnative tree",
        "cargo:tree:duplicates": "mnative tree -d",
        "cargo:update": "mnative update",
        "cargo:doc": "mnative doc",
        "cargo:audit": "mnative audit",
        "cargo:deny": "mnative deny check",
      },
      devDependencies: {
        "@myorg/bun-config": "workspace:*",
        "@myorg/bunup": "workspace:*",
        "@myorg/native-config": "workspace:*",
        "@myorg/ts": "workspace:*",
        "@napi-rs/cli": "^3.9.1",
      },
    };

    const pkgStr = JSON.stringify(pkgJson, null, 2).replaceAll("@myorg", scope);
    await writeFile(join(NATIVE_DIR, "package.json"), pkgStr);
    console.log(`  ✓ package.json (napi + cargo:* scripts via mnative)`);

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

  // Remove root Cargo.toml if exists (migrated to self-contained)
  const rootCargoPath = join(TARGET_DIR, "Cargo.toml");
  if (await file(rootCargoPath).exists()) {
    const content = await file(rootCargoPath).text();
    if (content.includes('members = ["packages/native"]') || content.includes("[workspace]")) {
      console.log(
        `  🗑️ Removing root Cargo.toml (migrated to packages/native/Cargo.toml self-contained)`,
      );
      await $`rm -f ${rootCargoPath}`.quiet();
    }
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

  // Update root package.json scripts — only build wrappers, no cargo:* (cargo via mnative directly)
  const rootPkgPath = join(TARGET_DIR, "package.json");
  if (await file(rootPkgPath).exists()) {
    const pkg = await file(rootPkgPath).json();
    pkg.scripts = pkg.scripts ?? {};
    const scriptsToEnsure: Record<string, string> = {
      "build:native": "bun --filter @myorg/native run build",
      "build:wasm": "bun --filter @myorg/native run build:wasm",
      "test:native": "bun --filter @myorg/native run test",
    };
    // Remove old cargo:* scripts from root (now only via mnative CLI directly)
    const cargoScripts = [
      "cargo:check",
      "cargo:clippy",
      "cargo:fmt",
      "cargo:fmt:check",
      "cargo:test",
      "cargo:build",
      "cargo:build:release",
      "cargo:build:ci",
    ];
    let updated = false;
    for (const k of cargoScripts) {
      if (pkg.scripts[k]) {
        delete pkg.scripts[k];
        console.log(
          `  🗑️ Removed root script ${k} (use mnative ${k.replace("cargo:", "")} directly)`,
        );
        updated = true;
      }
    }
    for (const [k, v] of Object.entries(scriptsToEnsure)) {
      if (pkg.scripts[k] !== v) {
        pkg.scripts[k] = v;
        console.log(`  ✓ Set root script ${k} → ${v}`);
        updated = true;
      }
    }
    if (updated) {
      await Bun.write(rootPkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
    }
  }

  // Update turbo config — only build:native and build:wasm, no cargo:* (cargo via mnative directly)
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
    // Remove old cargo:* turbo tasks (now via mnative CLI directly)
    const oldCargoTasks = [
      "cargo:check",
      "cargo:clippy",
      "cargo:fmt",
      "cargo:fmt:check",
      "cargo:test",
      "cargo:build",
      "cargo:build:release",
      "cargo:build:ci",
    ];
    for (const t of oldCargoTasks) {
      if (turbo.tasks[t]) {
        delete turbo.tasks[t];
        console.log(`  🗑️ Removed turbo task ${t} (use mnative directly)`);
        changed = true;
      }
    }
    if (changed) {
      await Bun.write(turboPath, `${JSON.stringify(turbo, null, 2)}\n`);
    }
  }

  // Create rust-toolchain.toml if not exists
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

  // Create .cargo/config.toml if not exists
  const cargoConfigDir = join(TARGET_DIR, ".cargo");
  const cargoConfigPath = join(cargoConfigDir, "config.toml");
  if (!(await file(cargoConfigPath).exists())) {
    await mkdir(cargoConfigDir, { recursive: true });
    await writeFile(
      cargoConfigPath,
      `# Cargo config — optional
# No workspace root needed, self-contained packages/native/Cargo.toml

[build]
# Use faster linker if available
# rustflags = ["-C", "link-arg=-fuse-ld=mold"]
`,
    );
    console.log(`  ✓ .cargo/config.toml (optional)`);
  }

  console.log(`\n✅ Native setup complete (self-contained, no root Cargo.toml).\n`);
  console.log(`  Cargo via mnative CLI:`);
  console.log(`    mnative check              # cargo check (fast)`);
  console.log(`    mnative clippy             # cargo clippy -D warnings`);
  console.log(`    mnative fmt:check          # cargo fmt --check`);
  console.log(`    mnative test               # cargo test`);
  console.log(`    mnative build:release      # cargo build --release (lto, strip)`);
  console.log(`  NAPI:`);
  console.log(`    bun run build:native       # mnative napi:build`);
  console.log(`    bun run build:wasm         # mnative napi:build:wasm`);
  console.log(`\n  Next: bun install && mnative check && bun run build:native && bun run test\n`);
}

if (import.meta.main) {
  await main();
}
