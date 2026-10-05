import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const metadataPath = path.join(
  projectRoot,
  "public",
  "test-data",
  "TAREAS.json",
);
const recordingPath = path.join(
  projectRoot,
  "public",
  "recordings",
  "tareas.webm",
);

console.log("Ejecutando el test de tareas en Chromium...");
execSync("npm run test:tareas", {
  stdio: "inherit",
  cwd: projectRoot,
});

if (!existsSync(metadataPath) || !existsSync(recordingPath)) {
  throw new Error("El test no generó las métricas y la grabación esperadas.");
}

const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
if (metadata.status !== "PASSED" || metadata.steps.length === 0) {
  throw new Error("No se renderiza el vídeo porque el test no pasó.");
}

const outputDir = path.join(projectRoot, "output");
const outputFile = path.join(outputDir, "Tareas.mp4");
mkdirSync(outputDir, { recursive: true });

console.log("Renderizando el recorrido con Remotion...");
console.log(`Fuente: ${recordingPath}`);
console.log(`Salida: ${outputFile}`);
execSync(
  `npx remotion render remotion/index.ts TasksWalkthrough "${outputFile}" --overwrite --codec=h264 --crf=18`,
  {
    stdio: "inherit",
    cwd: projectRoot,
  },
);

console.log(`Vídeo generado correctamente: ${outputFile}`);
