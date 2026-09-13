import { cliConfig, defineConfig } from "@myorg/bunup";

export default defineConfig({
  ...cliConfig,
  entry: ["src/e2e.ts"],
  // @playwright/test pulls in chromium-bidi, which bunup cannot bundle; keep
  // it external so the wrapper resolves it from node_modules at runtime.
  external: ["@playwright/test"],
});
