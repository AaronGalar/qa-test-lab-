// src/QATutorial.tsx
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

const TUTORIAL_STEPS = [
  {
    frameStart: 0,
    frameEnd: 180, // 0s - 6s
    stepNum: "Paso 1 de 5",
    title: "1. Autenticación en el Sistema",
    desc: "Ingresamos las credenciales de usuario en la pantalla de inicio de sesión de la plataforma de testing.",
    tip: "Tip: Asegúrate de probar siempre en entornos Staging/Dev.",
  },
  {
    frameStart: 180,
    frameEnd: 360, // 6s - 12s
    stepNum: "Paso 2 de 5",
    title: "2. Módulo de Casos de Prueba",
    desc: "Navegamos desde el menú lateral hacia la sección 'Casos de Prueba' donde se listan los escenarios registrados.",
    tip: "Tip: Puedes filtrar la lista por estado o prioridad.",
  },
  {
    frameStart: 360,
    frameEnd: 540, // 12s - 18s
    stepNum: "Paso 3 de 5",
    title: "3. Apertura de Formulario",
    desc: "Hacemos clic en '+ Nuevo caso' para desplegar el formulario de creación de pruebas.",
    tip: "Tip: Mantén los nombres de pruebas cortos y claros.",
  },
  {
    frameStart: 540,
    frameEnd: 720, // 18s - 24s
    stepNum: "Paso 4 de 5",
    title: "4. Redacción del Caso de Prueba",
    desc: "Escribimos el Título descriptivo y la Descripción detallada con los pasos a seguir y el resultado esperado.",
    tip: "Tip: Incluye las precondiciones necesarias para la prueba.",
  },
  {
    frameStart: 720,
    frameEnd: 900, // 24s - 30s
    stepNum: "Paso 5 de 5",
    title: "5. Guardado y Registro",
    desc: "Asignamos la prioridad y guardamos. El caso quedará disponible para incluirlo en la siguiente suite de ejecución.",
    tip: "Tip: Puedes asociar este test al ID del ticket en Jira.",
  },
];

export const QATutorial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.5 },
  });

  const translateY = interpolate(entrance, [0, 1], [-30, 0]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);

  const currentStep =
    TUTORIAL_STEPS.find((s) => frame >= s.frameStart && frame < s.frameEnd) ||
    TUTORIAL_STEPS[TUTORIAL_STEPS.length - 1];

  return (
    <AbsoluteFill style={{ backgroundColor: "#07111f" }}>
      {/* 1. Grabación del test con ratón y tecleo */}
      <AbsoluteFill>
        <OffthreadVideo
          src={staticFile("recordings/video-tutorial.webm")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>

      {/* 2. Tarjeta informativa centrada superior */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-end",
          paddingTop: "40px",
          paddingRight: "280px", // Centrado en la parte superior derecha
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            transform: `translateY(${translateY}px)`,
            opacity,
            width: "440px",
            backgroundColor: "#0f172a",
            borderRadius: "16px",
            border: "1.5px solid #334155",
            padding: "24px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7)",
            fontFamily: "sans-serif",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#38bdf8",
                backgroundColor: "rgba(56, 189, 248, 0.12)",
                padding: "4px 12px",
                borderRadius: "6px",
                border: "1px solid rgba(56, 189, 248, 0.3)",
              }}
            >
              {currentStep.stepNum}
            </span>
            <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
              Tutorial Paso a Paso
            </span>
          </div>

          <h3
            style={{
              fontSize: "17px",
              fontWeight: "bold",
              margin: 0,
              color: "#f8fafc",
            }}
          >
            {currentStep.title}
          </h3>

          <p
            style={{
              fontSize: "14px",
              margin: 0,
              color: "#94a3b8",
              lineHeight: "1.5",
            }}
          >
            {currentStep.desc}
          </p>

          <div
            style={{
              backgroundColor: "#1e293b",
              borderLeft: "3px solid #38bdf8",
              padding: "8px 12px",
              borderRadius: "0 8px 8px 0",
              fontSize: "12px",
              color: "#e2e8f0",
              fontStyle: "italic",
            }}
          >
            {currentStep.tip}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};