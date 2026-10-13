import { expect, test } from "@playwright/test";
import type { CreateTestCaseInput } from "@/lib/api/test-cases";
import type { TestCaseSuggestion } from "@/lib/api/test-case-suggestions";

const suggestions: TestCaseSuggestion[] = [
  {
    title: "Acceso de clientes: acceso con credenciales válidas",
    description:
      "Introducir credenciales válidas y comprobar que se permite el acceso.",
    priority: "High",
  },
  {
    title: "Acceso de clientes: rechazo de credenciales incorrectas",
    description:
      "Introducir una contraseña incorrecta y comprobar que se rechaza el acceso.",
    priority: "High",
  },
  {
    title: "Acceso de clientes: validación de campos obligatorios",
    description:
      "Enviar el formulario sin completar los campos requeridos y comprobar los mensajes de validación.",
    priority: "Medium",
  },
];

test("genera una vista previa y guarda solo los escenarios seleccionados", async ({
  page,
}) => {
  let generationRequest: { category: string; feature_name: string } | undefined;
  const savedCases: CreateTestCaseInput[] = [];

  await page.route("**/api/test-case-suggestions", async (route) => {
    generationRequest = route.request().postDataJSON();
    await route.fulfill({ json: suggestions });
  });
  await page.route("**/api/test-cases", async (route) => {
    if (route.request().method() !== "POST") {
      await route.fulfill({ status: 405 });
      return;
    }

    const savedCase: CreateTestCaseInput = route.request().postDataJSON();
    savedCases.push(savedCase);
    await route.fulfill({
      json: { ...savedCase, id: `TC-${savedCases.length + 3}` },
    });
  });

  await page.goto("/test-cases/generador");
  
  // Selección explícita para asegurar que el botón se habilite en todos los navegadores
  await page.getByLabel("Tipo de funcionalidad").selectOption("login");
  await page.getByLabel("Nombre de la funcionalidad").fill("Acceso de clientes");
  await page.getByRole("button", { name: "Generar escenarios" }).click();

  await expect(
    page.getByRole("heading", { name: "Revisa las sugerencias" }),
  ).toBeVisible();
  await expect(
    page.getByRole("checkbox", {
      name: `Seleccionar ${suggestions[1]!.title}`,
    }),
  ).toBeVisible();
  expect(generationRequest).toEqual({
    category: "login",
    feature_name: "Acceso de clientes",
  });

  await page
    .getByRole("checkbox", {
      name: `Seleccionar ${suggestions[1]!.title}`,
    })
    .check();
  await page.getByRole("button", { name: "Guardar seleccionados (1)" }).click();

  await expect(
    page.getByRole("status").filter({ hasText: "1 caso guardado en la biblioteca." }),
  ).toBeVisible();
  expect(savedCases).toEqual([
    {
      title: suggestions[1]!.title,
      description: suggestions[1]!.description,
      priority: "High",
      status: "PENDING",
    },
  ]);
});

test("muestra el error del backend si no puede generar escenarios", async ({
  page,
}) => {
  await page.route("**/api/test-case-suggestions", async (route) => {
    await route.fulfill({
      status: 503,
      json: { detail: "Servicio no disponible" },
    });
  });

  await page.goto("/test-cases/generador");
  
  // Selección explícita para evitar que el botón quede deshabilitado en WebKit
  await page.getByLabel("Tipo de funcionalidad").selectOption("login");
  await page.getByLabel("Nombre de la funcionalidad").fill("Acceso");
  await page.getByRole("button", { name: "Generar escenarios" }).click();

  await expect(page.locator("p[role='alert']")).toContainText(
    "El backend respondió con HTTP 503",
  );
});