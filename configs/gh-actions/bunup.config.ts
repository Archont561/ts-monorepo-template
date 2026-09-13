import { defineConfig } from "bunup";

export default defineConfig({
  entry: ["src/cli.ts", "src/act.ts"],
  format: ["esm"],
  target: "bun",
  clean: true,
  dts: false, // runnable binaries, not importable libraries
});
