import { baseConfig, defineConfig } from "@myorg/bunup";

export default defineConfig({
  ...baseConfig,
  entry: ["src/index.ts", "src/cli.ts"],
  target: "bun",
  dts: false,
});
