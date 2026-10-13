import { expect, test } from "@playwright/test";

test("abre el generador de escenarios desde los casos de prueba", async ({ page }) => {
  // 1. Iniciar sesión
  await page.goto("/login");
  await page.getByLabel("Email").fill("qa@test.com");
  await page.getByLabel("Contraseña").fill("123456");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  // 2. Ir a Casos de prueba
  await page.goto("/test-cases");
  await page.waitForLoadState("domcontentloaded");

  // 3. Abrir el generador
  const generatorLink = page.getByRole("link", { name: "Generador de escenarios" }).first();
  await expect(generatorLink).toBeVisible({ timeout: 15000 });
  await generatorLink.click();

  await page.waitForURL("**/test-cases/generador", { timeout: 15000 });
  await expect(
    page.getByRole("heading", { name: "Generador de escenarios QA" }),
  ).toBeVisible({ timeout: 15000 });
}); 