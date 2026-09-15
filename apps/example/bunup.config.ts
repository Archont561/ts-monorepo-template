import { defineConfig } from "@myorg/tooling/bunup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "bun",
  dts: false,
  clean: true,
});
