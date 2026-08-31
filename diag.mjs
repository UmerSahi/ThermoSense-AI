import { chromium } from "playwright";

const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleMsgs = [];
const pageErrors = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") consoleMsgs.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => pageErrors.push(String(e)));

await page.goto("http://localhost:5199/", { waitUntil: "networkidle" });
await page.waitForTimeout(6000);

const info = await page.evaluate(() => {
  const sections = document.querySelectorAll("section, main > *");
  const cards = document.querySelectorAll("h2, h3");
  return {
    title: document.title,
    bodyHeight: document.body.scrollHeight,
    sections: sections.length,
    headings: Array.from(cards).slice(0, 20).map((h) => h.textContent.trim()),
    textLen: document.body.innerText.length,
    textPreview: document.body.innerText.slice(0, 600),
  };
});

console.log("=== PAGE ERRORS ===");
console.log(pageErrors.length ? pageErrors.join("\n") : "(none)");
console.log("=== CONSOLE ===");
console.log(consoleMsgs.length ? consoleMsgs.slice(0, 30).join("\n") : "(none)");
console.log("=== INFO ===");
console.log(JSON.stringify(info, null, 2));

await browser.close();
