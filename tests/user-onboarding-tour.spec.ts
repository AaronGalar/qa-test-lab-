// tests/user-onboarding-tour.spec.ts
import { expect, test, type Locator } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

test("TC-TUTORIAL - Tour completo con creación de caso de prueba", async ({
  browser,
}, testInfo) => {
  test.setTimeout(120_000);
  const isRecordingBrowser = testInfo.project.name === "chromium";

  const context = await browser.newContext({
    ...(isRecordingBrowser
      ? {
          recordVideo: {
            dir: "public/recordings/",
            size: { width: 1920, height: 1080 },
          },
        }
      : {}),
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();
  const recording = page.video();

  async function pauseForRecording(durationMs: number) {
    if (isRecordingBrowser) await page.waitForTimeout(durationMs);
  }

  // Puntero azul animado sobre la pantalla
  async function installCursor() {
    await page.addInitScript(() => {
      const init = () => {
        if (document.getElementById("qa-cursor")) return;
        const cursor = document.createElement("div");
        cursor.id = "qa-cursor";
        cursor.style.cssText = `
          position: fixed; z-index: 2147483647; width: 32px; height: 32px;
          pointer-events: none; transform: translate(-4px, -4px);
          transition: left 180ms ease-out, top 180ms ease-out;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.5));
        `;
        cursor.innerHTML = `
          <svg width="32" height="32" viewBox="0 0 32 32">
            <path d="M4 3.5v22l6.2-6 4.8 11 4.5-2-4.8-11h9.3L4 3.5Z" fill="#38bdf8" stroke="#0f172a" stroke-width="2"/>
          </svg>
        `;
        document.body.appendChild(cursor);
        document.addEventListener("mousemove", (e) => {
          cursor.style.left = `${e.clientX}px`;
          cursor.style.top = `${e.clientY}px`;
        });
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
      } else {
        init();
      }
    });
  }

  // Movimiento fluido del ratón
  async function moveTo(locator: Locator) {
    const box = await locator.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
        steps: isRecordingBrowser ? 30 : 1,
      });
      await pauseForRecording(250);
    }
  }

  // Clic tipo usuario
  async function clickLikeUser(locator: Locator) {
    await moveTo(locator);
    await locator.click();
    await pauseForRecording(350);
  }

  // Escritura progresiva y entendible (90ms entre letras)
  async function typeLikeUser(locator: Locator, text: string) {
    await moveTo(locator);
    await locator.click();
    if (!isRecordingBrowser) {
      await locator.fill(text);
      return;
    }

    for (const char of text) {
      await locator.pressSequentially(char);
      await pauseForRecording(90);
    }
    await pauseForRecording(300);
  }

  try {
    if (isRecordingBrowser) await installCursor();

    // 1. Login
    await page.goto("http://localhost:3000/login");
    await pauseForRecording(2000);
    await typeLikeUser(page.getByLabel("Email"), "qa@test.com");
    await typeLikeUser(page.getByLabel("Contraseña"), "123456");
    await clickLikeUser(page.getByRole("button", { name: "Iniciar sesión" }));
    await expect(
      page.getByRole("heading", { name: "Resumen de calidad" }),
    ).toBeVisible();

    // 2. Ir a Casos de Prueba
    await clickLikeUser(page.getByRole("link", { name: "Casos de prueba" }));
    await expect(
      page.getByRole("heading", { name: "Casos de prueba" }),
    ).toBeVisible();

    // 3. Abrir el formulario "Nuevo caso"
    const newCaseBtn = page.getByRole("button", { name: /nuevo caso/i });
    await clickLikeUser(newCaseBtn);
    await expect(
      page.getByRole("heading", { name: "Crea un caso de prueba" }),
    ).toBeVisible();

    // 4. Rellenar los campos del Caso de Prueba
    await typeLikeUser(
      page.getByLabel(/título/i),
      "Verificar inicio de sesión con credenciales válidas",
    );
    await typeLikeUser(
      page.getByLabel(/descripción/i),
      "El usuario introduce email y clave correctos y accede al Dashboard sin errores.",
    );

    // Selección de Prioridad resiliente (evita colgar el test)
    const prioritySelect = page.getByLabel(/prioridad/i);
    if (await prioritySelect.isVisible().catch(() => false)) {
      await clickLikeUser(prioritySelect);

      const nativeSelect = page.locator("select[name='priority']");
      if ((await nativeSelect.count().catch(() => 0)) > 0) {
        await nativeSelect.selectOption({ label: "ALTA" }).catch(() => {});
      } else {
        const altaOption = page.getByRole("option", { name: /alta/i });
        if (await altaOption.isVisible().catch(() => false)) {
          await clickLikeUser(altaOption);
        }
      }
    }

    // Guardar el caso
    const saveBtn = page.getByRole("button", { name: /guardar|crear/i });
    if (await saveBtn.isVisible().catch(() => false)) {
      await clickLikeUser(saveBtn);
    }

    await expect(
      page.getByText("Verificar inicio de sesión con credenciales válidas"),
    ).toBeVisible();

    // Guardar vídeo en disco antes de cerrar la página
    const recordingPath = path.resolve(process.cwd(), "public", "recordings");
    mkdirSync(recordingPath, { recursive: true });

    if (recording) {
      await page.close();
      await recording.saveAs(path.join(recordingPath, "video-tutorial.webm"));
    }
  } catch (err) {
    console.error("Error en el test:", err);
    throw err;
  } finally {
    if (context) {
      await context.close().catch(() => {});
    }
  }
});
