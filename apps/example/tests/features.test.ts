import { describe, expect, test } from "bun:test";
import {
  appFile,
  detectFeatures,
  hasNative,
  hasUnoConfig,
  hasUnocss,
  htmlHasUnocss,
  repoFile,
  unocssPageEnabled,
} from "@src/features";

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
    const path = repoFile("configs/coverage/index.ts").name;
    expect(path).toContain("/configs/coverage/index.ts");
    expect(path).not.toContain("/apps/");
  });

  test("the plain page is always present", async () => {
    expect(await appFile("public/index.html").exists()).toBe(true);
  });
});

describe("unocss page detection", () => {
  test("recognises the utility-class page either way it is spelled", () => {
    expect(htmlHasUnocss('<link href="/uno.css">unocss')).toBe(true);
    expect(htmlHasUnocss("<title>Bun Monorepo Example — UnoCSS</title>")).toBe(true);
    expect(htmlHasUnocss("<title>Bun Monorepo Example</title>")).toBe(false);
  });

  test("a surviving index-unocss.html wins over the plain page", () => {
    expect(unocssPageEnabled(true, "<title>Bun Monorepo Example</title>")).toBe(true);
  });

  test("after the setup swap, index.html decides", () => {
    expect(unocssPageEnabled(false, "<title>Bun Monorepo Example — UnoCSS</title>")).toBe(true);
    expect(unocssPageEnabled(false, "<title>Bun Monorepo Example</title>")).toBe(false);
  });
});

describe("feature detection", () => {
  test("hasUnocss matches the pages on disk", async () => {
    const hasUnocssPage = await appFile("public/index-unocss.html").exists();
    const plainHtml = await appFile("public/index.html").text();
    expect(await hasUnocss()).toBe(hasUnocssPage || plainHtml.includes("UnoCSS"));
  });

  test("hasUnoConfig matches the config package on disk", async () => {
    expect(await hasUnoConfig()).toBe(await repoFile("configs/unocss/uno.config.ts").exists());
  });

  test("hasNative matches the native routes on disk", async () => {
    expect(await hasNative()).toBe(await appFile("src/pages/api/native/index.ts").exists());
  });

  test("detectFeatures agrees with the individual checks", async () => {
    const flags = await detectFeatures();
    expect(flags.unocss).toBe((await hasUnocss()) || (await hasUnoConfig()));
    expect(flags.native).toBe(await hasNative());
  });

  test("both flags are reported, whatever the checkout has", async () => {
    // Runs in the template repo and in scaffolds with either config declined,
    // so this asserts the shape rather than the values.
    const flags = await detectFeatures();
    expect(Object.keys(flags).sort()).toEqual(["native", "unocss"]);
  });
});
