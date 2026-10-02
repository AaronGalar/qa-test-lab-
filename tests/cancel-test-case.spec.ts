import { test, expect, type Locator } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createQaMetricRecorder } from "./qa-metrics";

test("TC-005 - Cancelar creación de caso", async ({ page }, testInfo) => {
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
        steps: 18,
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

    const recordingPath = path.resolve(process.cwd(), "public", "recordings");
    mkdirSync(recordingPath, { recursive: true });
    await page.close();
    await recording.saveAs(path.join(recordingPath, "video-TC-005.webm"));
  }

  try {
    await installRecordingCursor();
    await metrics.recordStep("Abrir login", async () => {
      await page.goto("http://localhost:3000/login");
      await expect(page).toHaveURL(/\/login$/);
    });

    await metrics.recordStep("Introducir credenciales", async () => {
      const email = page.getByLabel("Email");
      const password = page.getByLabel("Contraseña");
      await moveTo(email);
      await email.click();
      await email.pressSequentially("qa@test.com", { delay: 42 });
      await moveTo(password);
      await password.click();
      await password.pressSequentially("123456", { delay: 42 });
    });

    await metrics.recordStep("Iniciar sesión", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Iniciar sesión" }));
      await expect(
        page.getByRole("heading", { name: "Resumen de calidad" }),
      ).toBeVisible();
    });

    await metrics.recordStep("Abrir Test Cases", async () => {
      await clickLikeUser(page.getByRole("link", { name: "Casos de prueba" }));
      await expect(
        page.getByRole("heading", { name: "Casos de prueba" }),
      ).toBeVisible();
    });

    await metrics.recordStep("Abrir formulario", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Nuevo caso" }));
      await expect(
        page.getByRole("heading", { name: "Crea un caso de prueba" }),
      ).toBeVisible();
    });

    await metrics.recordStep("Cancelar sin guardar", async () => {
      const formHeading = page.getByRole("heading", {
        name: "Crea un caso de prueba",
      });
      await clickLikeUser(page.getByRole("button", { name: "Cancelar" }));
      await expect(formHeading).toBeHidden();
      await expect(
        page.getByRole("button", { name: "Nuevo caso" }),
      ).toBeVisible();
    });

    metrics.finalize("PASSED");
    await saveChromiumRecording();
  } catch (error) {
    metrics.finalize("FAILED");
    await saveChromiumRecording();
    throw error;
  }
});
