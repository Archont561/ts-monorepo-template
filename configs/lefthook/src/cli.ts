#!/usr/bin/env bun
import { $, file, write } from "bun";

/**
 * `msetup` — regenerates the root `lefthook.yml` wrapper, then installs the
 * Git hooks. Bun links every config package's `m`-prefixed bin into
 * `node_modules/.bin` during `bun install`, so no shim generation is needed.
 *
 * Runs from the repository root as part of the root `prepare` script.
 */
export async function msetup(target = "lefthook"): Promise<void> {
  if (target !== "lefthook") {
    throw new Error(`Unknown setup target '${target}' (expected "lefthook")`);
  }

  const lefthookPkg = await file("configs/lefthook/package.json").json();
  const wrapper = `extends:\n  - node_modules/${lefthookPkg.name}/lefthook.yml\n`;
  await write("lefthook.yml", wrapper);
  await $`bunx lefthook install`.quiet().nothrow();
}

if (import.meta.main) {
  await msetup(process.argv[2]);
}
