const { execSync, spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("?? 1/3: Beende eventuell noch geöffnete Instanzen der App...");
try {
  execSync('taskkill /F /IM "JARVIS Agent Studio.exe" /T', { stdio: "ignore" });
  console.log("? Alte Prozesse beendet.");
} catch (e) {
  console.log("? Keine blockierenden Prozesse gefunden.");
}

console.log("\n?? 2/3: Teste Vite-Kompilierung (Code-Syntax-Check)...");
const viteCli = path.join(__dirname, "node_modules", "vite", "bin", "vite.js");
const viteTest = spawnSync(process.execPath, [viteCli, "build"], { stdio: "inherit" });

if (viteTest.status !== 0) {
  console.error("\n? FEHLER IN DER CODE-SYNTAX GEFUNDEN!");
  console.error("Vite konnte src/App.tsx nicht kompilieren. Siehe Fehlermeldung oben.");
  process.exit(1);
}

console.log("\n? Code ist 100% fehlerfrei kompiliert!");
console.log("\n?? 3/3: Erstelle die .exe neu...");
const builder = require("electron-builder");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

builder.build({
  targets: builder.Platform.WINDOWS.createTarget(["portable"]),
  config: pkg.build || {
    appId: "com.jarvis.agentstudio",
    productName: "JARVIS Agent Studio",
    directories: { output: "release" },
    files: ["dist/**/*", "electron/**/*"],
    win: { target: ["portable"] }
  }
}).then(() => {
  console.log("\n========================================================");
  console.log("?? ERFOLG! Die .exe wurde sauber aktualisiert!");
  console.log("Ordner wird geöffnet...");
  console.log("========================================================");
  const { exec } = require("child_process");
  exec(`explorer.exe "${path.join(__dirname, "release")}"`);
}).catch((err) => {
  console.error("\n? FEHLER BEIM ERSTELLEN DER .EXE:", err.message);
});
