# Playbook para que una IA cree videos de casos de uso QA

Este documento sirve como instrucciones de trabajo para una IA que deba analizar una aplicacion, crear o adaptar un test de Playwright y entregar un video explicativo de uso.

## Objetivo

Convertir un caso de uso de tester o QAA en un video que una persona no tecnica pueda seguir.

El resultado debe mostrar:

- que problema resuelve la pantalla;
- que control se utiliza;
- que datos introduce la persona;
- que ocurre despues de cada accion;
- como se confirma que el flujo termino correctamente.

El video no es un reporte tecnico del test. Es una demostracion guiada del producto.

## Instruccion principal para la IA

> Trabaja como ingeniero senior de QA y editor de videos de producto. Antes de editar, localiza el flujo real de la aplicacion, sus selectores, su test de Playwright, los datos de metricas y la composicion de Remotion. Construye una grabacion de uso humano: viewport fija, movimiento visible del raton, escritura progresiva, pausas entre pasos y validaciones de estado. Genera una composicion que muestre la aplicacion completa, con instrucciones breves y legibles, un cursor grande, foco visual y zoom suave sobre el objetivo actual. El video debe llegar hasta la confirmacion final. Valida el test, el tipo de datos, el render y una previsualizacion antes de entregar.

## Regla de trabajo: investigar poco, actuar pronto

Antes del primer cambio, la IA debe localizar:

1. La pantalla o componente que se quiere demostrar.
2. El test o flujo de Playwright relacionado.
3. La configuracion de viewport y video.
4. La composicion y el script de render.

Despues debe formular una hipotesis comprobable, por ejemplo:

- “El video parece pequeno porque el proyecto Chromium sobrescribe la viewport global”.
- “El final no aparece porque la composicion dura menos que `durationMs / playbackRate`”.
- “El uso parece brusco porque se usa `fill()` y no hay movimiento del raton”.

La primera edicion debe probar esa hipotesis y la siguiente accion debe ser una validacion enfocada.

## Flujo general reutilizable

### Paso 1: entender el caso de uso

Extrae:

- objetivo de negocio;
- usuario que lo ejecuta;
- pantalla inicial;
- datos necesarios;
- accion principal;
- resultado esperado;
- mensaje o estado que demuestra el exito.

Divide el flujo en entre 5 y 10 pasos. Un paso debe representar una intencion, no cada linea de codigo.

Ejemplo:

```text
1. Entrar al espacio de trabajo
2. Abrir la seccion de casos
3. Crear un caso nuevo
4. Completar titulo y descripcion
5. Elegir prioridad
6. Guardar
7. Verificar confirmacion
```

### Paso 2: inspeccionar la aplicacion

Busca los controles con accesibilidad:

```ts
page.getByRole("button", { name: "Guardar caso" });
page.getByLabel("Descripcion");
page.getByRole("heading", { name: "Nuevo caso de prueba" });
```

No inventes nombres de controles ni selectores. Si la interfaz no tiene etiquetas claras, mejora primero la accesibilidad del front.

Simplifica la pantalla si hay navegacion o elementos que no ayudan al caso de uso. Una demo sencilla y coherente es mejor que una pantalla llena de secciones sin funcion.

### Paso 3: fijar el formato de captura

Usa una unica configuracion para el navegador que publica la grabacion:

```ts
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
}
```

Importante: una configuracion global puede ser sobrescrita por el `use` del proyecto. Comprueba siempre ambos sitios.

La resolucion del archivo debe coincidir con la viewport real. Si no coincide, el video tendra espacio vacio, barras o la aplicacion aparecera en una esquina.

### Paso 4: hacer la interaccion humana

No uses acciones instantaneas para una grabacion de producto.

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

Para cada paso:

1. mueve el raton hacia el control;
2. ejecuta la accion;
3. espera a que la interfaz cambie;
4. valida el resultado;
5. deja una pausa de presentacion de aproximadamente `700-1000 ms`.

Las pausas deben estar centralizadas en el recorder de metricas para no llenar los tests de esperas arbitrarias.

### Paso 5: guardar metrica y video

El recorder debe producir:

```ts
{
  id,
  title,
  status,
  durationMs,
  steps: [{ name, status, startMs, endMs }]
}
```

Guarda el video solo desde el proyecto Chromium y antes de que se cierre el contexto:

```ts
const recording = page.video();
// ... ejecutar el caso ...
await page.close();
await recording?.saveAs("public/recordings/video.webm");
```

### Paso 6: construir la guia visual

Para cada paso define una ficha:

```ts
{
  title: "Guarda el caso",
  text: "Pulsa Guardar caso y comprueba que aparece la confirmacion.",
  target: { x: 1000, y: 760 }
}
```

La composicion debe incluir:

- titulo centrado y grande;
- explicacion de una sola frase;
- numero de paso;
- progreso;
- cursor grande;
- halo alrededor del objetivo;
- zoom suave, no brusco;
- video de la app a pantalla completa.

El cursor debe interpolarse entre el objetivo anterior y el nuevo:

```ts
const cursorX = interpolate(
  frame,
  [stepStartFrame - 24, stepStartFrame],
  [previousTarget.x, currentTarget.x],
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
);
```

El zoom debe centrarse en el objetivo actual, no en el centro fijo del canvas:

```ts
transform: `scale(${zoom})`,
transformOrigin: `${target.x}px ${target.y}px`,
```

No tapes el control que se esta explicando. Si el panel de texto ocupa esa zona, mueve el panel o usa un zoom distinto.

### Paso 7: sincronizar duracion

Calcula la duracion necesaria:

```text
duracion_minima_ms = durationMs / playbackRate
```

Anade margen para la pantalla final:

```text
duracion_render_ms = duracion_minima_ms + 1000 o 2000
```

Con 30 FPS:

```ts
const durationInFrames = Math.ceil((durationRenderMs / 1000) * 30);
```

No uses una duracion fija corta. Si el flujo cambia, el video debe seguir llegando a la confirmacion.

### Paso 8: render y validacion

Ejecuta:

```powershell
npx playwright test tests/<caso>.spec.ts --project=chromium
npm run lint
npx tsc --noEmit
npm run render:qa
npx remotion still remotion/index.ts QARecording output\preview.png --frame=300 --overwrite
```

El resultado solo se puede considerar terminado si:

- Playwright pasa;
- el WebM se actualiza;
- el JSON contiene todos los pasos;
- el MP4 se renderiza sin cortar el ultimo paso;
- la aplicacion llena el canvas;
- el texto se lee a escala normal;
- el cursor apunta al control correcto;
- el mensaje final es visible.

## Criterios de calidad visual

### Ritmo

- Nada debe aparecer como un salto instantaneo.
- La escritura debe poder seguirse.
- Cada accion debe tener tiempo de lectura.
- El final debe permanecer visible al menos un segundo.

### Encuadre

- La captura y la composicion deben compartir resolucion y proporcion.
- No uses `object-fit: contain` si deja barras que no aportan valor; primero corrige la resolucion de origen.
- No escales una captura 1280x720 a un canvas 1920x1080 sin comprobar su contenido real.

### Texto

- Escribe para una persona que no conoce la aplicacion.
- Usa frases cortas y verbos de accion.
- Un titulo y una frase por paso suelen ser suficientes.
- Centra la instruccion si debe ser el foco, pero no tapes el control.

### Cursor y zoom

- El cursor debe ser mayor que el cursor real, pero no tapar el objetivo.
- Usa un halo de color contrastado.
- Mueve el cursor entre puntos con interpolacion.
- Haz zoom de forma suave y limitada, normalmente entre `1.05` y `1.15`.

### Funcionalidad

- Cada click debe tener una asercion posterior.
- El caso debe demostrar un resultado observable.
- Si el ultimo paso es guardar, verifica la fila creada y el mensaje de confirmacion.
- No presentes como exitoso un flujo que solo llego al boton de guardar.

## Errores que la IA debe evitar

- Cambiar solo la velocidad de Remotion para arreglar una captura brusca.
- Grabar con una viewport y renderizar con otra.
- Añadir overlays decorativos que oculten la aplicacion.
- Usar flechas o cursores que saltan sin transicion.
- Cortar el video con una duracion fija menor que el flujo.
- Crear pasos tecnicos que el espectador no entiende.
- Dejar navegacion vacia como Bugs o Reports si no participa en el caso.
- Entregar un MP4 sin revisar un frame final.

## Plantilla de solicitud para futuros casos

```text
Crea un video QA del caso de uso: <NOMBRE DEL CASO>.

Objetivo: <QUE DEBE CONSEGUIR EL USUARIO>.
Usuario: <TIPO DE USUARIO>.
Ruta inicial: <URL O PANTALLA>.
Datos de prueba: <DATOS NO SECRETOS>.
Resultado esperado: <CONFIRMACION VISIBLE>.

Requisitos:
- usa Chromium a 1920x1080;
- ejecuta el caso con Playwright;
- mueve el raton suavemente;
- escribe texto con ritmo humano;
- registra cada paso y su duracion;
- genera instrucciones en español para una persona principiante;
- usa cursor grande, halo y zoom suave;
- no tapes la aplicacion;
- comprueba que el ultimo resultado aparece;
- entrega WebM fuente, JSON de metricas y MP4 H.264;
- valida con Playwright, lint, TypeScript y una previsualizacion.
```

## Resultado esperado de la IA

La IA debe informar al terminar:

1. que archivos modifico;
2. que caso de uso grabo;
3. que viewport y codec uso;
4. donde estan el MP4 y la previsualizacion;
5. que comandos pasaron;
6. cualquier advertencia no bloqueante, como una version de dependencia de Remotion.
