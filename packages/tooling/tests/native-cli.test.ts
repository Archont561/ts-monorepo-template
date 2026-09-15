import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { annotateError } from "@/src/utils/spawn";

/**
 * Two invariants that CI depends on and that nothing else would notice breaking.
 *
 * Both were broken at once by the same thing: `napiBin()` resolved
 * `@napi-rs/cli/scripts/index.js`, which is the v2 layout. `@napi-rs/cli` v3 has
 * no such file and does not export `./dist/cli.js`, so `import.meta.resolve`
 * threw and every `m native napi:*` command exited 1 without printing a word —
 * which in CI reads as a bare "Process completed with exit code 1".
 */

describe("napi CLI resolution", () => {
  test("`./package.json` is the exported subpath the bin is derived from", () => {
    // The only subpath besides `.` that @napi-rs/cli exports. If a future
    // version drops it, napiBin() throws and this test names the reason.
    const manifest = Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/package.json"));
    expect(existsSync(manifest)).toBe(true);
    expect(manifest.endsWith(join("@napi-rs", "cli", "package.json"))).toBe(true);
  });

  test("the bin it points at exists on disk", () => {
    const manifest = Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/package.json"));
    const cli = join(dirname(manifest), "dist", "cli.js");
    expect(existsSync(cli)).toBe(true);
  });

  test("the resolved bin is the one the package declares", async () => {
    // Guards against the manifest's `bin` moving while the derived path stays:
    // if napi renames dist/cli.js, derive-from-manifest would silently point at
    // a file that is no longer the CLI.
    const manifest = Bun.fileURLToPath(import.meta.resolve("@napi-rs/cli/package.json"));
    const pkg = JSON.parse(await Bun.file(manifest).text()) as { bin?: Record<string, string> };
    expect(pkg.bin?.napi).toBe("./dist/cli.js");
  });
});

describe("annotateError", () => {
  /**
   * Runs `fn` with console.error captured and GITHUB_ACTIONS pinned.
   *
   * The env var has to be pinned rather than read: this suite runs both on a
   * laptop (unset) and in Actions (set), and the "plain echo" branch depends on
   * it — an unpinned test passes on one and fails on the other.
   */
  function capture(fn: () => void, inActions: boolean): string[] {
    const lines: string[] = [];
    const original = console.error;
    const previous = process.env.GITHUB_ACTIONS;
    if (inActions) process.env.GITHUB_ACTIONS = "true";
    else delete process.env.GITHUB_ACTIONS;
    console.error = (...args: unknown[]) => {
      lines.push(args.map(String).join(" "));
    };
    try {
      fn();
    } finally {
      console.error = original;
      if (previous === undefined) delete process.env.GITHUB_ACTIONS;
      else process.env.GITHUB_ACTIONS = previous;
    }
    return lines;
  }

  test("emits one annotation with newlines encoded, so the tail survives", () => {
    // An unencoded newline truncates the annotation at the first line, which is
    // exactly the output that carries the reason a tool failed.
    const lines = capture(() => annotateError("cargo build failed (exit 101)", "a\nb\nc"), false);
    expect(lines).toHaveLength(2);
    const annotation = lines[0] ?? "";
    expect(annotation.startsWith("::error::")).toBe(true);
    expect(annotation).toContain("%0A");
    expect(annotation).not.toContain("\n");
    expect(annotation).toContain("cargo build failed (exit 101)");
    expect(annotation).toContain("c");
  });

  test("escapes percent signs before encoding, so the payload stays decodable", () => {
    // GitHub decodes %0A/%0D/%25; a literal % in the tool's output would
    // otherwise start a bogus escape sequence.
    const lines = capture(() => annotateError("t", "100% done"), false);
    expect(lines[0]).toContain("100%25 done");
  });

  test("caps the tail so a long build log does not become the annotation", () => {
    const detail = Array.from({ length: 60 }, (_, i) => `line ${i}`).join("\n");
    const lines = capture(() => annotateError("t", detail, 5), false);
    const annotation = lines[0] ?? "";
    expect(annotation).toContain("line 59");
    expect(annotation).not.toContain("line 10");
  });

  test("still annotates inside Actions, without the duplicate plain echo", () => {
    // Actions already shows stderr in the step log, so the readable copy is
    // suppressed there — but the annotation itself must survive either way.
    const lines = capture(() => annotateError("t", "d"), true);
    expect(lines).toHaveLength(1);
    expect(lines[0]?.startsWith("::error::")).toBe(true);
  });
});
