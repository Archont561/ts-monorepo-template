#!/usr/bin/env bun
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { $, file } from "bun";

/**
 * Setup script for native bindings — run when native config is enabled (publish/docker).
 * Scaffolds packages/native/ with Rust + napi-rs structure if not exists,
 * and ensures example app has native routes.
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
        build:
          "if command -v cargo >/dev/null 2>&1; then napi build --release --platform; else echo '⚠️ cargo not found, skipping native build'; fi",
        "build:debug":
          "if command -v cargo >/dev/null 2>&1; then napi build; else echo '⚠️ cargo not found'; fi",
        "build:wasm":
          "if command -v cargo >/dev/null 2>&1; then napi build --release --target wasm32-wasip1-threads; else echo '⚠️ cargo not found'; fi",
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
    console.log(`  ✓ turbo.json`);
  }

  // Ensure example native routes exist
  const exampleNativeDir = join(TARGET_DIR, "apps/example/src/pages/api/native");
  if (!(await exists(exampleNativeDir))) {
    console.log(`  📦 Creating example native routes...`);
    await mkdir(join(exampleNativeDir, "fibonacci"), { recursive: true });
    await mkdir(join(exampleNativeDir, "primes"), { recursive: true });

    // index.ts
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

    // add.ts
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

    // status.ts
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
    await Bun.write(rootPkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
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
    await Bun.write(turboPath, `${JSON.stringify(turbo, null, 2)}\n`);
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

  console.log(`\n✅ Native setup complete. Next steps:\n`);
  console.log(`  1. bun install`);
  console.log(`  2. bun run build:native`);
  console.log(`  3. bun run test\n`);
}

if (import.meta.main) {
  await main();
}
