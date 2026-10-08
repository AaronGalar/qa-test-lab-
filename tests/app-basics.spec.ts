import { expect, test, type Page } from "@playwright/test";
import type { TestCase } from "@/lib/api/test-cases";

async function mockTestCaseApi(page: Page) {
  const testCases: TestCase[] = [
    {
      id: "TC-001",
      title: "Login correcto",
      description: "Comprobar acceso con credenciales válidas",
      priority: "High",
      status: "PASS",
    },
    {
      id: "TC-002",
      title: "Login incorrecto",
      description: "Comprobar rechazo de credenciales incorrectas",
      priority: "Medium",
      status: "PASS",
    },
    {
      id: "TC-003",
      title: "Campos obligatorios",
      description: "Comprobar validación de campos vacíos",
      priority: "Low",
      status: "PASS",
    },
  ];
  let nextCaseNumber = 4;

  await page.route("**/api/test-cases**", async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname;

    if (request.method() === "GET" && pathname === "/api/test-cases") {
      await route.fulfill({ json: testCases });
      return;
    }

    const id = decodeURIComponent(
      pathname.slice("/api/test-cases/".length),
    );
    const testCaseIndex = testCases.findIndex((testCase) => testCase.id === id);

    if (request.method() === "POST" && pathname === "/api/test-cases") {
      const input = request.postDataJSON() as Omit<TestCase, "id">;
      const createdCase = {
        ...input,
        id: `TC-${String(nextCaseNumber++).padStart(3, "0")}`,
      };
      testCases.push(createdCase);
      await route.fulfill({ json: createdCase });
      return;
    }

    if (request.method() === "PATCH" && testCaseIndex >= 0) {
      const update = request.postDataJSON() as Pick<TestCase, "status">;
      testCases[testCaseIndex].status = update.status;
      await route.fulfill({ json: testCases[testCaseIndex] });
      return;
    }

    if (request.method() === "DELETE" && testCaseIndex >= 0) {
      testCases.splice(testCaseIndex, 1);
      await route.fulfill({ json: { id } });
      return;
    }

    await route.fulfill({ status: 404, json: { detail: "Not found" } });
  });
}

test("el FAQ lee y crea preguntas en el backend", async ({
  page,
}) => {
  let payload: { texto: string } | undefined;

  await page.route("http://localhost:8000/api/preguntas", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        json: [{ id: 1, texto: "Pregunta ya guardada" }],
      });
      return;
    }

    const requestBody: { texto: string } = route.request().postDataJSON();
    payload = requestBody;
    await route.fulfill({
      json: {
        MENSAJE: "Pregunta creada exitosamente",
        pregunta: { id: 2, texto: requestBody.texto },
      },
    });
  });

  await page.goto("/faq");
  await expect(page.getByRole("listitem")).toContainText(
    "Pregunta ya guardada",
  );
  await page.getByLabel("Escribe una pregunta").fill("¿Cómo pruebo el login?");
  await page.getByRole("button", { name: "Añadir pregunta" }).click();

  await expect(page).toHaveURL(/\/faq$/);
  await expect(
    page.getByRole("listitem").filter({ hasText: "¿Cómo pruebo el login?" }),
  ).toBeVisible();
  expect(payload).toEqual({ texto: "¿Cómo pruebo el login?" });
});

test("los IDs de caso siguen siendo únicos al borrar y volver a crear", async ({
  page,
}) => {
  await mockTestCaseApi(page);
  await page.goto("/test-cases");

  const firstStatus = page.getByRole("button", {
    name: "Cambiar estado de TC-001",
  });
  await firstStatus.click();
  await expect(firstStatus).toHaveText("PENDING");

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

  await page.reload();
  await expect(page.getByText("Campos obligatorios")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Cambiar estado de TC-001" }),
  ).toHaveText("PENDING");
  await expect(
    page.getByRole("button", { name: "Eliminar caso de prueba TC-005" }),
  ).toBeVisible();
});
