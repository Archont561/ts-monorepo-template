import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { REPO_ROOT } from "./helpers";

/**
 * The Dockerfile is never executed by CI in this sandbox (no Docker daemon),
 * so it rots silently: when the `configs/*` packages were folded into
 * `packages/tooling`, the file kept copying eighteen manifests that no longer
 * exist. `COPY` of a missing source is a hard build failure, and nothing in
 * the JS test suite noticed.
 *
 * These assertions are the cheap substitute for `docker build`: every source
 * path a `COPY` names must exist on disk, and every workspace member must be
 * present before `bun install --frozen-lockfile` runs.
 *
 * Note `readFileSync`, not `Bun.file().text()` — `Bun.file(...).textSync` does
 * not exist in Bun 1.4.2, and guarding for it with a ternary would have made
 * every assertion below pass against an empty string.
 */

const DOCKERFILE = join(REPO_ROOT, "apps/example/Dockerfile");

function dockerfileText(): string {
  return readFileSync(DOCKERFILE, "utf8");
}

/** Dockerfile lines with comments and blanks removed. */
function dockerfileLines(): string[] {
  return dockerfileText()
    .split("\n")
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0 && !l.trimStart().startsWith("#"));
}

/**
 * Every `COPY` that reads from the build context (no `--from=`), as
 * `{ line, sources }` — the final token is the destination.
 */
function contextCopies(): { line: string; sources: string[] }[] {
  const out: { line: string; sources: string[] }[] = [];
  for (const line of dockerfileLines()) {
    if (!/^COPY\s/.test(line)) continue;
    if (line.includes("--from=")) continue;
    const tokens = line
      .slice("COPY".length)
      .split(/\s+/)
      .filter((t) => t.length > 0 && !t.startsWith("--"));
    if (tokens.length < 2) continue;
    out.push({ line, sources: tokens.slice(0, -1) });
  }
  return out;
}

/**
 * Workspace members: expand the root `workspaces` globs (every glob in this
 * repo is `dir/*` or a literal `dir`) and keep those with a manifest.
 */
function workspaceMembers(): string[] {
  const rootPkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8")) as {
    workspaces?: string[];
  };
  const members: string[] = [];
  for (const glob of rootPkg.workspaces ?? []) {
    if (glob.endsWith("/*")) {
      const base = glob.slice(0, -2);
      const abs = join(REPO_ROOT, base);
      if (!existsSync(abs)) continue;
      for (const entry of readdirSync(abs)) {
        const dir = join(base, entry);
        if (existsSync(join(REPO_ROOT, dir, "package.json"))) members.push(dir);
      }
    } else if (existsSync(join(REPO_ROOT, glob, "package.json"))) {
      members.push(glob);
    }
  }
  return members.sort();
}

describe("apps/example/Dockerfile", () => {
  test("exists and parses to real COPY instructions", () => {
    expect(existsSync(DOCKERFILE)).toBe(true);
    // Guards against a vacuous pass if the parse above ever stops matching.
    expect(contextCopies().length).toBeGreaterThan(0);
    expect(dockerfileText()).toContain("FROM oven/bun:");
  });

  test("every build-context COPY names a path that exists", () => {
    const missing: string[] = [];
    for (const { line, sources } of contextCopies()) {
      for (const src of sources) {
        // Globs resolve inside the image, not against this checkout.
        if (src.includes("*")) continue;
        if (/^https?:\/\//.test(src)) continue;
        if (!existsSync(resolve(REPO_ROOT, src))) {
          missing.push(`${src}  ←  ${line}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  test("the deps stage copies every workspace member manifest", () => {
    const members = workspaceMembers();
    expect(members.length).toBeGreaterThan(0);

    const copied = new Set<string>();
    for (const { sources } of contextCopies()) {
      for (const raw of sources) {
        // `COPY packages/native/ ./…` carries a trailing slash; without
        // normalising it the prefix test below never matches.
        const src = raw.replace(/\/+$/, "");
        if (src.endsWith("package.json")) copied.add(dirname(src));
        // A whole-directory COPY also brings the manifests inside it.
        if (!src.includes("*") && !src.endsWith("package.json")) {
          for (const m of members) {
            if (m === src || m.startsWith(`${src}/`)) copied.add(m);
          }
        }
      }
    }

    expect(members.filter((m) => !copied.has(m))).toEqual([]);
  });

  test("does not reference the removed configs/ tree or the retired mnative binary", () => {
    const text = dockerfileText();
    expect(text).not.toContain("configs/");
    expect(text).not.toContain("mnative");
    expect(text).not.toContain("@myorg/native-config");
  });

  test("drives cargo through the m CLI that the image actually installs", () => {
    const text = dockerfileText();
    expect(text).toContain("./node_modules/.bin/m native");
    // The root manifest declares @myorg/tooling, which provides that bin.
    const rootPkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8")) as {
      devDependencies?: Record<string, string>;
    };
    expect(rootPkg.devDependencies?.["@myorg/tooling"]).toBeDefined();
  });
});
