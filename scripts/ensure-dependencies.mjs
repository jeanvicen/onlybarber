import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export function dependenciesInstalled(rootDirectory) {
  return existsSync(path.join(rootDirectory, "node_modules", "expo", "package.json"));
}

export async function ensureDependencies(rootDirectory, runner = runCommand) {
  if (dependenciesInstalled(rootDirectory)) return false;
  console.log("Instalando as dependências do Only Barber. Isso acontece apenas no primeiro uso...");
  await runner("npm", ["install"], rootDirectory);
  if (!dependenciesInstalled(rootDirectory)) {
    throw new Error("A instalação terminou sem disponibilizar o Expo localmente.");
  }
  return true;
}

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: process.platform === "win32",
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code) => code === 0
      ? resolve()
      : reject(new Error(`${command} terminou com código ${code ?? "desconhecido"}.`)));
  });
}

const executedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (executedDirectly) {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  ensureDependencies(root).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
