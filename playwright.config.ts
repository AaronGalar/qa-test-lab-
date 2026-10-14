
import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = `http://127.0.0.1:${port}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests",

  fullyParallel: false,
  forbidOnly: isCI,

  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,

  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],

  outputDir: "test-results",

  use: {
    baseURL,

    actionTimeout: 15_000,
    navigationTimeout: 20_000,

    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    viewport: {
      width: 1920,
      height: 1080,
    },

    deviceScaleFactor: 1,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
      },
    },
  ],

  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
