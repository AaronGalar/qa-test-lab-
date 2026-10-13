import { defineConfig, devices } from "@playwright/test";

const port = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  
  // En CI damos 2 reintentos por si un runner de GitHub va lento
  retries: process.env.CI ? 2 : 0,
  
  // En CI usamos 2 workers para no saturar la CPU con 1 solo ni sobrecargar el server
  workers: process.env.CI ? 2 : undefined,
  
  // Aumentamos el timeout general por test en CI (45 segundos)
  timeout: process.env.CI ? 45_000 : 30_000,
  
  reporter: process.env.CI ? "line" : "html",
  
  use: {
    baseURL,
    trace: "on-first-retry",
    
    // Timeouts defensivos para acciones y navegaciones
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    
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
        // Solo graba vídeo si falla o se reintenta para no bloquear el sistema de archivos en CI
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
    timeout: 120_000, // Dar más tiempo a Next.js para arrancar en GitHub Actions
  },
});