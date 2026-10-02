import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outputDir = path.join(projectRoot, "output");
const outputFile = path.join(outputDir, "Tutorial-primer-uso.mp4");

mkdirSync(outputDir, { recursive: true });

const command = `npx remotion render remotion/index.ts FirstUseTutorial "${outputFile}" --overwrite --codec=h264 --crf=18`;

console.log("Generando tutorial de primer uso de QA Test Lab...");
console.log(`Salida: ${outputFile}`);
execSync(command, {
  stdio: "inherit",
  cwd: projectRoot,
});

console.log(`Video generado correctamente: ${outputFile}`);
