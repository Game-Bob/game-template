import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const game = process.argv[2] || config.name;
const port = Number(process.argv[3] || 4175);
const directory = path.join(root, "itch", "output", game);

if (!fs.existsSync(path.join(directory, "index.html"))) {
    execFileSync(process.execPath, [path.join(root, "scripts", "package-itch.mjs")], {
        cwd: root,
        stdio: "inherit",
    });
}

const mime = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon" };
const server = http.createServer((request, response) => {
    const requested = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    const relative = requested === "/" ? "index.html" : requested.slice(1);
    const candidate = path.resolve(directory, relative);
    if (!candidate.startsWith(`${directory}${path.sep}`)) {
        response.writeHead(403).end();
        return;
    }
    const filePath = fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : path.join(directory, "index.html");
    response.writeHead(200, { "content-type": mime[path.extname(filePath)] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(response);
});
server.listen(port, "127.0.0.1", () => console.log(`itch.io preview: http://127.0.0.1:${port}/`));
