import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csv.js";

// 브랜드 공통 배너 (제품군과 무관하게 재사용되는 이미지)
const COMMON_BANNERS = {
  topBanner:
    "http://image1.coupangcdn.com/image/vendor_inventory/17a6/84579d22887412458784f6efd08f9ab19c358d4a40e03b10e4c4669ae715.png",
  midBanner:
    "http://image1.coupangcdn.com/image/vendor_inventory/a327/2e92e41169451810b5ed0ca8fd541cbf83fe9efd9618f9d6845e1478999f.png",
  bottomBanner:
    "http://image1.coupangcdn.com/image/vendor_inventory/15f6/cd5f01c8721ef73b585de4c6dc16a1c7f64d51e5ecc1859ecf2ade1fa146.png",
};

const [, , csvPath, groupName, skuKeyword, titleSkuName, outPath] = process.argv;

if (!csvPath || !groupName || !titleSkuName || !outPath) {
  console.error(
    "사용법: node src/buildFromCsv.js <csv경로> <제품군> <SKU명 포함 키워드(없으면 \"\")> <대표SKU명> <출력json경로>"
  );
  process.exit(1);
}

const rows = parseCsv(fs.readFileSync(csvPath, "utf-8"));
const header = rows[2];
const col = (name) => header.indexOf(name);
const idx = {
  sku코드: col("sku_code_draft"),
  제품군: col("제품군"),
  SKU명: col("SKU명"),
  지름: col("지름_mm"),
  띠길이: col("띠길이_mm"),
  띠폭: col("띠폭_mm"),
  색상: col("색상"),
  재질: col("재질"),
  포장수량: col("1차포장수량"),
  포장단위: col("1차포장단위"),
};

// img/<sku_code_draft>/ 폴더에서 product-N.*, color-material.*, packaging-N.* 파일을 찾아 상대경로로 반환
function findLocalImages(skuCode) {
  const dir = path.join("img", skuCode);
  const empty = { product: [], colorMaterial: "", packaging: [] };
  if (!fs.existsSync(dir)) return empty;

  const byNumber = (a, b) => a.n - b.n;
  const files = fs.readdirSync(dir);
  const toUrl = (file) => `../img/${skuCode}/${file}`;

  const product = files
    .map((f) => ({ f, n: Number(f.match(/^product-(\d+)\./)?.[1]) }))
    .filter((x) => !Number.isNaN(x.n))
    .sort(byNumber)
    .map((x) => toUrl(x.f));

  const packaging = files
    .map((f) => ({ f, n: Number(f.match(/^packaging-(\d+)\./)?.[1]) }))
    .filter((x) => !Number.isNaN(x.n))
    .sort(byNumber)
    .map((x) => toUrl(x.f));

  const colorMaterialFile = files.find((f) => /^color-material\./.test(f));

  return {
    product,
    colorMaterial: colorMaterialFile ? toUrl(colorMaterialFile) : "",
    packaging,
  };
}

const groupRows = rows
  .slice(3)
  .filter(
    (r) =>
      r[idx.제품군] === groupName &&
      r[idx.SKU명] &&
      (!skuKeyword || r[idx.SKU명].includes(skuKeyword))
  );

const specRows = groupRows.map((r) => [
  r[idx.SKU명],
  r[idx.지름] || "-",
  r[idx.띠길이] || "-",
  r[idx.띠폭] || "-",
]);

const titleRow = groupRows.find((r) => r[idx.SKU명] === titleSkuName);
if (!titleRow) {
  console.error(`대표 SKU "${titleSkuName}"를 ${groupName} 제품군에서 찾을 수 없습니다.`);
  process.exit(1);
}

const localImages = findLocalImages(titleRow[idx.sku코드]);

const product = {
  title: titleSkuName,
  images: {
    ...COMMON_BANNERS,
    ...localImages,
  },
  specs: {
    headers: ["품명", "원형 지름(mm)", "띠 길이(mm)", "띠 폭(mm)"],
    rows: specRows,
  },
  colorMaterial: [titleRow[idx.색상], titleRow[idx.재질]].filter(Boolean).join(" / "),
  packagingUnit: {
    name: titleSkuName,
    unit: `${titleRow[idx.포장수량] || ""}${titleRow[idx.포장단위] || ""}`,
  },
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(product, null, 2), "utf-8");
console.log(`생성 완료: ${outPath}`);
console.log(
  `이미지: product ${localImages.product.length}개, colorMaterial ${localImages.colorMaterial ? "있음" : "없음"}, packaging ${localImages.packaging.length}개 (img/${titleRow[idx.sku코드]}/ 에서 자동 인식)`
);
