import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  NATIVE_TARGET_TRIPLES,
  NATIVE_WASM_TARGET,
  type NativeCrateSpec,
  nativeCrateDir,
  nativePackageDir,
} from "../index.ts";

/**
 * File templates for the Rust workspace.
 *
 * Shared by `mnative setup` (which writes the whole workspace) and
 * `mnative add` (which appends one crate + package), so the two can never
 * drift. No workspace imports: `setup.ts` runs before `bun install`.
 */

export type TemplateOptions = {
  /** npm scope, e.g. `@acme`. */
  scope?: string;
  /** Repository URL written into Cargo manifests. */
  repository?: string;
};

const SCOPE = (options: TemplateOptions): string => options.scope ?? "@myorg";
const REPO = (options: TemplateOptions): string =>
  options.repository ?? "https://github.com/OWNER/REPO";

/**
 * Virtual workspace root — no `[package]` table. Members are listed explicitly
 * so `cargo` never guesses, and every crate inherits version/edition/lints.
 */
export function workspaceCargoToml(crates: NativeCrateSpec[], options: TemplateOptions): string {
  const members = crates.length
    ? crates.map((crate) => `  "crates/${crate.name}",`).join("\n")
    : "  # no crates yet — add one with `mnative add <name>`";
  const shared = crates.some((crate) => (crate.uses ?? []).includes("shared"));
  const lines = [
    "# Virtual Cargo workspace — no [package] here, only members.",
    "# Everything Rust lives under packages/native, so the repo root stays clean.",
    "[workspace]",
    'resolver = "3"',
    "members = [",
    members,
    "]",
    "",
    "[workspace.package]",
    'edition    = "2024"',
    'version    = "0.1.0"',
    'license    = "MIT"',
    `repository = "${REPO(options)}"`,
    "",
    "[workspace.dependencies]",
    "# napi crates — pinned together",
    'napi         = { version = "3", features = ["napi4"] }',
    'napi-derive  = "3"',
    'napi-build   = "2"',
  ];
  if (shared) lines.push('shared       = { path = "crates/shared" }');
  lines.push(
    "",
    "[workspace.lints.rust]",
    "# pedantic is left off on purpose: #[napi] generates code that trips it,",
    "# and CI runs clippy with -D warnings.",
    'unsafe_code = "forbid"',
    "",
    "[workspace.lints.clippy]",
    'all = "warn"',
    "",
  );
  return lines.join("\n");
}

/** A crate manifest — `cdylib` for bindings, plain lib for pure Rust. */
export function crateCargoToml(spec: NativeCrateSpec): string {
  const lines = [
    "[package]",
    `name    = "${spec.name}"`,
    "version.workspace    = true",
    "edition.workspace    = true",
    "license.workspace    = true",
    "repository.workspace = true",
    "",
  ];

  if (spec.binding) {
    lines.push(
      "[lib]",
      "# required — produces the .node binary napi packages",
      'crate-type = ["cdylib"]',
      "",
      "[dependencies]",
      "napi.workspace        = true",
      "napi-derive.workspace = true",
      ...(spec.uses ?? []).map((dep) => `${dep}.workspace = true`),
      "",
      "[build-dependencies]",
      "napi-build.workspace = true",
      "",
    );
  } else {
    lines.push(
      "# Pure Rust — no napi dependency, no cdylib: testable without a Node runtime.",
      "[dependencies]",
      ...(spec.uses ?? []).map((dep) => `${dep}.workspace = true`),
      "",
    );
  }

  lines.push("[lints]", "workspace = true", "");
  return lines.join("\n");
}

export const crateBuildRs = (): string =>
  `extern crate napi_build;\n\nfn main() {\n  napi_build::setup();\n}\n`;

/** Sample bindings — the same surface the example app routes call. */
export function crateLibRs(spec: NativeCrateSpec): string {
  if (!spec.binding) {
    return `//! Pure Rust helpers shared by the binding crates.
//!
//! Nothing here may depend on napi — that keeps it testable with plain
//! \`cargo test\` and reusable from a future WASM-only crate.

/// Sum two numbers.
pub fn add(a: i32, b: i32) -> i32 {
  a + b
}

/// Compute the nth Fibonacci number.
pub fn fibonacci(n: u32) -> u32 {
  match n {
    0 => 0,
    1 => 1,
    _ => {
      let (mut a, mut b) = (0u32, 1u32);
      for _ in 2..=n {
        let c = a + b;
        a = b;
        b = c;
      }
      b
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn adds() {
    assert_eq!(add(2, 3), 5);
  }

  #[test]
  fn fibonacci_sequence() {
    assert_eq!(fibonacci(10), 55);
  }
}
`;
  }

  const usesShared = (spec.uses ?? []).length > 0;
  const prelude = usesShared
    ? (spec.uses ?? [])
        .map((dep) => `use ${dep.replace(/-/g, "_")}::fibonacci as ${dep}_fibonacci;`)
        .join("\n")
    : "";
  const fibBody = usesShared
    ? `  ${(spec.uses ?? [])[0]}_fibonacci(n)`
    : `  match n {
    0 => 0,
    1 => 1,
    _ => {
      let mut a = 0u32;
      let mut b = 1u32;
      for _ in 2..=n {
        let c = a + b;
        a = b;
        b = c;
      }
      b
    }
  }`;

  return `#![deny(clippy::all)]

use napi_derive::napi;
${prelude}

/// Add two numbers in Rust.
#[napi]
pub fn add(a: i32, b: i32) -> i32 {
  a + b
}

/// Compute the nth Fibonacci number.
#[napi]
pub fn fibonacci(n: u32) -> u32 {
${fibBody}
}

/// Reverse a string by chars (handles multi-byte input).
#[napi]
pub fn reverse_string(s: String) -> String {
  s.chars().rev().collect()
}

/// Mutable struct exposed to JS as a class.
#[napi]
pub struct Counter {
  count: i32,
}

#[napi]
impl Counter {
  #[napi(constructor)]
  pub fn new(initial: Option<i32>) -> Self {
    Self { count: initial.unwrap_or(0) }
  }

  #[napi]
  pub fn increment(&mut self) -> i32 {
    self.count += 1;
    self.count
  }

  #[napi]
  pub fn get_count(&self) -> i32 {
    self.count
  }
}

/// Sieve of Eratosthenes — the sample workload for native vs JS benchmarks.
#[napi]
pub fn primes_up_to(n: u32) -> Vec<u32> {
  if n < 2 {
    return vec![];
  }
  let mut sieve = vec![true; (n + 1) as usize];
  sieve[0] = false;
  sieve[1] = false;
  let mut primes = Vec::new();
  let mut i = 2u32;
  while i <= n {
    if sieve[i as usize] {
      primes.push(i);
      let mut j = i * i;
      while j <= n {
        sieve[j as usize] = false;
        j += i;
      }
    }
    i += 1;
  }
  primes
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn adds() {
    assert_eq!(add(2, 3), 5);
  }

  #[test]
  fn reverses() {
    assert_eq!(reverse_string("hello".to_string()), "olleh");
  }
}
`;
}

/** Root npm package for a binding crate — platform packages are generated. */
export function npmPackageJson(
  spec: NativeCrateSpec,
  options: TemplateOptions,
): Record<string, unknown> {
  const scope = SCOPE(options);
  const name = `${scope}/${spec.name}`;
  return {
    name,
    version: "0.0.0",
    // Private by default: publish with changesets after flipping this off.
    private: true,
    type: "module",
    main: "index.js",
    types: "index.d.ts",
    exports: {
      ".": {
        types: "./index.d.ts",
        require: "./index.js",
        import: "./index.js",
      },
      "./wasi": {
        types: "./index.d.ts",
        require: `./${spec.name}.wasi.cjs`,
        browser: `./${spec.name}.wasi-browser.js`,
      },
    },
    files: [
      "index.js",
      "index.d.ts",
      `*.node`,
      `${spec.name}.wasi.cjs`,
      `${spec.name}.wasi-browser.js`,
      `${spec.name}.wasm`,
    ],
    napi: {
      binaryName: spec.name,
      packageName: name,
      targets: [...NATIVE_TARGET_TRIPLES],
      wasm: {
        initialMemory: 16,
        maximumMemory: 65536,
        browser: { fs: false, asyncInit: true, errorEvent: true },
      },
    },
    scripts: {
      build: `mnative napi:build --only ${spec.name}`,
      "build:debug": `mnative napi:build:debug --only ${spec.name}`,
      "build:wasm": `mnative napi:build:wasm --only ${spec.name}`,
      "create-npm-dirs": `mnative create-npm-dirs --only ${spec.name}`,
      artifacts: `mnative artifacts --only ${spec.name}`,
      test: "mbun test",
      "test:watch": "mbun test --watch",
      typecheck: "mtsc --noEmit",
      "cargo:check": "mnative check",
      "cargo:clippy": "mnative clippy",
      "cargo:fmt": "mnative fmt",
      "cargo:fmt:check": "mnative fmt:check",
      "cargo:test": "mnative test",
    },
    devDependencies: {
      [`${scope}/bun-config`]: "workspace:*",
      [`${scope}/native-config`]: "workspace:*",
      [`${scope}/ts`]: "workspace:*",
      "@napi-rs/cli": "^3.9.1",
    },
  };
}

/**
 * `tsconfig.json` for a binding package, written as text rather than
 * serialized: `JSON.stringify(..., null, 2)` puts every array element on its
 * own line, and the generated project's `biome check` rejects that.
 *
 * `index.d.ts` is produced by `napi build`, so the committed test file is what
 * gives `mtsc` an input until the first build runs.
 */
export function npmTsConfig(scope: string): string {
  return `{
  "extends": "${scope}/ts/library.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "./dist",
    "types": ["bun"]
  },
  "include": ["index.d.ts", "tests/**/*"]
}
`;
}

/**
 * Package-level Turbo config: builds are never cached (they call cargo) and
 * their outputs are the napi artifacts, not `dist/`.
 */
export const npmTurboJson = (): string => `{
  "extends": ["//"],
  "tasks": {
    "build": {
      "outputs": ["*.node", "index.js", "index.d.ts"],
      "cache": false
    },
    "build:wasm": {
      "outputs": ["*.wasi.cjs", "*.wasi-browser.js", "*.wasm"],
      "cache": false
    },
    "cargo:check": {
      "cache": false
    },
    "cargo:clippy": {
      "cache": false
    }
  }
}
`;

/**
 * Structure test for a generated binding package — mirrors the one shipped
 * with the first crate, so a fresh `mnative add` package has both a
 * `typecheck` input and a `test` that runs without the Rust toolchain.
 */
export const npmPackageTest = (spec: NativeCrateSpec): string => {
  const name = spec.name;
  return `import { describe, expect, it } from "bun:test";

// Structure tests: the workspace is the source of truth for where things live.
// The Rust code itself is covered by \`cargo test\`, the JS fallback path by
// packages/external.

const NAME = "${name}";
const CRATE = \`../../crates/\${NAME}\`;

describe(\`\${NAME} crate\`, () => {
  it("is listed in the workspace manifest", async () => {
    const content = await Bun.file("../../Cargo.toml").text();
    expect(content).toContain(\`"crates/\${NAME}"\`);
  });

  it("is a cdylib binding crate", async () => {
    const content = await Bun.file(\`\${CRATE}/Cargo.toml\`).text();
    expect(content).toContain(\`name    = "\${NAME}"\`);
    expect(content).toContain("cdylib");
    expect(content).toContain("napi-derive");
  });

  it("has a build.rs calling napi_build::setup", async () => {
    const content = await Bun.file(\`\${CRATE}/build.rs\`).text();
    expect(content).toContain("napi_build::setup");
  });

  it("declares the napi config for every target", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.napi.binaryName).toBe(NAME);
    expect(pkg.napi.targets).toContain("wasm32-wasip1-threads");
    expect(pkg.napi.wasm).toBeDefined();
  });
});
`;
};

export const rustToolchainToml = (): string => `[toolchain]
channel = "stable"
components = ["rustfmt", "clippy"]
targets = ["${NATIVE_WASM_TARGET}"]
`;

export const cargoConfigToml =
  (): string => `# Cargo config for packages/native — no root Cargo.toml in this repo.
#
# WASI builds need a linker; CI sets WASI_SDK_PATH before building.

[build]
# Uncomment to use a faster linker when available (mold, lld)
# rustflags = ["-C", "link-arg=-fuse-ld=mold"]
`;

export const nativeGitignore = (): string => `# Rust build output
target/

# Generated by \`napi build\` — index.js, index.d.ts and the binaries
npm/*/index.js
npm/*/index.d.ts
npm/*/*.node
npm/*/*.wasm
npm/*/*.wasi.cjs
npm/*/*.wasi-browser.js
npm/*/wasi-worker*.mjs

# Generated per platform by \`napi create-npm-dirs\` in CI
npm/*-*/
`;

/**
 * Writes one crate (and, for bindings, its npm package) under the workspace.
 * Existing files are left alone — this is used by both a fresh setup and
 * `mnative add`.
 */
export async function writeCrate(
  root: string,
  spec: NativeCrateSpec,
  options: TemplateOptions = {},
): Promise<{ crate: string; package?: string }> {
  const crateDir = join(root, nativeCrateDir(spec.name));
  await mkdir(join(crateDir, "src"), { recursive: true });
  await writeFile(join(crateDir, "Cargo.toml"), crateCargoToml(spec));
  await writeFile(join(crateDir, "src", "lib.rs"), crateLibRs(spec));
  if (spec.binding) {
    await writeFile(join(crateDir, "build.rs"), crateBuildRs());
  }

  if (!spec.binding) return { crate: crateDir };

  const packageDir = join(root, nativePackageDir(spec.name));
  await mkdir(packageDir, { recursive: true });
  await writeFile(
    join(packageDir, "package.json"),
    `${JSON.stringify(npmPackageJson(spec, options), null, 2)}\n`,
  );
  await writeFile(join(packageDir, "tsconfig.json"), npmTsConfig(SCOPE(options)));
  await writeFile(join(packageDir, "turbo.json"), npmTurboJson());
  await mkdir(join(packageDir, "tests"), { recursive: true });
  await writeFile(join(packageDir, "tests", `${spec.name}.test.ts`), npmPackageTest(spec));

  return { crate: crateDir, package: packageDir };
}

/** Rewrites `members = [...]` with `name` added, keeping the list sorted. */
function sortMembers(content: string, name: string): string {
  return content.replace(/members = \[([\s\S]*?)\]/, (_match, body: string) => {
    const members = new Set(
      body
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.startsWith('"'))
        .map((line) => line.replace(/,$/, "")),
    );
    members.add(`"crates/${name}"`);
    return `members = [\n${[...members]
      .sort()
      .map((m) => `  ${m},`)
      .join("\n")}\n]`;
  });
}

/**
 * Rewrites the `members` list of an existing workspace manifest so a new crate
 * is picked up without hand-editing TOML.
 */
export async function addWorkspaceMember(root: string, name: string): Promise<void> {
  const manifest = join(root, "packages", "native", "Cargo.toml");
  if (!existsSync(manifest)) return;
  const content = await Bun.file(manifest).text();
  if (content.includes(`"crates/${name}"`)) return;

  const next = content.includes("members = [")
    ? sortMembers(content, name)
    : `${content.trimEnd()}\n\n[workspace]\nmembers = [\n  "crates/${name}",\n]\n`;
  await writeFile(manifest, next);
}
