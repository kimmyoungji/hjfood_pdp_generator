import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const PAGE_WIDTH = 780; // 상세페이지 컨테이너 폭 (template.js max-width와 동일)

const isLocalPath = (src) => Boolean(src) && !/^https?:\/\//.test(src) && !src.startsWith("data:");

// 이미지 필드는 "경로" 문자열 또는 { src, rotate } 객체(세로 이미지 회전용) 둘 다 지원
function normalizeImage(entry) {
  return typeof entry === "string" ? { src: entry, rotate: 0 } : { src: entry?.src ?? "", rotate: entry?.rotate ?? 0 };
}

// 파일을 지정 폭으로 리사이즈(+선택적 회전)해서 버퍼로 반환
export async function resizeImage(filePath, { width = PAGE_WIDTH, rotate = 0 } = {}) {
  return sharp(filePath)
    .rotate(rotate)
    .resize({ width, withoutEnlargement: true })
    .toBuffer({ resolveWithObject: true });
}

export async function toDataUri(entry, { width = PAGE_WIDTH, basePath = "output" } = {}) {
  const { src, rotate } = normalizeImage(entry);
  if (!isLocalPath(src)) return src;
  const filePath = path.resolve(basePath, src); // JSON의 경로는 basePath(기본 output/) 기준 상대경로
  const { data, info } = await resizeImage(filePath, { width, rotate });
  return `data:image/${info.format};base64,${data.toString("base64")}`;
}

export async function embedLocalImages(images, options) {
  return {
    ...images,
    topBanner: await toDataUri(images.topBanner, options),
    midBanner: await toDataUri(images.midBanner, options),
    bottomBanner: await toDataUri(images.bottomBanner, options),
    product: await Promise.all(images.product.map((entry) => toDataUri(entry, options))),
    colorMaterial: await toDataUri(images.colorMaterial, options),
    packaging: await Promise.all(images.packaging.map((entry) => toDataUri(entry, options))),
  };
}

// 단독 CLI로도 사용 가능: node src/lib/embedImages.js <이미지경로> [width] [rotate]
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const [, , filePath, widthArg, rotateArg] = process.argv;
  if (!filePath) {
    console.error("사용법: node src/lib/embedImages.js <이미지경로> [width=780] [rotate=0]");
    process.exit(1);
  }
  const width = widthArg ? Number(widthArg) : PAGE_WIDTH;
  const rotate = rotateArg ? Number(rotateArg) : 0;

  const { data, info } = await resizeImage(filePath, { width, rotate });
  const { dir, name, ext } = path.parse(filePath);
  const outPath = path.join(dir, `${name}.resized${ext}`);
  fs.writeFileSync(outPath, data);
  console.log(`생성 완료: ${outPath} (${info.width}x${info.height}, ${(data.length / 1024).toFixed(0)}KB)`);
}
