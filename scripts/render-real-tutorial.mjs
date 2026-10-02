import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const metadataPath = path.join(
  projectRoot,
  "public",
  "test-data",
  "TUTORIAL-IA.json",
);
const recordingPath = path.join(
  projectRoot,
  "public",
  "recordings",
  "tutorial-ia.webm",
);

console.log("Grabando el recorrido real en Chromium...");
execSync("npm run record:tutorial", {
  stdio: "inherit",
  cwd: projectRoot,
});

if (!existsSync(metadataPath) || !existsSync(recordingPath)) {
  throw new Error("Playwright no generó la grabación y sus métricas.");
}

const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
if (metadata.status !== "PASSED") {
  throw new Error("No se renderiza el tutorial porque el recorrido no pasó.");
}

const outputDir = path.join(projectRoot, "output");
const outputFile = path.join(outputDir, "Tutorial-primer-uso.mp4");
mkdirSync(outputDir, { recursive: true });

console.log("Montando la grabación real con sus instrucciones...");
console.log(`Fuente: ${recordingPath}`);
console.log(`Salida: ${outputFile}`);
execSync(
  `npx remotion render remotion/index.ts FirstUseTutorial "${outputFile}" --overwrite --codec=h264 --crf=18`,
  {
    stdio: "inherit",
    cwd: projectRoot,
  },
);

console.log(`Tutorial generado correctamente: ${outputFile}`);
