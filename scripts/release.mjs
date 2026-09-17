import { execFileSync } from "node:child_process";

const releaseType = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (releaseType !== "minor") {
    throw new Error("Este comando solo admite releases minor.");
}

const run = (command, args, options = {}) =>
    execFileSync(command, args, {
        encoding: "utf8",
        stdio: options.capture ? "pipe" : "inherit",
        ...options,
    })?.trim();

const git = (args, options) => run("git", args, options);
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Ejecuta este release mediante npm run minor.");

const runNpm = (args, options) => run(process.execPath, [npmCli, ...args], options);
const branch = git(["branch", "--show-current"], { capture: true });
if (branch !== "main") {
    throw new Error(`Debes ejecutar el release desde main (rama actual: ${branch || "ninguna"}).`);
}

const changes = git(["status", "--porcelain"], { capture: true });
if (changes) {
    throw new Error("El repositorio tiene cambios sin guardar. Haz commit o descártalos antes del release.");
}

git(["fetch", "origin", "main", "--tags"]);
const head = git(["rev-parse", "HEAD"], { capture: true });
const remoteHead = git(["rev-parse", "origin/main"], { capture: true });
if (head !== remoteHead) {
    throw new Error("Tu main local no coincide con origin/main. Sincronízalo antes del release.");
}

const { default: packageJson } = await import("../package.json", { with: { type: "json" } });
const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(packageJson.version);
if (!match) throw new Error(`La versión actual no es válida: ${packageJson.version}`);

const nextVersion = `${match[1]}.${Number(match[2]) + 1}.0`;
const tag = `v${nextVersion}`;
try {
    git(["rev-parse", "--verify", `refs/tags/${tag}`], { capture: true });
    throw new Error(`El tag ${tag} ya existe.`);
} catch (error) {
    if (error.message === `El tag ${tag} ya existe.`) throw error;
}

if (dryRun) {
    console.log(`Todo correcto: npm run minor publicaría ${tag}.`);
    process.exit(0);
}

runNpm(["version", nextVersion, "--no-git-tag-version"]);
git(["add", "package.json", "package-lock.json"]);
git(["commit", "--no-verify", "-m", `release: ${tag}`]);
git(["tag", "-a", tag, "-m", `Release ${tag}`]);
git(["push", "--atomic", "--no-verify", "origin", "main", tag]);

console.log(`${tag} publicado.`);
