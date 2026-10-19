import { test, expect } from '@playwright/test';

test('test de inicio de sesión grabado', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'tu@email.com' }).fill('user@gmail.com');
  await page.getByRole('textbox', { name: '••••••••' }).fill('123');
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // 👉 Añadimos esto para verificar que el login fue exitoso (ej. comprobar que aparece un título de bienvenida o cambia la URL)
  await expect(page).toHaveURL('http://localhost:3000/');
});