import { test, expect } from '@playwright/test';

test('Debe enviar mensaje a la IA y recibir respuesta simulada', async ({ page }) => {
  await page.goto('/ai-demo'); // Ajusta la ruta según corresponda

  const input = page.getByTestId('chat-input');
  const sendButton = page.getByTestId('send-button');

  // 1. Escribir y enviar mensaje
  await input.fill('Genera tests para mi login');
  await sendButton.click();

  // 2. Verificar que el mensaje del usuario aparece en pantalla
  await expect(page.getByTestId('message-user')).toContainText('Genera tests para mi login');

  // 3. Verificar que aparece el estado de pensando
  await expect(page.getByTestId('ai-thinking')).toBeVisible();

  // 4. Esperar a que la IA complete su respuesta (aumentando el timeout por la animación de tipado)
  const lastAiMessage = page.getByTestId('message-ai').last();
  await expect(lastAiMessage).toContainText('Analizando tu aplicación', { timeout: 15000 });
  await expect(lastAiMessage).toContainText('Validación de login', { timeout: 15000 });
});