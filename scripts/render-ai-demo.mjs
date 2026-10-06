import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outputDir = path.join(projectRoot, "output");
const outputFile = path.join(outputDir, "Demo-asistente-IA.mp4");

mkdirSync(outputDir, { recursive: true });

// Renderiza la composición del asistente, sin grabar otra vez el tutorial de acceso.
const command = `npx remotion render remotion/index.ts AIDemoVideo "${outputFile}" --overwrite --codec=h264 --crf=18`;
console.log("Generando el vídeo de demostración del asistente de IA...");
console.log(`Salida: ${outputFile}`);
execSync(command, {
  stdio: "inherit",
  cwd: projectRoot,
});

console.log(`Vídeo generado correctamente: ${outputFile}`);
