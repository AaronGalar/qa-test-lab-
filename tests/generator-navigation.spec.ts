import { expect, test } from "@playwright/test";

test("abre el generador de escenarios desde los casos de prueba", async ({
  page,
}) => {
  await page.goto("/test-cases");

  await page.getByRole("link", { name: "Generador de escenarios" }).click();

  await expect(page).toHaveURL(/\/test-cases\/generador$/);
  await expect(
    page.getByRole("heading", { name: "Generador de escenarios QA" }),
  ).toBeVisible();
});
