# План реалізації: Автоматизація виконання фінансового плану (FP 2025)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Створити локальний автономний інструмент з інтерактивним дашбордом для парсингу квартальних PDF-сканів бухгалтерії ДП "ОК "Укрвуглереструктуризація", автоматичного розрахунку дельт, аналітичних коефіцієнтів та генерації повної 10-аркушної книги Excel (`Звіт_Викон_Фін_Пл...xlsx`).

**Architecture:** Локальний бекенд на Node.js забезпечує парсинг PDF-таблиць, локальне збереження періодів у `data/` та формування Excel-книг через `ExcelJS`. Фронтенд — єдиний інтерактивний дашборд у браузері зі Split-View (оригінальний скан PDF ліворуч, розпізнана таблиця з 10-ма вкладками праворуч, валідацією контрольних сум та кнопкою миттєвого експорту).

**Tech Stack:** Node.js (v26+), Express, pdf-parse / pdf2json, ExcelJS, Vanilla JS / CSS3 (Dark/Light responsive theme).

**Spec:** [docs/superpowers/specs/2026-10-27-finplan-automation-design.md](file:///r:/Скани/2022/2022_05_04/FP%202025/docs/superpowers/specs/2026-10-27-finplan-automation-design.md)

## Global Constraints

- Працювати виключно всередині робочого простору `r:\Скани\2022\2022_05_04\FP 2025`.
- Усі скрипти, сервери та процеси повинні запускатися локально без зовнішніх хмарних залежностей.
- Вихідний файл Excel повинен містити рівно 10 аркушів: `580`, `581`, `582`, `583`, `584`, `588`, `589`, `5895`, `Дані_ПДФ`, `Перевірка`.
- Формули підсумків та контрольних співвідношень повинні зберігатися як живі формули Excel (`SUM`, віднімання, ділення), а не як статичний текст.

## Review Focus

1. **Нечітко відсканований рядок:** система не повинна ламатися при пропуску або спотворенні тексту — рядок підсвічується жовтим, надається можливість відредагувати суму прямо у веб-таблиці.
2. **Перехід між роками (4 квартал $\to$ 1 квартал):** у 1 кварталі наростаючий підсумок дорівнює факту 1 кварталу, а в 4 кварталі дельта $Q_4 = \text{Рік} - (Q_1 + Q_2 + Q_3)$.
3. **Від'ємні суми (збитки, дужки `(14 187)`):** коректне перетворення бухгалтерських дужок на від'ємні числа (`-14187`) для розрахунків EBITDA та балансу.
4. **Розбіжність балансу:** аркуш `Перевірка` зобов'язаний виводити чітку різницю `Активи - Пасиви` та статус `OK` / `ERROR`.
5. **Пусті форми (584, 588):** генерація коректних нулів та формул у рядках 4000 (інвестиції) та 10 (джерела), без помилок `#ЗНАЧ!`.

---

### Task 1: Базова структура проєкту та сховище даних

**Files:**
- Create: `package.json`
- Create: `src/storage/periodStore.js`
- Create: `tests/storage.test.js`

**Interfaces:**
- Consumes: Node.js fs / path.
- Produces: `savePeriodData(year, quarter, data)`, `getPeriodData(year, quarter)`, `getAllPeriods()`.

- [ ] **Step 1: Write test for periodStore**
```javascript
const assert = require('assert');
const { savePeriodData, getPeriodData } = require('../src/storage/periodStore');

const sample = { 'f1_1300': 65264, 'f1_1900': 65264 };
savePeriodData(2026, 3, sample);
const loaded = getPeriodData(2026, 3);
assert.strictEqual(loaded['f1_1300'], 65264);
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/storage.test.js`  
Expected: Error (module not found).

- [ ] **Step 3: Implement `periodStore.js` and initialize `package.json`**
Setup minimal dependencies (`express`, `exceljs`, `pdf-parse`) and write atomic JSON file reader/writer under `data/periods/`.

- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/storage.test.js`  
Expected: Process exits with 0.

- [ ] **Step 5: Commit**

---

### Task 2: Модуль парсингу та екстракції форм з PDF

**Files:**
- Create: `src/parser/pdfExtractor.js`
- Create: `src/parser/formSignatures.js`
- Create: `tests/parser.test.js`

**Interfaces:**
- Consumes: PDF Buffer / file path (`3квЛМ001.pdf`).
- Produces: `extractFinancialReport(pdfBuffer) -> { forms: { 'f1': {...}, 'f2': {...}, 'f3': {...}, '1956': {...}, '1704': {...}, '6220': {...}, '8210': {...}, '1633': {...} } }`.

- [ ] **Step 1: Write test for PDF extraction signatures**
```javascript
const assert = require('assert');
const { identifyFormType } = require('../src/parser/formSignatures');

assert.strictEqual(identifyFormType('Баланс (Звіт про фінансовий стан) Форма №1'), 'f1');
assert.strictEqual(identifyFormType('Звіт про фінансові результати Форма №2'), 'f2');
assert.strictEqual(identifyFormType('Код форми 1956'), '1956');
assert.strictEqual(identifyFormType('Код форми 1704'), '1704');
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/parser.test.js`  
Expected: FAIL.

- [ ] **Step 3: Implement `formSignatures.js` and `pdfExtractor.js`**
Regex and coordinate/line based parser to extract rows, codes, column numbers and parse accounting numbers with brackets `(14 187)` -> `-14187`.

- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/parser.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

---

### Task 3: Розрахунковий двигун (мапінг, квартальні дельти, коефіцієнти)

**Files:**
- Create: `src/calc/mappingMatrix.js`
- Create: `src/calc/deltaCalculator.js`
- Create: `src/calc/ratiosCalculator.js`
- Create: `tests/calc.test.js`

**Interfaces:**
- Consumes: Extracted current period data + historical quarters from `periodStore`.
- Produces: `computeFinPlanSuite(currentRaw, priorQuartersHistory) -> { form580, form581, form582, form583, form584, form588, form589, form5895, validation }`.

- [ ] **Step 1: Write test for quarterly delta and EBITDA**
```javascript
const assert = require('assert');
const { calculateQuarterDelta, calculateEBITDA } = require('../src/calc/deltaCalculator');

// Q4 = Year (151072) - Q1(48834) - Q2(59443) - Q3(42795)
const delta = calculateQuarterDelta(151072, [48834, 59443, 42795]);
assert.strictEqual(delta, 0); // Exact cumulative parity check

const ebitda = calculateEBITDA(-16036, 558); // ряд. 1100 + ряд. 1430
assert.strictEqual(ebitda, -15478);
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/calc.test.js`  
Expected: FAIL.

- [ ] **Step 3: Implement mapping matrix for all 8 forms + validation checks**
Implement exact rules from design doc:
- ф.581: рядки 1070, 1080, 1100, 1200, 1300, 1400-1450
- ф.582: рядки 1200, 2000, 2009, 2070, 2110-2134
- ф.583: рядки 3000-3415
- ф.589: рядки 1073, 1086, 1152, 1162, 3041
- ф.5895: персонал і зарплата
- ф.580: зведена + коефіцієнти (5011, 5014, 5015, 5020, 5022, 5030)
- ф.584 та ф.588: шаблони інвестицій

- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/calc.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

---

### Task 4: Генератор книги Excel (10 аркушів) через ExcelJS

**Files:**
- Create: `src/excel/excelGenerator.js`
- Create: `src/excel/styles.js`
- Create: `tests/excel.test.js`

**Interfaces:**
- Consumes: Calculated suite object from Task 3.
- Produces: `generateFinPlanWorkbook(suiteData) -> Promise<Buffer>` (Excel file with sheets: `580`, `581`, `582`, `583`, `584`, `588`, `589`, `5895`, `Дані_ПДФ`, `Перевірка`).

- [ ] **Step 1: Write test checking sheet names and formulas**
```javascript
const assert = require('assert');
const ExcelJS = require('exceljs');
const { generateFinPlanWorkbook } = require('../src/excel/excelGenerator');

async function testWorkbook() {
  const buffer = await generateFinPlanWorkbook({ ... });
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  const expectedSheets = ['580', '581', '582', '583', '584', '588', '589', '5895', 'Дані_ПДФ', 'Перевірка'];
  assert.strictEqual(wb.worksheets.length, 10);
  expectedSheets.forEach(name => assert(wb.getWorksheet(name), `Sheet ${name} missing`));
}
testWorkbook();
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node tests/excel.test.js`  
Expected: FAIL.

- [ ] **Step 3: Implement `excelGenerator.js` with styles and formulas**
Build complete layout replicating the user's Excel screenshots, including borders, fonts (Calibri/Arial), bold totals, and Excel formulas (`=SUM(E18:E25)`, `=C17-SUM(E17:G17)`).

- [ ] **Step 4: Run test to verify it passes**
Run: `node tests/excel.test.js`  
Expected: PASS.

- [ ] **Step 5: Commit**

---

### Task 5: Веб-інтерфейс єдиного дашборду (Single Dashboard Web UI)

**Files:**
- Create: `public/index.html`
- Create: `public/app.js`
- Create: `public/styles.css`
- Create: `src/server.js`

**Interfaces:**
- Consumes: REST endpoints:
  - `POST /api/upload-pdf` (multipart upload)
  - `GET /api/periods`
  - `POST /api/recalculate` (updates editable cells in memory)
  - `GET /api/export-excel` (downloads `.xlsx`)
- Produces: Responsive browser application with PDF preview and 10-tab editor.

- [ ] **Step 1: Implement Express API server**
Write `src/server.js` exposing upload, calculation, and export routes.

- [ ] **Step 2: Implement frontend Single Dashboard**
Implement dual-pane layout:
- Left pane: PDF.js renderer with page switcher and zoom.
- Right pane: 10 navigation tabs matching the Excel workbook, live editable table cells, green/red audit status badges.
- Download button for instant Excel export.

- [ ] **Step 3: Verify server startup and route responses**
Run: `node src/server.js`  
Check: `GET /api/periods` returns 200 OK.

- [ ] **Step 4: Commit**

---

### Task 6: Наскрізне тестування та валідація на реальному скані `3квЛМ001.pdf`

**Files:**
- Test file: `tests/e2e.test.js`
- Scripts: `scripts/start.js`

**Interfaces:**
- End-to-end integration test with user's provided 23-page PDF.

- [ ] **Step 1: Ingest sample data from `3квЛМ001.pdf`**
Extract all 23 pages, populate forms 580, 581, 582, 583, 589, 5895.
- [ ] **Step 2: Verify calculated values against user's Excel screenshots**
Assert:
- ф. 580 EBITDA = `-15478`
- ф. 581 ряд. 1070 = `151072`, ряд. 1080 = `167108`
- ф. 582 ряд. 2000 = `-68316`, ряд. 2070 = `-82503`
- ф. 583 ряд. 3000 = `153176`, ряд. 3100 = `-152488`, ряд. 3400 = `688`
- ф. 5895 штат = `67`
- Аркуш `Перевірка` = 0 розбіжностей.
- [ ] **Step 3: Verify generated Excel file opens and formulas evaluate correctly**
Run automated workbook validation script.
- [ ] **Step 4: Document one-click start command in README**
Add `npm start` command instructions.
- [ ] **Step 5: Final Commit**
