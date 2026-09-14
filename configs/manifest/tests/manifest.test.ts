import { describe, expect, test } from "bun:test";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  addJsonArrayValue,
  readJson,
  removeJsonArrayValue,
  removeJsonEntry,
  setJsonBlock,
  setJsonValue,
  updateManifestFile,
} from "../src/index.ts";

/** A manifest in the committed style: short arrays inline, one entry per line. */
const FIXTURE = `{
  "name": "fixture",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "mturbo build",
    "test": "mturbo test",
    "lint": "mbiome check"
  },
  "devDependencies": {
    "@fixture/core": "workspace:*"
  },
  "turbo": {
    "tasks": {
      "build": {
        "dependsOn": ["^build"],
        "outputs": ["dist/**"]
      }
    }
  }
}
`;

describe("manifest editor", () => {
  test("adds a scalar entry and leaves every other byte alone", () => {
    const next = setJsonValue(FIXTURE, "scripts.build:native", "mnative build");

    // Appended after the existing entries, so it is the one without a comma.
    expect(next).toContain(`    "lint": "mbiome check",\n    "build:native": "mnative build"\n`);
    expect(next.replace(`,\n    "build:native": "mnative build"`, "")).toBe(FIXTURE);
    expect(readJson<{ scripts: Record<string, string> }>(next).scripts["build:native"]).toBe(
      "mnative build",
    );
  });

  test("replaces an existing scalar in place", () => {
    const next = setJsonValue(FIXTURE, "scripts.lint", "mbiome check --write");

    expect(readJson<{ scripts: Record<string, string> }>(next).scripts.lint).toBe(
      "mbiome check --write",
    );
    expect(next.replace("mbiome check --write", "mbiome check")).toBe(FIXTURE);
  });

  test("creates the missing parents of a dotted path", () => {
    const next = setJsonValue(FIXTURE, "publishConfig.access", "public");
    const doc = readJson<{ publishConfig: { access: string } }>(next);

    expect(doc.publishConfig.access).toBe("public");
    expect(next).toContain(`  "publishConfig": {\n    "access": "public"\n  }\n}`);
  });

  test("inserts an object block, re-based to where it lands", () => {
    const next = setJsonBlock(
      FIXTURE,
      "turbo.tasks.build:native",
      `{
  "dependsOn": ["build"],
  "outputs": ["*.node", "index.js", "index.d.ts"],
  "cache": false
}`,
    );

    expect(next).toContain(
      `      "build:native": {\n` +
        `        "dependsOn": ["build"],\n` +
        `        "outputs": ["*.node", "index.js", "index.d.ts"],\n` +
        `        "cache": false\n` +
        `      }`,
    );
    const tasks = readJson<{ turbo: { tasks: Record<string, unknown> } }>(next).turbo.tasks;
    expect(tasks["build:native"]).toEqual({
      dependsOn: ["build"],
      outputs: ["*.node", "index.js", "index.d.ts"],
      cache: false,
    });
  });

  test("removes a middle entry without touching its neighbours", () => {
    const next = removeJsonEntry(FIXTURE, "scripts.test");

    expect(next).not.toContain("mturbo test");
    expect(next).toContain(`    "build": "mturbo build",\n    "lint": "mbiome check"\n`);
    expect(readJson<{ scripts: Record<string, string> }>(next).scripts.build).toBe("mturbo build");
  });

  test("removes the last entry and takes the previous comma with it", () => {
    const next = removeJsonEntry(FIXTURE, "scripts.lint");

    expect(next).toContain(`    "test": "mturbo test"\n  }`);
    expect(next).not.toContain("mbiome check");
    expect(() => readJson(next)).not.toThrow();
  });

  test("removes a nested entry addressed by a dotted path", () => {
    const next = removeJsonEntry(FIXTURE, "turbo.tasks.build.outputs");

    expect(next).toContain(`        "dependsOn": ["^build"]\n`);
    expect(readJson<{ turbo: { tasks: Record<string, object> } }>(next).turbo.tasks.build).toEqual({
      dependsOn: ["^build"],
    });
  });

  test("removing the only entry of an object still yields a readable manifest", () => {
    const next = removeJsonEntry(FIXTURE, "turbo.tasks.build");

    expect(readJson<{ turbo: { tasks: Record<string, object> } }>(next).turbo.tasks).toEqual({});
  });

  test("a path that is not there is a no-op", () => {
    expect(removeJsonEntry(FIXTURE, "scripts.missing")).toBe(FIXTURE);
    expect(removeJsonEntry(FIXTURE, "nope.deep.key")).toBe(FIXTURE);
  });

  test("appends to a multi-line array on its own line", () => {
    const next = addJsonArrayValue(FIXTURE, "workspaces", "configs/*");

    expect(next).toContain(`    "apps/*",\n    "packages/*",\n    "configs/*"\n  ],`);
  });

  test("appends to an inline array in place", () => {
    const next = addJsonArrayValue(FIXTURE, "turbo.tasks.build.outputs", "public/**");

    expect(next).toContain(`"outputs": ["dist/**", "public/**"]`);
  });

  test("removes an array element by value, keeping the array", () => {
    const middle = removeJsonArrayValue(FIXTURE, "workspaces", "apps/*");
    expect(middle).toContain(`  "workspaces": [\n    "packages/*"\n  ],`);

    const last = removeJsonArrayValue(FIXTURE, "turbo.tasks.build.outputs", "dist/**");
    expect(last).toContain(`"outputs": []`);
  });

  test("inserts into an empty object and an empty array", () => {
    const emptyObject = `{\n  "scripts": {}\n}\n`;
    expect(setJsonValue(emptyObject, "scripts.build", "mturbo build")).toBe(
      `{\n  "scripts": {\n    "build": "mturbo build"\n  }\n}\n`,
    );

    const inline = `{\n  "long": []\n}\n`;
    expect(addJsonArrayValue(inline, "long", "one")).toBe(`{\n  "long": ["one"]\n}\n`);

    const expanded = `{\n  "long": [\n  ]\n}\n`;
    const withElement = addJsonArrayValue(expanded, "long", "one");
    expect(withElement).toBe(`{\n  "long": [\n      "one"\n  ]\n}\n`);
    expect(readJson<{ long: string[] }>(withElement).long).toEqual(["one"]);
  });

  test("removes an element that is not the first of its array", () => {
    const next = removeJsonArrayValue(FIXTURE, "workspaces", "packages/*");

    expect(next).toContain(`  "workspaces": [\n    "apps/*"\n  ],`);
  });

  test("removes the last element of an inline array and its comma", () => {
    const source = `{\n  "a": {\n    "list": ["x", "y"]\n  }\n}\n`;
    expect(removeJsonArrayValue(source, "a.list", "y")).toBe(
      `{\n  "a": {\n    "list": ["x"]\n  }\n}\n`,
    );
  });

  test("removing a value its array does not hold is a no-op", () => {
    expect(removeJsonArrayValue(FIXTURE, "workspaces", "packages/*")).not.toBe(FIXTURE);
    expect(removeJsonArrayValue(FIXTURE, "workspaces", "missing/*")).toBe(FIXTURE);
    expect(removeJsonArrayValue(FIXTURE, "turbo.tasks.build.outputs", "dist/**")).not.toBe(FIXTURE);
    expect(removeJsonArrayValue(FIXTURE, "name", "myorg")).toBe(FIXTURE);
  });

  test.each(["[1, 2, 3]", `{ "a" 1 }`, `{"a": "unterminated`, `{"a": {"b": 1`])(
    "malformed or non-object document %p is left alone by removeJsonEntry",
    (doc) => {
      expect(removeJsonEntry(doc, "a")).toBe(doc);
    },
  );

  test("malformed document is left alone by setJsonValue", () => {
    expect(setJsonValue("not json", "a", 1)).toBe("not json");
  });

  test("edits are idempotent", () => {
    const once = setJsonValue(FIXTURE, "scripts.build:native", "mnative build");
    const twice = setJsonValue(once, "scripts.build:native", "mnative build");

    expect(twice).toBe(once);
  });

  test("arrays the edit does not mention keep their exact bytes", () => {
    const source = `{\n  "scripts": {\n    "a": "1"\n  },\n  "long": [\n    "one",\n    "two"\n  ]\n}\n`;
    const next = setJsonValue(source, "scripts.b", "2");

    expect(next).toContain(`  "long": [\n    "one",\n    "two"\n  ]\n}`);
  });
});

describe("updateManifestFile", () => {
  test("writes only when the edit changes the text", async () => {
    const dir = await mkdtemp(join(tmpdir(), "manifest-"));
    const path = join(dir, "package.json");
    await writeFile(path, FIXTURE);

    expect(await updateManifestFile(path, (source) => source)).toBe(false);
    expect(await readFile(path, "utf8")).toBe(FIXTURE);

    expect(
      await updateManifestFile(path, (source) => setJsonValue(source, "scripts.e2e", "me2e")),
    ).toBe(true);
    expect(await readFile(path, "utf8")).toContain(`"e2e": "me2e"`);

    expect(
      await updateManifestFile(path, (source) => setJsonValue(source, "scripts.e2e", "me2e")),
    ).toBe(false);
  });

  test("reports a missing file instead of creating it", async () => {
    const dir = await mkdtemp(join(tmpdir(), "manifest-"));
    expect(await updateManifestFile(join(dir, "package.json"), (source) => source)).toBe(false);
  });

  test("round-trips the repo's own root manifest", async () => {
    const path = new URL("../../../package.json", import.meta.url).pathname;
    const source = await readFile(path, "utf8");

    const added = setJsonValue(source, "scripts.manifestProbe", "true");
    expect(readJson<{ scripts: Record<string, string> }>(added).scripts.manifestProbe).toBe("true");
    expect(removeJsonEntry(added, "scripts.manifestProbe")).toBe(source);
  });
});
