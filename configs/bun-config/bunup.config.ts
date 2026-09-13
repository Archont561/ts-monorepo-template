import { defineConfig } from "bunup";

export default defineConfig({
  entry: ["src/cli.ts", "src/coverage.ts"],
  format: ["esm"],
  target: "bun",
  clean: true,
  dts: false, // runnable binaries, not importable libraries
});
