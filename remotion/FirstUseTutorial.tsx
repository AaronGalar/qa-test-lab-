import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const LOGIN_EMAIL = "qa@test.com";
const LOGIN_PASSWORD = "123456";
const PROMPT = "Genera tests para mi login";
const CASE_TITLE = "Validación de login con credenciales inválidas";
const CASE_DESCRIPTION =
  "Escribe credenciales incorrectas y comprueba que el acceso se rechaza.";
const AI_RESPONSE =
  "Analizando tu aplicación... 🚀 He detectado 3 escenarios clave:\n\n" +
  "1. Validación de login con credenciales inválidas (Prioridad Alta).\n" +
  "2. Timeout de sesión tras 15 minutos de inactividad (Prioridad Media).\n" +
  "3. Inyección de caracteres especiales en formulario (Prioridad Alta).\n\n" +
  "¿Quieres que añada estos 3 casos automáticamente a tu biblioteca de pruebas?";

const TIMELINE = {
  loginEnd: 240,
  dashboardEnd: 405,
  casesEnd: 555,
  chatEnd: 1170,
  saveEnd: 1590,
  tutorialEnd: 1680,
};

type CursorPoint = {
  frame: number;
  x: number;
  y: number;
  click?: boolean;
};

const LOGIN_CURSOR: CursorPoint[] = [
  { frame: 0, x: 1270, y: 725 },
  { frame: 24, x: 960, y: 452 },
  { frame: 28, x: 960, y: 452, click: true },
  { frame: 88, x: 960, y: 452 },
  { frame: 97, x: 960, y: 545 },
  { frame: 101, x: 960, y: 545, click: true },
  { frame: 145, x: 960, y: 545 },
  { frame: 157, x: 960, y: 635 },
  { frame: 164, x: 960, y: 635, click: true },
  { frame: 207, x: 1260, y: 650 },
];

const DASHBOARD_CURSOR: CursorPoint[] = [
  { frame: 0, x: 1260, y: 650 },
  { frame: 34, x: 285, y: 308 },
  { frame: 42, x: 285, y: 308, click: true },
  { frame: 120, x: 285, y: 308 },
];

const CASES_CURSOR: CursorPoint[] = [
  { frame: 0, x: 285, y: 308 },
  { frame: 40, x: 285, y: 356 },
  { frame: 49, x: 285, y: 356, click: true },
  { frame: 115, x: 340, y: 410 },
];

const CHAT_CURSOR: CursorPoint[] = [
  { frame: 0, x: 285, y: 356 },
  { frame: 23, x: 920, y: 779 },
  { frame: 29, x: 920, y: 779, click: true },
  { frame: 80, x: 920, y: 779 },
  { frame: 91, x: 1430, y: 779 },
  { frame: 98, x: 1430, y: 779, click: true },
  { frame: 150, x: 1510, y: 700 },
];

const SAVE_CURSOR: CursorPoint[] = [
  { frame: 0, x: 1430, y: 779 },
  { frame: 12, x: 1680, y: 185 },
  { frame: 20, x: 1680, y: 185, click: true },
  { frame: 42, x: 1680, y: 185 },
  { frame: 68, x: 1650, y: 282 },
  { frame: 76, x: 1650, y: 282, click: true },
  { frame: 114, x: 1080, y: 450 },
  { frame: 120, x: 1080, y: 450, click: true },
  { frame: 214, x: 1080, y: 550 },
  { frame: 220, x: 1080, y: 550, click: true },
  { frame: 350, x: 650, y: 700 },
  { frame: 358, x: 650, y: 700, click: true },
  { frame: 380, x: 510, y: 780 },
  { frame: 390, x: 510, y: 780, click: true },
  { frame: 410, x: 760, y: 670 },
];

type GuideSceneProps = {
  frame: number;
  step: number;
  title: string;
  description: string;
  route: string;
  cursorPoints?: CursorPoint[];
  children: React.ReactNode;
};

const colors = {
  background: "#07111f",
  panel: "#0b192b",
  border: "rgba(255, 255, 255, 0.09)",
  muted: "#94a3b8",
  text: "#f8fafc",
  cyan: "#38bdf8",
  green: "#4ade80",
};

function typeValue(value: string, frame: number, start: number, every: number) {
  const count = Math.floor((frame - start) / every);
  return value.slice(0, Math.max(0, Math.min(value.length, count)));
}

const MousePointer: React.FC<{ frame: number; points: CursorPoint[] }> = ({
  frame,
  points,
}) => {
  const x = interpolate(
    frame,
    points.map((point) => point.frame),
    points.map((point) => point.x),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const y = interpolate(
    frame,
    points.map((point) => point.frame),
    points.map((point) => point.y),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const clickPoint = points.find(
    (point) => point.click && frame >= point.frame && frame < point.frame + 12,
  );
  const clickProgress = clickPoint ? frame - clickPoint.frame : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        zIndex: 20,
        width: 34,
        height: 42,
        pointerEvents: "none",
        filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.7))",
      }}
    >
      {clickPoint && (
        <div
          style={{
            position: "absolute",
            left: 1,
            top: 2,
            width: 28,
            height: 28,
            border: "2px solid #7dd3fc",
            borderRadius: "50%",
            opacity: interpolate(clickProgress, [0, 11], [0.9, 0], {
              extrapolateRight: "clamp",
            }),
            transform: `scale(${interpolate(
              clickProgress,
              [0, 11],
              [0.35, 1.5],
              {
                extrapolateRight: "clamp",
              },
            )})`,
          }}
        />
      )}
      <svg width="30" height="38" viewBox="0 0 30 38" aria-hidden="true">
        <path
          d="M3 2v25l7-7 5 12 5-2.5-5-11h10L3 2Z"
          fill="#38bdf8"
          stroke="#f8fafc"
          strokeLinejoin="round"
          strokeWidth="1.7"
        />
      </svg>
    </div>
  );
};

const GuideScene: React.FC<GuideSceneProps> = ({
  frame,
  step,
  title,
  description,
  route,
  cursorPoints,
  children,
}) => {
  const opacity = interpolate(frame, [0, 14], [0, 1], {
    extrapolateRight: "clamp",
  });
  const { fps } = useVideoConfig();
  const enter = spring({
    frame,
    fps,
    config: { damping: 20, mass: 0.75 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: "Arial, sans-serif",
        opacity,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 160,
          right: 160,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 44,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              color: colors.background,
              fontSize: 18,
              fontWeight: 800,
              background: "linear-gradient(135deg, #38bdf8, #34d399)",
            }}
          >
            Q
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: 1 }}>
            QA TEST LAB{" "}
            <span style={{ color: colors.muted, fontWeight: 400 }}>
              · GUÍA DE PRIMER USO
            </span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              style={{
                width: index + 1 === step ? 34 : 20,
                height: 5,
                borderRadius: 8,
                backgroundColor: index < step ? colors.cyan : "#26384b",
              }}
            />
          ))}
          <span style={{ marginLeft: 8, color: colors.muted, fontSize: 13 }}>
            {step}/5
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 160,
          top: 112,
          width: 1600,
          height: 744,
          borderRadius: 14,
          overflow: "hidden",
          border: `1px solid ${colors.border}`,
          backgroundColor: "#07111f",
          boxShadow: "0 30px 90px rgba(0, 0, 0, 0.4)",
          transform: `translateY(${interpolate(enter, [0, 1], [18, 0])}px)`,
        }}
      >
        <div
          style={{
            height: 42,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0 16px",
            backgroundColor: "#101d2d",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 99,
              backgroundColor: "#fb7185",
            }}
          />
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 99,
              backgroundColor: "#fbbf24",
            }}
          />
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 99,
              backgroundColor: "#4ade80",
            }}
          />
          <div
            style={{
              width: 460,
              marginLeft: 20,
              padding: "5px 14px",
              borderRadius: 7,
              backgroundColor: "#07111f",
              color: "#94a3b8",
              fontSize: 12,
            }}
          >
            localhost:3000{route}
          </div>
          <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 12 }}>
            Entorno de demostración
          </span>
        </div>
        <div style={{ height: 702, overflow: "hidden" }}>{children}</div>
      </div>

      {cursorPoints && <MousePointer frame={frame} points={cursorPoints} />}

      <div
        style={{
          position: "absolute",
          left: 160,
          right: 160,
          top: 886,
          height: 156,
          display: "flex",
          alignItems: "center",
          gap: 24,
          opacity,
        }}
      >
        <div
          style={{
            width: 5,
            height: 82,
            borderRadius: 8,
            backgroundColor: colors.cyan,
            boxShadow: "0 0 24px rgba(56, 189, 248, 0.45)",
          }}
        />
        <div
          style={{
            transform: `translateY(${interpolate(enter, [0, 1], [10, 0])}px)`,
          }}
        >
          <div
            style={{
              marginBottom: 8,
              color: colors.cyan,
              fontSize: 13,
              fontWeight: 800,
              textTransform: "uppercase",
            }}
          >
            Paso {step} · {title}
          </div>
          <div
            style={{
              maxWidth: 1470,
              color: "#dbe5f1",
              fontSize: 21,
              lineHeight: 1.45,
            }}
          >
            {description}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const InputField: React.FC<{
  label: string;
  value: string;
  placeholder?: string;
  focused?: boolean;
}> = ({ label, value, placeholder, focused }) => (
  <div>
    <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
      {label}
    </div>
    <div
      style={{
        height: 50,
        display: "flex",
        alignItems: "center",
        padding: "0 15px",
        borderRadius: 10,
        border: `1px solid ${focused ? colors.cyan : "rgba(255,255,255,0.13)"}`,
        backgroundColor: colors.background,
        boxShadow: focused ? "0 0 0 4px rgba(56,189,248,0.1)" : "none",
        color: value ? colors.text : "#64748b",
        fontSize: 15,
      }}
    >
      {value || placeholder}
      {focused && <span style={{ marginLeft: 2, color: colors.cyan }}>▍</span>}
    </div>
  </div>
);

const LoginScreen: React.FC<{ frame: number }> = ({ frame }) => {
  const email = typeValue(LOGIN_EMAIL, frame, 34, 4);
  const passwordLength = typeValue(LOGIN_PASSWORD, frame, 100, 5).length;
  const isSubmitting = frame >= 166;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(circle at 50% 42%, rgba(14,165,233,0.08), transparent 44%), #07111f",
      }}
    >
      <div style={{ width: 430, marginTop: -8 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 62,
              height: 62,
              margin: "0 auto 16px",
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              color: "#082032",
              backgroundColor: colors.cyan,
              fontSize: 28,
            }}
          >
            ✦
          </div>
          <div style={{ fontSize: 31, fontWeight: 800 }}>QA Test Lab</div>
          <div style={{ marginTop: 7, color: colors.muted, fontSize: 15 }}>
            Entra en tu espacio de calidad
          </div>
        </div>

        <div
          style={{
            padding: 27,
            borderRadius: 15,
            border: `1px solid ${colors.border}`,
            backgroundColor: "rgba(11,25,43,0.96)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 19 }}>
            <InputField
              label="Email"
              value={email}
              placeholder="qa@test.com"
              focused={frame >= 30 && frame < 100}
            />
            <InputField
              label="Contraseña"
              value={"•".repeat(passwordLength)}
              placeholder="••••••••"
              focused={frame >= 100 && frame < 166}
            />
            <div
              style={{
                height: 48,
                borderRadius: 10,
                display: "grid",
                placeItems: "center",
                color: "#082032",
                backgroundColor: isSubmitting ? "#7dd3fc" : colors.cyan,
                boxShadow:
                  frame >= 150 ? "0 0 0 5px rgba(56,189,248,0.16)" : "none",
                fontSize: 15,
                fontWeight: 800,
              }}
            >
              {frame >= 175
                ? "Acceso correcto"
                : isSubmitting
                  ? "Comprobando acceso..."
                  : "Iniciar sesión"}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            textAlign: "center",
            color: "#64748b",
            fontSize: 12,
          }}
        >
          Demo environment · QA Test Lab
        </div>
      </div>
    </div>
  );
};

type ActiveNav = "Resumen" | "Casos de prueba";

const AppHeader: React.FC = () => (
  <div
    style={{
      height: 68,
      flexShrink: 0,
      padding: "0 34px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "rgba(11,25,43,0.96)",
      borderBottom: `1px solid ${colors.border}`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          display: "grid",
          placeItems: "center",
          color: "#082032",
          backgroundColor: colors.cyan,
          fontSize: 20,
        }}
      >
        ✦
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>QA Test Lab</div>
        <div style={{ marginTop: 3, color: colors.muted, fontSize: 11 }}>
          Tu espacio de pruebas
        </div>
      </div>
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "#cbd5e1",
        fontSize: 13,
      }}
    >
      Aarón
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 99,
          display: "grid",
          placeItems: "center",
          border: "1px solid rgba(125,211,252,0.25)",
          backgroundColor: "rgba(56,189,248,0.14)",
          color: "#bae6fd",
          fontWeight: 700,
        }}
      >
        A
      </div>
    </div>
  </div>
);

const SideNav: React.FC<{
  active: ActiveNav;
  focusOn?: ActiveNav | "Asistente IA";
}> = ({ active, focusOn }) => {
  const items: Array<{ label: ActiveNav | "Asistente IA"; number: string }> = [
    { label: "Resumen", number: "01" },
    { label: "Casos de prueba", number: "02" },
    { label: "Asistente IA", number: "03" },
  ];

  return (
    <aside
      style={{
        width: 238,
        flexShrink: 0,
        padding: 18,
        borderRight: `1px solid ${colors.border}`,
        backgroundColor: "rgba(9,22,39,0.7)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map(({ label, number }) => {
          const selected = label === active;
          const focused = label === focusOn;
          return (
            <div
              key={label}
              style={{
                padding: "13px 14px",
                borderRadius: 10,
                border: `1px solid ${selected ? "rgba(56,189,248,0.2)" : focused ? "rgba(56,189,248,0.7)" : "transparent"}`,
                backgroundColor: selected
                  ? "rgba(56,189,248,0.13)"
                  : focused
                    ? "rgba(56,189,248,0.09)"
                    : "transparent",
                boxShadow: focused ? "0 0 0 4px rgba(56,189,248,0.12)" : "none",
                color: selected || focused ? "#e0f2fe" : "#94a3b8",
                fontSize: 13,
                fontWeight: selected || focused ? 700 : 500,
              }}
            >
              <span
                style={{
                  marginRight: 12,
                  color: selected || focused ? colors.cyan : "#64748b",
                }}
              >
                {number}
              </span>
              {label}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

const AppLayout: React.FC<{
  active: ActiveNav;
  focusOn?: ActiveNav | "Asistente IA";
  children: React.ReactNode;
}> = ({ active, focusOn, children }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      color: colors.text,
      backgroundColor: colors.background,
    }}
  >
    <AppHeader />
    <div style={{ minHeight: 0, display: "flex", flex: 1 }}>
      <SideNav active={active} focusOn={focusOn} />
      <main
        style={{
          minWidth: 0,
          flex: 1,
          padding: "29px 34px",
          background:
            "radial-gradient(circle at top right, rgba(14,165,233,0.08), transparent 38%)",
        }}
      >
        {children}
      </main>
    </div>
  </div>
);

const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      marginBottom: 7,
      color: "#7dd3fc",
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: 1.3,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const DashboardScreen: React.FC<{ frame: number }> = ({ frame }) => (
  <AppLayout
    active="Resumen"
    focusOn={frame >= 30 ? "Casos de prueba" : undefined}
  >
    <SectionEyebrow>Vista general</SectionEyebrow>
    <div style={{ fontSize: 28, fontWeight: 800 }}>Resumen de calidad</div>
    <div style={{ marginTop: 7, color: colors.muted, fontSize: 13 }}>
      Una lectura rápida del estado de tu suite y las últimas pruebas
      ejecutadas.
    </div>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 15,
        marginTop: 25,
      }}
    >
      {[
        ["Casos totales", "24", colors.cyan],
        ["Superados", "18", colors.green],
        ["Necesitan atención", "6", "#fbbf24"],
      ].map(([label, value, tone]) => (
        <div
          key={label}
          style={{
            padding: 19,
            border: `1px solid ${colors.border}`,
            borderRadius: 13,
            backgroundColor: "rgba(11,25,43,0.78)",
          }}
        >
          <div style={{ color: colors.muted, fontSize: 12 }}>{label}</div>
          <div
            style={{
              marginTop: 10,
              color: tone,
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            {value}
          </div>
        </div>
      ))}
    </div>
    <div
      style={{
        marginTop: 22,
        padding: 19,
        border: `1px solid ${colors.border}`,
        borderRadius: 13,
        backgroundColor: "rgba(11,25,43,0.78)",
      }}
    >
      <div style={{ marginBottom: 13, fontWeight: 700 }}>
        Actividad reciente
      </div>
      {[
        ["TC-001", "Login correcto", "PASS"],
        ["TC-002", "Crear proyecto", "PASS"],
        ["TC-004", "Eliminar proyecto", "FAIL"],
      ].map(([id, title, status]) => (
        <div
          key={id}
          style={{
            height: 37,
            display: "flex",
            alignItems: "center",
            borderTop: `1px solid ${colors.border}`,
            fontSize: 12,
          }}
        >
          <span
            style={{ width: 100, color: colors.muted, fontFamily: "monospace" }}
          >
            {id}
          </span>
          <span style={{ flex: 1 }}>{title}</span>
          <span
            style={{
              color: status === "PASS" ? colors.green : "#fb7185",
              fontWeight: 700,
            }}
          >
            {status}
          </span>
        </div>
      ))}
    </div>
  </AppLayout>
);

const CasesList: React.FC<{
  frame: number;
  showForm?: boolean;
  isSaveTutorial?: boolean;
}> = ({ frame, showForm = false, isSaveTutorial = false }) => (
  <AppLayout
    active="Casos de prueba"
    focusOn={
      !isSaveTutorial && frame > 25 && frame < 150 ? "Asistente IA" : undefined
    }
  >
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <div>
        <SectionEyebrow>Biblioteca de calidad</SectionEyebrow>
        <div style={{ fontSize: 28, fontWeight: 800 }}>Casos de prueba</div>
        <div style={{ marginTop: 6, color: colors.muted, fontSize: 13 }}>
          Define escenarios claros y conserva una suite fácil de mantener.
        </div>
      </div>
      <div
        style={{
          padding: "12px 17px",
          borderRadius: 10,
          color: "#082032",
          backgroundColor: colors.cyan,
          boxShadow:
            frame < 155 && !showForm
              ? "0 0 0 5px rgba(56,189,248,0.16)"
              : "none",
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        + Nuevo caso
      </div>
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginTop: 20,
      }}
    >
      {[
        ["Total casos", "3"],
        ["Exitosos", "2"],
        ["Fallidos", "0"],
        ["Tasa de éxito", "67%"],
      ].map(([label, value]) => (
        <div
          key={label}
          style={{
            padding: 14,
            border: `1px solid ${colors.border}`,
            borderRadius: 11,
            backgroundColor: "rgba(11,25,43,0.75)",
          }}
        >
          <div style={{ color: colors.muted, fontSize: 11 }}>{label}</div>
          <div style={{ marginTop: 5, fontSize: 22, fontWeight: 800 }}>
            {value}
          </div>
        </div>
      ))}
    </div>

    {showForm ? (
      <div
        style={{
          marginTop: 18,
          padding: 20,
          border: "1px solid rgba(56,189,248,0.25)",
          borderRadius: 13,
          backgroundColor: "rgba(11,25,43,0.92)",
        }}
      >
        <SectionEyebrow>Nuevo escenario</SectionEyebrow>
        <div style={{ marginBottom: 13, fontSize: 17, fontWeight: 700 }}>
          Crea un caso de prueba
        </div>
        <FormField
          label="Título"
          value={typeValue(CASE_TITLE, frame, 70, 2)}
          placeholder="Ej. Restablecer contraseña"
        />
        <FormField
          label="Descripción"
          value={typeValue(CASE_DESCRIPTION, frame, 155, 2)}
          placeholder="Describe los pasos o qué queremos comprobar..."
          multiline
        />
        <div style={{ marginTop: 11 }}>
          <div style={{ marginBottom: 7, fontSize: 12, fontWeight: 700 }}>
            Prioridad
          </div>
          <div
            style={{
              width: 430,
              padding: "10px 13px",
              borderRadius: 9,
              border: `1px solid ${frame >= 300 && frame < 330 ? colors.cyan : colors.border}`,
              backgroundColor: colors.background,
              fontSize: 13,
            }}
          >
            <span
              style={{
                marginRight: 9,
                color: frame >= 330 ? "#fb7185" : "#fbbf24",
              }}
            >
              ●
            </span>
            {frame >= 330 ? "Alta" : "Media"}
          </div>
          {frame >= 300 && frame < 330 && (
            <div
              style={{
                width: 430,
                padding: 7,
                border: `1px solid ${colors.border}`,
                borderRadius: 9,
                backgroundColor: colors.panel,
              }}
            >
              {["Alta", "Media", "Baja"].map((priority) => (
                <div
                  key={priority}
                  style={{
                    padding: "6px 8px",
                    color: priority === "Alta" ? "#fda4af" : colors.muted,
                    fontSize: 11,
                  }}
                >
                  {priority}
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 13 }}>
          <div
            style={{
              padding: "10px 17px",
              borderRadius: 9,
              color: "#082032",
              backgroundColor: colors.cyan,
              boxShadow:
                frame >= 340 && frame < 365
                  ? "0 0 0 4px rgba(56,189,248,0.16)"
                  : "none",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {frame >= 350 ? "Guardado" : "Guardar caso"}
          </div>
          <div
            style={{
              padding: "10px 17px",
              border: `1px solid ${colors.border}`,
              borderRadius: 9,
              color: colors.muted,
              fontSize: 12,
            }}
          >
            Cancelar
          </div>
        </div>
        {frame >= 365 && (
          <div style={{ marginTop: 12, color: "#bbf7d0", fontSize: 12 }}>
            Caso TC-004 guardado correctamente.
          </div>
        )}
      </div>
    ) : (
      <div
        style={{
          marginTop: 18,
          overflow: "hidden",
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          backgroundColor: "rgba(11,25,43,0.78)",
        }}
      >
        <div
          style={{
            height: 42,
            display: "grid",
            gridTemplateColumns: "90px 1fr 130px 120px",
            alignItems: "center",
            padding: "0 17px",
            borderBottom: `1px solid ${colors.border}`,
            color: "#64748b",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.8,
          }}
        >
          <span>ID</span>
          <span>CASO DE PRUEBA</span>
          <span>PRIORIDAD</span>
          <span>ESTADO</span>
        </div>
        {[
          ["TC-001", "Login correcto", "Alta", "PASS"],
          ["TC-002", "Login incorrecto", "Media", "PASS"],
          ["TC-003", "Campos obligatorios", "Baja", "PENDING"],
        ].map(([id, title, priority, status]) => (
          <div
            key={id}
            style={{
              height: 57,
              display: "grid",
              gridTemplateColumns: "90px 1fr 130px 120px",
              alignItems: "center",
              padding: "0 17px",
              borderBottom: `1px solid ${colors.border}`,
              fontSize: 12,
            }}
          >
            <span style={{ color: colors.muted, fontFamily: "monospace" }}>
              {id}
            </span>
            <span>{title}</span>
            <span style={{ color: colors.muted }}>{priority}</span>
            <span
              style={{
                color: status === "PASS" ? colors.green : "#fbbf24",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {status}
            </span>
          </div>
        ))}
      </div>
    )}
  </AppLayout>
);

const FormField: React.FC<{
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
}> = ({ label, value, placeholder, multiline = false }) => (
  <div style={{ marginTop: 10 }}>
    <div style={{ marginBottom: 6, fontSize: 12, fontWeight: 700 }}>
      {label}
    </div>
    <div
      style={{
        minHeight: multiline ? 58 : 38,
        width: "100%",
        boxSizing: "border-box",
        padding: "9px 12px",
        borderRadius: 9,
        border: `1px solid ${value ? "rgba(56,189,248,0.5)" : colors.border}`,
        backgroundColor: colors.background,
        color: value ? colors.text : "#64748b",
        fontSize: 12,
        lineHeight: 1.45,
      }}
    >
      {value || placeholder}
      {value &&
        value.length <
          (multiline ? CASE_DESCRIPTION.length : CASE_TITLE.length) && (
          <span style={{ color: colors.cyan }}>▍</span>
        )}
    </div>
  </div>
);

const ChatScreen: React.FC<{ frame: number }> = ({ frame }) => {
  const typedPrompt = typeValue(PROMPT, frame, 34, 2);
  const isSent = frame >= 98;
  const thinking = frame >= 126 && frame < 194;
  const responseCount = Math.min(
    AI_RESPONSE.length,
    Math.max(0, Math.floor((frame - 194) * 1.1)),
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        color: colors.text,
        backgroundColor: colors.background,
      }}
    >
      <div
        style={{
          height: 63,
          flexShrink: 0,
          padding: "0 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.panel,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 37,
              height: 37,
              borderRadius: 11,
              display: "grid",
              placeItems: "center",
              color: "#082032",
              background: "linear-gradient(135deg,#38bdf8,#34d399)",
              fontSize: 17,
            }}
          >
            ✦
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>
              QA Copilot AI (Simulación)
            </div>
            <div style={{ marginTop: 3, color: colors.green, fontSize: 11 }}>
              ● Modelo activo (Local)
            </div>
          </div>
        </div>
        <div style={{ color: colors.muted, fontSize: 12 }}>
          ← Volver a Casos
        </div>
      </div>

      <div
        style={{
          width: 1080,
          minHeight: 0,
          flex: 1,
          margin: "0 auto",
          padding: "24px 0 21px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <ChatMessage text="¡Hola! Soy tu asistente de QA con IA. ¿En qué puedo ayudarte hoy a analizar o generar casos de prueba?" />
          {isSent && <ChatMessage user text={PROMPT} />}
          {thinking && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: colors.muted,
                fontSize: 13,
                fontStyle: "italic",
              }}
            >
              <ChatAvatar />
              La IA está analizando tu petición...{" "}
              <span style={{ color: colors.cyan }}>•••</span>
            </div>
          )}
          {responseCount > 0 && (
            <ChatMessage
              text={`${AI_RESPONSE.slice(0, responseCount)}${responseCount < AI_RESPONSE.length ? "▍" : ""}`}
              multiline
            />
          )}
        </div>

        <div
          style={{
            height: 56,
            flexShrink: 0,
            padding: "0 7px 0 17px",
            display: "flex",
            alignItems: "center",
            borderRadius: 13,
            border: `1px solid ${frame < 98 ? "rgba(56,189,248,0.75)" : colors.border}`,
            backgroundColor: colors.panel,
            boxShadow: frame < 98 ? "0 0 0 4px rgba(56,189,248,0.1)" : "none",
          }}
        >
          <div
            style={{
              flex: 1,
              color: typedPrompt ? colors.text : "#64748b",
              fontSize: 13,
            }}
          >
            {isSent
              ? "Pídele a la IA que genere casos de prueba..."
              : typedPrompt || "Pídele a la IA que genere casos de prueba..."}
            {!isSent && frame >= 34 && (
              <span style={{ color: colors.cyan }}>▍</span>
            )}
          </div>
          <div
            style={{
              minWidth: 98,
              height: 42,
              padding: "0 13px",
              borderRadius: 9,
              display: "grid",
              placeItems: "center",
              color: isSent ? colors.muted : "#082032",
              backgroundColor: isSent ? "#1e293b" : colors.cyan,
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Enviar ✦
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatAvatar: React.FC = () => (
  <div
    style={{
      width: 35,
      height: 35,
      flexShrink: 0,
      display: "grid",
      placeItems: "center",
      borderRadius: 9,
      border: "1px solid rgba(56,189,248,0.35)",
      backgroundColor: "rgba(56,189,248,0.14)",
      color: "#7dd3fc",
      fontSize: 11,
      fontWeight: 800,
    }}
  >
    AI
  </div>
);

const ChatMessage: React.FC<{
  text: string;
  user?: boolean;
  multiline?: boolean;
}> = ({ text, user = false, multiline = false }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: user ? "flex-end" : "flex-start",
      gap: 12,
    }}
  >
    {!user && <ChatAvatar />}
    <div
      style={{
        maxWidth: user ? 690 : 800,
        padding: "13px 17px",
        borderRadius: 14,
        border: user ? "none" : `1px solid ${colors.border}`,
        backgroundColor: user ? colors.cyan : colors.panel,
        color: user ? "#082032" : "#e2e8f0",
        fontSize: 14,
        lineHeight: 1.5,
        whiteSpace: multiline ? "pre-line" : "normal",
        fontWeight: user ? 700 : 400,
      }}
    >
      {text}
    </div>
  </div>
);

const OutroScreen: React.FC = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "grid",
      placeItems: "center",
      background:
        "radial-gradient(circle at 50% 45%, rgba(14,165,233,0.1), transparent 45%), #07111f",
    }}
  >
    <div style={{ width: 790 }}>
      <div
        style={{
          color: colors.cyan,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1.4,
          textTransform: "uppercase",
        }}
      >
        Recorrido completado
      </div>
      <div style={{ marginTop: 12, fontSize: 34, fontWeight: 800 }}>
        Ya puedes empezar
      </div>
      <div
        style={{
          marginTop: 26,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {[
          "Inicia sesión con la cuenta de demostración.",
          "Abre Casos de prueba y selecciona Asistente IA.",
          "Escribe un prompt concreto y revisa los escenarios.",
          "Guarda manualmente los casos que quieras conservar.",
        ].map((item, index) => (
          <div
            key={item}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#dbe5f1",
              fontSize: 17,
            }}
          >
            <span
              style={{
                width: 29,
                height: 29,
                display: "grid",
                placeItems: "center",
                borderRadius: 99,
                backgroundColor: "rgba(74,222,128,0.13)",
                color: colors.green,
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              {index + 1}
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const FirstUseTutorial: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame < TIMELINE.loginEnd) {
    return (
      <GuideScene
        frame={frame}
        step={1}
        title="Inicia sesión"
        description="Cuenta de demostración: qa@test.com · contraseña: 123456. Completa ambos campos y pulsa Iniciar sesión."
        route="/login"
        cursorPoints={LOGIN_CURSOR}
      >
        <LoginScreen frame={frame} />
      </GuideScene>
    );
  }

  if (frame < TIMELINE.dashboardEnd) {
    const localFrame = frame - TIMELINE.loginEnd;
    return (
      <GuideScene
        frame={localFrame}
        step={2}
        title="Abre Casos de prueba"
        description="Al entrar verás el resumen. En el menú lateral, selecciona Casos de prueba para llegar a la biblioteca."
        route="/"
        cursorPoints={DASHBOARD_CURSOR}
      >
        <DashboardScreen frame={localFrame} />
      </GuideScene>
    );
  }

  if (frame < TIMELINE.casesEnd) {
    const localFrame = frame - TIMELINE.dashboardEnd;
    return (
      <GuideScene
        frame={localFrame}
        step={3}
        title="Entra al Asistente IA"
        description="En la navegación lateral, pulsa Asistente IA. El enlace está disponible también desde el resumen."
        route="/test-cases"
        cursorPoints={CASES_CURSOR}
      >
        <CasesList frame={localFrame} />
      </GuideScene>
    );
  }

  if (frame < TIMELINE.chatEnd) {
    const localFrame = frame - TIMELINE.casesEnd;
    return (
      <GuideScene
        frame={localFrame}
        step={4}
        title="Escribe un prompt claro"
        description="Prueba con: “Genera tests para mi login”. Espera el análisis y revisa los escenarios y sus prioridades."
        route="/test-cases/ai-demo"
        cursorPoints={CHAT_CURSOR}
      >
        <ChatScreen frame={localFrame} />
      </GuideScene>
    );
  }

  if (frame < TIMELINE.saveEnd) {
    const localFrame = frame - TIMELINE.chatEnd;
    const isReturningToCases = localFrame < 40;
    return (
      <GuideScene
        frame={localFrame}
        step={5}
        title="Guarda un caso"
        description="La IA de esta demo sugiere escenarios, pero no los guarda automáticamente. Vuelve a Casos de prueba, pulsa + Nuevo caso, completa título, descripción y prioridad, y guarda."
        route={isReturningToCases ? "/test-cases/ai-demo" : "/test-cases"}
        cursorPoints={SAVE_CURSOR}
      >
        {isReturningToCases ? (
          <ChatScreen frame={620} />
        ) : (
          <CasesList
            frame={localFrame - 40}
            showForm={localFrame >= 104}
            isSaveTutorial
          />
        )}
      </GuideScene>
    );
  }

  const localFrame = frame - TIMELINE.saveEnd;
  return (
    <GuideScene
      frame={localFrame}
      step={5}
      title="¡Listo para empezar!"
      description="Ya conoces el recorrido completo: inicia sesión, consulta la IA y guarda manualmente los escenarios que quieras conservar."
      route="tutorial-completado"
    >
      <OutroScreen />
    </GuideScene>
  );
};
