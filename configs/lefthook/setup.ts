#!/usr/bin/env bun
import { $, file, write } from "bun";

/**
 * Regenerates the root `lefthook.yml` wrapper, links the config packages'
 * `m`-prefixed CLI bins into `node_modules/.bin`, and installs the Git hooks.
 *
 * Runs from the repository root as part of the root `prepare` script.
 *
 * bun only links workspace-package bins when the package is declared as a
 * dependency, but the root ships zero `devDependencies`. These symlinks are
 * therefore recreated on every install so `mturbo`, `mbiome`, etc. resolve
 * through `node_modules/.bin` exactly like a real dependency's bin would.
 */
async function linkBins(): Promise<void> {
  const configs = await $`find configs -maxdepth 2 -name package.json`.text();

  for (const pkgPath of configs.trim().split("\n").filter(Boolean)) {
    const pkg = await file(pkgPath).json();
    if (!pkg.bin) continue;

    const dir = pkgPath.replace("package.json", "").replace(/\/$/, "");
    for (const [name, relative] of Object.entries<string>(pkg.bin)) {
      const target = `../../${dir}/${relative}`;
      const link = `node_modules/.bin/${name}`;
      await $`ln -sfn ${target} ${link}`.quiet().nothrow();
      await $`chmod +x ${dir}/${relative}`.quiet().nothrow();
    }
  }
}

/**
 * Regenerates the root `lefthook.yml` wrapper and installs the Git hooks.
 * Lefthook merges the shared configuration from the workspace config
 * package, so the root file stays a two-line thin wrapper.
 *
 * The extends target resolves the lefthook package's actual scoped name
 * instead of hardcoding `@myorg`, so regenerating during a generated
 * project's install (where the scope may have been renamed) still points
 * at the correct workspace package.
 *
 * Hoisted as the `msetup` bin; `bun run prepare` invokes it directly via
 * `bun configs/lefthook/setup.ts lefthook`.
 */
export async function msetup(target = "lefthook"): Promise<void> {
  if (target !== "lefthook") {
    throw new Error(`Unknown setup target '${target}' (expected "lefthook")`);
  }

  await $`mkdir -p node_modules/.bin`.quiet().nothrow();
  await linkBins();
  const lefthookPkg = await file("configs/lefthook/package.json").json();
  const wrapper = `extends:\n  - node_modules/${lefthookPkg.name}/lefthook.yml\n`;
  await write("lefthook.yml", wrapper);
  await $`bunx lefthook install`.quiet().nothrow();
}

if (import.meta.main) {
  await msetup(process.argv[2]);
}
