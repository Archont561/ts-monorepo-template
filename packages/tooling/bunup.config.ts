// The raw `bunup` package has no `cliConfig` — that preset is defined by this
// repo on top of bunup (see src/bunup.ts). Importing it from `bunup` fails, and
// importing it from `@myorg/tooling/bunup` would be circular because this file
// is what builds that module. So the preset is spelled out inline here, matching
// `cliConfig` in src/bunup.ts exactly.
import { defineConfig } from "bunup";

export default defineConfig({
  format: ["esm"],
  dts: false,
  clean: true,
  target: "bun",
  minify: true,
  sourcemap: false,
  // The tools `m` shells out to are resolved at runtime from node_modules, not
  // bundled: playwright-core pulls in chromium-bidi, which is not installed.
  // The scaffold bundle has to run before `node_modules` exists, so its
  // dependencies (citty, @clack/prompts) are inlined rather than resolved.
  packages: "bundle",
  // One self-contained file per entry. Code splitting would emit hashed
  // `shared/chunk-*.js` files that all have to be committed alongside, and
  // rename on every source change.
  splitting: false,
  // The tools `m` shells out to are resolved at runtime from node_modules, not
  // bundled: playwright-core pulls in chromium-bidi, which is not installed.
  external: ["@playwright/test", "playwright-core", "@napi-rs/cli", "@unocss/cli"],
  // Two entry points, two consumers:
  //   dist/cli.js  — the `m` CLI, invoked through the package bin.
  //   dist/run.js  — the interactive scaffolder that `bun-create.preinstall`
  //                  runs. It has to be a committed bundle because preinstall
  //                  fires before node_modules exists.
  entry: ["src/cli.ts", "src/scaffold/run.ts"],
});
