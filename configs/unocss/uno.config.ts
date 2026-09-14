import { baseConfig, defineConfig } from "./index.ts";

export default defineConfig({
  ...baseConfig,
  content: {
    filesystem: [
      "./apps/example/src/**/*.{html,js,ts,tsx}",
      "./apps/example/public/**/*.html",
      "./packages/*/src/**/*.{html,js,ts,tsx}",
    ],
  },
  // CLI entry for bundle handling — generates public/uno.css
  cli: {
    entry: [
      {
        patterns: ["apps/example/src/**/*.{html,ts,tsx}", "apps/example/public/**/*.html"],
        outFile: "apps/example/public/uno.css",
      },
    ],
  },
});
