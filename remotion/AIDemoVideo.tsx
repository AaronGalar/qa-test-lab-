import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const PROMPT = "Genera tests para mi login";
const RESPONSE =
  "Analizando tu aplicación...\n" +
  "He detectado 3 escenarios clave:\n\n" +
  "1. Validación de login con credenciales inválidas (Alta)\n" +
  "2. Sesión expirada tras 15 minutos de inactividad (Media)\n" +
  "3. Caracteres especiales en formularios (Alta)\n\n" +
  "¿Quieres añadirlos a tu biblioteca de pruebas?";

const TYPE_START = 48;
const SEND_FRAME = 112;
const THINKING_START = 142;
const RESPONSE_START = 210;

const AIAvatar: React.FC = () => (
  <div
    style={{
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: "rgba(56, 189, 248, 0.14)",
      border: "1px solid rgba(56, 189, 248, 0.35)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#7dd3fc",
      fontSize: 15,
      fontWeight: 800,
      flexShrink: 0,
    }}
  >
    AI
  </div>
);

export const AIDemoVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame,
    fps,
    config: { damping: 18, mass: 0.7 },
  });
  const typedCount = Math.min(
    PROMPT.length,
    Math.max(0, Math.floor((frame - TYPE_START) / 2)),
  );
  const responseCount = Math.min(
    RESPONSE.length,
    Math.max(0, Math.floor((frame - RESPONSE_START) * 0.8)),
  );
  const isThinking = frame >= THINKING_START && frame < RESPONSE_START;
  const showUserMessage = frame >= SEND_FRAME;
  const bubbleEntrance = spring({
    frame: Math.max(0, frame - SEND_FRAME),
    fps,
    config: { damping: 16, mass: 0.6 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#07111f",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
        opacity: interpolate(entrance, [0, 1], [0, 1]),
      }}
    >
      <div
        style={{
          height: 94,
          padding: "0 64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#0b192b",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              color: "#07111f",
              fontSize: 23,
              background: "linear-gradient(135deg, #38bdf8, #34d399)",
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 700 }}>
              QA Copilot AI (Simulación)
            </div>
            <div
              style={{
                marginTop: 5,
                color: "#4ade80",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: "#4ade80",
                }}
              />
              Modelo activo (Local)
            </div>
          </div>
        </div>
        <div style={{ color: "#94a3b8", fontSize: 15 }}>Asistente de QA</div>
      </div>

      <div
        style={{
          width: 1280,
          margin: "0 auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 0 58px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <AIAvatar />
            <div
              style={{
                maxWidth: 900,
                padding: "20px 24px",
                borderRadius: 18,
                backgroundColor: "#0b192b",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                color: "#dbe5f1",
                fontSize: 21,
                lineHeight: 1.55,
              }}
            >
              ¡Hola! Soy tu asistente de QA con IA. ¿En qué puedo ayudarte hoy a
              analizar o generar casos de prueba?
            </div>
          </div>

          {showUserMessage && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                opacity: bubbleEntrance,
                transform: `translateY(${interpolate(bubbleEntrance, [0, 1], [16, 0])}px)`,
              }}
            >
              <div
                style={{
                  maxWidth: 900,
                  padding: "18px 24px",
                  borderRadius: 18,
                  backgroundColor: "#38bdf8",
                  color: "#07111f",
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {PROMPT}
              </div>
            </div>
          )}

          {isThinking && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                color: "#94a3b8",
                fontSize: 17,
                fontStyle: "italic",
              }}
            >
              <AIAvatar />
              <span>La IA está analizando tu petición...</span>
              <span style={{ color: "#38bdf8", fontSize: 24 }}>•••</span>
            </div>
          )}

          {responseCount > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                opacity: interpolate(
                  frame,
                  [RESPONSE_START, RESPONSE_START + 12],
                  [0, 1],
                  {
                    extrapolateRight: "clamp",
                  },
                ),
              }}
            >
              <AIAvatar />
              <div
                style={{
                  width: 980,
                  padding: "20px 24px",
                  borderRadius: 18,
                  backgroundColor: "#0b192b",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#e2e8f0",
                  fontSize: 21,
                  lineHeight: 1.55,
                  whiteSpace: "pre-line",
                }}
              >
                {RESPONSE.slice(0, responseCount)}
                {responseCount < RESPONSE.length && (
                  <span style={{ color: "#38bdf8" }}>▍</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            position: "relative",
            height: 76,
            borderRadius: 18,
            border: `1px solid ${frame < SEND_FRAME ? "rgba(56, 189, 248, 0.75)" : "rgba(255, 255, 255, 0.14)"}`,
            backgroundColor: "#0b192b",
            display: "flex",
            alignItems: "center",
            padding: "0 10px 0 24px",
            boxShadow:
              frame < SEND_FRAME ? "0 0 0 4px rgba(56, 189, 248, 0.1)" : "none",
          }}
        >
          <div
            style={{
              flex: 1,
              color: typedCount > 0 ? "#f8fafc" : "#64748b",
              fontSize: 19,
            }}
          >
            {frame < SEND_FRAME
              ? typedCount > 0
                ? PROMPT.slice(0, typedCount)
                : "Pídele a la IA que genere casos de prueba..."
              : "Pídele a la IA que genere casos de prueba..."}
            {frame >= TYPE_START && frame < SEND_FRAME && (
              <span style={{ color: "#38bdf8" }}>▍</span>
            )}
          </div>
          <div
            style={{
              height: 56,
              minWidth: 136,
              padding: "0 20px",
              borderRadius: 12,
              backgroundColor: frame >= SEND_FRAME ? "#1e293b" : "#38bdf8",
              color: frame >= SEND_FRAME ? "#94a3b8" : "#07111f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 17,
              fontWeight: 800,
            }}
          >
            Enviar ✦
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
