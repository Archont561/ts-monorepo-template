import { defineConfig } from "@myorg/tooling/bunup";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "bun",
  dts: false,
  clean: true,
  // TEMPLATE-ONLY:START(unocss)
  onSuccess: "m unocss build",
  // TEMPLATE-ONLY:END(unocss)
});
