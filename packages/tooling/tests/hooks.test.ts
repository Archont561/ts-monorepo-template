import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

const REPO_ROOT = join(import.meta.dir, "../../..");
const BASE = join(REPO_ROOT, "packages/tooling/src/configs/lefthook.base.yml");

interface HookConfig {
  parallel?: boolean;
  commands: Record<string, { run?: string; glob?: string; stage_fixed?: boolean }>;
}
type LefthookConfig = Record<string, HookConfig | string[] | undefined>;

const config = Bun.YAML.parse(readFileSync(BASE, "utf8")) as LefthookConfig;

/** Every `run:` block in the config, tagged with the hook it belongs to. */
function runBlocks(): Array<{ hook: string; name: string; run: string }> {
  const out: Array<{ hook: string; name: string; run: string }> = [];
  for (const [hook, value] of Object.entries(config)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    for (const [name, cmd] of Object.entries((value as HookConfig).commands ?? {})) {
      if (cmd.run) out.push({ hook, name, run: cmd.run });
    }
  }
  return out;
}

/** A hook's command, asserting it exists so the tests read without `?.` noise. */
function cmd(hook: string, name: string): { run?: string; glob?: string; stage_fixed?: boolean } {
  const hookConfig = config[hook] as HookConfig | undefined;
  const command = hookConfig?.commands?.[name];
  if (!command) throw new Error(`missing command ${hook}.${name}`);
  return command;
}

/** The `run` block of a hook command. */
function run(hook: string, name: string): string {
  return cmd(hook, name).run ?? "";
}

describe("shared lefthook config", () => {
  test("declares every hook the developer workflow needs", () => {
    for (const hook of [
      "pre-commit",
      "commit-msg",
      "pre-push",
      "post-checkout",
      "post-merge",
      "post-rewrite",
    ]) {
      expect(Object.keys(config), `missing hook ${hook}`).toContain(hook);
    }
  });

  test("every command has a run block", () => {
    const empty = runBlocks().length;
    expect(empty).toBeGreaterThan(0);
    for (const [hook, value] of Object.entries(config)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) continue;
      for (const [name, cmd] of Object.entries((value as HookConfig).commands ?? {})) {
        expect(cmd.run?.trim().length, `${hook}.${name} has no run`).toBeGreaterThan(0);
      }
    }
  });

  test("the root wrapper extends the shared base config", () => {
    const root = Bun.YAML.parse(readFileSync(join(REPO_ROOT, "lefthook.yml"), "utf8")) as {
      extends?: string[];
    };
    expect(root.extends).toBeDefined();
    expect(root.extends?.some((p) => p.endsWith("configs/lefthook.base.yml"))).toBe(true);
  });
});

describe("hook design rules", () => {
  // Hooks are an early-warning system; CI is authoritative. A missing tool must
  // never block a commit or a push.
  test("the workflow-lint hook skips when actionlint is unavailable", () => {
    expect(run("pre-commit", "actionlint")).toContain("--if-installed");
  });

  test("the external-binary wrappers are the defensive ones", () => {
    const blocks = runBlocks();
    const gitleaks = blocks.find((b) => b.name === "gitleaks");
    expect(gitleaks?.run).toContain("m gitleaks protect");
    // m gitleaks / m trivy / m native all exit 0 with a hint when the binary is
    // absent. The assertion that matters is that hooks go through those wrappers
    // instead of invoking the binary directly, which would hard-fail.
    for (const { hook, name, run } of blocks) {
      for (const bin of ["gitleaks", "trivy", "cargo", "actionlint"]) {
        // Strip the legitimate wrapper form first, then look for a bare call.
        const withoutWrapper = run.split(`m ${bin}`).join("");
        const bare = new RegExp(`(^|[;&|(]\\s*|\\s)${bin}(\\s|$)`);
        expect(
          bare.test(withoutWrapper),
          `${hook}.${name} invokes ${bin} directly instead of through m`,
        ).toBe(false);
      }
    }
  });

  // Feature-dependent hooks must no-op when the feature is absent, rather than
  // requiring the scaffolder to rewrite this file per project.
  test("Rust hooks are guarded by the Cargo workspace existing", () => {
    expect(run("pre-commit", "rustfmt")).toContain("test -f packages/native/Cargo.toml");
    expect(run("pre-push", "native")).toContain("test -f packages/native/Cargo.toml");
  });

  // No hook in the blocking path may reach the network: a commit or push must
  // not fail because a machine is offline or behind cert interception.
  test("no blocking hook performs a network operation", () => {
    const network =
      /\b(curl|wget|nc|ssh|git\s+(clone|fetch|pull|push)|bun\s+(add|install|update|x\s+install)|npm\s+install|go\s+install|brew\s+install)\b/;
    for (const { hook, name, run } of runBlocks()) {
      if (hook.startsWith("post-")) continue; // install hooks legitimately run bun install
      expect(network.test(run), `${hook}.${name} performs a network operation`).toBe(false);
    }
  });

  test("lockfile hooks install only when a lockfile actually moved", () => {
    for (const hook of ["post-checkout", "post-merge", "post-rewrite"]) {
      const block = run(hook, "install");
      expect(block, `${hook} must diff a lockfile`).toContain("bun.lock");
      expect(block, `${hook} must guard the install`).toContain("git diff --quiet");
    }
  });

  test("post-checkout ignores file checkouts, which cannot move a lockfile", () => {
    expect(run("post-checkout", "install")).toContain('[ "{3}" = "1" ]');
  });

  // Lefthook substitutes hook arguments as {n} templates; it does not pass them
  // as shell positional parameters. Using $1/$2/$3 compiles and runs, and then
  // silently skips on every invocation — which looks identical to a pass.
  test("hook arguments use lefthook templates, never shell positionals", () => {
    for (const { hook, name, run: block } of runBlocks()) {
      // Only executable lines count — the comments in this file discuss $1/$3
      // precisely to explain why they must not be used.
      const code = block
        .split("\n")
        .filter((line) => !line.trim().startsWith("#"))
        .join("\n");
      expect(
        /\$[1-9]/.test(code),
        `${hook}.${name} reads $1..$9, which lefthook leaves empty`,
      ).toBe(false);
    }
  });

  // `m test` / `m typecheck` run a bare tool at the repo root, where there is no
  // tsconfig and the cwd is wrong for specs that resolve paths relatively. The
  // root scripts run the Turbo task per package instead.
  test("pre-push uses the Turbo-backed root scripts, not the bare wrappers", () => {
    expect(run("pre-push", "typecheck")).toBe("bun run typecheck");
    expect(run("pre-push", "test")).toBe("bun run test");
  });

  test("pre-commit runs in parallel, pre-push does not", () => {
    expect((config["pre-commit"] as HookConfig).parallel).toBe(true);
    // Sequential on purpose: Turbo already parallelises internally, and four
    // interleaved logs make a failure hard to read.
    expect((config["pre-push"] as HookConfig).parallel).toBeUndefined();
  });

  test("Biome re-stages its own fixes", () => {
    const biome = cmd("pre-commit", "biome");
    expect(biome.stage_fixed).toBe(true);
    // Without this flag a staged path Biome excludes aborts the commit with
    // "No files were processed" — duplicating Biome's exclude list here would
    // just be a second source of truth to drift.
    expect(biome.run).toContain("--no-errors-on-unmatched");
    expect(biome.run).toContain("{staged_files}");
  });

  test("Biome's glob omits Markdown, which Biome cannot parse", () => {
    const glob = cmd("pre-commit", "biome").glob;
    expect(glob).toBeDefined();
    expect(glob).not.toContain("md");
  });

  test("the conflict-marker check does not match a line of equals signs", () => {
    const block = run("pre-commit", "conflict-markers");
    expect(block).toContain("<{7}");
    expect(block).toContain(">{7}");
    expect(block).not.toContain("={7}");
  });

  test("the large-file guard excludes build output", () => {
    const block = run("pre-commit", "large-files");
    expect(block).toContain("node_modules");
    expect(block).toContain("dist");
    expect(block).toContain("LARGE_FILE_LIMIT");
  });
});

describe("commit message policy", () => {
  test("fixup and squash are allowed at commit time so autosquash works", () => {
    const block = run("commit-msg", "conventional");
    expect(block).toContain('"fixup! "*|"squash! "*) exit 0');
    expect(block).toContain('"Merge "*');
    expect(block).toContain('"chore(release):"*');
  });

  test("wip and todo are rejected at commit time", () => {
    expect(run("commit-msg", "no-wip")).toMatch(/\(wip\|todo\)/i);
  });

  test("the push-time rule is what actually stops an unautosquashed fixup", () => {
    const block = run("pre-push", "no-unsquashed");
    expect(block).toContain("fixup|squash");
    expect(block).toContain("autosquash");
    // It must degrade to a skip rather than an error when no base ref resolves.
    expect(block).toContain("|| exit 0");
  });
});

describe("m ci:lint actionlint probe", () => {
  // The github-actionlint package downloads its binary on first run. When that
  // download is blocked the tool is unusable, and the wrapper used to die with
  // an opaque TLS error. Both modes below must stay off the network.
  test("--if-installed exits 0 when actionlint is unavailable", async () => {
    const result = await $`bun run m ci:lint --if-installed`.cwd(REPO_ROOT).nothrow().quiet();
    const out = `${result.stdout.toString()}${result.stderr.toString()}`;
    if (result.exitCode === 0 && out.includes("not available")) {
      expect(out).toContain("CI runs actionlint as the authoritative gate");
    }
    // Either it skipped with the warning, or actionlint really is installed and
    // it linted. What it must never do is fail on a download.
    expect(out).not.toContain("unable to verify the first certificate");
  }, 60_000);

  test("strict mode fails with install instructions, not a TLS error", async () => {
    const result = await $`bun run m ci:lint`.cwd(REPO_ROOT).nothrow().quiet();
    const out = `${result.stdout.toString()}${result.stderr.toString()}`;
    expect(out).not.toContain("unable to verify the first certificate");
    if (result.exitCode !== 0) {
      expect(out).toContain("actionlint");
      expect(out).toContain("ACTIONLINT_BIN");
    }
  }, 60_000);
});
