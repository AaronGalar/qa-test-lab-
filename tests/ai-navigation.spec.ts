import { expect, test } from "@playwright/test";

test("abre el asistente IA desde el menú de casos de prueba", async ({
  page,
}) => {
  await page.goto("/test-cases");

  await page.getByRole("link", { name: "Asistente IA" }).click();

  await expect(page).toHaveURL(/\/test-cases\/ai-demo$/);
  await expect(page.getByTestId("chat-input")).toBeVisible();
});
