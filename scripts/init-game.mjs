import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
    const argument = process.argv[index];
    if (!argument?.startsWith("--")) continue;
    args.set(argument.slice(2), process.argv[index + 1] ?? "");
    index += 1;
}

const name = args.get("name");
const slug = args.get("slug") || name?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const appId = args.get("app-id") || (slug ? `com.gamebob.${slug}` : "");

if (!name || !slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[a-z][a-z0-9]*(?:\.[a-z0-9]+)+$/.test(appId)) {
    console.error("Usage: npm run init -- --name \"My Game\" --slug my-game [--app-id com.gamebob.my-game]");
    process.exitCode = 1;
    process.exit();
}

const root = process.cwd();
const replacements = [
    ["package.json", [["game-template", slug], ["Game Template", name]]],
    ["index.html", [["Game Template", name]]],
    ["src/game/game-config.ts", [["game-template", slug], ["Game Template", name], ["com.gamebob.game", appId]]],
    ["capacitor.config.ts", [["com.gamebob.game", appId], ["Game Template", name]]],
];

for (const [relativePath, rules] of replacements) {
    const filePath = path.join(root, relativePath);
    let content = await fs.readFile(filePath, "utf8");
    for (const [from, to] of rules) content = content.replaceAll(from, to);
    await fs.writeFile(filePath, content);
}

const packagePath = path.join(root, "package.json");
const packageJson = JSON.parse(await fs.readFile(packagePath, "utf8"));
packageJson.name = slug;
packageJson.build.appId = appId;
packageJson.build.productName = name;
await fs.writeFile(packagePath, `${JSON.stringify(packageJson, null, 4)}\n`);

console.log(`Initialized ${name} (${slug})`);
console.log(`App ID: ${appId}`);
console.log("Next steps: npm install && npm run dev");
