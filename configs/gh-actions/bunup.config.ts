import { cliConfig, defineConfig } from "@myorg/bunup";

export default defineConfig({
  ...cliConfig,
  entry: ["src/cli.ts"],
});
