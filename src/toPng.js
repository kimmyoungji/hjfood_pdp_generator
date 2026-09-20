import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const [, , htmlPath] = process.argv;
if (!htmlPath) {
  console.error("사용법: node src/toPng.js <html경로>");
  process.exit(1);
}

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(path.resolve(htmlPath)).href, { waitUntil: "load" });

const pngPath = htmlPath.replace(/\.html$/, ".png");
await page.screenshot({ path: pngPath, fullPage: true });

await browser.close();
console.log(`생성 완료: ${pngPath}`);
