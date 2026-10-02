import {
  AbsoluteFill,
  OffthreadVideo,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface QARecordingProps {
  testId?: string;
  title?: string;
  status?: "PASSED" | "FAILED";
  durationSeconds?: number;
  videoSrc?: string;
}

// Pasos detallados que van cambiando según avance el vídeo
const STEPS = [
  { frameStart: 0, frameEnd: 90, label: "1. Accediendo a la pantalla de login" },
  { frameStart: 90, frameEnd: 180, label: "2. Introduciendo credenciales de usuario" },
  { frameStart: 180, frameEnd: 270, label: "3. Iniciando sesión y cargando el panel" },
  { frameStart: 270, frameEnd: 360, label: "4. Navegando al módulo de 'Casos de prueba'" },
  { frameStart: 360, frameEnd: 450, label: "5. Cambiando el estado del caso de prueba" },
];

export const QARecording: React.FC<QARecordingProps> = ({
  testId = "TC-008",
  title = "Cambiar estado de un caso de prueba",
  status = "PASSED",
  durationSeconds = 15.0,
  videoSrc = "recordings/video-TC-008.webm",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animación suave de entrada
  const entrance = spring({
    frame,
    fps,
    config: { damping: 15, mass: 0.5 },
  });

  const translateY = interpolate(entrance, [0, 1], [80, 0]);
  const isPassed = status === "PASSED";

  // Identificar el paso activo
  const currentStep =
    STEPS.find((s) => frame >= s.frameStart && frame < s.frameEnd)?.label ||
    STEPS[STEPS.length - 1].label;

  return (
    <AbsoluteFill style={{ backgroundColor: "#07111f" }}>
      {/* 1. Grabación ajustada dejando espacio para el dock */}
      <AbsoluteFill style={{ paddingBottom: "120px" }}>
        <OffthreadVideo
          src={staticFile(videoSrc)}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </AbsoluteFill>

      {/* 2. Dock flotante ELEVADO (paddingBottom: 48px) */}
      <AbsoluteFill
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: "48px", // <--- Elevado significativamente del borde inferior
          paddingLeft: "40px",
          paddingRight: "40px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            transform: `translateY(${translateY}px)`,
            height: "76px",
            width: "100%",
            maxWidth: "1800px",
            backgroundColor: "#0b192b",
            borderRadius: "16px",
            border: "1.5px solid #1e293b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.7)",
            fontFamily: "sans-serif",
            color: "#ffffff",
          }}
        >
          {/* Lado Izquierdo: ID + Título */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "13px",
                fontWeight: "bold",
                backgroundColor: "#0284c7",
                color: "#ffffff",
                padding: "6px 12px",
                borderRadius: "8px",
                letterSpacing: "0.5px",
              }}
            >
              {testId}
            </span>

            <div>
              <h2
                style={{
                  fontSize: "15px",
                  fontWeight: "bold",
                  margin: 0,
                  color: "#f8fafc",
                }}
              >
                {title}
              </h2>
            </div>
          </div>

          {/* Centro: Paso activo en tiempo real */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "#1e293b",
              padding: "8px 18px",
              borderRadius: "10px",
              border: "1px solid #334155",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#38bdf8",
                boxShadow: "0 0 10px #38bdf8",
              }}
            />
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#e2e8f0",
              }}
            >
              {currentStep}
            </span>
          </div>

          {/* Lado Derecho: Estado y Duración */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div
              style={{
                fontSize: "12px",
                color: "#94a3b8",
                display: "flex",
                gap: "16px",
              }}
            >
              <span>
                Duración: <strong style={{ color: "#f1f5f9" }}>{durationSeconds}s</strong>
              </span>
              <span style={{ fontFamily: "monospace", color: "#38bdf8" }}>
                {videoSrc.split("/").pop()}
              </span>
            </div>

            <span
              style={{
                borderRadius: "9999px",
                padding: "5px 16px",
                fontSize: "11px",
                fontWeight: "800",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                backgroundColor: isPassed
                  ? "rgba(34, 197, 94, 0.15)"
                  : "rgba(239, 68, 68, 0.15)",
                color: isPassed ? "#4ade80" : "#f87171",
                border: isPassed
                  ? "1px solid rgba(34, 197, 94, 0.4)"
                  : "1px solid rgba(239, 68, 68, 0.4)",
              }}
            >
              {status}
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};