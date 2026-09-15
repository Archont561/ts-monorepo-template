import { existsSync, readFileSync } from "node:fs";
import { Glob } from "bun";
import { defineCommand, defineWrapperCommand, spawnTool } from "@/src/utils/spawn";

/**
 * Workspace globs from the root package.json. Read rather than hardcoded so
 * nested layouts — `packages/native/npm/*` for the native bindings — are
 * health-checked without this config knowing about them.
 */
function workspaceGlobs(): string[] {
  try {
    const root = JSON.parse(readFileSync("package.json", "utf8"));
    const globs = Array.isArray(root.workspaces)
      ? root.workspaces.filter((g: unknown): g is string => typeof g === "string")
      : [];
    if (globs.length > 0) return globs;
  } catch {
    // no readable root manifest — fall through to the conventional layout
  }
  return ["packages/*", "apps/*"];
}

/**
 * Every workspace package that isn't `private` — these are the ones that would
 * actually hit the registry, so they are the ones worth health-checking.
 */
function publishablePackages(): string[] {
  const found: string[] = [];
  for (const pattern of workspaceGlobs()) {
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

export const healthCommand = defineCommand({
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
    const built = spawnTool(["bun", "run", "build"]);
    if (built !== 0) {
      console.error("::error::build failed, cannot run package health checks");
      process.exit(built);
    }

    let failed = 0;
    for (const dir of packages) {
      console.log(`\n📦 ${dir}`);
      const publint = spawnTool(["bunx", "--yes", "publint", dir]);
      if (publint !== 0) {
        console.error(`::error::publint failed for ${dir}`);
        failed++;
      }
      const attw = spawnTool(
        ["bunx", "--yes", "@arethetypeswrong/cli", "--pack", ".", "--profile", "esm-only"],
        { cwd: dir },
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

const BUNUP = Bun.fileURLToPath(
  import.meta.resolve("bunup/package.json").replace("package.json", "dist/cli/index.js"),
);

const main = defineWrapperCommand({
  name: "build",
  version: "1.0.0",
  description: "Bunup wrapper — bundler owned by @myorg/tooling, use m build not bunup",
  binPath: "bun",
  configArgs: [BUNUP],
  argsName: "entry",
  argsDescription: "Entry files or bunup args",
  subCommands: { health: healthCommand },
});

export default main;
