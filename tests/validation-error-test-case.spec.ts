import { test, expect, type Locator } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createQaMetricRecorder } from "./qa-metrics";

test("TC-007 - Validar campos obligatorios al crear caso", async ({ page }, testInfo) => {
  test.setTimeout(90_000);

  const metrics = createQaMetricRecorder(testInfo, {
    id: "TC-007",
    title: "Validar campos obligatorios al crear caso",
  });
  const recording = page.video();

  async function installRecordingCursor() {
    await page.addInitScript(() => {
      const installCursor = () => {
        if (document.getElementById("qa-recording-cursor")) return;

        const style = document.createElement("style");
        style.textContent = `
          @keyframes qa-route-enter {
            from { opacity: 0.72; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          main { animation: qa-route-enter 420ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        `;
        document.head.appendChild(style);

        const cursor = document.createElement("div");
        cursor.id = "qa-recording-cursor";
        cursor.style.cssText = `
          position: fixed;
          z-index: 2147483647;
          width: 34px;
          height: 42px;
          pointer-events: none;
          transform: translate(-5px, -3px) rotate(-7deg);
          transform-origin: 8px 8px;
          left: 0;
          top: 0;
          transition: left 80ms linear, top 80ms linear, transform 100ms ease;
          filter: drop-shadow(0 3px 5px rgba(2, 6, 23, 0.55));
        `;
        cursor.innerHTML = `
          <svg width="34" height="42" viewBox="0 0 34 42" aria-hidden="true">
            <path d="M4 3.5v27l7.1-6.9 5.2 12.1 5.1-2.2-5.2-12.1h10.5L4 3.5Z" fill="#f8fafc" stroke="#0f172a" stroke-width="2.4" stroke-linejoin="round" />
            <path d="m8 12 9.3 9.2" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" />
          </svg>
        `;
        document.body.appendChild(cursor);
        document.addEventListener("mousemove", (event) => {
          cursor.style.left = `${event.clientX}px`;
          cursor.style.top = `${event.clientY}px`;
        });
        document.addEventListener("mousedown", () => {
          cursor.style.transform = "translate(-5px, -3px) rotate(-7deg) scale(0.88)";
        });
        document.addEventListener("mouseup", () => {
          cursor.style.transform = "translate(-5px, -3px) rotate(-7deg) scale(1)";
        });
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", installCursor, { once: true });
      } else {
        installCursor();
      }
    });
  }

  async function moveTo(locator: Locator) {
    const box = await locator.boundingBox();
    if (box) {
      const target = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
      };
      await page.mouse.move(target.x, target.y, { steps: 35 });
      await page.waitForTimeout(100);
    }
  }

  async function clickLikeUser(locator: Locator) {
    await moveTo(locator);
    await locator.click();
    await page.waitForTimeout(150);
  }

  async function typeLikeUser(locator: Locator, value: string) {
    await moveTo(locator);
    await locator.click();

    for (const [index, character] of Array.from(value).entries()) {
      await locator.pressSequentially(character);

      const nextCharacter = value[index + 1];
      const pause = /[.,!?;:]/.test(character)
        ? 420
        : character === " "
          ? 210
          : 140 + ((index * 37) % 61);

      if (nextCharacter) {
        await page.waitForTimeout(pause);
      }
    }
  }

  async function saveChromiumRecording() {
    if (testInfo.project.name !== "chromium" || !recording) {
      return;
    }

    const recordingPath = path.resolve(process.cwd(), "public", "recordings");
    mkdirSync(recordingPath, { recursive: true });
    await page.close();
    await recording.saveAs(path.join(recordingPath, "video-TC-007.webm"));
  }

  try {
    await installRecordingCursor();

    await metrics.recordStep("Abrir login", async () => {
      await page.goto("http://localhost:3000/login");
      await expect(page).toHaveURL(/\/login$/);
      await page.waitForTimeout(800);
    });

    await metrics.recordStep("Introducir credenciales", async () => {
      await typeLikeUser(page.getByLabel("Email"), "qa@test.com");
      await typeLikeUser(page.getByLabel("Contraseña"), "123456");
    });

    await metrics.recordStep("Iniciar sesión", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Iniciar sesión" }));
      await expect(
        page.getByRole("heading", { name: "Resumen de calidad" })
      ).toBeVisible();
    });

    await metrics.recordStep("Abrir Test Cases", async () => {
      await clickLikeUser(page.getByRole("link", { name: "Casos de prueba" }));
      await expect(
        page.getByRole("heading", { name: "Casos de prueba" })
      ).toBeVisible();
    });

    await metrics.recordStep("Abrir formulario", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Nuevo caso" }));
      await expect(
        page.getByRole("heading", { name: "Crea un caso de prueba" })
      ).toBeVisible();
    });

    await metrics.recordStep("Intentar guardar sin rellenar datos", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Guardar caso" }));
      await page.waitForTimeout(1200); // Pausa para mostrar las alertas rojas en pantalla
    });

    await metrics.recordStep("Comprobar validación de descripción", async () => {
      await typeLikeUser(page.getByLabel("Título"), "Caso borrador");
      await clickLikeUser(page.getByRole("button", { name: "Guardar caso" }));
      await page.waitForTimeout(1200);
    });

    await metrics.recordStep("Cancelar acción", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Cancelar" }));
      await page.waitForTimeout(1000);
    });

    metrics.finalize("PASSED");
    await saveChromiumRecording();
  } catch (error) {
    metrics.finalize("FAILED");
    await saveChromiumRecording();
    throw error;
  }
});