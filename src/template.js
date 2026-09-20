const COMPANY_INTRO = `
<p style="margin:0;padding:0;line-height:1.8;text-align:center">
  <span style="font-size:13px"><b>한중식품</b>은 제과용 <u><b>분말제품</b></u><u>과 </u><u><b>종이제품</b></u> <b>제조회사</b>입니다.</span>
</p>
<p style="margin:0;padding:0;line-height:1.8;text-align:center">
  <span style="font-size:13px;color:#36851e"><b>항상 믿을 수 있는 제품을 공급하겠습니다.</b></span>
</p>`;

const DELIVERY_INFO = `
<p style="margin:0;padding:0;line-height:1.8;text-align:center">
  <span style="font-size:19px;color:#36851e"><b>배송 안내</b></span>
</p>
<p style="margin:0;padding:0;line-height:1.8;text-align:center">
  <span style="font-size:15px;color:#000000">제품은 박스에 포장되어 배송됩니다.</span>
</p>
<p style="margin:0;padding:0;line-height:1.8;text-align:center">
  <span style="font-size:15px;color:#000000"><u><b>평일 오전 10시</b></u> 이전 주문 시 <u><b>당일 출고</b></u>해드립니다.</span>
</p>`;

const spacer = () => `<div style="height:40px"></div>`;

const image = (src, { width = 200, align = "center" } = {}) => `
<div style="width:100%;text-align:${align}">
  <img src="${src}" alt="" style="display:inline-block;width:${width}px;max-width:100%" />
</div>`;

// 여러 장을 화면 폭이 허락하는 한 가로로 나란히, 넘치면 다음 줄로 배치
const imageGroup = (srcs, { width = 200 } = {}) => `
<div style="width:100%;display:flex;flex-wrap:wrap;justify-content:center;gap:8px">
${srcs.map((src) => `  <img src="${src}" alt="" style="width:${width}px;max-width:100%" />`).join("\n")}
</div>`;

const sectionTitle = (text) => `
<p style="margin:0;padding:0;line-height:1.5;text-align:left">
  <span style="font-size:28px;color:#36851e"><b>${text}</b></span>
</p>`;

const productTitle = (text) => `
<p style="margin:0;padding:0;line-height:1.5;text-align:center">
  <span style="font-size:28px;color:#36851e"><b>&lt;&lt; ${text} &gt;&gt;</b></span>
</p>`;

function specTable({ headers, rows }, currentProduct) {
  const th = headers.map((h) => `<th style="padding:8px;border:1px solid #ddd;font-size:13px">${h}</th>`).join("");
  const trs = rows
    .map((row) => {
      const isCurrent = row[0] === currentProduct;
      const cells = row
        .map((cell) => `<td style="padding:8px;border:1px solid #ddd;font-size:13px;text-align:center${isCurrent ? ";font-weight:bold" : ""}">${cell}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table style="width:100%;border-collapse:collapse;text-align:center"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

export function renderProductPage(product) {
  const { title, images, specs, colorMaterial, packagingUnit } = product;

  return `<div style="text-align:center;max-width:780px;margin:0 auto">
${spacer()}
${image(images.topBanner)}
${COMPANY_INTRO}
${spacer()}
${image(images.midBanner)}

${spacer()}
${sectionTitle("제품 상세 정보")}
${spacer()}
${productTitle(title)}
${spacer()}
${imageGroup(images.product, { width: 300 })}
${spacer()}

${spacer()}
${sectionTitle("1) 규격")}
${specTable(specs, title)}
${spacer()}

${spacer()}
${sectionTitle("2) 색상 / 재질")}
<p style="margin:0;padding:0;line-height:1.8;text-align:center">
  <span style="font-size:19px;color:#000000"><b>${colorMaterial}</b></span>
</p>
${image(images.colorMaterial, { width: 600 })}
${spacer()}

${sectionTitle("3) 포장 단위")}
<p style="margin:0;padding:0;line-height:1.6;text-align:center">
  <span style="font-size:15px">${packagingUnit.name}</span><br/>
  <span style="font-size:15px">${packagingUnit.unit}</span>
</p>
${imageGroup(images.packaging, { width: 600 })}
${spacer()}

${image(images.bottomBanner)}
${DELIVERY_INFO}
${spacer()}
</div>`;
}
