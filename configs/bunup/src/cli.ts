#!/usr/bin/env bun
import { existsSync, readFileSync } from "node:fs";
import { Glob, spawnSync } from "bun";
import { defineCommand, runMain } from "citty";

function run(cmd: string[], cwd?: string): number {
  const result = spawnSync({
    cmd,
    ...(cwd ? { cwd } : {}),
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  return result.exitCode;
}

/**
 * Every workspace package that isn't `private` — these are the ones that would
 * actually hit the registry, so they are the ones worth health-checking.
 */
function publishablePackages(): string[] {
  const found: string[] = [];
  for (const pattern of ["packages/*", "configs/*", "apps/*"]) {
    for (const pkgJson of new Glob(`${pattern}/package.json`).scanSync(".")) {
      try {
        const pkg = JSON.parse(readFileSync(pkgJson, "utf8"));
        if (pkg.private === true) continue;
        const dir = pkgJson.replace("/package.json", "");
        if (existsSync(`${dir}/package.json`)) found.push(dir);
      } catch {
        // unreadable/invalid manifest — nothing to check here
      }
    }
  }
  return found.sort();
}

const healthCommand = defineCommand({
  meta: {
    name: "health",
    description: "publint + arethetypeswrong over every publishable package",
  },
  run() {
    const packages = publishablePackages();
    if (packages.length === 0) {
      console.log("ℹ️ No publishable packages — skipping package health checks");
      process.exit(0);
    }

    // publint/attw read dist/ + package.json, so the bundles have to exist first.
    // turbo makes the repeat build a cache hit.
    console.log(`🔨 Building before health checks (${packages.length} package(s))`);
    const built = run(["bun", "run", "build"]);
    if (built !== 0) {
      console.error("::error::build failed, cannot run package health checks");
      process.exit(built);
    }

    let failed = 0;
    for (const dir of packages) {
      console.log(`\n📦 ${dir}`);
      const publint = run(["bunx", "--yes", "publint", dir]);
      if (publint !== 0) {
        console.error(`::error::publint failed for ${dir}`);
        failed++;
      }
      const attw = run(
        ["bunx", "--yes", "@arethetypeswrong/cli", "--pack", ".", "--profile", "esm-only"],
        dir,
      );
      if (attw !== 0) {
        console.error(`::error::arethetypeswrong failed for ${dir}`);
        failed++;
      }
    }

    if (failed > 0) {
      console.error(`\n::error::${failed} package health check(s) failed`);
      process.exit(1);
    }
    console.log(`\n✅ Package health OK (${packages.length} package(s))`);
    process.exit(0);
  },
});

const main = defineCommand({
  meta: {
    name: "mbunup",
    version: "1.0.0",
    description: "Bunup wrapper — bundler owned by @myorg/bunup, hoisted, use mbunup not bunup",
  },
  args: {
    entry: { type: "positional", description: "Entry files or bunup args", required: false },
  },
  subCommands: {
    health: healthCommand,
  },
  run() {
    const bunup = Bun.fileURLToPath(
      import.meta.resolve("bunup/package.json").replace("package.json", "dist/cli/index.js"),
    );
    const args = process.argv.slice(2);
    const result = spawnSync({
      cmd: ["bun", bunup, ...args],
      stdout: "inherit",
      stderr: "inherit",
      stdin: "inherit",
    });
    process.exit(result.exitCode);
  },
});

runMain(main);
