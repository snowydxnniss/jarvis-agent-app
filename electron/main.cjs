const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");

let mainWindow;

// Nutze den sicheren userData-Pfad von Electron für persistente SSD-Daten
const userDataDir = app.getPath("userData");
const dbDir = path.join(userDataDir, "db");
const sessionDir = path.join(userDataDir, "browser-session");
const systemProfilePath = path.join(dbDir, "system_profile.json");
const dbPath = path.join(dbDir, "database.json");

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ executions: [] }, null, 2), "utf8");
}

function initSystemProfile() {
  if (fs.existsSync(systemProfilePath)) {
    try { return JSON.parse(fs.readFileSync(systemProfilePath, "utf8")); } catch (e) {}
  }

  let gpuName = "Unbekannte GPU";
  try {
    const gpuRaw = execSync("powershell -Command \"(Get-CimInstance Win32_VideoController).Name\"", { encoding: "utf8" });
    gpuName = gpuRaw.trim().split("\n")[0].trim();
  } catch (e) {}

  const profile = {
    username: os.userInfo().username,
    hostname: os.hostname(),
    os: `${os.type()} ${os.release()} (${os.arch()})`,
    cpu: os.cpus()[0]?.model || "Unbekannte CPU",
    cpuCores: os.cpus().length,
    totalRamGB: Math.round(os.totalmem() / (1024 ** 3)),
    gpu: gpuName,
    homedir: os.homedir(),
    scanTimestamp: new Date().toISOString()
  };

  fs.writeFileSync(systemProfilePath, JSON.stringify(profile, null, 2), "utf8");
  return profile;
}

const currentSystemProfile = initSystemProfile();

ipcMain.handle("get-system-profile", () => currentSystemProfile);

ipcMain.handle("open-in-default-browser", async (event, url) => {
  await shell.openExternal(url);
  return { success: true };
});

ipcMain.handle("open-platform-login", async (event, platformKey) => {
  const urls = {
    instagram: "https://www.instagram.com/",
    google: "https://accounts.google.com/",
    youtube: "https://www.youtube.com/",
    tiktok: "https://www.tiktok.com/",
    twitch: "https://www.twitch.tv/",
    snapchat: "https://web.snapchat.com/",
    apple: "https://appleid.apple.com/",
    github: "https://github.com/",
    stripe: "https://dashboard.stripe.com/"
  };
  const target = urls[platformKey] || "https://google.com";
  await shell.openExternal(target);
  return { success: true };
});

ipcMain.handle("db-save-execution", async (event, entry) => {
  try {
    const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    data.executions.unshift({ ...entry, id: "cmd-" + Date.now(), timestamp: new Date().toISOString() });
    if (data.executions.length > 300) data.executions.pop();
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1550,
    height: 950,
    minWidth: 1200,
    minHeight: 750,
    title: "JARVIS Agent Studio",
    backgroundColor: "#05070d",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
