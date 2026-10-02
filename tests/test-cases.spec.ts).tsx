import { test, expect } from '@playwright/test';

test.describe('Navegación y flujo de Gestión de Casos de Prueba', () => {
  test('debe permitir crear un nuevo caso de prueba y cambiar estados', async ({ page }) => {
    // 1. Ir a la página de casos de prueba
    await page.goto('/test-cases');

    // 2. Verificar que el título principal está visible
    await expect(page.getByRole('heading', { name: 'Casos de prueba' })).toBeVisible();

    // 3. Cambiar el estado del primer caso de prueba (TC-001)
    const statusBtn = page.getByRole('button', { name: 'Cambiar estado de TC-001' });
    await statusBtn.click(); // Pasa a PENDING
    await page.waitForTimeout(500); // Pequeña pausa para que se aprecie en el vídeo
    await statusBtn.click(); // Pasa a FAIL
    await page.waitForTimeout(500);

    // 4. Abrir el formulario para crear un nuevo caso
    await page.getByRole('button', { name: '+ Nuevo caso' }).click();

    // 5. Rellenar los campos del formulario
    await page.getByLabel('Título').fill('Prueba E2E con Playwright');
    await page.getByLabel('Descripción').fill('Validación de vídeo grabado automáticamente.');

    // 6. Guardar el nuevo caso
    await page.getByRole('button', { name: 'Guardar caso' }).click();

    // 7. Validar que el caso fue añadido a la tabla y aparece la alerta de confirmación
    await expect(page.getByText('Prueba E2E con Playwright')).toBeVisible();
    await expect(page.getByText(/guardado correctamente/i)).toBeVisible();

    // Pausa final opcional para que el vídeo muestre el resultado final
    await page.waitForTimeout(1000);
  });
});