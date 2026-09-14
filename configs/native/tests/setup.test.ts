import { afterEach, describe, expect, test } from "bun:test";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Characterization tests for `src/setup.ts`.
 *
 * The script mutates whatever tree it runs in (`process.cwd()`), so every case
 * builds a throwaway fixture in the OS temp dir, runs the real script inside it,
 * and asserts the resulting deltas — the refactor of `main()` must keep them
 * byte-for-byte. The scope is passed through the environment so nothing here
 * depends on a checked-out project's scope.
 */

const SETUP_SCRIPT = join(import.meta.dir, "../src/setup.ts");
const SCOPE = "@fixture-scope";

const trees: string[] = [];

afterEach(() => {
  for (const tree of trees.splice(0)) {
    rmSync(tree, { recursive: true, force: true });
  }
});

/** Writes `{ relativePath: contents }` into a fresh temp dir and returns it. */
function makeTree(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), "native-setup-"));
  trees.push(root);
  for (const [relative, contents] of Object.entries(files)) {
    const path = join(root, relative);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
  }
  return root;
}

/** Runs the setup script with `cwd` set to the fixture. */
async function runSetup(cwd: string): Promise<{ code: number; output: string }> {
  const proc = Bun.spawn({
    cmd: ["bun", SETUP_SCRIPT],
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, NATIVE_SCOPE: SCOPE, GITHUB_REPOSITORY: "" },
  });
  const [stdout, stderr] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  return { code: await proc.exited, output: stdout + stderr };
}

const read = (root: string, relative: string): string => readFileSync(join(root, relative), "utf8");
const readJson = (root: string, relative: string): Record<string, never> =>
  JSON.parse(read(root, relative));
const exists = (root: string, relative: string): boolean => existsSync(join(root, relative));

/** Every file under `root` as `{ relativePath: contents }`, for byte comparisons. */
function snapshot(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const entry of readdirSync(root, { recursive: true }).map(String).sort()) {
    const path = join(root, entry);
    if (statSync(path).isFile()) {
      files[entry] = readFileSync(path, "utf8");
    }
  }
  return files;
}

/** The smallest tree `main()` needs: a root manifest, turbo tasks, one app. */
function baseTree(extra: Record<string, string> = {}): Record<string, string> {
  return {
    "package.json": `${JSON.stringify(
      {
        name: "fixture",
        private: true,
        workspaces: ["apps/*", "packages/*", "configs/*"],
        scripts: { "cargo:build": "bun --filter @fixture-scope/native run build" },
      },
      null,
      2,
    )}\n`,
    "configs/turbo/turbo.base.json": `${JSON.stringify(
      { $schema: "./schema.json", tasks: { build: { dependsOn: ["^build"] } } },
      null,
      2,
    )}\n`,
    "apps/example/package.json": `${JSON.stringify({ name: "@fixture-scope/example" }, null, 2)}\n`,
    ...extra,
  };
}

describe("native setup — crates and packages", () => {
  test("writes the Cargo workspace, toolchain, cargo config and gitignore", async () => {
    const root = makeTree(baseTree());
    const { code } = await runSetup(root);
    expect(code).toBe(0);

    const workspace = read(root, "packages/native/Cargo.toml");
    expect(workspace).toContain("[workspace]");
    expect(workspace).toContain("crates/native");
    // A virtual workspace carries `[workspace.*]` tables but no crate [package] table.
    expect(workspace).not.toMatch(/^\[package\]$/m);
    // A repository URL the scaffolder rewrites — asserted by shape, never by value.
    expect(workspace).toMatch(/repository\s*=\s*"https:\/\/github\.com\//);

    expect(exists(root, "packages/native/crates/native/Cargo.toml")).toBe(true);
    expect(exists(root, "packages/native/crates/native/src/lib.rs")).toBe(true);
    expect(read(root, "packages/native/crates/native/Cargo.toml")).toMatch(/name\s*=\s*"native"/);

    // The default scaffold ships a pure crate plus a thin binding that uses it.
    expect(read(root, "packages/native/Cargo.toml")).toContain('"crates/shared"');
    expect(read(root, "packages/native/crates/native/Cargo.toml")).toContain(
      "shared.workspace      = true",
    );
    expect(read(root, "packages/native/crates/shared/Cargo.toml")).not.toMatch(/^crate-type/m);
    expect(read(root, "packages/native/crates/shared/Cargo.toml")).not.toMatch(/^napi/m);
    expect(read(root, "packages/native/crates/shared/src/lib.rs")).not.toContain("#[napi]");
    expect(read(root, "packages/native/crates/native/src/lib.rs")).toContain("shared::add");

    const npmPackage = JSON.parse(read(root, "packages/native/npm/native/package.json")) as {
      name: string;
      private: boolean;
      napi: { binaryName: string; packageName: string };
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(npmPackage.name).toBe(`${SCOPE}/native`);
    expect(npmPackage.private).toBe(true);
    expect(npmPackage.napi.packageName).toBe(`${SCOPE}/native`);
    expect(npmPackage.napi.binaryName).toBe("native");
    expect(npmPackage.scripts.build).toBe("mnative napi:build --only native");
    // The Cargo path dep is mirrored as the bridge workspace dependency.
    expect(npmPackage.devDependencies[`${SCOPE}/native-crates`]).toBe("workspace:*");

    expect(read(root, "packages/native/rust-toolchain.toml")).toContain("stable");
    expect(read(root, "packages/native/rust-toolchain.toml")).toContain("wasm32-wasip1-threads");
    expect(exists(root, "packages/native/.cargo/config.toml")).toBe(true);
    expect(read(root, "packages/native/.gitignore")).toContain("target/");
  });

  test("links the npm packages into the workspace and adjusts the root manifest", async () => {
    const root = makeTree(baseTree());
    await runSetup(root);

    const pkg = readJson(root, "package.json") as {
      workspaces: string[];
      scripts: Record<string, string>;
      private: boolean;
    };
    expect(pkg.workspaces).toEqual([
      "apps/*",
      "packages/*",
      "configs/*",
      "packages/native/npm/*",
      "packages/native/crates",
    ]);
    expect(pkg.scripts["build:native"]).toBe("mnative napi:build");
    expect(pkg.scripts["build:wasm"]).toBe("mnative napi:build:wasm");
    expect(pkg.scripts["test:native"]).toBe("mnative test");
    // Cargo is driven through the mnative wrapper now.
    expect(pkg.scripts["cargo:build"]).toBeUndefined();
    expect(pkg.private).toBe(true);
    expect(read(root, "package.json").endsWith("}\n")).toBe(true);
  });

  test("adds the turbo tasks without touching the ones already there", async () => {
    const root = makeTree(baseTree());
    await runSetup(root);

    const turbo = readJson(root, "configs/turbo/turbo.base.json") as {
      $schema: string;
      tasks: Record<string, { dependsOn?: string[]; outputs?: string[]; cache?: boolean }>;
    };
    expect(turbo.tasks.build).toEqual({ dependsOn: ["^build"] });
    expect(turbo.tasks["build:native"].dependsOn).toEqual(["^build"]);
    expect(turbo.tasks["build:native"].outputs).toContain("*.node");
    expect(turbo.tasks["build:native"].cache).toBe(false);
    expect(turbo.tasks["build:wasm"].dependsOn).toEqual(["build:native"]);
    expect(turbo.tasks["build:wasm"].cache).toBe(false);
    expect(turbo.$schema).toBe("./schema.json");
  });

  test("pure Rust crates are one bridge node; napi builds are cacheable", async () => {
    const root = makeTree(baseTree());
    await runSetup(root);

    // The bridge package stands for every pure crate in the Turbo graph.
    const bridge = JSON.parse(read(root, "packages/native/crates/package.json")) as {
      name: string;
      private: boolean;
      scripts: Record<string, string>;
    };
    expect(bridge.name).toBe(`${SCOPE}/native-crates`);
    expect(bridge.private).toBe(true);
    expect(bridge.scripts.build).toBe("mnative build --pure");
    expect(bridge.scripts.test).toBe("mnative test --pure");

    // Cargo owns target/ — the bridge tasks are never Turbo-cached.
    const bridgeTurbo = readJson(root, "packages/native/crates/turbo.json") as {
      tasks: Record<string, { cache?: boolean; inputs?: string[]; outputs?: string[] }>;
    };
    expect(bridgeTurbo.tasks.build?.cache).toBe(false);
    expect(bridgeTurbo.tasks.test?.cache).toBe(false);
    expect(bridgeTurbo.tasks.build?.inputs).toContain("*/src/**/*.rs");

    // The napi build IS cached, with inputs that reach the crate sources.
    const npmTurbo = readJson(root, "packages/native/npm/native/turbo.json") as {
      tasks: Record<string, { cache?: boolean; inputs?: string[]; outputs?: string[] }>;
    };
    expect(npmTurbo.tasks.build?.cache).toBe(true);
    expect(npmTurbo.tasks.build?.outputs).toContain("*.node");
    expect(npmTurbo.tasks.build?.inputs).toContain("../../crates/*/src/**/*.rs");
    expect(npmTurbo.tasks.build?.inputs).toContain("../../Cargo.lock");
    expect(npmTurbo.tasks["build:wasm"]?.cache).toBe(false);

    // Release binaries are tuned once, in the workspace manifest.
    const workspace = read(root, "packages/native/Cargo.toml");
    expect(workspace).toContain("[profile.release]");
    expect(workspace).toContain("lto           = true");
    expect(workspace).toContain("strip         = true");
  });

  test("creates the example native routes", async () => {
    const root = makeTree(baseTree());
    await runSetup(root);

    const routes = ["index.ts", "add.ts", "status.ts"];
    for (const route of routes) {
      expect(exists(root, `apps/example/src/pages/api/native/${route}`)).toBe(true);
    }
    expect(read(root, "apps/example/src/pages/api/native/index.ts")).toContain("/api/native/add");
    expect(read(root, "apps/example/src/pages/api/native/add.ts")).toContain("addSync");
    expect(read(root, "apps/example/src/pages/api/native/status.ts")).toContain(
      "isNativeAvailable()",
    );
    // The per-endpoint folders come with the routes (they hold future pages).
    expect(exists(root, "apps/example/src/pages/api/native/fibonacci")).toBe(true);
    expect(exists(root, "apps/example/src/pages/api/native/primes")).toBe(true);
  });

  test("a second run is a no-op (bytes unchanged)", async () => {
    const root = makeTree(baseTree());
    await runSetup(root);
    const first = snapshot(root);

    await runSetup(root);

    expect(snapshot(root)).toEqual(first);
  });
});

describe("native setup — legacy single-crate layout", () => {
  test("migrates the old crate, npm package, toolchain and cargo config", async () => {
    const root = makeTree(
      baseTree({
        "packages/native/Cargo.toml": '[package]\nname = "fixture-native"\nversion = "0.0.0"\n',
        "packages/native/src/lib.rs": "// legacy crate source\nexport const LEGACY = 1;\n",
        "packages/native/build.rs": "fn main() {}\n",
        "packages/native/package.json": `${JSON.stringify({ name: "@fixture-scope/native" }, null, 2)}\n`,
        "packages/native/turbo.json": `${JSON.stringify({ extends: ["//"] }, null, 2)}\n`,
        "rust-toolchain.toml":
          '[toolchain]\nchannel = "stable"\ntargets = ["wasm32-wasip1-threads"]\n',
        ".cargo/config.toml":
          '[target.wasm32-wasip1-threads]\nrustflags = ["-C", "link-arg=-zstack-size=1048576"]\n',
      }),
    );
    await runSetup(root);

    // The legacy crate is *replaced* by a freshly generated one — the copy of the old
    // source survives only in the nested `src/src/` tree the `cp -r` leaves behind.
    expect(read(root, "packages/native/crates/native/src/lib.rs")).toContain("napi");
    expect(read(root, "packages/native/crates/native/src/src/lib.rs")).toBe(
      "// legacy crate source\nexport const LEGACY = 1;\n",
    );
    expect(exists(root, "packages/native/crates/native/build.rs")).toBe(true);
    expect(exists(root, "packages/native/src")).toBe(false);
    expect(exists(root, "packages/native/package.json")).toBe(false);

    // The hand-written [package] manifest became the virtual workspace manifest.
    const workspace = read(root, "packages/native/Cargo.toml");
    expect(workspace).toContain("[workspace]");
    expect(workspace).not.toMatch(/^\[package\]$/m);
    // A repository URL the scaffolder rewrites — asserted by shape, never by value.
    expect(workspace).toMatch(/repository\s*=\s*"https:\/\/github\.com\//);

    // Migration lands on the current layout: shared pure crate + bridge node.
    expect(exists(root, "packages/native/crates/shared/Cargo.toml")).toBe(true);
    expect(exists(root, "packages/native/crates/package.json")).toBe(true);
    expect(exists(root, "packages/native/crates/turbo.json")).toBe(true);

    // The npm package moved under npm/<name>/ and was regenerated there from the scope
    // (the moved manifest is overwritten, so the old `description` does not survive).
    const moved = JSON.parse(read(root, "packages/native/npm/native/package.json")) as {
      name: string;
      description?: string;
    };
    expect(moved.name).toBe(`${SCOPE}/native`);
    expect(moved.description).toBeUndefined();
    expect(exists(root, "packages/native/npm/native/turbo.json")).toBe(true);
    expect(exists(root, "packages/native/npm/native/tsconfig.json")).toBe(true);

    // Toolchain + cargo config are hoisted into packages/native/, contents intact.
    expect(read(root, "packages/native/rust-toolchain.toml")).toContain('channel = "stable"');
    expect(exists(root, "rust-toolchain.toml")).toBe(false);
    expect(read(root, "packages/native/.cargo/config.toml")).toContain("zstack-size");
    expect(exists(root, ".cargo/config.toml")).toBe(false);
    expect(exists(root, ".cargo")).toBe(false);
  });
});
