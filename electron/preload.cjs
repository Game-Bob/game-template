const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gamePlatform", {
    kind: "electron",
    share: (title, text, url) => ipcRenderer.invoke("game:share", { title, text: `${text}\n${url}` }),
});
