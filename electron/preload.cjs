const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("jarvisBridge", {
  openPlatformLogin: (platformKey) => ipcRenderer.invoke("open-platform-login", platformKey),
  openInDefaultBrowser: (url) => ipcRenderer.invoke("open-in-default-browser", url),
  getSystemProfile: () => ipcRenderer.invoke("get-system-profile"),
  dbSaveExecution: (entry) => ipcRenderer.invoke("db-save-execution", entry),
  dbGetHistory: () => ipcRenderer.invoke("db-get-history")
});
