import { expect, test } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createQaMetricRecorder } from "./qa-metrics";

test("Tareas - crear, completar y eliminar una tarea", async ({
  page,
}, testInfo) => {
  test.setTimeout(90_000);
  const isRecordingBrowser = testInfo.project.name === "chromium";
  const recording = page.video();
  const recordingPath = path.resolve(
    process.cwd(),
    "public",
    "recordings",
    "tareas.webm",
  );
  const metrics = createQaMetricRecorder(testInfo, {
    id: "TAREAS",
    title: "Gestionar tareas",
  });
  const recordStep = (name: string, action: () => Promise<void>) =>
    isRecordingBrowser ? metrics.recordStep(name, action) : action();

  try {
    await recordStep("Visitar la página de tareas", async () => {
      await page.goto("/tareas");
      await expect(
        page.getByRole("heading", { name: "Lista de tareas" }),
      ).toBeVisible();
      await expect(
        page.getByPlaceholder("Añade aquí tu tarea"),
      ).toBeVisible();
    });

    await recordStep("Validar tareas vacías", async () => {
      await page.getByPlaceholder("Añade aquí tu tarea").fill("   ");
      await page.getByRole("button", { name: "Añadir tarea" }).click();
      await expect(page.getByRole("listitem")).toHaveCount(0);
    });

    await recordStep("Añadir una tarea", async () => {
      await page
        .getByPlaceholder("Añade aquí tu tarea")
        .fill("  Preparar informe de pruebas  ");
      await page.getByRole("button", { name: "Añadir tarea" }).click();

      const task = page.getByRole("listitem");
      await expect(task).toHaveCount(1);
      await expect(task).toContainText("Preparar informe de pruebas");
      await expect(
        page.getByPlaceholder("Añade aquí tu tarea"),
      ).toHaveValue("");
    });

    await recordStep("Marcar y desmarcar la tarea", async () => {
      const task = page.getByRole("listitem");
      const taskLabel = task.getByText("Preparar informe de pruebas", {
        exact: true,
      });

      await task.getByRole("button", { name: "Marcar" }).click();
      await expect(taskLabel).toHaveClass(/line-through/);
      await task.getByRole("button", { name: "Desmarcar" }).click();
      await expect(taskLabel).not.toHaveClass(/line-through/);
    });

    await recordStep("Eliminar la tarea", async () => {
      await page.getByRole("listitem").getByRole("button", {
        name: "Eliminar",
      }).click();
      await expect(page.getByRole("listitem")).toHaveCount(0);
    });

    if (isRecordingBrowser) metrics.finalize("PASSED");
  } catch (error) {
    if (isRecordingBrowser) metrics.finalize("FAILED");
    throw error;
  } finally {
    if (isRecordingBrowser && recording) {
      mkdirSync(path.dirname(recordingPath), { recursive: true });
      await page.close();
      await recording.saveAs(recordingPath);
    }
  }
});
