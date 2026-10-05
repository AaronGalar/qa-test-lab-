import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type RecordingStep = {
  name: string;
  status: "PASSED" | "FAILED";
  startMs: number;
  endMs: number;
};

export type RecordedFirstUseTutorialProps = {
  testId: string;
  title: string;
  status: "PASSED" | "FAILED";
  durationMs: number;
  steps: RecordingStep[];
  videoSrc: string;
};

const STEP_GUIDANCE: Record<string, string> = {
  "Visitar la página de tareas":
    "Abre la página y comprueba el campo para crear tareas.",
  "Validar tareas vacías":
    "Una descripción vacía o con solo espacios no crea una tarea.",
  "Añadir una tarea":
    "Escribe la tarea y confirma que aparece en la lista.",
  "Marcar y desmarcar la tarea":
    "Alterna el estado completada desde el botón de acción.",
  "Eliminar la tarea":
    "Elimina la tarea y verifica que ya no aparece.",
  "Abrir la pantalla de inicio de sesión":
    "Entra en QA Test Lab con tu cuenta de demostración.",
  "Introducir las credenciales de demostración":
    "Escribe el correo y la contraseña de prueba, letra a letra.",
  "Iniciar sesión": "Pulsa Iniciar sesión para abrir el espacio de trabajo.",
  "Abrir Casos de prueba":
    "Desde el menú lateral, entra en la biblioteca de casos.",
  "Abrir el Asistente IA": "Abre el asistente desde el menú de navegación.",
  "Escribir y enviar un prompt":
    "Describe lo que quieres probar y envía la solicitud.",
  "Revisar los escenarios sugeridos":
    "Lee los escenarios propuestos y compara sus prioridades.",
  "Volver a la biblioteca":
    "Las sugerencias no se guardan solas; vuelve a la biblioteca para crear un caso.",
  "Abrir el formulario para crear un caso":
    "Selecciona Nuevo caso para registrar el escenario elegido.",
  "Completar los datos del escenario":
    "Añade un título claro y una descripción que se pueda ejecutar.",
  "Seleccionar prioridad alta":
    "Elige la prioridad adecuada para el impacto del escenario.",
  "Guardar y comprobar el caso":
    "Guarda el caso y confirma que aparece en la biblioteca.",
};

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export const RecordedFirstUseTutorial: React.FC<
  RecordedFirstUseTutorialProps
> = ({ testId, title, status, durationMs, steps, videoSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = Math.min((frame / fps) * 1000, durationMs);
  const activeIndex = steps.findIndex(
    (step) => currentMs >= step.startMs && currentMs < step.endMs,
  );
  const stepIndex = activeIndex === -1 ? steps.length - 1 : activeIndex;
  const currentStep = steps[stepIndex];
  const entrance = spring({
    frame: Math.max(0, frame - (currentStep?.startMs ?? 0) * (fps / 1000)),
    fps,
    config: { damping: 18, mass: 0.6 },
  });
  const progress = interpolate(currentMs, [0, durationMs], [0, 100], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#07111f", color: "#f8fafc" }}>
      <OffthreadVideo
        src={staticFile(videoSrc)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {currentStep && (
        <div
          style={{
            position: "absolute",
            left: 30,
            bottom: 28,
            width: 500,
            minHeight: 104,
            boxSizing: "border-box",
            padding: "17px 20px 14px",
            border: "1px solid rgba(148, 163, 184, 0.28)",
            borderRadius: 12,
            backgroundColor: "rgba(7, 17, 31, 0.94)",
            boxShadow: "0 14px 40px rgba(0,0,0,0.42)",
            fontFamily: "Arial, sans-serif",
            opacity: interpolate(entrance, [0, 1], [0.78, 1]),
            transform: `translateY(${interpolate(entrance, [0, 1], [9, 0])}px)`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                color: "#7dd3fc",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.7,
                textTransform: "uppercase",
              }}
            >
              {testId} · Paso {stepIndex + 1} de {steps.length}
            </div>
            <div style={{ color: "#94a3b8", fontSize: 11 }}>
              {formatTime(currentMs)} / {formatTime(durationMs)}
            </div>
          </div>
          <div style={{ fontSize: 15, fontWeight: 750 }}>
            {currentStep.name}
          </div>
          <div
            style={{
              marginTop: 5,
              color: "#cbd5e1",
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            {STEP_GUIDANCE[currentStep.name] ?? title}
          </div>
          <div
            style={{
              height: 3,
              marginTop: 12,
              overflow: "hidden",
              borderRadius: 5,
              backgroundColor: "#26384b",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: status === "PASSED" ? "#38bdf8" : "#fb7185",
              }}
            />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
