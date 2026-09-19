const path = require("path");
const { spawnSync, spawn } = require("child_process");

const viteCli = path.join(__dirname, "node_modules", "vite", "bin", "vite.js");
spawnSync(process.execPath, [viteCli, "build"], { stdio: "inherit" });

const electronExe = require("electron");
const child = spawn(electronExe, [path.join(__dirname, "electron", "main.cjs")], { stdio: "inherit" });
child.on("close", () => process.exit(0));
