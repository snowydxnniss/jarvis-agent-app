const path = require("path");
const { spawnSync } = require("child_process");

async function run() {
  console.log("?? 1/2: Kompiliere Web-Assets...");
  const viteCli = path.join(__dirname, "node_modules", "vite", "bin", "vite.js");
  const viteBuild = spawnSync(process.execPath, [viteCli, "build"], { stdio: "inherit" });

  if (viteBuild.status !== 0) {
    console.error("Vite Build fehlgeschlagen!");
    process.exit(1);
  }

  console.log("\n?? 2/2: Erstelle portable Windows .exe...");
  const builder = require("electron-builder");
  
  try {
    await builder.build({
      targets: builder.Platform.WINDOWS.createTarget(["portable"]),
      config: {
        appId: "com.jarvis.agentstudio",
        productName: "JARVIS Agent Studio",
        directories: { output: "release" },
        files: ["dist/**/*", "electron/**/*"],
        win: { target: ["portable"] }
      }
    });
    console.log("\n========================================================");
    console.log("? FERTIG! Öffne den Ausgabe-Ordner...");
    console.log("========================================================");
    
    // Öffnet den Ordner direkt im Windows Datei-Explorer
    const { exec } = require("child_process");
    exec(`explorer.exe "${path.join(__dirname, "release")}"`);
  } catch (err) {
    console.error("Fehler beim Erstellen der .exe:", err);
  }
}

run();
