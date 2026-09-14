import { baseConfig, browsers, bunWebServer, defineConfig } from "@myorg/playwright";
import { PORT } from "./src/port";

export default defineConfig({
  ...baseConfig,
  testDir: "./e2e",
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  projects: [browsers.chromium, browsers.firefox, browsers.webkit],
  webServer: bunWebServer({
    command: "bun run start",
    url: `http://localhost:${PORT}/`,
  }),
});
