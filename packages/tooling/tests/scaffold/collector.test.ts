import { describe, expect, test } from "bun:test";
import { OptionsCollector } from "../../src/scaffold/collector";

describe("OptionsCollector (non-interactive)", () => {
  test("returns project defaults when no overrides are given", async () => {
    const collector = new OptionsCollector({ nonInteractive: true });
    const options = await collector.collect();

    expect(options.scope).toBe("@myorg");
    expect(options.gitHooks).toBe(true);
    expect(options.configs).toEqual({});
    // Target dir is discovered from the cwd marker unless overridden.
    expect(options.targetDir).not.toBe(".");
  });

  test("applies defaults overrides", async () => {
    const collector = new OptionsCollector({
      nonInteractive: true,
      defaults: {
        targetDir: "/tmp/project",
        scope: "@acme",
        gitHooks: false,
        configs: { unocss: true },
      },
    });
    const options = await collector.collect();

    expect(options.targetDir).toBe("/tmp/project");
    expect(options.scope).toBe("@acme");
    expect(options.gitHooks).toBe(false);
    expect(options.configs).toEqual({ unocss: true });
  });

  test("non-interactive resolution finds the repo root via the configs/template marker", async () => {
    const collector = new OptionsCollector({ nonInteractive: true });
    const options = await collector.collect();

    // Collecting from this package means the cwd is inside configs/template,
    // so the marker walk must land on the repository root above it.
    const repoRoot = new URL(`${import.meta.dir}/../../../..`, "file:///").pathname.replace(
      /\/$/,
      "",
    );
    expect(options.targetDir).toBe(repoRoot);
  });

  test("treats a serial CI-ish environment as non-interactive", async () => {
    const previous = process.env.CI;
    try {
      process.env.CI = "1";
      const collector = new OptionsCollector();
      const options = await collector.collect();

      expect(options.scope).toBe("@myorg");
      expect(options.gitHooks).toBe(true);
      expect(options.configs).toEqual({});
    } finally {
      if (previous === undefined) {
        delete process.env.CI;
      } else {
        process.env.CI = previous;
      }
    }
  });
});

describe("OptionsCollector overrides", () => {
  test.each([
    {
      field: "scope",
      defaults: { scope: "@acme" },
      expectedKey: "scope" as const,
      expectedVal: "@acme",
    },
    {
      field: "gitHooks",
      defaults: { gitHooks: false },
      expectedKey: "gitHooks" as const,
      expectedVal: false,
    },
    {
      field: "configs",
      defaults: { configs: { playwright: false, unocss: true } },
      expectedKey: "configs" as const,
      expectedVal: { playwright: false, unocss: true },
    },
  ])("respects $field override", async ({ defaults, expectedKey, expectedVal }) => {
    const collector = new OptionsCollector({ nonInteractive: true, defaults });
    const options = await collector.collect();
    expect(options[expectedKey]).toEqual(expectedVal);
  });

  test("combines multiple overrides", async () => {
    const collector = new OptionsCollector({
      nonInteractive: true,
      defaults: {
        scope: "@combo",
        gitHooks: false,
        configs: { playwright: false, unocss: true },
      },
    });
    const options = await collector.collect();

    expect(options.scope).toBe("@combo");
    expect(options.gitHooks).toBe(false);
    expect(options.configs).toEqual({ playwright: false, unocss: true });
  });

  test("returns boolean/string/record types for all option fields", async () => {
    const collector = new OptionsCollector({ nonInteractive: true });
    const options = await collector.collect();

    expect(typeof options.scope).toBe("string");
    expect(typeof options.gitHooks).toBe("boolean");
    expect(typeof options.targetDir).toBe("string");
    expect(typeof options.configs).toBe("object");
  });
});

describe("OptionsCollector target directory", () => {
  test("prefers --target-dir argument over cwd discovery", async () => {
    const originalArgv = process.argv;
    try {
      process.argv = [...originalArgv, "--target-dir", "/tmp/argv-target"];
      const collector = new OptionsCollector({ nonInteractive: true });
      const options = await collector.collect();
      expect(options.targetDir).toBe("/tmp/argv-target");
    } finally {
      process.argv = originalArgv;
    }
  });

  test("falls back to cwd when --target-dir has no value", async () => {
    const originalArgv = process.argv;
    try {
      process.argv = [...originalArgv, "--target-dir"];
      const collector = new OptionsCollector({ nonInteractive: true });
      const options = await collector.collect();
      expect(options.targetDir).toBe(".");
    } finally {
      process.argv = originalArgv;
    }
  });
});
