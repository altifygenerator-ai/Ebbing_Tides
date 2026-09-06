import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../public", import.meta.url));
const port = Number(process.env.PORT || 3000);
const mime = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json"
};

const server = http.createServer(async (req, res) => {
  try {
    const rawPath = decodeURIComponent((req.url || "/").split("?")[0] || "/");
    const requested = rawPath === "/" ? "/alpha/index.html" : rawPath;
    const safe = normalize(requested).replace(/^([.][.][/\\])+/, "");
    let path = join(root, safe);
    const info = await stat(path).catch(() => undefined);
    if (info?.isDirectory()) path = join(path, "index.html");
    const body = await readFile(path);
    res.writeHead(200, { "content-type": mime[extname(path)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Ebbing Tides Alpha 0.1: http://localhost:${port}/alpha/`);
});
