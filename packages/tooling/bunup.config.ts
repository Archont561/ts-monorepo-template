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
  external: ["@playwright/test", "playwright-core", "@napi-rs/cli", "@unocss/cli"],
  entry: ["src/cli.ts"],
});
