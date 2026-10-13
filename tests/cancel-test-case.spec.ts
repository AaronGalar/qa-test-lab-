import { test, expect, type Locator } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createQaMetricRecorder } from "./qa-metrics";

test("TC-005 - Cancelar creación de caso", async ({ page }, testInfo) => {
  // Subimos el timeout general del test a 60s para evitar corte en Chromium con vídeo
  test.setTimeout(60_000);

  const metrics = createQaMetricRecorder(testInfo, {
    id: "TC-005",
    title: "Cancelar creación de caso",
  });
  const recording = page.video();

  async function installRecordingCursor() {
    await page.addInitScript(() => {
      const installCursor = () => {
        if (document.getElementById("qa-recording-cursor")) {
          return;
        }

        const cursor = document.createElement("div");
        cursor.id = "qa-recording-cursor";
        cursor.style.cssText = `
          position: fixed;
          z-index: 2147483647;
          width: 24px;
          height: 32px;
          pointer-events: none;
          background: #ffffff;
          border: 2px solid #0f172a;
          clip-path: polygon(0 0, 0 100%, 28% 73%, 48% 100%, 66% 91%, 44% 65%, 100% 65%);
          filter: drop-shadow(0 3px 4px rgba(2, 6, 23, 0.6));
          transform: translate(-3px, -2px) rotate(-8deg);
        `;
        document.body.appendChild(cursor);
        document.addEventListener("mousemove", (event) => {
          cursor.style.left = `${event.clientX}px`;
          cursor.style.top = `${event.clientY}px`;
        });
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", installCursor, {
          once: true,
        });
      } else {
        installCursor();
      }
    });
  }

  async function moveTo(locator: Locator) {
    const box = await locator.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: 10,
      });
    }
  }

  async function clickLikeUser(locator: Locator) {
    await moveTo(locator);
    await locator.click();
  }

  async function saveChromiumRecording() {
    if (testInfo.project.name !== "chromium" || !recording) {
      return;
    }

    try {
      const recordingPath = path.resolve(process.cwd(), "public", "recordings");
      mkdirSync(recordingPath, { recursive: true });
      await page.close();
      await recording.saveAs(path.join(recordingPath, "video-TC-005.webm"));
    } catch (err) {
      console.warn("No se pudo guardar la grabación:", err);
    }
  }

  try {
    await installRecordingCursor();
    await metrics.recordStep("Abrir login", async () => {
      await page.goto("/login");
      await expect(page).toHaveURL(/\/login$/);
    });

    await metrics.recordStep("Introducir credenciales", async () => {
      await page.getByLabel("Email").fill("qa@test.com");
      await page.getByLabel("Contraseña").fill("123456");
    });

    await metrics.recordStep("Iniciar sesión", async () => {
      await page.getByRole("button", { name: "Iniciar sesión" }).click();
      await page.goto("/");
      await expect(
        page.getByRole("heading", { name: "Resumen de calidad" }),
      ).toBeVisible({ timeout: 15000 });
    });

    await metrics.recordStep("Abrir Test Cases", async () => {
      await page.goto("/test-cases");
      await expect(
        page.getByRole("heading", { name: "Casos de prueba" }),
      ).toBeVisible({ timeout: 15000 });
    });

    await metrics.recordStep("Abrir formulario", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Nuevo caso" }).first());
      await expect(
        page.getByRole("heading", { name: "Crea un caso de prueba" }),
      ).toBeVisible({ timeout: 15000 });
    });

    await metrics.recordStep("Cancelar sin guardar", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Cancelar" }).first());
      await expect(
        page.getByRole("heading", { name: "Crea un caso de prueba" }),
      ).toBeHidden({ timeout: 15000 });
      await expect(
        page.getByRole("button", { name: "Nuevo caso" }).first(),
      ).toBeVisible({ timeout: 15000 });
    });

    metrics.finalize("PASSED");
    await saveChromiumRecording();
  } catch (error) {
    metrics.finalize("FAILED");
    await saveChromiumRecording();
    throw error;
  }
});