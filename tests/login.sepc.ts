import { test, expect } from "@playwright/test";

test("TC-001 - Login correcto", async ({ page }) => {
  // 1. Abrir el login
  await page.goto("http://localhost:3000/login");

  // 2. Introducir email
  await page.getByLabel("Email").fill("qa@test.com");

  // 3. Introducir contraseña
  await page.getByLabel("Contraseña").fill("123456");

  // 4. Pulsar el botón
  await page.getByRole("button", {
    name: "Iniciar sesión",
  }).click();

  // 5. Comprobar que hemos llegado al Dashboard
  await expect(
    page.getByRole("heading", {
      name: "Dashboard",
    })
  ).toBeVisible();
});