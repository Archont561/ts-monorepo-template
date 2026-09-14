import { defineConfig } from "@myorg/bunup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "bun",
  dts: false,
  clean: true,
  // TEMPLATE-ONLY:START(unocss)
  onSuccess: "munocss build",
  // TEMPLATE-ONLY:END(unocss)
});
