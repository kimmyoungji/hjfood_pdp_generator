import path from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer from "puppeteer";

const [, , htmlPath] = process.argv;
if (!htmlPath) {
  console.error("사용법: node src/toPdf.js <html경로>");
  process.exit(1);
}

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(path.resolve(htmlPath)).href, { waitUntil: "load" });

// 상세페이지는 A4 여러 장이 아니라 내용 전체 높이의 한 장짜리로 출력
const { width, height } = await page.evaluate(() => ({
  width: document.documentElement.scrollWidth,
  height: document.documentElement.scrollHeight,
}));

const pdfPath = htmlPath.replace(/\.html$/, ".pdf");
await page.pdf({
  path: pdfPath,
  printBackground: true,
  width: `${width}px`,
  height: `${height}px`,
});

await browser.close();
console.log(`생성 완료: ${pdfPath}`);
