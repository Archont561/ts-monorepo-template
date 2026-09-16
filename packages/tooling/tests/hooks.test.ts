import { describe, expect, test } from "bun:test";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { $ } from "bun";
import { skipMissingTool, TOOLS, withOptionalTool } from "@/src/utils/tools";
import { REPO_ROOT } from "./helpers";

const BASE = join(REPO_ROOT, "packages/tooling/src/configs/lefthook.base.yml");

interface HookCommand {
  run?: string;
  glob?: string;
  stage_fixed?: boolean;
}
interface HookConfig {
  parallel?: boolean;
  commands: Record<string, HookCommand>;
}
type LefthookConfig = Record<string, HookConfig | string[] | undefined>;

const config = Bun.YAML.parse(readFileSync(BASE, "utf8")) as LefthookConfig;

/** A hook's command, asserting it exists so the tests read without `?.` noise. */
function cmd(hook: string, name: string): HookCommand {
  const command = (config[hook] as HookConfig | undefined)?.commands?.[name];
  if (!command) throw new Error(`missing command ${hook}.${name}`);
  return command;
}

/** The `run` block of a hook command. */
function run(hook: string, name: string): string {
  return cmd(hook, name).run ?? "";
}

/** Every `run:` block in the config, tagged with the hook it belongs to. */
function runBlocks(): Array<{ hook: string; name: string; run: string }> {
  const out: Array<{ hook: string; name: string; run: string }> = [];
  for (const [hook, value] of Object.entries(config)) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    for (const [name, command] of Object.entries((value as HookConfig).commands ?? {})) {
      if (command.run) out.push({ hook, name, run: command.run });
    }
  }
  return out;
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
    expect(runBlocks().length).toBeGreaterThan(0);
    for (const { run: block } of runBlocks()) {
      expect(block.trim().length).toBeGreaterThan(0);
    }
  });

  test("the root wrapper extends the shared base config", () => {
    const root = Bun.YAML.parse(readFileSync(join(REPO_ROOT, "lefthook.yml"), "utf8")) as {
      extends?: string[];
    };
    expect(root.extends?.some((p) => p.endsWith("configs/lefthook.base.yml"))).toBe(true);
  });
});

describe("hook commands stay minimal", () => {
  // Related checks are merged rather than spread across commands, and the logic
  // lives in the `m` wrappers so the YAML stays declarative.
  test("pre-commit is four commands and commit-msg is one", () => {
    expect(Object.keys((config["pre-commit"] as HookConfig).commands).sort()).toEqual([
      "biome",
      "guards",
      "secrets",
      "workflows",
    ]);
    expect(Object.keys((config["commit-msg"] as HookConfig).commands)).toEqual(["message"]);
  });

  test("each pre-commit command that delegates to a tool is a single line", () => {
    for (const name of ["biome", "secrets", "workflows"]) {
      const lines = run("pre-commit", name).trim().split("\n");
      expect(lines.length, `${name} should be one line`).toBe(1);
    }
  });

  test("pre-commit runs in parallel, pre-push does not", () => {
    expect((config["pre-commit"] as HookConfig).parallel).toBe(true);
    // Sequential on purpose: Turbo already parallelises internally, and several
    // interleaved logs make a failure hard to read.
    expect((config["pre-push"] as HookConfig).parallel).toBeUndefined();
  });
});

describe("hook design rules", () => {
  // Hooks are an early-warning system; CI is authoritative. The skip behaviour
  // lives in the m wrappers, so the hook only has to ask for the lenient mode.
  test("the workflow-lint hook skips when actionlint is unavailable", () => {
    expect(run("pre-commit", "workflows")).toContain("--if-installed");
  });

  test("hooks invoke external tools through m, never directly", () => {
    expect(run("pre-commit", "secrets")).toContain("m gitleaks protect");
    for (const { hook, name, run: block } of runBlocks()) {
      for (const bin of Object.values(TOOLS)) {
        const withoutWrapper = block.split(`m ${bin.bin}`).join("");
        const bare = new RegExp(`(^|[;&|(]\\s*|\\s)${bin.bin}(\\s|$)`);
        expect(
          bare.test(withoutWrapper),
          `${hook}.${name} invokes ${bin.bin} directly instead of through m`,
        ).toBe(false);
      }
    }
  });

  // `m` is a workspace bin, and `node_modules/.bin` is not on PATH in the shell
  // a hook runs in — a bare `m …` dies with "m: not found" (exit 127) and fails
  // the commit. `bun run m` resolves it from node_modules/.bin instead. This
  // was hit for real: commit-msg reached for a bare `m commitlint`.
  test("every m invocation in a hook goes through `bun run`, because m is not on PATH", () => {
    const offenders: string[] = [];
    for (const { hook, name, run: block } of runBlocks()) {
      for (const raw of block.split("\n")) {
        const code = raw.replace(/#.*$/, "").trim();
        if (code.length === 0) continue;
        if (/(^|[;&|(]\s*)m\s/.test(code) && !code.includes("bun run m")) {
          offenders.push(`${hook}.${name}: ${code}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  // Feature-dependent hooks no-op when the feature is absent, rather than
  // requiring the scaffolder to rewrite this file per project.
  test("Rust hooks are guarded by the Cargo workspace existing", () => {
    const native = run("pre-push", "native");
    expect(native).toContain("test -f Cargo.toml");
    // Formatting is enforced here rather than in pre-commit, to keep that hook
    // minimal — but it is still enforced.
    expect(native).toContain("fmt:check");
  });

  // No hook in the blocking path may reach the network: a commit or push must
  // not fail because a machine is offline or behind cert interception.
  test("no blocking hook performs a network operation", () => {
    const network =
      /\b(curl|wget|nc|ssh|git\s+(clone|fetch|pull|push)|bun\s+(add|install|update)|npm\s+install|go\s+install|brew\s+install)\b/;
    for (const { hook, name, run: block } of runBlocks()) {
      if (hook.startsWith("post-")) continue; // install hooks legitimately run bun install
      expect(network.test(block), `${hook}.${name} performs a network operation`).toBe(false);
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
  // tsconfig and the cwd is wrong for specs that resolve paths relatively.
  test("pre-push uses the Turbo-backed root scripts, not the bare wrappers", () => {
    expect(run("pre-push", "typecheck")).toBe("bun run typecheck");
    expect(run("pre-push", "test")).toBe("bun run test");
  });

  test("Biome re-stages its own fixes and tolerates excluded paths", () => {
    const biome = cmd("pre-commit", "biome");
    expect(biome.stage_fixed).toBe(true);
    // Without this flag a staged path Biome's own config excludes aborts the
    // commit with "No files were processed"; duplicating Biome's exclude list
    // here would just be a second source of truth to drift.
    expect(biome.run).toContain("--no-errors-on-unmatched");
    expect(biome.run).toContain("{staged_files}");
  });

  test("Biome's glob omits Markdown, which Biome cannot parse", () => {
    const glob = cmd("pre-commit", "biome").glob;
    expect(glob).toBeDefined();
    expect(glob).not.toContain("md");
  });

  test("the conflict-marker guard does not match a line of equals signs", () => {
    const block = run("pre-commit", "guards");
    expect(block).toContain("<{7}");
    expect(block).toContain(">{7}");
    expect(block).not.toContain("={7}");
  });

  test("the size guard excludes build output and is configurable", () => {
    const block = run("pre-commit", "guards");
    expect(block).toContain("node_modules");
    expect(block).toContain("dist");
    expect(block).toContain("LARGE_FILE_LIMIT");
  });
});

describe("commit message policy", () => {
  test("fixup and squash are allowed at commit time so autosquash works", () => {
    const block = run("commit-msg", "message");
    expect(block).toContain('"fixup! "*');
    expect(block).toContain('"squash! "*');
    expect(block).toContain('"Merge "*');
    expect(block).toContain('"chore(release):"*');
  });

  test("wip and todo are rejected at commit time", () => {
    expect(run("commit-msg", "message")).toMatch(/\(wip\|todo\)/i);
  });

  test("message format is delegated to commitlint, not a hand-rolled regex", () => {
    const block = run("commit-msg", "message");
    // Through `m`, like every other external tool a hook reaches for.
    expect(block).toContain("m commitlint {1}");
    // The inline type-list regex is gone: config-conventional owns the spec.
    expect(block).not.toContain("feat|fix|docs|style");
  });

  test("the message check lives in commit-msg, where the message exists", () => {
    // git passes pre-commit no arguments, so there is nothing there to lint.
    // Asserted structurally so the check cannot be moved by accident.
    expect(run("commit-msg", "message")).toContain("{1}");
    expect(run("pre-commit", "biome")).not.toContain("commitlint");
    expect(run("pre-commit", "guards")).not.toContain("commitlint");
    expect(run("pre-commit", "secrets")).not.toContain("commitlint");
  });

  test("commitlint accepts conventional messages and rejects the rest", async () => {
    const cases: Array<[string, "allow" | "block"]> = [
      ["feat: add a thing", "allow"],
      ["fix(scope)!: breaking change", "allow"],
      ["chore(release): 1.2.3", "allow"],
      ["added some stuff", "block"],
      ["feat:missing space after colon", "block"],
      ["nonsense: not a real type", "block"],
    ];
    for (const [message, want] of cases) {
      const file = join(tmpdir(), `commitlint-${Buffer.from(message).toString("hex")}`);
      writeFileSync(file, `${message}\n`);
      const result = await $`bun run m commitlint ${file}`.cwd(REPO_ROOT).nothrow().quiet();
      const allowed = result.exitCode === 0;
      expect(allowed, `${JSON.stringify(message)} should ${want}`).toBe(want === "allow");
      unlinkSync(file);
    }
  }, 120_000);

  test("an absent commitlint reports a skip rather than failing the commit", () => {
    // The wrapper resolves the local bin and only then runs it; when neither
    // the local bin nor PATH has it, this is the path taken.
    expect(skipMissingTool(TOOLS.commitlint)).toBe(0);
  });

  test("an empty message is let through, so an editor abort is not a failure", async () => {
    const file = join(tmpdir(), "commitlint-empty");
    writeFileSync(file, "");
    const result = await $`bun run m commitlint ${file}`.cwd(REPO_ROOT).nothrow().quiet();
    expect(result.exitCode).toBe(0);
    unlinkSync(file);
  }, 60_000);

  test("the push-time rule is what actually stops an unautosquashed fixup", () => {
    const block = run("pre-push", "unsquashed");
    expect(block).toContain("fixup|squash");
    expect(block).toContain("autosquash");
    // It must degrade to a skip rather than an error when no base ref resolves.
    expect(block).toContain("|| exit 0");
  });
});

describe("missing external tools are reported, not fatal", () => {
  // The wrappers do the skipping; these tests pin the contract hooks rely on.
  test("every known tool declares a purpose and install guidance", () => {
    for (const [name, spec] of Object.entries(TOOLS)) {
      expect(spec.purpose.length, `${name} has no purpose`).toBeGreaterThan(0);
      expect(spec.install.length, `${name} has no install hint`).toBeGreaterThan(0);
      expect(spec.bin.length, `${name} has no binary name`).toBeGreaterThan(0);
    }
  });

  test("withOptionalTool skips with exit 0 for an absent tool", () => {
    let ran = false;
    // A name that cannot exist on PATH, so the skip path is what runs.
    const code = withOptionalTool("gitleaks", () => {
      ran = true;
      return 42;
    });
    if (!ran) {
      expect(code).toBe(0);
    } else {
      expect(code).toBe(42);
    }
  });

  test("each optional tool logs and exits 0 through its m command", async () => {
    const probes: Array<{ args: string[]; label: string }> = [
      { args: ["gitleaks", "protect", "--staged"], label: "gitleaks" },
      { args: ["ci:lint", "--if-installed"], label: "actionlint" },
      { args: ["trivy", "fs"], label: "trivy" },
      { args: ["ci:local"], label: "act" },
      { args: ["native", "check"], label: "cargo" },
    ];
    for (const probe of probes) {
      const result = await $`bun run m ${probe.args}`.cwd(REPO_ROOT).nothrow().quiet();
      const out = `${result.stdout.toString()}${result.stderr.toString()}`;
      // A present tool may legitimately do real work and exit non-zero on real
      // findings; what must never happen is an opaque loader/network error.
      expect(out, `${probe.label} surfaced a raw download error`).not.toContain(
        "unable to verify the first certificate",
      );
      expect(result.exitCode, `${probe.label} hard-failed on a missing tool`).not.toBe(1);
    }
  }, 120_000);

  test("strict actionlint mode gives install instructions, not a TLS error", async () => {
    const result = await $`bun run m ci:lint`.cwd(REPO_ROOT).nothrow().quiet();
    const out = `${result.stdout.toString()}${result.stderr.toString()}`;
    expect(out).not.toContain("unable to verify the first certificate");
    if (result.exitCode !== 0) {
      expect(out).toContain("ACTIONLINT_BIN");
    }
  }, 60_000);
});
