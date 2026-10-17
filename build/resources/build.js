/*
 * ilene.ai resource builder.
 * Renders the resource PDFs from their HTML sources with Chromium (Playwright).
 * Usage (from the repo root):  node build/resources/build.js
 * Requires: playwright with Chromium, and the Poppins font installed locally.
 */
const path = require("path");
const { chromium } = require("playwright");

const HERE = __dirname;
const OUT = path.join(HERE, "..", "..", "resources");
const DOCS = [
  ["measuring-ai-value.html", "measuring-ai-value.pdf"],
  ["ai-policy-writing-guide.html", "ai-policy-writing-guide.pdf"]
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.route(/fonts\.(googleapis|gstatic)/, (r) => r.abort());
  for (const [src, out] of DOCS) {
    await page.goto("file://" + path.join(HERE, src));
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: path.join(OUT, out), format: "Letter", printBackground: true, preferCSSPageSize: true });
    console.log("Built", out);
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
