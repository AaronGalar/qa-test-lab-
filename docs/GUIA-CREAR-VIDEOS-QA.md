# Guia practica para crear videos QA con Playwright y Remotion

Este documento explica como repetir el flujo de este proyecto para convertir un caso de uso de QA en un video claro y profesional.

## 1. Que hace cada herramienta

- **Next.js**: contiene la aplicacion que se va a demostrar.
- **Playwright**: ejecuta el caso de uso en un navegador real y graba el WebM.
- **qa-metrics**: mide cuanto dura cada paso y genera un JSON con la linea temporal.
- **Remotion**: coloca el WebM en una composicion, anade instrucciones y progreso.
- **FFmpeg**, usado internamente por Remotion: convierte la composicion a MP4 H.264.

El flujo completo es:

```text
Caso de uso -> Playwright -> video.webm + test-data.json -> Remotion -> video.mp4
```

## 2. Estructura importante

```text
app/                         Aplicacion Next.js
 tests/                      Casos de uso Playwright
   create-test-case.spec.ts  Flujo que se graba
   qa-metrics.ts             Tiempos por paso y exportacion JSON
playwright.config.ts         Viewport, navegador y video
public/recordings/video.webm Fuente grabada por Playwright
public/test-data/TC-004.json Tiempos y nombres de los pasos
remotion/QARecording.tsx     Composicion del video
remotion/Root.tsx            FPS, resolucion y duracion
scripts/render-tc004.mjs     Comando de exportacion MP4
output/TC-004.mp4            Video final
```

## 3. Preparar el entorno

Desde la raiz del proyecto:

```powershell
npm ci
npx playwright install
```

Playwright inicia el servidor de desarrollo automaticamente. Para probar la aplicación a mano, ejecuta `npm run dev` y abre `http://localhost:3000`.

## 4. Escribir el caso de uso

Un caso de uso debe tener pasos con nombres comprensibles para una persona, no solo para una maquina:

```ts
await metrics.recordStep("Abrir formulario", async () => {
  const button = page.getByRole("button", { name: "Nuevo caso" });
  await moveTo(button);
  await button.click();
  await expect(
    page.getByRole("heading", { name: "Nuevo caso de prueba" }),
  ).toBeVisible();
});
```

Buenas practicas:

1. Usa `getByRole`, `getByLabel` y `getByText` en lugar de selectores CSS fragiles.
2. Despues de cada accion, valida el resultado con `expect`.
3. Divide el flujo en pasos de negocio: entrar, abrir una seccion, completar datos, guardar y comprobar.
4. Usa nombres que puedan aparecer directamente como instrucciones del video.
5. No uses `waitForTimeout` para ocultar fallos. Las pausas de presentacion deben estar centralizadas en `qa-metrics.ts`.

## 5. Hacer que la grabacion parezca humana

Un `fill()` cambia todo el texto en un instante y produce un video artificial. Para una demo usa helpers:

```ts
async function moveTo(locator: Locator) {
  const box = await locator.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 18,
    });
  }
}

async function typeLikeUser(locator: Locator, value: string) {
  await moveTo(locator);
  await locator.click();
  await locator.pressSequentially(value, { delay: 42 });
}
```

Para botones, mueve el raton antes de hacer clic. Para campos, escribe letra a letra. La pausa de `900 ms` de `qa-metrics.ts` deja tiempo para que se entienda cada accion.

## 6. Configurar Playwright correctamente

La viewport debe definirse dos veces: en `use` y dentro del proyecto Chromium. El proyecto puede sobrescribir la configuracion global.

```ts
projects: [
  {
    name: "chromium",
    use: {
      ...devices["Desktop Chrome"],
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
      video: {
        mode: "on",
        size: { width: 1920, height: 1080 },
      },
    },
  },
];
```

Si la viewport real es 1280x720 pero el archivo se guarda como 1920x1080, la imagen aparecera pequena en una esquina con espacio vacio. Ese es un problema de captura, no de Remotion.

## 7. Guardar la grabacion fuente

El test de este proyecto guarda automaticamente el video de Chromium en:

```text
public/recordings/video.webm
```

Solo Chromium debe publicar la fuente para evitar que Firefox o WebKit la reemplacen:

```ts
if (testInfo.project.name === "chromium" && recording) {
  await page.close();
  await recording.saveAs(path.join(recordingPath, "video.webm"));
}
```

## 8. Generar el JSON de tiempos

`createQaMetricRecorder` crea un documento como este:

```json
{
  "id": "TC-004",
  "title": "Crear caso de prueba",
  "status": "PASSED",
  "durationMs": 17396,
  "steps": [
    {
      "name": "Abrir login",
      "status": "PASSED",
      "startMs": 0,
      "endMs": 1724
    }
  ]
}
```

Ese JSON permite que Remotion sepa que paso debe mostrar en cada frame.

## 9. Crear la composicion Remotion

El script `render-tc004.mjs` prepara las props a partir del JSON y valida la fuente antes de renderizar. `QARecording.tsx` se ocupa de:

1. Recibir la cronologia del test como props.
2. Convertir el frame actual a milisegundos.
3. Elegir el paso activo usando los tiempos medidos por Playwright.
4. Pintar el video y las ayudas visuales.

La relacion basica es:

```ts
const currentMs = Math.min(
  frame * (1000 / fps) * playbackRate,
  test.durationMs,
);
```

Para una guia de uso se pueden anadir:

- titulo de la accion;
- explicacion breve en lenguaje sencillo;
- cursor grande;
- circulo de foco;
- zoom centrado en el objetivo;
- barra de progreso;
- indicador `PASO X DE Y`.

Las ayudas no deben tapar el contenido principal. El video de la aplicacion debe ocupar todo el canvas y conservar su proporcion.

## 10. Elegir la duracion

La duracion de Remotion debe cubrir el tiempo del WebM y un breve margen final.

Formula aproximada:

```text
duracion del render >= durationMs / playbackRate + margen
```

El script `render-tc004.mjs` calcula la duracion a partir del JSON y anade 1,2 segundos de margen. La composicion `QARecording` recibe los datos del caso como props de Remotion.

## 11. Renderizar el MP4

El script actual usa H.264 con calidad alta:

```powershell
npm run render:qa -- TC-004
```

Internamente, el script crea un archivo temporal de props, calcula la duracion necesaria y lo elimina al terminar. Tambien puedes indicar otro ID si existen sus datos y grabacion: `npm run render:qa -- TC-005`.

Si Windows bloquea el archivo anterior, elimina solo el artefacto generado y repite:

```powershell
Remove-Item output\TC-004.mp4 -Force
npm run render:qa
```

## 12. Comprobaciones antes de entregar

```powershell
npx playwright test tests/create-test-case.spec.ts --project=chromium
npm run lint
npx tsc --noEmit
npm run render:qa
```

Revisa tambien un frame del video:

```powershell
npx remotion still remotion/index.ts QARecording output\preview.png --frame=300 --overwrite
```

Comprueba especialmente:

- que la aplicacion llena todo el encuadre;
- que no hay barras grises ni contenido en una esquina;
- que cada texto cabe y se lee;
- que el cursor apunta al control correcto;
- que el ultimo paso muestra la confirmacion esperada;
- que la duracion no corta la accion final.

## 13. Errores frecuentes

### El video va demasiado rapido

La grabacion original tiene acciones instantaneas. Usa `pressSequentially`, movimiento de raton y pausas de presentacion. No intentes resolverlo solo ralentizando Remotion.

### El contenido aparece pequeno en una esquina

La viewport del proyecto de Playwright esta sobrescribiendo la global. Configura `viewport` y `video.size` dentro de Chromium.

### El video termina antes de guardar

La composicion es demasiado corta. Compara `durationMs` del JSON con la duracion en frames y anade margen.

### El texto tapa la aplicacion

Reduce el panel, mueve la instruccion a una zona libre o usa un zoom localizado. La explicacion debe ayudar, no ocultar el control.

### Remotion avisa de versiones de zod

Es un aviso de dependencias. El render puede terminar, pero conviene fijar las versiones de los paquetes Remotion y la version de zod que indique el mensaje.
