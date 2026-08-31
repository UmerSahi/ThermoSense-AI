import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-gpu"],
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto("http://localhost:5199/", { waitUntil: "networkidle" });

// Wait until the dashboard data has loaded (hero shows the live reading)
try {
  await page.waitForSelector("text=Live reading", { timeout: 20000 });
} catch {
  console.log("WARN: 'Live reading' never appeared — capturing anyway");
}

// Let the charts/fade-up animations settle
await page.waitForTimeout(2500);

await page.screenshot({ path: "/app/screenshot-full.png", fullPage: true });

// Also grab a top viewport shot for a compact preview
await page.screenshot({ path: "/app/screenshot-top.png" });

await browser.close();
console.log("done");
