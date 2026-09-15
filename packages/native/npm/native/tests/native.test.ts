import { describe, expect, it } from "bun:test";

// Structure tests: the workspace is the source of truth for where things live.
// The Rust code itself is covered by `cargo test`, the JS fallback path by
// packages/external.

const CRATE = "../../crates/native";

describe("native workspace", () => {
  it("has a virtual workspace manifest listing the crate", async () => {
    const content = await Bun.file("../../Cargo.toml").text();
    expect(content).toContain("[workspace]");
    // `[workspace.package]` is fine — a real [package] table is not.
    expect(content).not.toMatch(/^\[package\]$/m);
    expect(content).toContain('"crates/native"');
  });

  it("has a cdylib binding crate", async () => {
    const content = await Bun.file(`${CRATE}/Cargo.toml`).text();
    expect(content).toContain('name    = "native"');
    expect(content).toContain("cdylib");
    expect(content).toContain("napi-derive");
  });

  it("has src/lib.rs with #[napi] macros", async () => {
    const content = await Bun.file(`${CRATE}/src/lib.rs`).text();
    expect(content).toContain("#[napi]");
    expect(content).toContain("pub fn add");
    expect(content).toContain("pub fn fibonacci");
    expect(content).toContain("Counter");
  });

  it("has a build.rs calling napi_build::setup", async () => {
    const content = await Bun.file(`${CRATE}/build.rs`).text();
    expect(content).toContain("napi_build::setup");
  });
});

describe("native npm package", () => {
  it("declares the napi config for every target", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.napi).toBeDefined();
    expect(pkg.napi.binaryName).toBe("native");
    expect(pkg.napi.targets).toContain("wasm32-wasip1-threads");
    expect(pkg.napi.wasm).toBeDefined();
  });

  it("builds only its own package", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.scripts.build).toBe("m native napi:build --only native");
    expect(pkg.scripts["build:wasm"]).toBe("m native napi:build:wasm --only native");
  });

  it("depends on the pure-Rust bridge package", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.devDependencies["@myorg/native-crates"]).toBe("workspace:*");
  });

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

describe("pure Rust crates", () => {
  it("keep the shared logic in crates/shared, napi-free", async () => {
    const manifest = await Bun.file("../../crates/shared/Cargo.toml").text();
    expect(manifest).toContain('name    = "shared"');
    expect(manifest).not.toMatch(/^crate-type/m);
    expect(manifest).not.toMatch(/^napi/m);

    const lib = await Bun.file("../../crates/shared/src/lib.rs").text();
    expect(lib).toContain("pub fn add");
    expect(lib).toContain("pub fn fibonacci");
    expect(lib).toContain("pub fn primes_up_to");
    expect(lib).toContain("pub struct Counter");
    expect(lib).not.toContain("#[napi]");
  });

  it("are wired into the binding via a Cargo path dependency", async () => {
    const manifest = await Bun.file(`${CRATE}/Cargo.toml`).text();
    expect(manifest).toContain("shared.workspace      = true");
  });

  it("are listed in the virtual workspace manifest", async () => {
    const manifest = await Bun.file("../../Cargo.toml").text();
    expect(manifest).toContain('"crates/shared"');
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
    expect(pkg.name).toBe("@myorg/native-crates");
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
