import { afterEach, describe, expect, test } from "bun:test";
import {
  pixiBinPath,
  pixiHome,
  pixiInstallerCommand,
  pixiUnpackPlatform,
  pixiUnpackUrl,
  planSandboxSetup,
  sandboxEnvBinDir,
  sandboxEnvDir,
  sandboxHome,
  withVendoredSource,
} from "@/src/commands/sandbox";
import { PIXI_PACK_VERSION, PIXI_VERSION } from "@/src/scaffold/vars";

/**
 * The sandbox command is designed to be testable with mocks: every network or
 * spawn touchpoint is behind exported pure helpers (`planSandboxSetup`,
 * `withVendoredSource`, the URL/path builders), so the tests exercise the real
 * decision logic without downloading anything or running act/pixi.
 */

let savedPixiHome: string | undefined;

afterEach(() => {
  if (savedPixiHome === undefined) delete process.env.PIXI_HOME;
  else process.env.PIXI_HOME = savedPixiHome;
  savedPixiHome = undefined;
});

describe("pixi bootstrap helpers", () => {
  test("the installer command pins the version and the install location", () => {
    const cmd = pixiInstallerCommand();
    expect(cmd).toContain(`PIXI_VERSION="${PIXI_VERSION}"`);
    expect(cmd).toContain(`PIXI_HOME="${pixiHome()}"`);
    expect(cmd).toContain("https://pixi.sh/install.sh");
  });

  test("pixiHome honors $PIXI_HOME and otherwise falls back to ~/.pixi", () => {
    savedPixiHome = process.env.PIXI_HOME;
    process.env.PIXI_HOME = "/tmp/sandbox-home";
    expect(pixiHome()).toBe("/tmp/sandbox-home");
    expect(pixiBinPath()).toBe("/tmp/sandbox-home/bin/pixi");
  });

  test("pixi-unpack URL points at the pinned pixi-pack release asset", () => {
    const url = pixiUnpackUrl("v0.7.11", "x86_64-unknown-linux-gnu");
    expect(url).toBe(
      "https://github.com/Quantco/pixi-pack/releases/download/v0.7.11/pixi-unpack-x86_64-unknown-linux-gnu",
    );
  });

  test("pixiUnpackPlatform maps node platforms to the real release triples", () => {
    expect(pixiUnpackPlatform("linux", "x64")).toBe("x86_64-unknown-linux-gnu");
    expect(pixiUnpackPlatform("linux", "arm64")).toBe("aarch64-unknown-linux-gnu");
    expect(pixiUnpackPlatform("darwin", "x64")).toBe("x86_64-apple-darwin");
    expect(pixiUnpackPlatform("darwin", "arm64")).toBe("aarch64-apple-darwin");
    expect(pixiUnpackPlatform("win32", "x64")).toBe("x86_64-pc-windows-msvc");
    expect(pixiUnpackPlatform("win32", "arm64")).toBe("aarch64-pc-windows-msvc");
  });

  test("windows towns to an .exe suffix but linux/mac do not", () => {
    expect(pixiUnpackUrl("v0.7.11", "x86_64-pc-windows-msvc")).toEndWith(".exe");
    expect(pixiUnpackUrl("v0.7.11", "aarch64-unknown-linux-gnu")).not.toContain(".exe");
    expect(pixiUnpackUrl("v0.7.11", "x86_64-apple-darwin")).not.toContain(".exe");
  });

  test("pixiUnpackUrl defaults to the transport's own platform at the pinned version", () => {
    const url = pixiUnpackUrl();
    expect(url).toContain(PIXI_PACK_VERSION);
    expect(url).toContain(pixiUnpackPlatform());
  });
});

describe("sandbox paths", () => {
  test("the environment lives under .pixi/envs/<name> with its bin/ vor PATH", () => {
    expect(sandboxHome("/tmp/repo")).toBe("/tmp/repo/.pixi");
    expect(sandboxEnvDir("/tmp/repo")).toBe("/tmp/repo/.pixi/envs/default");
    expect(sandboxEnvBinDir("/tmp/repo")).toBe("/tmp/repo/.pixi/envs/default/bin");
    expect(sandboxEnvDir("/tmp/repo", "ci")).toBe("/tmp/repo/.pixi/envs/ci");
    expect(sandboxEnvBinDir("/tmp/repo", "ci")).toBe("/tmp/repo/.pixi/envs/ci/bin");
  });
});

describe("planSandboxSetup", () => {
  const root = "/tmp/repo";

  test("online mode installs the locked env from the manifest", () => {
    const steps = planSandboxSetup(root, { hasPixi: true });
    expect(steps).toHaveLength(1);
    expect(steps[0]?.spawn).toEqual(["pixi", "install", "--locked"]);
    expect(steps[0]?.cwd).toBe(root);
  });

  test("online mode downloads pixi first when it is missing", () => {
    const steps = planSandboxSetup(root, { hasPixi: false });
    expect(steps.map((s) => s.label)).toEqual([
      `Download pixi (${PIXI_VERSION})`,
      "Install the environment (locked)",
    ]);
    expect(steps[0]?.shell).toContain(PIXI_VERSION);
  });

  test("archive mode unpacks the bundle into .pixi/envs without a conda solve", () => {
    const steps = planSandboxSetup(root, { archive: "/tmp/sandbox.tar", hasPixiUnpack: true });
    expect(steps).toHaveLength(1);
    expect(steps[0]?.spawn).toEqual([
      expect.stringContaining("pixi-unpack"),
      "/tmp/sandbox.tar",
      "-o",
      "/tmp/repo/.pixi/envs",
      "-e",
      "default",
    ]);
  });

  test("archive mode honors the environment name", () => {
    const steps = planSandboxSetup(root, {
      archive: "/tmp/sandbox.tar",
      env: "ci",
      hasPixiUnpack: true,
    });
    expect(steps[0]?.spawn).toContain("-e");
    expect(steps[0]?.spawn).toContain("ci");
  });

  test("a URL archive adds a download step before unpacking", () => {
    const steps = planSandboxSetup(root, {
      archive: "https://example.com/sandbox.tar",
      hasPixiUnpack: true,
    });
    expect(steps.map((s) => s.label)).toEqual([
      "Download the environment bundle",
      "Unpack the environment (default)",
    ]);
    expect(steps[0]?.shell).toContain("https://example.com/sandbox.tar");
    expect(steps[0]?.shell).toContain("/tmp/repo/.pixi/packs/sandbox.tar");
  });

  test("a missing pixi-unpack adds its pinned download step", () => {
    const steps = planSandboxSetup(root, { archive: "/tmp/sandbox.tar", hasPixiUnpack: false });
    expect(steps.map((s) => s.label)[0]).toBe(`Download pixi-unpack (${PIXI_PACK_VERSION})`);
    expect(steps[0]?.shell).toContain(pixiUnpackUrl());
  });
});

describe("withVendoredSource", () => {
  const fixture = `[build]
rustflags = ["-C", "link-arg=-fuse-ld=mold"]

[env]
RUST_BACKTRACE = "1"
`;

  test("appends the vendored source override and keeps the fixture intact", () => {
    const next = withVendoredSource(fixture);
    expect(next).toContain("replace-with = \"vendored-sources\"");
    expect(next).toContain("[source.vendored-sources]\ndirectory = \"vendor\"");
    // Every original byte survives — the committed formatting is sacred.
    expect(next).toContain(fixture.trim());
  });

  test("is idempotent", () => {
    const once = withVendoredSource(fixture);
    expect(withVendoredSource(once)).toBe(once);
  });

  test("a config that already has the override is untouched", () => {
    const wired = `${fixture}\n[source.crates-io]\nreplace-with = "vendored-sources"\n`;
    expect(withVendoredSource(wired)).toBe(wired);
  });

  test("an empty config gets the override", () => {
    const next = withVendoredSource("");
    expect(next).toContain('directory = "vendor"');
  });
});