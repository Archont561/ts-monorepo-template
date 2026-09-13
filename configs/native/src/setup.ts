#!/usr/bin/env bun
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $, file } from "bun";

/**
 * Setup script for native bindings — run when native config is enabled (publish/docker).
 * Scaffolds packages/native/ with Rust + napi-rs structure if not exists.
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
  console.log("\n🦀 Setting up native Rust bindings (napi-rs)...\n");

  // Check if already exists
  if (await exists(join(NATIVE_DIR, "Cargo.toml"))) {
    console.log(`  ✓ ${NATIVE_DIR}/ already exists, skipping scaffold`);
  } else {
    console.log(`  📦 Creating ${NATIVE_DIR}/...`);
    await mkdir(join(NATIVE_DIR, "src"), { recursive: true });

    // Cargo.toml
    const cargoToml = `[package]
name = "native"
version = "0.1.0"
edition = "2021"
description = "Native Rust bindings — napi-rs with WASM fallback"
license = "MIT"

[lib]
crate-type = ["cdylib"]
name = "native"

[dependencies]
napi = { version = "3.0.0", features = ["napi4"] }
napi-derive = "3.0.0"

[build-dependencies]
napi-build = "2"

[profile.release]
lto = true
codegen-units = 1
strip = "symbols"
opt-level = 3
`;

    await writeFile(join(NATIVE_DIR, "Cargo.toml"), cargoToml);
    console.log(`  ✓ Cargo.toml`);

    // build.rs
    await writeFile(
      join(NATIVE_DIR, "build.rs"),
      `extern crate napi_build;\nfn main() { napi_build::setup(); }\n`,
    );
    console.log(`  ✓ build.rs`);

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
`;
    await writeFile(join(NATIVE_DIR, "src/lib.rs"), libRs);
    console.log(`  ✓ src/lib.rs`);

    // package.json
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
        build: "napi build --release --platform",
        "build:debug": "napi build",
        "build:wasm": "napi build --release --target wasm32-wasip1-threads",
        "create-npm-dirs": "napi create-npm-dirs",
        artifacts: "napi artifacts",
        prepublish: "napi pre-publish",
        test: "bun test",
        typecheck: "tsc --noEmit",
      },
      devDependencies: {
        "@myorg/bunup": "workspace:*",
        "@myorg/ts": "workspace:*",
        "@napi-rs/cli": "^3.9.1",
      },
    };

    // Replace scope placeholder
    const scope = process.env.NATIVE_SCOPE ?? "@myorg";
    const pkgStr = JSON.stringify(pkgJson, null, 2).replaceAll("@myorg", scope);
    await writeFile(join(NATIVE_DIR, "package.json"), pkgStr);
    console.log(`  ✓ package.json`);

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
  }

  // Update root package.json scripts
  const rootPkgPath = join(TARGET_DIR, "package.json");
  if (await file(rootPkgPath).exists()) {
    const pkg = await file(rootPkgPath).json();
    pkg.scripts = pkg.scripts ?? {};
    if (!pkg.scripts["build:native"]) {
      pkg.scripts["build:native"] = "bun --filter @myorg/native run build";
      console.log(`  ✓ Added root script build:native`);
    }
    if (!pkg.scripts["build:wasm"]) {
      pkg.scripts["build:wasm"] = "bun --filter @myorg/native run build:wasm";
      console.log(`  ✓ Added root script build:wasm`);
    }
    if (!pkg.scripts["test:native"]) {
      pkg.scripts["test:native"] = "bun --filter @myorg/native test";
      console.log(`  ✓ Added root script test:native`);
    }
    await Bun.write(rootPkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }

  // Update turbo config
  const turboPath = join(TARGET_DIR, "configs/turbo/turbo.base.json");
  if (await file(turboPath).exists()) {
    const turbo = await file(turboPath).json();
    turbo.tasks = turbo.tasks ?? {};
    if (!turbo.tasks["build:native"]) {
      turbo.tasks["build:native"] = {
        dependsOn: ["^build"],
        outputs: ["*.node", "index.js", "index.d.ts"],
      };
      console.log(`  ✓ Added turbo task build:native`);
    }
    if (!turbo.tasks["build:wasm"]) {
      turbo.tasks["build:wasm"] = { dependsOn: ["build:native"], outputs: ["*.wasi.cjs"] };
      console.log(`  ✓ Added turbo task build:wasm`);
    }
    await Bun.write(turboPath, JSON.stringify(turbo, null, 2) + "\n");
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
    console.log(`  ✓ rust-toolchain.toml`);
  }

  console.log(`\n✅ Native setup complete. Next steps:\n`);
  console.log(`  1. bun install`);
  console.log(`  2. bun run build:native`);
  console.log(`  3. bun run test\n`);
  console.log(`  For WASM: rustup target add wasm32-wasip1-threads && bun run build:wasm\n`);
}

if (import.meta.main) {
  await main();
}
