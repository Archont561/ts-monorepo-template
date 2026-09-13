import { baseConfig, defineConfig } from "@myorg/unocss";

export default defineConfig({
  ...baseConfig,
  content: {
    filesystem: [
      "./apps/example/src/**/*.{html,js,ts,tsx}",
      "./apps/example/public/**/*.html",
      "./packages/*/src/**/*.{html,js,ts,tsx}",
    ],
  },
});
