# hjfood_dongsim_pdp_generator

한중식품 상품 상세 페이지(PDP) 생성기. 제품 마스터 CSV → HTML → (선택) PDF/PNG 순서로 변환합니다.

## 동작 방식

```
제품 마스터 CSV ─▶ JSON ─▶ HTML ─▶ (선택) PDF / PNG
  (buildFromCsv.js)  (index.js)   (toPdf.js / toPng.js)
```

1. CSV에서 원하는 제품군/SKU를 골라 JSON 데이터로 추출 (규격표, 색상/재질, 포장단위 + `img/` 폴더 이미지 자동 매칭)
2. JSON을 상세페이지 템플릿에 채워 HTML 생성. 로컬 이미지는 리사이즈 후 base64로 파일 안에 직접 삽입해 HTML 하나로 완결됨
3. 필요하면 그 HTML을 PDF나 PNG로 변환 (둘 다 헤드리스 브라우저로 실제 렌더링한 결과)

## 파일 구조

| 파일 | 역할 |
|---|---|
| `src/buildFromCsv.js` | CSV → JSON 변환 (제품군/SKU 필터링, 규격표 생성, 이미지 자동 매칭) |
| `src/index.js` | JSON → HTML 생성 (진입점) |
| `src/template.js` | 상세페이지 HTML 마크업/스타일 정의 |
| `src/toPdf.js` | HTML → PDF 변환 |
| `src/toPng.js` | HTML → PNG 변환 |
| `src/lib/csv.js` | 따옴표 안 콤마도 처리하는 CSV 파서 |
| `src/lib/embedImages.js` | 이미지 리사이즈/회전/base64 인코딩 (단독 CLI로도 실행 가능) |
| `src/data/*.json` | buildFromCsv.js로 생성된 제품 데이터 |
| `img/<sku_code_draft>/` | SKU별 원본 이미지 (파일명 규칙은 아래 참고) |
| `output/` | 생성된 HTML/PDF/PNG (git 추적 안 함) |

## 사용법

1. 제품 마스터 CSV → JSON 데이터 생성
   ```bash
   node src/buildFromCsv.js <csv경로> <제품군> <SKU명 필터(없으면 "")> <대표SKU명> <출력json경로>
   ```
   예시:
   ```bash
   node src/buildFromCsv.js "src/한중식품_제품마스터_통합초안_v2_2026-07-19.xlsm - SKU_종이.csv" "갱지가다" "하트모양" "하트모양 갱지가다 2호" "src/data/heart-gada-2.json"
   ```
   상품/색상재질/포장 이미지는 `img/<sku_code_draft>/` 폴더에 아래 이름 규칙으로 넣어두면 자동으로 인식되어 채워짐 (없으면 빈 값):
   - `product-1.jpg`, `product-2.jpg`, ... → `images.product`
   - `color-material.jpg` → `images.colorMaterial`
   - `packaging-1.jpg`, `packaging-2.jpg`, ... → `images.packaging`

   예: `img/S-GADA-HEART-002/product-1.jpg`

   파라미터 설명:
   - `제품군`: CSV `제품군` 컬럼과 정확히 일치하는 값
   - `SKU명 필터`: `SKU명`에 포함된 문자열로 추가 필터링 (안 좁히려면 `""`)
   - `대표SKU명`: 위 조건으로 걸러진 SKU 중 이 페이지의 주인공(title/색상재질/포장단위 추출 대상)

2. JSON → 상세페이지 HTML 생성 (`output/` 폴더에 생성됨)
   ```bash
   node src/index.js <json경로>
   ```
   로컬 이미지는 780px 폭으로 리사이즈된 뒤 base64로 인코딩되어 HTML에 직접 삽입됨 (파일 하나로 완결, 외부 경로 의존 없음)

   세로 이미지를 가로로 돌리고 싶으면 JSON에서 해당 이미지를 문자열 대신 객체로 지정:
   ```json
   { "src": "img/S-GADA-HEART-002/product-1.jpg", "rotate": 90 }
   ```

3. (선택) HTML → PDF / PNG 변환 (같은 폴더에 동일한 이름으로 생성됨)
   ```bash
   node src/toPdf.js <html경로>   # 내용 전체 높이를 한 장으로 출력 (A4 분할 없음)
   node src/toPng.js <html경로>   # 전체 페이지 스크린샷, 2배 해상도
   ```

## 의존성

- `sharp` — 이미지 리사이즈/회전
- `puppeteer` — HTML → PDF/PNG 렌더링 (헤드리스 Chrome 포함, 설치 용량 큼)

Node 23 기준, ESM(`type: module`) 프로젝트입니다.
