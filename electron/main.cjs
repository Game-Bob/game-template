const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("node:path");

const isDevelopment = Boolean(process.env.GAME_DEV_SERVER_URL);

function createWindow() {
    const window = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 640,
        minHeight: 480,
        backgroundColor: "#09121c",
        webPreferences: {
            preload: path.join(__dirname, "preload.cjs"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (isDevelopment) {
        window.loadURL(process.env.GAME_DEV_SERVER_URL);
    } else {
        window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
    }

    window.webContents.setWindowOpenHandler(({ url }) => {
        void shell.openExternal(url);
        return { action: "deny" };
    });
}

app.whenReady().then(() => {
    ipcMain.handle("game:share", async (_event, payload) => {
        const { title, text } = payload;
        await shell.openExternal(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`);
    });
    createWindow();
    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
