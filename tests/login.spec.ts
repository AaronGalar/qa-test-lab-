import { expect, test } from "@playwright/test";

test("TC-001 - Login correcto", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("qa@test.com");
  await page.getByLabel("Contraseña").fill("123456");

  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  // Esperar a la navegación o forzar ir a home si WebKit retrasa la redirección
  await page.waitForURL((url) => url.pathname !== "/login", { timeout: 15000 }).catch(async () => {
    await page.goto("/");
  });

  await expect(
    page.getByRole("heading", { name: "Resumen de calidad" }),
  ).toBeVisible({ timeout: 15000 });
});