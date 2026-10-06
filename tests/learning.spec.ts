import { expect, test } from "@playwright/test";

test("la guía muestra ejercicios ligados a las funciones de QA Test Lab", async ({
  page,
}) => {
  // Cada tarjeta debe ofrecer una tarea que se pueda validar en el proyecto.
  await page.goto("/aprender");

  await expect(
    page.getByRole("heading", { name: "Aprende React construyendo QA Test Lab" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Guardar tareas en el navegador" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Probar un flujo con Playwright" }),
  ).toBeVisible();
});

test("el FAQ agrega una pregunta sin navegar a una ruta inexistente", async ({
  page,
}) => {
  // El formulario actualiza la lista en la misma ruta.
  await page.goto("/faq");
  await page.getByLabel("Escribe una pregunta").fill("¿Cómo pruebo el login?");
  await page.getByRole("button", { name: "Añadir pregunta" }).click();

  await expect(page).toHaveURL(/\/faq$/);
  await expect(page.getByRole("listitem")).toContainText(
    "¿Cómo pruebo el login?",
  );
});

test("los IDs de caso siguen siendo únicos al borrar y volver a crear", async ({
  page,
}) => {
  await page.goto("/test-cases");

  await page
    .getByRole("button", { name: "Eliminar caso de prueba TC-002" })
    .click();
  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill("Comprobar un ID único");
  await page.getByLabel("Descripción").fill("Crear un caso tras borrar otro.");
  await page.getByRole("button", { name: "Guardar caso" }).click();
  await expect(page.getByText("Caso TC-004 guardado correctamente.")).toBeVisible();

  await page
    .getByRole("button", { name: "Eliminar caso de prueba TC-004" })
    .click();
  await page.getByRole("button", { name: "Nuevo caso" }).click();
  await page.getByLabel("Título").fill("Comprobar el siguiente ID");
  await page.getByLabel("Descripción").fill("El ID eliminado no se reutiliza.");
  await page.getByRole("button", { name: "Guardar caso" }).click();

  await expect(page.getByText("Caso TC-005 guardado correctamente.")).toBeVisible();
});
