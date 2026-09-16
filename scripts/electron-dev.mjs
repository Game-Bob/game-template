import http from "node:http";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const vite = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--strictPort"], { stdio: "inherit", shell: false });
const url = "http://127.0.0.1:5173";
let electron;

const waitForServer = () => new Promise((resolve, reject) => {
    const check = () => {
        const request = http.get(url, () => { request.destroy(); resolve(); });
        request.on("error", () => setTimeout(check, 150));
    };
    setTimeout(check, 250);
    vite.on("error", reject);
});

try {
    await waitForServer();
    electron = spawn(process.execPath, [path.join(process.cwd(), "node_modules", "electron", "cli.js"), "."], { env: { ...process.env, GAME_DEV_SERVER_URL: url }, stdio: "inherit", shell: false });
    electron.on("exit", (code) => { vite.kill(); process.exit(code ?? 0); });
} catch (error) {
    vite.kill();
    throw error;
}

const stop = () => { electron?.kill(); vite.kill(); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
