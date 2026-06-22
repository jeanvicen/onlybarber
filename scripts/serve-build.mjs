import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const normalized = (value) => value.replaceAll("\\", "/");

export function resolveStaticPath(pathname, distDirectory) {
  let decoded;
  try { decoded = decodeURIComponent(pathname.split("?")[0] ?? "/"); } catch { decoded = "/+not-found"; }
  if (decoded.split("/").includes("..")) return normalized(path.join(distDirectory, "+not-found.html"));
  if (decoded === "/") return normalized(path.join(distDirectory, "index.html"));
  if (/^\/course\/[^/]+$/.test(decoded)) return normalized(path.join(distDirectory, "course", "[id].html"));
  if (/^\/learn\/[^/]+$/.test(decoded)) return normalized(path.join(distDirectory, "learn", "[id].html"));
  const extension = path.extname(decoded);
  return normalized(path.join(distDirectory, extension ? decoded : `${decoded}.html`));
}

function openBrowser(url) {
  if (process.platform === "win32") spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
  else if (process.platform === "darwin") spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
  else spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
}

export function startPreview({ distDirectory, port = 4173, open = true }) {
  const absoluteDist = path.resolve(distDirectory);
  if (!existsSync(path.join(absoluteDist, "index.html"))) throw new Error(`Build não encontrada em ${absoluteDist}. Execute npm run build:web primeiro.`);
  const server = createServer((request, response) => {
    const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
    let target = resolveStaticPath(pathname, absoluteDist);
    if (!normalized(path.resolve(target)).startsWith(normalized(absoluteDist)) || !existsSync(target) || statSync(target).isDirectory()) target = path.join(absoluteDist, "+not-found.html");
    response.setHeader("Content-Type", mimeTypes[path.extname(target)] ?? "application/octet-stream");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "same-origin");
    createReadStream(target).pipe(response);
  });
  server.listen(port, "127.0.0.1", () => {
    const url = `http://127.0.0.1:${port}`;
    console.log(`Only Barber disponível em ${url}`);
    if (open) openBrowser(url);
  });
  return server;
}

const executedDirectly = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (executedDirectly) {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const portArg = process.argv.find((value) => value.startsWith("--port="));
  startPreview({ distDirectory: path.join(root, "apps", "mobile", "dist"), port: portArg ? Number(portArg.split("=")[1]) : 4173, open: !process.argv.includes("--no-open") });
}
