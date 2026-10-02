# Como trabajo cuando me pides modificar un video QA

Esta guia describe el proceso que sigo en este proyecto para cambiar una demostracion grabada con Playwright y compuesta con Remotion. La idea es que puedas identificar que archivo contiene cada comportamiento y continuar los cambios manualmente si lo necesitas.

## Flujo de trabajo

1. **Aclarar el resultado esperado.** Traduzco la peticion a un comportamiento observable: por ejemplo, movimiento continuo del cursor, escritura legible, selector visible o una pantalla final mas larga.
2. **Localizar quien controla ese comportamiento.** Compruebo el test que graba la interaccion, los datos de duracion y la composicion Remotion. Si el problema esta en un control de la app, reviso tambien su componente.
3. **Formular una causa comprobable.** Distingo si el defecto nace en la interaccion del navegador, en los tiempos del JSON o en la presentacion del video. Evito cambiar la composicion para ocultar un problema de captura, o viceversa.
4. **Hacer el cambio minimo en el archivo fuente responsable.** Mantengo los cambios de comportamiento junto a su propietario y no edito a mano los artefactos generados.
5. **Validar primero el comportamiento.** Ejecuto el test de Playwright del caso, y despues lint y TypeScript cuando haya cambios de codigo.
6. **Regenerar y revisar el resultado.** Playwright actualiza la grabacion fuente y las metricas; Remotion genera el MP4. Reviso un fotograma representativo y el final para detectar saltos, texto cortado o una composicion demasiado corta.
7. **Informar exactamente que se toco.** Al terminar indico archivos fuente modificados, motivo de cada cambio, validaciones y ruta del video generado. Si un render no termina correctamente, no presento un MP4 anterior como si fuera el nuevo.

## Mapa de archivos fuente

| Archivo                              | Se cambia cuando...                                                                                                                      | Motivo                                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `tests/create-test-case.spec.ts`     | Hay que modificar la secuencia grabada: movimientos, clics, escritura, pausas o interacciones del caso TC-004.                           | Playwright es quien maneja el navegador y produce el video fuente.                                           |
| `tests/qa-metrics.ts`                | Hay que cambiar como se miden los pasos, las pausas de presentacion o los datos que se guardan en el JSON.                               | Centraliza la linea temporal usada por Remotion.                                                             |
| `app/test-cases/page.tsx`            | La demostracion necesita un control o comportamiento real distinto en la interfaz, por ejemplo el menu de prioridad y sus descripciones. | Es la interfaz que aparece en la grabacion; el test no debe fingir un control que no existe.                 |
| `remotion/QARecording.tsx`           | Hay que cambiar textos de guia, zoom, transiciones, barra de progreso, cursor superpuesto o tarjeta final.                               | Define como se presenta y sincroniza la grabacion en el video.                                               |
| `remotion/Root.tsx`                  | Hay que ajustar resolucion, FPS o duracion de la composicion.                                                                            | Una duracion insuficiente corta la grabacion o el tiempo de lectura del cierre.                              |
| `playwright.config.ts`               | Cambian viewport, navegador, tamano del video o forma de levantar la aplicacion para los tests.                                          | Define el entorno de captura de Playwright.                                                                  |
| `scripts/render-tc004.mjs`           | Hay que cambiar el nombre o destino del MP4, codec u opciones del render automatizado.                                                   | Es el comando que conecta los datos del test con Remotion.                                                   |
| `package.json` y `package-lock.json` | Se necesita instalar o fijar una dependencia para resolver una necesidad concreta del render.                                            | Mantienen reproducible el entorno; no se modifican para arreglar un problema visual que pertenece al codigo. |

No todos los cambios requieren tocar todos estos archivos. Por ejemplo, un problema de escritura suele pertenecer al test de Playwright; un fundido o un texto del cierre suele pertenecer a Remotion.

## Archivos generados

Estos archivos son resultados del flujo, no el lugar normal para implementar cambios:

| Archivo o carpeta              | Quien lo genera                                        | Uso                                                |
| ------------------------------ | ------------------------------------------------------ | -------------------------------------------------- |
| `public/recordings/video.webm` | `tests/create-test-case.spec.ts` al ejecutar Chromium. | Grabacion original de la aplicacion.               |
| `public/test-data/TC-004.json` | `tests/qa-metrics.ts` al terminar el test.             | Estado, duracion y tiempos de cada paso.           |
| `output/*.mp4`                 | Remotion o el script de render.                        | Video final para entregar.                         |
| `output/*preview*.png`         | `npx remotion still`.                                  | Imagen de comprobacion de un fotograma.            |
| `test-results/`                | Playwright.                                            | Resultados, videos y contexto de errores del test. |

Si un archivo generado esta desactualizado, vuelvo a ejecutar el paso que lo genera. No corrijo manualmente el JSON para esconder una grabacion fallida ni edito fotogramas sueltos para aparentar que se arreglo el video.

## Ejemplo: puntero y escritura

Para un puntero que salta o una escritura que parece aparecer por bloques, el primer lugar que reviso es `tests/create-test-case.spec.ts`:

- Compruebo como se calculan y temporizan los puntos del movimiento del raton.
- Compruebo si Playwright envia eventos demasiado deprisa para que queden visibles a 30 FPS.
- Compruebo como se envia cada caracter y cuanto dura la pausa entre caracteres.
- Repito el test y reviso la grabacion WebM antes de renderizar el MP4.

Solo ajusto `remotion/QARecording.tsx` si el salto se debe al movimiento de camara, al zoom o a una transicion superpuesta. Ajusto `remotion/Root.tsx` cuando la grabacion ya dura mas y hace falta dar cabida a todo el flujo y al cierre.

En la correccion mas reciente del puntero y la escritura, los archivos fuente modificados fueron:

- `tests/create-test-case.spec.ts`: trayectoria curva con aceleracion y frenado, movimiento temporizado, pausas de escritura variables y mayor timeout para permitir la grabacion completa.
- `remotion/Root.tsx`: duracion de 55 segundos para incluir la captura y dejar tiempo para leer la pantalla final.

El test escribio de nuevo `public/recordings/video.webm` y `public/test-data/TC-004.json`; el render produjo el MP4 y su previsualizacion. Estos artefactos se regeneraron, no se editaron manualmente.

## Comandos habituales

Desde la raiz del proyecto:

```powershell
npx playwright test tests/create-test-case.spec.ts --project=chromium --reporter=line
npm run lint
npx tsc --noEmit
npx remotion render remotion/index.ts QARecording output/TC-004.mp4 --overwrite --codec=h264 --crf=18 --concurrency=3
npx remotion still remotion/index.ts QARecording output/preview.png --frame=1500 --overwrite
```

La imagen fija permite revisar una escena concreta, pero no sustituye ver el video cuando se esta evaluando la continuidad del puntero o de la escritura.
