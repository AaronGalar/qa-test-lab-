import { execSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const testId = process.argv[2] || "TC-004";
if (!/^[A-Z0-9-]+$/.test(testId)) {
  throw new Error("El identificador solo puede contener letras, números y guiones.");
}

const testJsonPath = path.join(
  projectRoot,
  "public",
  "test-data",
  `${testId}.json`,
);

if (!existsSync(testJsonPath)) {
  throw new Error(`No se encontró el JSON del test: ${testJsonPath}`);
}

const testData = JSON.parse(readFileSync(testJsonPath, "utf8"));
if (testData.status !== "PASSED" && testData.status !== "FAILED") {
  throw new Error(`Estado de prueba no válido: ${testData.status}`);
}

if (
  !Array.isArray(testData.steps) ||
  testData.steps.length === 0 ||
  testData.steps.some(
    (step) =>
      typeof step.name !== "string" ||
      typeof step.startMs !== "number" ||
      typeof step.endMs !== "number",
  )
) {
  throw new Error(`La prueba ${testId} no contiene una cronología válida.`);
}

// TC-004 conserva el nombre corto de su primera grabación histórica.
const recordingName =
  testId === "TAREAS"
    ? "tareas.webm"
    : testId === "TC-004"
      ? "video.webm"
      : `video-${testId}.webm`;
const videoSrc = `recordings/${recordingName}`;
if (!existsSync(path.join(projectRoot, "public", videoSrc))) {
  throw new Error(`No se encontró la grabación: public/${videoSrc}`);
}

const outputDir = path.join(projectRoot, "output");
mkdirSync(outputDir, { recursive: true });

const outputFile = path.join(outputDir, `${testData.id}.mp4`);
const propsFile = path.join(outputDir, `${testId}-remotion-props.json`);
const durationSeconds = Math.max(
  1,
  (Number(testData.durationMs) || 15_000) / 1000,
);
const props = {
  testId: testData.id,
  title: testData.title,
  status: testData.status,
  durationSeconds,
  steps: testData.steps.map(({ name, startMs, endMs }) => ({
    name,
    startMs,
    endMs,
  })),
  videoSrc,
};
writeFileSync(propsFile, JSON.stringify(props, null, 2), "utf8");

console.log(`Generando video QA para ${testData.id}...`);
console.log(`Salida: ${outputFile}`);
try {
  execSync(
    `npx remotion render remotion/index.ts QARecording "${outputFile}" --props "${propsFile}" --duration=${Math.ceil((durationSeconds + 1.2) * 30)} --overwrite --codec=h264 --crf=18`,
    {
      stdio: "inherit",
      cwd: projectRoot,
    },
  );
} finally {
  rmSync(propsFile, { force: true });
}

console.log(`Video generado correctamente: ${outputFile}`);
