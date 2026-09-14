import {
  type PlaywrightTestConfig,
  defineConfig as playwrightDefineConfig,
  devices as playwrightDevices,
} from "@playwright/test";

// Re-export Playwright primitives so apps never import @playwright/test directly
export const defineConfig = playwrightDefineConfig;
export const devices = playwrightDevices;
export type { PlaywrightTestConfig };

/**
 * Shared base settings for all Playwright configs.
 * Apps spread this and add app-specific overrides.
 */
export const baseConfig = {
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? "dot" : "list",
} as const;

/**
 * Named browser presets. Apps pick which ones they need.
 *
 * Usage:
 *   projects: [browsers.chromium, browsers.firefox]
 */
export const browsers = {
  chromium: {
    name: "chromium",
    use: { ...playwrightDevices["Desktop Chrome"] },
  },
  firefox: {
    name: "firefox",
    use: { ...playwrightDevices["Desktop Firefox"] },
  },
  webkit: {
    name: "webkit",
    use: { ...playwrightDevices["Desktop Safari"] },
  },
} as const;

/**
 * Helper to create a webServer config for a Bun.serve app.
 * Handles CI/local reuse logic automatically.
 *
 * Usage:
 *   webServer: bunWebServer({ command: "bun run start", url: `http://localhost:${PORT}/` })
 */
export function bunWebServer(options: { command: string; url: string }) {
  return {
    command: options.command,
    url: options.url,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore" as const,
    stderr: "pipe" as const,
  };
}
