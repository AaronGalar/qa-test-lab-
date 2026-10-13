import { test, expect } from '@playwright/test';

test('TC-008 - Cambiar estado de un caso de prueba', async ({ page }) => {
  // 1. Ir al login e iniciar sesión
  await page.goto('/login');
  await page.getByLabel('Email').fill('qa@test.com');
  await page.getByLabel('Contraseña').fill('123456');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  // 2. Navegar directamente a la sección de casos de prueba
  await page.goto('/test-cases');
  await page.waitForLoadState('domcontentloaded');

  // 3. Interactuar con los botones de cambio de estado
  const btnTc1 = page.getByRole('button', { name: 'Cambiar estado de TC-001' }).first();
  await expect(btnTc1).toBeVisible({ timeout: 15000 });
  await btnTc1.click();
  await page.waitForTimeout(500);

  await btnTc1.click();
  await page.waitForTimeout(500);

  const btnTc2 = page.getByRole('button', { name: 'Cambiar estado de TC-002' }).first();
  await expect(btnTc2).toBeVisible({ timeout: 15000 });
  await btnTc2.click();
  await page.waitForTimeout(500);
});