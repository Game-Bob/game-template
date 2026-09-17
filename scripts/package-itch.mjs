import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import archiver from "archiver";

const root = process.cwd();
const packageJson = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
const slug = packageJson.name.split("/").at(-1);
const outputRoot = path.join(root, "itch", "output");
const staging = path.join(outputRoot, slug);
const archivePath = path.join(outputRoot, `${slug}-v${packageJson.version}-itch.zip`);

execFileSync(process.execPath, [path.join(root, "node_modules", "vite", "bin", "vite.js"), "build"], {
    cwd: root,
    stdio: "inherit",
});
await fs.rm(staging, { recursive: true, force: true });
await fs.mkdir(outputRoot, { recursive: true });
await fs.cp(path.join(root, "dist"), staging, { recursive: true });
await fs.rm(archivePath, { force: true });

await new Promise((resolve, reject) => {
    const output = fsSync.createWriteStream(archivePath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(staging, false);
    void archive.finalize();
});

console.log(`itch.io package ready: ${path.relative(root, archivePath)}`);
console.log(`Preview files: ${path.relative(root, staging)}`);
