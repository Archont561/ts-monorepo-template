import { defineConfig } from "bunup";

export default defineConfig({
  entry: ["src/e2e.ts"],
  format: ["esm"],
  target: "bun",
  clean: true,
  dts: false, // runnable binary, not an importable library
  // @playwright/test pulls in chromium-bidi, which bunup cannot bundle; keep
  // it external so the wrapper resolves it from node_modules at runtime.
  external: ["@playwright/test"],
});
