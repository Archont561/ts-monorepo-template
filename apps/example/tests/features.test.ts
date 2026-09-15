import { afterEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import type { FeatureFiles } from "@src/features";
import {
  appFile,
  detectFeatures,
  hasNative,
  NATIVE_ENDPOINTS,
  nativeProvider,
  PROVIDERS,
  repoFile,
} from "@src/features";
import { file } from "bun";

/**
 * These live next to the app deliberately: the paths in `src/features.ts` are
 * the app's only source of truth for `public/`, and the failure mode when they
 * are wrong is silent — every lookup misses and the features just look off.
 */

describe("app paths", () => {
  test("appFile resolves inside apps/example, not apps/", () => {
    const path = appFile("public/index.html").name;
    expect(path).toContain("/apps/example/public/index.html");
    expect(path).not.toContain("/apps/public/");
  });

  test("appFile keeps nested paths intact", () => {
    expect(appFile("src/pages/api/native/index.ts").name).toContain(
      "/apps/example/src/pages/api/native/index.ts",
    );
  });

  test("repoFile resolves to the monorepo root", () => {
    const path = repoFile("packages/tooling/src/commands/coverage.ts").name;
    expect(path).toContain("/packages/tooling/src/commands/coverage.ts");
    expect(path).not.toContain("/apps/");
  });

  test("the page is always present", async () => {
    expect(await appFile("public/index.html").exists()).toBe(true);
  });
});

describe("feature detection", () => {
  test("hasNative matches the native routes on disk", async () => {
    expect(await hasNative()).toBe(await appFile("src/pages/api/native/index.ts").exists());
  });

  test("detectFeatures agrees with the individual checks", async () => {
    const flags = await detectFeatures();
    expect(flags.native).toBe(await hasNative());
  });

  test("every flag is reported, whatever the checkout has", async () => {
    // Runs in the template repo and in scaffolds with either config declined,
    // so this asserts the shape rather than the values.
    const flags = await detectFeatures();
    expect(Object.keys(flags).sort()).toEqual(["native"]);
  });
});

/** Fixture file tree: `app/` and `repo/` are the two roots a provider may look in. */
const fixtures: string[] = [];

afterEach(() => {
  for (const root of fixtures.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

function fixtureFiles(tree: Record<string, string>): FeatureFiles {
  const root = mkdtempSync(join(tmpdir(), "features-fixture-"));
  fixtures.push(root);
  for (const [relative, contents] of Object.entries(tree)) {
    const path = join(root, relative);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
  }
  const at = (base: string) => (path: string) => file(join(root, base, path));
  return { app: at("app"), repo: at("repo") };
}

describe("feature providers", () => {
  test("PROVIDERS answers for exactly the reported flags", () => {
    expect(PROVIDERS.map((provider) => provider.name)).toEqual(["native"]);
    expect(new Set(PROVIDERS.map((provider) => provider.name)).size).toBe(PROVIDERS.length);
  });

  test("the native provider serves the native endpoint list", async () => {
    const provider = nativeProvider(
      fixtureFiles({ "app/src/pages/api/native/index.ts": "export default () => {};" }),
    );
    expect(await provider.enabled()).toBe(true);
    expect(provider.endpoints()).toEqual([...NATIVE_ENDPOINTS]);
    expect(provider.endpoints()).toContain("/api/native/add?a=1&b=2");
  });

  test("the native provider stays off without the routes", async () => {
    const provider = nativeProvider(fixtureFiles({ "app/src/pages/api/index.ts": "" }));
    expect(await provider.enabled()).toBe(false);
  });

  test("detectFeatures reports whatever providers it is given", async () => {
    const flags = await detectFeatures([
      nativeProvider(fixtureFiles({ "app/src/pages/api/native/index.ts": "export {};" })),
    ]);
    expect(flags).toEqual({ native: true });
  });
});
