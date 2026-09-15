import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  DEFAULT_NATIVE_SCOPE,
  NATIVE_TARGET_TRIPLES,
  NATIVE_WASM_TARGET,
  type NativeCrateSpec,
  nativeCrateDir,
  nativePackageDir,
} from "./native-shared";

/**
 * File templates for the Rust workspace.
 *
 * Shared by `m native setup` (which writes the whole workspace) and
 * `m native add` (which appends one crate + package), so the two can never
 * drift. No workspace imports: `setup.ts` runs before `bun install`.
 */

export type TemplateOptions = {
  /** npm scope, e.g. `@acme`. */
  scope?: string;
  /** Repository URL written into Cargo manifests. */
  repository?: string;
};

const SCOPE = (options: TemplateOptions): string => options.scope ?? DEFAULT_NATIVE_SCOPE;
const REPO = (options: TemplateOptions): string =>
  options.repository ?? "https://github.com/OWNER/REPO";

/**
 * Virtual workspace root — no `[package]` table. Members are listed explicitly
 * so `cargo` never guesses, and every crate inherits version/edition/lints.
 */
export function workspaceCargoToml(crates: NativeCrateSpec[], options: TemplateOptions): string {
  const members = crates.length
    ? crates.map((crate) => `  "crates/${crate.name}",`).join("\n")
    : "  # no crates yet — add one with `m native add <name>`";
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
    "# Release binaries — `m native build:release` and every `napi build --release`.",
    "[profile.release]",
    "lto           = true",
    "codegen-units = 1",
    "strip         = true",
    "",
    "# CI builds — `m native build:ci`: fast to produce, fast to run.",
    "[profile.ci]",
    'inherits   = "dev"',
    "opt-level  = 1",
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
      // Aligned with the napi lines above so a generated manifest reads evenly.
      ...(spec.uses ?? []).map((dep) => `${`${dep}.workspace`.padEnd(22)}= true`),
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
  `extern crate napi_build;\n\nfn main() {\n    napi_build::setup();\n}\n`;

/**
 * Sample Rust source — rustfmt-conformant (four-space indent) so a fresh
 * scaffold passes `m native fmt:check` without a reformat.
 */
export function crateLibRs(spec: NativeCrateSpec): string {
  if (!spec.binding) {
    return `//! Pure Rust helpers shared by the binding crates.
//!
//! Nothing here may depend on napi — that keeps it testable with plain
//! \`cargo test\` and reusable from a future WASM-only crate.

/// Add two numbers.
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Compute the nth Fibonacci number.
///
/// Fibonacci(40) here is ~100x faster than the JS fallback.
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

/// Reverse a string by Unicode scalar.
pub fn reverse_string(s: &str) -> String {
    s.chars().rev().collect()
}

/// All primes up to and including \`n\` — sieve of Eratosthenes.
pub fn primes_up_to(n: u32) -> Vec<u32> {
    if n < 2 {
        return vec![];
    }
    let mut sieve = vec![true; (n + 1) as usize];
    sieve[0] = false;
    sieve[1] = false;
    let mut i = 2;
    while i * i <= n {
        if sieve[i as usize] {
            let mut j = i * i;
            while j <= n {
                sieve[j as usize] = false;
                j += i;
            }
        }
        i += 1;
    }
    sieve
        .iter()
        .enumerate()
        .filter_map(|(idx, &is_prime)| if is_prime { Some(idx as u32) } else { None })
        .collect()
}

/// Counter — plain Rust state the napi binding wraps as a JS class.
pub struct Counter {
    count: i32,
}

impl Counter {
    pub fn new(initial: Option<i32>) -> Self {
        Self {
            count: initial.unwrap_or(0),
        }
    }

    pub fn increment(&mut self) -> i32 {
        self.count += 1;
        self.count
    }

    pub fn decrement(&mut self) -> i32 {
        self.count -= 1;
        self.count
    }

    pub fn get(&self) -> i32 {
        self.count
    }

    pub fn reset(&mut self) {
        self.count = 0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds() {
        assert_eq!(add(2, 3), 5);
        assert_eq!(add(-1, 1), 0);
    }

    #[test]
    fn fibonacci_sequence() {
        assert_eq!(fibonacci(0), 0);
        assert_eq!(fibonacci(1), 1);
        assert_eq!(fibonacci(10), 55);
        assert_eq!(fibonacci(20), 6765);
    }

    #[test]
    fn reverses_by_unicode_scalar() {
        assert_eq!(reverse_string("hello"), "olleh");
        assert_eq!(reverse_string("zażółć"), "ćłóżaz");
        assert_eq!(reverse_string(""), "");
    }

    #[test]
    fn primes_edge_cases() {
        assert_eq!(primes_up_to(0), Vec::<u32>::new());
        assert_eq!(primes_up_to(1), Vec::<u32>::new());
        assert_eq!(primes_up_to(2), vec![2]);
        assert_eq!(primes_up_to(10), vec![2, 3, 5, 7]);
        assert_eq!(primes_up_to(30), vec![2, 3, 5, 7, 11, 13, 17, 19, 23, 29]);
    }

    #[test]
    fn counter_counts() {
        let mut counter = Counter::new(None);
        assert_eq!(counter.get(), 0);
        assert_eq!(counter.increment(), 1);
        assert_eq!(counter.increment(), 2);
        assert_eq!(counter.decrement(), 1);
        assert_eq!(counter.get(), 1);
        counter.reset();
        assert_eq!(counter.get(), 0);
    }

    #[test]
    fn counter_takes_an_initial_value() {
        let mut counter = Counter::new(Some(41));
        assert_eq!(counter.increment(), 42);
    }
}
`;
  }

  // Bindings that use pure crates are thin #[napi] wrappers — the logic lives
  // in the pure crate so it stays testable without a Node runtime.
  const usesShared = (spec.uses ?? []).length > 0;
  if (usesShared) {
    const sharedCrate = (spec.uses ?? [])[0];
    if (!sharedCrate) {
      throw new Error("A binding crate that declares `uses` must name at least one crate");
    }
    const rustName = sharedCrate.replace(/-/g, "_");
    return `#![deny(clippy::all)]

use napi_derive::napi;

// Thin napi bindings — the logic lives in the \`${sharedCrate}\` crate so it stays
// testable with plain \`cargo test\`, no Node runtime required.

/// Add two numbers — native Rust speed
#[napi]
pub fn add(a: i32, b: i32) -> i32 {
    ${rustName}::add(a, b)
}

/// Fibonacci — demonstrates Rust performance vs JS
/// Fibonacci(40) in Rust is ~100x faster than JS
#[napi]
pub fn fibonacci(n: u32) -> u32 {
    ${rustName}::fibonacci(n)
}

/// Fast string reversal — native
#[napi]
pub fn reverse_string(s: String) -> String {
    ${rustName}::reverse_string(&s)
}

/// Counter struct — becomes JS class
#[napi]
pub struct Counter {
    inner: ${rustName}::Counter,
}

#[napi]
impl Counter {
    #[napi(constructor)]
    pub fn new(initial: Option<i32>) -> Self {
        Self {
            inner: ${rustName}::Counter::new(initial),
        }
    }

    #[napi]
    pub fn increment(&mut self) -> i32 {
        self.inner.increment()
    }

    #[napi]
    pub fn decrement(&mut self) -> i32 {
        self.inner.decrement()
    }

    #[napi]
    pub fn get_count(&self) -> i32 {
        self.inner.get()
    }

    #[napi]
    pub fn reset(&mut self) {
        self.inner.reset()
    }
}

/// Async example — becomes JS Promise
#[napi]
pub async fn fetch_data_simulated(url: String) -> napi::Result<String> {
    // Simulate async work
    Ok(format!("fetched: {}", url))
}

/// All primes up to n — sieve of Eratosthenes
#[napi]
pub fn primes_up_to(n: u32) -> Vec<u32> {
    ${rustName}::primes_up_to(n)
}
`;
  }

  return `#![deny(clippy::all)]

use napi_derive::napi;

/// Add two numbers — native Rust speed
#[napi]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Fibonacci — demonstrates Rust performance vs JS
/// Fibonacci(40) in Rust is ~100x faster than JS
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

/// Fast string reversal — native
#[napi]
pub fn reverse_string(s: String) -> String {
    s.chars().rev().collect()
}

/// Counter struct — becomes JS class
#[napi]
pub struct Counter {
    count: i32,
}

#[napi]
impl Counter {
    #[napi(constructor)]
    pub fn new(initial: Option<i32>) -> Self {
        Self {
            count: initial.unwrap_or(0),
        }
    }

    #[napi]
    pub fn increment(&mut self) -> i32 {
        self.count += 1;
        self.count
    }

    #[napi]
    pub fn decrement(&mut self) -> i32 {
        self.count -= 1;
        self.count
    }

    #[napi]
    pub fn get_count(&self) -> i32 {
        self.count
    }

    #[napi]
    pub fn reset(&mut self) {
        self.count = 0;
    }
}

/// Async example — becomes JS Promise
#[napi]
pub async fn fetch_data_simulated(url: String) -> napi::Result<String> {
    // Simulate async work
    Ok(format!("fetched: {}", url))
}

/// Compute prime numbers up to n — CPU intensive, Rust shines
#[napi]
pub fn primes_up_to(n: u32) -> Vec<u32> {
    if n < 2 {
        return vec![];
    }
    let mut sieve = vec![true; (n + 1) as usize];
    sieve[0] = false;
    sieve[1] = false;
    let mut i = 2;
    while i * i <= n {
        if sieve[i as usize] {
            let mut j = i * i;
            while j <= n {
                sieve[j as usize] = false;
                j += i;
            }
        }
        i += 1;
    }
    sieve
        .iter()
        .enumerate()
        .filter_map(|(idx, &is_prime)| if is_prime { Some(idx as u32) } else { None })
        .collect()
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
  // Mirror the crate's Cargo path deps as a workspace dependency on the
  // bridge package: it gives Turbo the one ordering edge it cannot see —
  // pure Rust builds/tests before the napi build that compiles them in.
  const usesPure = (spec.uses ?? []).length > 0;
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
      build: `m native napi:build --only ${spec.name}`,
      "build:debug": `m native napi:build:debug --only ${spec.name}`,
      "build:wasm": `m native napi:build:wasm --only ${spec.name}`,
      "create-npm-dirs": `m native create-npm-dirs --only ${spec.name}`,
      artifacts: `m native artifacts --only ${spec.name}`,
      test: "m bun test",
      "test:watch": "m bun test --watch",
      typecheck: "m typecheck --noEmit",
      "cargo:check": "m native check",
      "cargo:clippy": "m native clippy",
      "cargo:fmt": "m native fmt",
      "cargo:fmt:check": "m native fmt:check",
      "cargo:test": "m native test",
    },
    devDependencies: {
      [`${scope}/bun-config`]: "workspace:*",
      [`${scope}/native-config`]: "workspace:*",
      ...(usesPure ? { [`${scope}/native-crates`]: "workspace:*" } : {}),
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
 * gives `m typecheck` an input until the first build runs.
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
 * Package-level Turbo config for a binding package.
 *
 * The napi build is cacheable: its outputs (`*.node`, generated loader and
 * types) are stable local artifacts, and the inputs mirror the Cargo graph —
 * the binding crate's sources plus every pure crate under `crates/` and the
 * workspace manifests — so a Rust change always invalidates the cache.
 * Globbing all crates rather than only the ones this binding uses is the
 * safe default: over-invalidating costs a rebuild, a stale `.node` costs a
 * wrong binary.
 */
export const npmTurboJson = (): string => `{
  "extends": ["//"],
  "tasks": {
    "build": {
      "inputs": [
        "package.json",
        "../../crates/*/src/**/*.rs",
        "../../crates/*/Cargo.toml",
        "../../crates/*/build.rs",
        "../../Cargo.toml",
        "../../Cargo.lock",
        "../../rust-toolchain.toml"
      ],
      "outputs": ["*.node", "index.js", "index.d.ts"],
      "cache": true
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
 * with the first crate, so a fresh `m native add` package has both a
 * `typecheck` input and a `test` that runs without the Rust toolchain.
 */
/**
 * Structure tests for a binding package — the same assertions the template
 * repo's own `packages/native/npm/native/tests` carries, so a fresh scaffold
 * verifies its bridge-node and caching wiring from day one.
 */
export const npmPackageTest = (spec: NativeCrateSpec, options: TemplateOptions = {}): string => {
  const name = spec.name;
  const scope = SCOPE(options);
  const pure = (spec.uses ?? [])[0] ?? "shared";
  const usesPure = (spec.uses ?? []).length > 0;
  // The aligned `x.workspace = true` line the crate manifest template emits.
  const alignedDep = `${`${pure}.workspace`.padEnd(22)}= true`;

  const pureTests = usesPure
    ? `
describe("pure Rust crates", () => {
  it("keep the shared logic in crates/${pure}, napi-free", async () => {
    const manifest = await Bun.file("../../crates/${pure}/Cargo.toml").text();
    expect(manifest).toContain('name    = "${pure}"');
    expect(manifest).not.toMatch(/^crate-type/m);
    expect(manifest).not.toMatch(/^napi/m);

    const lib = await Bun.file("../../crates/${pure}/src/lib.rs").text();
    expect(lib).toContain("pub fn add");
    expect(lib).toContain("pub fn fibonacci");
    expect(lib).toContain("pub fn primes_up_to");
    expect(lib).toContain("pub struct Counter");
    expect(lib).not.toContain("#[napi]");
  });

  it("are wired into the binding via a Cargo path dependency", async () => {
    const manifest = await Bun.file(\`\${CRATE}/Cargo.toml\`).text();
    expect(manifest).toContain("${alignedDep}");
  });

  it("are listed in the virtual workspace manifest", async () => {
    const manifest = await Bun.file("../../Cargo.toml").text();
    expect(manifest).toContain('"crates/${pure}"');
  });

  it("tune the release profile (lto, single codegen unit, stripped)", async () => {
    const manifest = await Bun.file("../../Cargo.toml").text();
    expect(manifest).toContain("[profile.release]");
    expect(manifest).toContain("lto           = true");
    expect(manifest).toContain("codegen-units = 1");
    expect(manifest).toContain("strip         = true");
  });

  it("are one Turbo node — the bridge package runs m native --pure", async () => {
    const pkg = await Bun.file("../../crates/package.json").json();
    expect(pkg.name).toBe("${scope}/native-crates");
    expect(pkg.private).toBe(true);
    expect(pkg.scripts.build).toBe("m native build --pure");
    expect(pkg.scripts.test).toBe("m native test --pure");
  });

  it("never Turbo-cache the bridge tasks (cargo owns target/)", async () => {
    const turbo = await Bun.file("../../crates/turbo.json").json();
    expect(turbo.tasks.build.cache).toBe(false);
    expect(turbo.tasks.test.cache).toBe(false);
  });
});
`
    : "";

  return `import { describe, expect, it } from "bun:test";

// Structure tests: the workspace is the source of truth for where things live.
// The Rust code itself is covered by \`cargo test\`, the JS fallback path by
// packages/external.

const CRATE = "../../crates/${name}";

describe("${name} workspace", () => {
  it("has a virtual workspace manifest listing the crate", async () => {
    const content = await Bun.file("../../Cargo.toml").text();
    expect(content).toContain("[workspace]");
    // \`[workspace.package]\` is fine — a real [package] table is not.
    expect(content).not.toMatch(/^\\[package\\]$/m);
    expect(content).toContain('"crates/${name}"');
  });

  it("has a cdylib binding crate", async () => {
    const content = await Bun.file(\`\${CRATE}/Cargo.toml\`).text();
    expect(content).toContain('name    = "${name}"');
    expect(content).toContain("cdylib");
    expect(content).toContain("napi-derive");
  });

  it("has src/lib.rs with #[napi] macros", async () => {
    const content = await Bun.file(\`\${CRATE}/src/lib.rs\`).text();
    expect(content).toContain("#[napi]");
    expect(content).toContain("pub fn add");
    expect(content).toContain("pub fn fibonacci");
    expect(content).toContain("Counter");
  });

  it("has a build.rs calling napi_build::setup", async () => {
    const content = await Bun.file(\`\${CRATE}/build.rs\`).text();
    expect(content).toContain("napi_build::setup");
  });
});

describe("${name} npm package", () => {
  it("declares the napi config for every target", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.napi).toBeDefined();
    expect(pkg.napi.binaryName).toBe("${name}");
    expect(pkg.napi.targets).toContain("wasm32-wasip1-threads");
    expect(pkg.napi.wasm).toBeDefined();
  });

  it("builds only its own package", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.scripts.build).toBe("m native napi:build --only ${name}");
    expect(pkg.scripts["build:wasm"]).toBe("m native napi:build:wasm --only ${name}");
  });
${
  usesPure
    ? `
  it("depends on the pure-Rust bridge package", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.devDependencies["${scope}/native-crates"]).toBe("workspace:*");
  });
`
    : ""
}
  it("caches the napi build with the Cargo graph as inputs", async () => {
    const turbo = await Bun.file("turbo.json").json();
    expect(turbo.tasks.build.cache).toBe(true);
    expect(turbo.tasks.build.outputs).toContain("*.node");
    // The crate sources live OUTSIDE this package — the inputs must reach them.
    expect(turbo.tasks.build.inputs).toContain("../../crates/*/src/**/*.rs");
    expect(turbo.tasks.build.inputs).toContain("../../Cargo.lock");
    // The wasm build shells out to the wasm32 target toolchain — never cached.
    expect(turbo.tasks["build:wasm"].cache).toBe(false);
  });
});
${pureTests}`;
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
 * `m native add`.
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
  await writeFile(join(packageDir, "tests", `${spec.name}.test.ts`), npmPackageTest(spec, options));

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

/**
 * `package.json` for the bridge node — the ONE Turbo package that stands for
 * every pure Rust crate. It owns no files; its scripts scope cargo commands
 * to the pure crates via `m native <cmd> --pure`, and binding npm packages
 * depend on it (`workspace:*`) so Turbo orders pure Rust work before the napi
 * builds that compile it.
 */
export function bridgePackageJson(options: TemplateOptions): Record<string, unknown> {
  return {
    name: `${SCOPE(options)}/native-crates`,
    version: "0.0.0",
    private: true,
    scripts: {
      build: "m native build --pure",
      test: "m native test --pure",
      "cargo:check": "m native check --pure",
      "cargo:clippy": "m native clippy --pure",
      "cargo:fmt": "m native fmt --pure",
      "cargo:fmt:check": "m native fmt:check --pure",
    },
  };
}

/**
 * Turbo config for the bridge node. Cargo owns `target/` and its cache keys
 * include the toolchain, so these tasks are never Turbo-cached — the inputs
 * exist only so `turbo run` hash-reports (and `--dry`) reflect Rust changes.
 */
export const bridgeTurboJson = (): string => `{
  "extends": ["//"],
  "tasks": {
    "build": {
      "inputs": [
        "*/src/**/*.rs",
        "*/Cargo.toml",
        "../Cargo.toml",
        "../Cargo.lock",
        "../rust-toolchain.toml"
      ],
      "outputs": [],
      "cache": false
    },
    "test": {
      "inputs": [
        "*/src/**/*.rs",
        "*/Cargo.toml",
        "../Cargo.toml",
        "../Cargo.lock",
        "../rust-toolchain.toml"
      ],
      "outputs": [],
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
 * Writes (or refreshes) the bridge node at `packages/native/crates/`. Called
 * by setup and by `m native add --pure`, so the node can never go missing or
 * drift from the templates.
 */
export async function writeBridgeNode(
  root: string,
  options: TemplateOptions = {},
): Promise<string> {
  const bridgeDir = join(root, "packages", "native", "crates");
  await mkdir(bridgeDir, { recursive: true });
  await writeFile(
    join(bridgeDir, "package.json"),
    `${JSON.stringify(bridgePackageJson(options), null, 2)}\n`,
  );
  await writeFile(join(bridgeDir, "turbo.json"), bridgeTurboJson());
  return bridgeDir;
}
