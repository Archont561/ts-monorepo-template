import { describe, expect, it } from "bun:test";

// Test the package structure exists and fallback logic
// When native binary not built, external/src/native.ts should use fallback

describe("native package scaffolding", () => {
  it("has Cargo.toml", async () => {
    const file = Bun.file("Cargo.toml");
    expect(await file.exists()).toBe(true);
    const content = await file.text();
    expect(content).toContain('name = "native"');
    expect(content).toContain("cdylib");
  });

  it("has src/lib.rs with #[napi] macros", async () => {
    const file = Bun.file("src/lib.rs");
    expect(await file.exists()).toBe(true);
    const content = await file.text();
    expect(content).toContain("#[napi]");
    expect(content).toContain("pub fn add");
    expect(content).toContain("pub fn fibonacci");
    expect(content).toContain("Counter");
  });

  it("has build.rs with napi_build", async () => {
    const content = await Bun.file("build.rs").text();
    expect(content).toContain("napi_build::setup");
  });

  it("has package.json with napi config", async () => {
    const pkg = await Bun.file("package.json").json();
    expect(pkg.napi).toBeDefined();
    expect(pkg.napi.binaryName).toBe("native");
    expect(pkg.napi.targets).toContain("wasm32-wasip1-threads");
    expect(pkg.napi.wasm).toBeDefined();
  });
});
