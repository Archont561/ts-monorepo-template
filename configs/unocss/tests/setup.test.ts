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
 * The script edits whatever tree it runs in (`process.cwd()`), so each case builds
 * a throwaway fixture in the OS temp dir and runs the real script inside it. The
 * scope comes from the environment, so no assertion depends on the checked-out
 * project's scope.
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
  const root = mkdtempSync(join(tmpdir(), "unocss-setup-"));
  trees.push(root);
  for (const [relative, contents] of Object.entries(files)) {
    const path = join(root, relative);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
  }
  return root;
}

/** Runs the setup script with `cwd` set to the fixture. */
async function runSetup(cwd: string): Promise<number> {
  const proc = Bun.spawn({
    cmd: ["bun", SETUP_SCRIPT],
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: { ...process.env, UNOCSS_SCOPE: SCOPE },
  });
  await new Response(proc.stdout).text();
  await new Response(proc.stderr).text();
  return proc.exited;
}

const read = (root: string, relative: string): string => readFileSync(join(root, relative), "utf8");
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

const PLAIN_HTML = "<html><body>plain</body></html>\n";
const UNOCSS_HTML = '<html><body><div class="flex">UnoCSS version</div></body></html>\n';

/** A tree that has never been through the setup script. */
function freshTree(): Record<string, string> {
  return {
    "package.json": `${JSON.stringify(
      {
        name: "fixture",
        private: true,
        scripts: {
          build: "mturbo build",
          "build:css": "bunx unocss --out-file apps/example/public/uno.css",
        },
      },
      null,
      2,
    )}\n`,
    "apps/example/package.json": `${JSON.stringify({ name: "@fixture-scope/example" }, null, 2)}\n`,
    "apps/example/public/index.html": PLAIN_HTML,
    "apps/example/public/index-unocss.html": UNOCSS_HTML,
    "uno.config.ts": "export default {};\n",
  };
}

/** A tree that already went through the setup script. */
function configuredTree(): Record<string, string> {
  return {
    "package.json": `${JSON.stringify(
      { name: "fixture", private: true, scripts: { build: "mturbo build" } },
      null,
      2,
    )}\n`,
    "apps/example/package.json": `${JSON.stringify(
      {
        name: "@fixture-scope/example",
        devDependencies: { [`${SCOPE}/unocss`]: "workspace:*" },
        scripts: {
          build: "munocss build",
          "build:css": "munocss build",
          "build:css:watch": "munocss watch",
        },
      },
      null,
      2,
    )}\n`,
    "apps/example/public/index.html": UNOCSS_HTML,
    "configs/unocss/uno.config.ts": "export default { theme: { colors: { brand: '#f00' } } };\n",
  };
}

describe("unocss setup — first run", () => {
  test("creates the config, swaps the HTML and rewires the app scripts", async () => {
    const root = makeTree(freshTree());
    expect(await runSetup(root)).toBe(0);

    const config = read(root, "configs/unocss/uno.config.ts");
    expect(config).toContain("defineConfig");
    expect(config).toContain("apps/example/public/uno.css");
    expect(config).toContain("apps/example/src/**/*.{html,js,ts,tsx}");

    // index-unocss.html is renamed over index.html; the plain page is gone.
    expect(read(root, "apps/example/public/index.html")).toBe(UNOCSS_HTML);
    expect(exists(root, "apps/example/public/index-unocss.html")).toBe(false);

    const app = JSON.parse(read(root, "apps/example/package.json")) as {
      name: string;
      devDependencies: Record<string, string>;
      scripts: Record<string, string>;
    };
    expect(app.name).toBe(`${SCOPE}/example`);
    expect(app.devDependencies[`${SCOPE}/unocss`]).toBe("workspace:*");
    expect(app.scripts["build:css"]).toBe("munocss build");
    expect(app.scripts.build).toBe("munocss build");
    expect(app.scripts["build:css:watch"]).toBe("munocss watch");

    // CSS is built per app: the root-level script is dropped, the rest survives.
    const rootPkg = JSON.parse(read(root, "package.json")) as { scripts: Record<string, string> };
    expect(rootPkg.scripts["build:css"]).toBeUndefined();
    expect(rootPkg.scripts.build).toBe("mturbo build");

    expect(exists(root, "uno.config.ts")).toBe(false);
    expect(read(root, "package.json").endsWith("}\n")).toBe(true);
  });

  test("a second run is a no-op (bytes unchanged)", async () => {
    const root = makeTree(freshTree());
    await runSetup(root);
    const first = snapshot(root);

    expect(await runSetup(root)).toBe(0);

    expect(snapshot(root)).toEqual(first);
  });
});

describe("unocss setup — already configured", () => {
  test("keeps the existing config and leaves the tree untouched", async () => {
    const root = makeTree(configuredTree());
    const before = snapshot(root);

    expect(await runSetup(root)).toBe(0);

    expect(snapshot(root)).toEqual(before);
    expect(read(root, "configs/unocss/uno.config.ts")).toContain("brand");
  });
});
