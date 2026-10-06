import { expect, test } from "@playwright/test";

test("el asistente responde a una pregunta sobre casos de prueba", async ({
  page,
}) => {
  await page.goto("/test-cases/ai-demo");

  const input = page.getByTestId("chat-input");
  const sendButton = page.getByTestId("send-button");

  // La espera se basa en el contenido renderizado, no en una pausa fija.
  await input.fill("Genera tests para mi login");
  await sendButton.click();

  await expect(page.getByTestId("message-user")).toContainText(
    "Genera tests para mi login",
  );
  await expect(page.getByTestId("ai-thinking")).toBeVisible();

  const response = page.getByTestId("message-ai").last();
  await expect(response).toContainText("Analizando tu aplicación", {
    timeout: 15_000,
  });
  await expect(response).toContainText("Validación de login", {
    timeout: 15_000,
  });
});