import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false, // Desactivar paralelismo extremo en CI para evitar bloqueos
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // 2 reintentos automáticos en CI si algo falla por red
  workers: process.env.CI ? 1 : undefined, // 1 solo worker en CI para máxima estabilidad
  timeout: 45_000, // Timeout generoso por test
  reporter: process.env.CI ? "html" : "html",

  use: {
    baseURL,
    trace: "on-first-retry",
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        video: process.env.CI ? "retain-on-failure" : "on",
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
    timeout: 120_000, // Darle hasta 2 minutos a Next.js para arrancar holgadamente en el runner
  },
});