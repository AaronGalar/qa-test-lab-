import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createQaMetricRecorder } from "./qa-metrics";

const LOGIN_EMAIL = "qa@test.com";
const LOGIN_PASSWORD = "123456";
const FEATURE_NAME = "Acceso de clientes";
const CASE_TITLE = `${FEATURE_NAME}: rechazo de credenciales incorrectas`;

test("Tutorial real - desde el login hasta guardar un escenario QA", async ({
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
    title: "Primer uso de QA Test Lab y el generador de escenarios",
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
        await page.goto("/login");
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

    await metrics.recordStep("Abrir el generador de escenarios", async () => {
      await clickLikeUser(
        page.getByRole("link", { name: "Generador de escenarios" }),
      );
      await expect(
        page.getByRole("heading", { name: "Generador de escenarios QA" }),
      ).toBeVisible();
    });

    await metrics.recordStep("Elegir tipo y nombre de funcionalidad", async () => {
      await page.getByLabel("Tipo de funcionalidad").selectOption("login");
      await typeLikeUser(
        page.getByLabel("Nombre de la funcionalidad"),
        FEATURE_NAME,
      );
    });

    await metrics.recordStep("Generar y revisar los escenarios", async () => {
      await clickLikeUser(
        page.getByRole("button", { name: "Generar escenarios" }),
      );
      await expect(
        page.getByRole("heading", { name: "Revisa las sugerencias" }),
      ).toBeVisible();
      await expect(
        page.getByRole("checkbox", {
          name: `Seleccionar ${CASE_TITLE}`,
        }),
      ).toBeVisible();
    });

    await metrics.recordStep("Seleccionar el escenario que se guardará", async () => {
      await page
        .getByRole("checkbox", { name: `Seleccionar ${CASE_TITLE}` })
        .check();
    });

    await metrics.recordStep("Guardar el escenario elegido", async () => {
      await clickLikeUser(
        page.getByRole("button", { name: "Guardar seleccionados (1)" }),
      );
      await expect(page.getByRole("status")).toContainText(
        "1 caso guardado en la biblioteca.",
      );
    });

    await metrics.recordStep("Comprobar el caso en la biblioteca", async () => {
      await clickLikeUser(page.getByRole("link", { name: /volver a casos/i }));
      // Añadido .first() para evitar la violación del modo estricto
      await expect(page.getByText(CASE_TITLE).first()).toBeVisible();
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