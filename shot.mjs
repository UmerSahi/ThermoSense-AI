import { chromium } from "playwright";

// Captures full-page and hero-viewport screenshots of the dashboard.
// Usage: start `npm run dev`, then `node shot.mjs <url>` (default localhost:5173).
// Outputs base64 text files into public/screenshots/*.b64 so they can be
// committed as text. A Vite plugin (b64ScreenshotPlugin in vite.config.ts)
// decodes them back into real .png files at dev/build start.

const url = process.argv[2] ?? "http://localhost:5173/";
const OUT = "public/screenshots";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-gpu"],
});

const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });

try {
  await page.waitForSelector("text=Live reading", { timeout: 20000 });
} catch {
  console.log("WARN: dashboard data never appeared — capturing anyway");
}
await page.waitForTimeout(2500); // let charts / fade-up settle

const { mkdirSync, writeFileSync, readFileSync } = await import("node:fs");
mkdirSync(OUT, { recursive: true });

for (const [name, opts] of [
  ["dashboard.png", { fullPage: true }],
  ["hero.png", {}],
]) {
  await page.screenshot({ path: `/tmp/${name}`, ...opts });
  const b64 = readFileSync(`/tmp/${name}`).toString("base64");
  writeFileSync(`${OUT}/${name}.b64`, b64);
  console.log(`${OUT}/${name}.b64  (${b64.length} chars)`);
}

await browser.close();
console.log("done");
