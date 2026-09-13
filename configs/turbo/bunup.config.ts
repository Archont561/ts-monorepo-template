import { defineConfig } from "bunup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "bun",
  clean: true,
  dts: false, // runnable binary, not an importable library
});
