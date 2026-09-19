const fs = require("fs");
const path = require("path");
const { spawnSync, exec } = require("child_process");

console.log("🔧 1/4: Repariere package.json (Name & Version setzen)...");
const pkgPath = path.join(__dirname, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg.name = "jarvis-agent-studio";
pkg.version = "1.0.0";
pkg.description = "JARVIS 3D Agent Studio";
pkg.author = "Denizius";
pkg.main = "electron/main.cjs";

pkg.build = {
  appId: "com.jarvis.agentstudio",
  productName: "JARVIS Agent Studio",
  directories: { output: "release" },
  files: ["dist/**/*", "electron/**/*"],
  win: { target: ["portable"] }
};

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), "utf8");
console.log("✓ package.json ist vollständig.");

console.log("🔌 2/4: Verbinde Desktop-App direkt mit Ollama (Port 11434)...");
const appTsxPath = path.join(__dirname, "src", "App.tsx");
if (fs.existsSync(appTsxPath)) {
  let appCode = fs.readFileSync(appTsxPath, "utf8");
  // Stellt sicher, dass die .exe direkt http://127.0.0.1:11434 nutzt
  if (appCode.includes('"/ollama/api/')) {
    appCode = appCode.replaceAll(
      '"/ollama/api/',
      '(window.location.protocol === "file:" ? "http://127.0.0.1:11434/api/" : "/ollama/api/") + "'
    );
    fs.writeFileSync(appTsxPath, appCode, "utf8");
    console.log("✓ App.tsx auf direkte Ollama-Verbindung umgestellt.");
  }
}

console.log("⚡ 3/4: Richte Electron-Autostart für Ollama ein...");
const electronDir = path.join(__dirname, "electron");
if (!fs.existsSync(electronDir)) fs.mkdirSync(electronDir, { recursive: true });

const mainCjsContent = `const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const http = require("http");
const { spawn } = require("child_process");

let mainWindow;

// Prüft beim Start der .exe, ob Ollama läuft – wenn nicht, startet es automatisch
function ensureOllama() {
  const req = http.get("http://127.0.0.1:11434", () => {
    console.log("Ollama ist online.");
  });
  req.on("error", () => {
    console.log("Starte Ollama im Hintergrund...");
    try {
      const p = spawn("ollama", ["serve"], { detached: true, stdio: "ignore", windowsHide: true });
      p.unref();
    } catch (e) {
      console.error("Autostart fehlgeschlagen:", e);
    }
  });
}

function createWindow() {
  ensureOllama();

  mainWindow = new BrowserWindow({
    width: 1550,
    height: 950,
    minWidth: 1200,
    minHeight: 750,
    title: "JARVIS Agent Studio",
    backgroundColor: "#05070d",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false // Ermöglicht direkten API-Zugriff auf localhost:11434
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
`;
fs.writeFileSync(path.join(electronDir, "main.cjs"), mainCjsContent, "utf8");

console.log("📦 4/4: Kompiliere Vite & erstelle portable .exe...");
const viteCli = path.join(__dirname, "node_modules", "vite", "bin", "vite.js");
spawnSync(process.execPath, [viteCli, "build"], { stdio: "inherit" });

const builder = require("electron-builder");
builder.build({
  targets: builder.Platform.WINDOWS.createTarget(["portable"]),
  config: pkg.build
}).then(() => {
  console.log("\n========================================================");
  console.log("🎉 ERFOLGREICH! Deine .exe wurde erstellt!");
  console.log("========================================================");
  const releasePath = path.join(__dirname, "release");
  exec(`explorer.exe "${releasePath}"`);
}).catch((err) => {
  console.error("Fehler beim Build:", err);
});
