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
    expect(pkg.scripts.build).toBe("mnative napi:build --only native");
    expect(pkg.scripts["build:wasm"]).toBe("mnative napi:build:wasm --only native");
  });
});
