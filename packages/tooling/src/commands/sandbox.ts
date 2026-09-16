#!/usr/bin/env bun
import { existsSync, readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "bun";
import { PIXI_PACK_VERSION, PIXI_VERSION } from "@/src/scaffold/vars";
import { repoRoot } from "@/src/utils/paths";
import { defineCommand, rawArgsAfter, spawnTool } from "@/src/utils/spawn";
import { findTool } from "@/src/utils/tools";

/**
 * m sandbox — the reproducible offline sandbox built from the pixi env.
 *
 * `m sandbox setup` downloads pixi and the packed environment (the Sandbox
 * Bundle workflow's `environment.tar` + vendor tree) and unpacks them under
 * `.pixi/`. Every sandbox task runs against that env's bin/ directory, so act,
 * actionlint, podman and cargo never need a system install:
 *
 *   m sandbox setup [--archive <path|url>]   bootstrap pixi + the env bundle
 *   m sandbox run <tool> [args...]           run a tool inside the env
 *   m sandbox fetch-vendor                   cargo vendor + wire .cargo/config.toml
 *   m sandbox verify                         report which sandbox tools resolve
 *
 * The pure helpers below are exported so the plan builds are testable without
 * touching the network or spawning anything.
 */

const SANDBOX_DIR = ".pixi";
const SANDBOX_ENV = "default";
const VENDOR_DIR = "vendor";

/** Absolute path of the sandbox home under a repo root. */
export function sandboxHome(root: string): string {
  return join(root, SANDBOX_DIR);
}

/** The unpacked environment: `<root>/.pixi/envs/<env>`. */
export function sandboxEnvDir(root: string, env = SANDBOX_ENV): string {
  return join(sandboxHome(root), "envs", env);
}

/** The environment's bin directory — what `m sandbox run` prepends to PATH. */
export function sandboxEnvBinDir(root: string, env = SANDBOX_ENV): string {
  return join(sandboxEnvDir(root, env), "bin");
}

/** Where the pixi installer writes its binary (`$PIXI_HOME`, default `~/.pixi`). */
export function pixiHome(): string {
  return process.env.PIXI_HOME || join(homedir(), ".pixi");
}

/** The pixi binary the installer (or a previous setup) puts on disk. */
export function pixiBinPath(): string {
  return join(pixiHome(), "bin", "pixi");
}

/**
 * The installer command that fetches a pinned pixi. install.sh reads
 * `PIXI_HOME` (location) and `PIXI_VERSION` (release tag) from the
 * environment — the same pin the Sandbox Bundle workflow uses.
 */
export function pixiInstallerCommand(version = PIXI_VERSION): string {
  return (
    `PIXI_HOME=${JSON.stringify(pixiHome())} ` +
    `PIXI_VERSION=${JSON.stringify(version)} ` +
    "curl -fsSL https://pixi.sh/install.sh | bash"
  );
}

/** The target triple pixi-pack ships standalone binaries for (repo: Quantco/pixi-pack). */
export function pixiUnpackPlatform(platform = process.platform, arch = process.arch): string {
  if (platform === "darwin") return arch === "x64" ? "x86_64-apple-darwin" : "aarch64-apple-darwin";
  if (platform === "win32") return arch === "x64" ? "x86_64-pc-windows-msvc" : "aarch64-pc-windows-msvc";
  return arch === "x64" ? "x86_64-unknown-linux-gnu" : "aarch64-unknown-linux-gnu";
}

/** URL of the standalone pixi-unpack binary at a pinned pixi-pack release. */
export function pixiUnpackUrl(
  version = PIXI_PACK_VERSION,
  platform = pixiUnpackPlatform(),
): string {
  const name = platform.includes("windows")
    ? `pixi-unpack-${platform}.exe`
    : `pixi-unpack-${platform}`;
  return `https://github.com/Quantco/pixi-pack/releases/download/${version}/${name}`;
}

/** A step of the sandbox plan — either a shell snippet or a spawn vector. */
export interface SandboxStep {
  label: string;
  shell?: string;
  spawn?: string[];
  cwd?: string;
}

/**
 * The setup plan: everything `m sandbox setup` would do, as data.
 *
 * With `archive` the env is unpacked from a bundle (`m sandbox run` inline, no
 * conda solve). Without it, pixi installs the env from pixi.toml/pixi.lock.
 */
export function planSandboxSetup(
  root: string,
  options: {
    archive?: string;
    env?: string;
    hasPixi?: boolean;
    hasPixiUnpack?: boolean;
  } = {},
): SandboxStep[] {
  const env = options.env ?? SANDBOX_ENV;
  const steps: SandboxStep[] = [];

  if (options.archive) {
    let archivePath = options.archive;
    let unpackBin =
      process.env.SANDBOX_PIXI_UNPACK ?? join(pixiHome(), "bin", "pixi-unpack");

    if (options.hasPixiUnpack === false) {
      unpackBin = join(sandboxHome(root), "bin", "pixi-unpack");
      steps.push({
        label: `Download pixi-unpack (${PIXI_PACK_VERSION})`,
        shell: [
          `mkdir -p ${JSON.stringify(join(sandboxHome(root), "bin"))}`,
          `curl -fsSL ${JSON.stringify(pixiUnpackUrl())} -o ${JSON.stringify(unpackBin)}`,
          `chmod +x ${JSON.stringify(unpackBin)}`,
        ].join(" && "),
      });
    }

    if (/^https?:\/\//i.test(options.archive)) {
      const local = join(sandboxHome(root), "packs", "sandbox.tar");
      archivePath = local;
      steps.push({
        label: "Download the environment bundle",
        shell: [
          `mkdir -p ${JSON.stringify(join(sandboxHome(root), "packs"))}`,
          `curl -fsSL ${JSON.stringify(options.archive)} -o ${JSON.stringify(local)}`,
        ].join(" && "),
      });
    }

    steps.push({
      label: `Unpack the environment (${env})`,
      spawn: [unpackBin, archivePath, "-o", join(sandboxHome(root), "envs"), "-e", env],
      cwd: root,
    });
    return steps;
  }

  if (options.hasPixi === false) {
    steps.push({
      label: `Download pixi (${PIXI_VERSION})`,
      shell: pixiInstallerCommand(),
      cwd: root,
    });
  }
  steps.push({
    label: "Install the environment (locked)",
    spawn: ["pixi", "install", "--locked"],
    cwd: root,
  });
  return steps;
}

/**
 * Idempotent `.cargo/config.toml` edit: point cargo's crates-io source at the
 * vendored tree. Everything else in the file survives byte-for-byte; a config
 * that already has the override comes back untouched.
 */
export function withVendoredSource(config: string, vendorDir = VENDOR_DIR): string {
  if (config.includes('replace-with = "vendored-sources"')) return config;
  const block = `[source.crates-io]
replace-with = "vendored-sources"

[source.vendored-sources]
directory = "${vendorDir}"
`;
  return `${config.trimEnd()}\n\n# Offline vendored source — generated on demand by \`m sandbox fetch-vendor\`.\n${block}`;
}

/** PATH with the sandbox env's bin/ first, so tools resolve inside the env. */
function runInSandbox(cmd: string[], cwd: string): number {
  const binDir = sandboxEnvBinDir(cwd);
  if (!existsSync(binDir)) {
    console.warn(`⚠️  Sandbox env not found at ${binDir} — run \`m sandbox setup\` first.`);
    return 1;
  }
  const result = spawnSync({
    cmd,
    env: { ...process.env, PATH: `${binDir}:${process.env.PATH ?? ""}` },
    cwd,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  return result.exitCode;
}

/** The tools the sandbox is expected to provide, in a stable order. */
const SANDBOX_TOOLS = [
  "pixi",
  "act",
  "actionlint",
  "podman",
  "cargo",
  "pixi-pack",
  "pixi-unpack",
] as const;

async function runSetup(
  root: string,
  options: { archive?: string; env?: string },
): Promise<void> {
  const steps = planSandboxSetup(root, {
    ...options,
    hasPixi: findTool("pixi") !== null || existsSync(pixiBinPath()),
    hasPixiUnpack:
      Boolean(process.env.SANDBOX_PIXI_UNPACK) ||
      existsSync(join(pixiHome(), "bin", "pixi-unpack")),
  });

  for (const step of steps) {
    console.log(`\n▸ ${step.label}`);
    let code = 0;
    if (step.shell) {
      code =
        spawnSync({
          cmd: ["bash", "-c", step.shell],
          env: { ...process.env },
          ...(step.cwd ? { cwd: step.cwd } : {}),
          stdout: "inherit",
          stderr: "inherit",
          stdin: "inherit",
        }).exitCode ?? 0;
    } else if (step.spawn) {
      code = spawnTool(step.spawn, { cwd: step.cwd });
    }
    if (code !== 0) {
      console.error(`::error::m sandbox setup failed at: ${step.label}`);
      process.exit(1);
    }
  }

  console.log(`\n✅ Sandbox ready: ${sandboxEnvDir(root, options.env)}`);
  console.log(`   bin: ${sandboxEnvBinDir(root, options.env)}`);
  console.log("   next: m sandbox verify  |  m sandbox fetch-vendor");
}

async function setupFromCli(args: { archive?: string | undefined; env?: string | undefined }) {
  const root = repoRoot();
  await mkdir(sandboxHome(root), { recursive: true });
  await runSetup(root, {
    archive: (args.archive as string | undefined) ?? process.env.SANDBOX_ENV_ARCHIVE,
    env: (args.env as string | undefined) || SANDBOX_ENV,
  });
  // citty falls through to the parent command after a subcommand, so every
  // subcommand exits explicitly (see the same guard in m docs site).
  process.exit(0);
}

const setupCommand = defineCommand({
  meta: {
    name: "setup",
    description: "Download pixi and the env bundle, then unpack it",
  },
  args: {
    archive: {
      type: "string",
      description: "Sandbox bundle archive (path or URL)",
      required: false,
    },
    env: {
      type: "string",
      description: "Environment name (default: default)",
      required: false,
    },
  },
  run: ({ args }) => setupFromCli(args as { archive?: string; env?: string }),
});

const main = defineCommand({
  meta: {
    name: "m sandbox",
    version: "1.0.0",
    description:
      "Reproducible pixi sandbox — download pixi and the packed environment, unpack it, run tools offline",
  },
  args: {
    archive: {
      type: "string",
      description:
        "Sandbox bundle archive (path or URL), defaults to $SANDBOX_ENV_ARCHIVE",
      required: false,
    },
    env: {
      type: "string",
      description: "Environment name (default: default)",
      required: false,
    },
  },
  subCommands: {
    setup: setupCommand,
    run: defineCommand({
      meta: {
        name: "run",
        description: "Run a tool with the sandbox env's bin/ first on PATH",
      },
      args: {
        "tool": {
          type: "positional",
          description: "Tool to run, e.g. act, actionlint, cargo, podman",
          required: true,
        },
      },
      run() {
        const root = repoRoot();
        const raw = rawArgsAfter("run");
        const tool = raw[0];
        if (!tool) {
          console.error("Usage: m sandbox run <tool> [args...]");
          process.exit(1);
        }
        process.exit(runInSandbox([tool, ...raw.slice(1)], root));
      },
    }),
    "fetch-vendor": defineCommand({
      meta: {
        name: "fetch-vendor",
        description: "Rebuild the cargo vendor tree and wire .cargo/config.toml offline",
      },
      run() {
        const root = repoRoot();
        const vendored = runInSandbox(["cargo", "vendor", "vendor"], root);
        if (vendored !== 0) process.exit(vendored);

        const configPath = join(root, ".cargo", "config.toml");
        const previous = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
        const next = withVendoredSource(previous);
        if (next !== previous) {
          writeFile(configPath, next);
          console.log(`✅ Wrote offline vendored override to ${configPath}`);
        } else {
          console.log(`✅ ${configPath} already wired for vendored sources`);
        }
        process.exit(0);
      },
    }),
    verify: defineCommand({
      meta: {
        name: "verify",
        description: "Report which sandbox tools resolve (env bin/ or PATH)",
      },
      run() {
        const root = repoRoot();
        const binDir = sandboxEnvBinDir(root);
        console.log(`Sandbox: ${binDir}`);
        for (const tool of SANDBOX_TOOLS) {
          const inEnv = existsSync(join(binDir, tool));
          const onPath = findTool(tool);
          if (inEnv || onPath) {
            console.log(`  ✓ ${tool} → ${inEnv ? join(binDir, tool) : onPath}`);
          } else {
            console.log(`  ✗ ${tool} — neither in the env nor on PATH`);
          }
        }
        process.exit(0);
      },
    }),
  },
  run: ({ args }) =>
    setupFromCli(args as { archive?: string; env?: string }),
});

export default main;