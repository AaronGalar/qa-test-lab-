import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${port}`;

// Los vídeos de las pruebas se crean solo en Chromium para evitar duplicados.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "line" : "html",
  use: {
    baseURL,
    trace: "on-first-retry",
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        video: {
          mode: "on",
          size: { width: 1920, height: 1080 },
        },
      },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], video: "off" },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], video: "off" },
    },
  ],

  webServer: {
    command: `npm run start -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
