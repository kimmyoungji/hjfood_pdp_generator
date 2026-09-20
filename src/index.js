import fs from "node:fs";
import path from "node:path";
import { renderProductPage } from "./template.js";
import { embedLocalImages } from "./lib/embedImages.js";

const dataPath = process.argv[2] ?? "src/data/example.json";
const product = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
product.images = await embedLocalImages(product.images);

const html = renderProductPage(product);

fs.mkdirSync("output", { recursive: true });
const outPath = path.join("output", `${product.title}.html`);
fs.writeFileSync(outPath, html, "utf-8");

console.log(`생성 완료: ${outPath}`);
