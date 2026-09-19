const { chromium } = require("playwright-core");
const path = require("path");
const fs = require("fs");

const userDataDir = path.join(__dirname, "../workspace/browser-session");
if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });

// Findet die lokale Chrome- oder Edge-Installation auf Windows
function getExecutablePath() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
  throw new Error("Weder Chrome noch Edge auf dem System gefunden.");
}

// 1. Öffnet den sichtbaren Browser zum einmaligen Login aller Accounts
async function openLoginSession() {
  console.log("Starte Session-Browser für manuelle Logins...");
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: getExecutablePath(),
    headless: false,
    viewport: null,
    args: ["--start-maximized"]
  });

  const page = context.pages()[0] || await context.newPage();
  await page.goto("https://www.google.com");
  console.log("Browser geöffnet. Logge dich auf Instagram, Twitch, TikTok etc. ein. Schließe den Browser, wenn du fertig bist.");
}

// 2. Automatisierte Extraktion für Agenten (z. B. Instagram Feed/Stats lesen)
async function scrapeInstagramStats() {
  const context = await chromium.launchPersistentContext(userDataDir, {
    executablePath: getExecutablePath(),
    headless: true
  });
  const page = await context.newPage();
  await page.goto("https://www.instagram.com/", { waitUntil: "networkidle" });
  
  // Prüft, ob Session aktiv ist
  const isLoggedIn = await page.locator('nav').count() > 0;
  await context.close();
  return { platform: "Instagram", authenticated: isLoggedIn };
}

module.exports = { openLoginSession, scrapeInstagramStats };

if (process.argv.includes("--login")) {
  openLoginSession();
}
