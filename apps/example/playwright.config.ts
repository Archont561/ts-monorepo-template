import { baseConfig, browsers, bunWebServer, defineConfig } from "@myorg/playwright";

export default defineConfig({
  ...baseConfig,
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [browsers.chromium, browsers.firefox, browsers.webkit],
  webServer: bunWebServer({
    command: "bun run start",
    url: "http://localhost:3000/",
  }),
});
