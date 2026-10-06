import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createQaMetricRecorder } from "./qa-metrics";

const LOGIN_EMAIL = "qa@test.com";
const LOGIN_PASSWORD = "123456";
const PROMPT = "Genera tests para mi login";
const CASE_TITLE = "Validación de login con credenciales inválidas";
const CASE_DESCRIPTION =
  "Escribe credenciales incorrectas y comprueba que el acceso se rechaza.";

test("Tutorial real - desde el login hasta guardar un caso sugerido por IA", async ({
  browser,
}, testInfo) => {
  test.setTimeout(180_000);

  const recordingDirectory = testInfo.outputPath("recording");
  const isRecordingBrowser = testInfo.project.name === "chromium";
  const recordingPath = path.resolve(
    process.cwd(),
    "public",
    "recordings",
    "tutorial-ia.webm",
  );
  mkdirSync(recordingDirectory, { recursive: true });
  mkdirSync(path.dirname(recordingPath), { recursive: true });

  // Solo Chromium genera los artefactos públicos que consume Remotion.
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    ...(isRecordingBrowser
      ? {
          recordVideo: {
            dir: recordingDirectory,
            size: { width: 1920, height: 1080 },
          },
        }
      : {}),
  });
  const page = await context.newPage();
  const recording = page.video();
  const metrics = createQaMetricRecorder(testInfo, {
    id: "TUTORIAL-IA",
    title: "Primer uso de QA Test Lab y el asistente de IA",
    createdCase: {
      id: "TC-004",
      title: CASE_TITLE,
      description: CASE_DESCRIPTION,
      priority: "High",
      status: "PENDING",
    },
  });

  async function installRecordingCursor() {
    await page.addInitScript(() => {
      const installCursor = () => {
        if (document.getElementById("qa-recording-cursor")) return;

        const style = document.createElement("style");
        style.textContent = `
          #qa-recording-cursor { transition: left 55ms linear, top 55ms linear, transform 100ms ease; }
          #qa-recording-cursor.is-pressed { transform: translate(-5px, -3px) rotate(-7deg) scale(0.86); }
        `;
        document.head.appendChild(style);

        const cursor = document.createElement("div");
        cursor.id = "qa-recording-cursor";
        cursor.style.cssText = `
          position: fixed;
          z-index: 2147483647;
          width: 34px;
          height: 42px;
          left: -60px;
          top: -60px;
          pointer-events: none;
          transform: translate(-5px, -3px) rotate(-7deg);
          transform-origin: 8px 8px;
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
          cursor.classList.add("is-pressed");
        });
        document.addEventListener("mouseup", () => {
          cursor.classList.remove("is-pressed");
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
    await expect(locator).toBeVisible();
    const box = await locator.boundingBox();
    if (!box) throw new Error("No se pudo localizar el control para el cursor");

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 28,
    });
    await page.waitForTimeout(180);
  }

  async function clickLikeUser(locator: Locator) {
    await moveTo(locator);
    await locator.click();
    await page.waitForTimeout(180);
  }

  async function typeLikeUser(locator: Locator, value: string) {
    await moveTo(locator);
    await locator.click();
    await locator.pressSequentially(value, { delay: 48 });
    await page.waitForTimeout(250);
  }

  try {
    await installRecordingCursor();

    await metrics.recordStep(
      "Abrir la pantalla de inicio de sesión",
      async () => {
        await page.goto("http://localhost:3000/login");
        await expect(
          page.getByRole("heading", { name: "QA Test Lab" }),
        ).toBeVisible();
      },
    );

    await metrics.recordStep(
      "Introducir las credenciales de demostración",
      async () => {
        await typeLikeUser(page.getByLabel("Email"), LOGIN_EMAIL);
        await typeLikeUser(page.getByLabel("Contraseña"), LOGIN_PASSWORD);
      },
    );

    await metrics.recordStep("Iniciar sesión", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Iniciar sesión" }));
      await expect(
        page.getByRole("heading", { name: "Resumen de calidad" }),
      ).toBeVisible();
    });

    await metrics.recordStep("Abrir Casos de prueba", async () => {
      await clickLikeUser(page.getByRole("link", { name: "Casos de prueba" }));
      await expect(
        page.getByRole("heading", { name: "Casos de prueba" }),
      ).toBeVisible();
    });

    await metrics.recordStep("Abrir el Asistente IA", async () => {
      await clickLikeUser(page.getByRole("link", { name: "Asistente IA" }));
      await expect(page.getByTestId("chat-input")).toBeVisible();
      await expect(page.getByTestId("message-ai").first()).toContainText(
        "asistente de QA con IA",
      );
    });

    await metrics.recordStep("Escribir y enviar un prompt", async () => {
      await typeLikeUser(page.getByTestId("chat-input"), PROMPT);
      await clickLikeUser(page.getByTestId("send-button"));
      await expect(page.getByTestId("message-user").last()).toContainText(
        PROMPT,
      );
    });

    await metrics.recordStep("Revisar los escenarios sugeridos", async () => {
      const response = page.getByTestId("message-ai").last();
      await expect(response).toContainText("Validación de login", {
        timeout: 20_000,
      });
      await expect(response).toContainText("Prioridad Alta");
      await expect(response).toContainText("Timeout de sesión");
      await expect(response).toContainText("caracteres especiales");
    });

    await metrics.recordStep("Volver a la biblioteca", async () => {
      await clickLikeUser(page.getByRole("link", { name: /volver a casos/i }));
      await expect(
        page.getByRole("heading", { name: "Casos de prueba" }),
      ).toBeVisible();
    });

    await metrics.recordStep(
      "Abrir el formulario para crear un caso",
      async () => {
        await clickLikeUser(page.getByRole("button", { name: /nuevo caso/i }));
        await expect(
          page.getByRole("heading", { name: "Crea un caso de prueba" }),
        ).toBeVisible();
      },
    );

    await metrics.recordStep("Completar los datos del escenario", async () => {
      await typeLikeUser(page.getByLabel("Título"), CASE_TITLE);
      await typeLikeUser(page.getByLabel("Descripción"), CASE_DESCRIPTION);
    });

    await metrics.recordStep("Seleccionar prioridad alta", async () => {
      const priority = page.getByRole("button", { name: "Prioridad" });
      await clickLikeUser(priority);
      const priorityOptions = page.getByRole("listbox", {
        name: "Niveles de prioridad",
      });
      await expect(priorityOptions).toBeVisible();
      await clickLikeUser(
        priorityOptions.getByRole("option", { name: /Alta/ }),
      );
      await expect(priority).toContainText("Alta");
    });

    await metrics.recordStep("Guardar y comprobar el caso", async () => {
      await clickLikeUser(page.getByRole("button", { name: "Guardar caso" }));
      await expect(page.getByText(CASE_TITLE)).toBeVisible();
      await expect(
        page.getByText("Caso TC-004 guardado correctamente."),
      ).toBeVisible();
    });

    await page.waitForTimeout(1800);
    if (isRecordingBrowser) metrics.finalize("PASSED");
  } catch (error) {
    if (isRecordingBrowser) metrics.finalize("FAILED");
    throw error;
  } finally {
    if (isRecordingBrowser && recording) {
      await page.close().catch(() => {});
      await recording.saveAs(recordingPath);
    } else {
      await page.close().catch(() => {});
    }
    await context.close();
  }
});
