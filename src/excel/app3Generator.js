/**
 * Генератор Excel для «Неофіційний Додаток 3» (форми 680–6895)
 * ДП "ОК "Укрвуглереструктуризація", ЄДРПОУ 39244432
 *
 * Структура аркушів: 680, 681, 682, 683, 684, 688, 689, 6895, Перевірка
 */

const ExcelJS = require('exceljs');
const { app3Suite } = require('../calc/app3Template');
const {
  thinBorder,
  headerFill,
  subtotalFill,
  fontRegular,
  fontBold,
  fontTitle
} = require('./styles');

// Реквізити підприємства (ті самі, що й Додаток 2)
const enterpriseInfo = {
  name: 'ДП "ОК "Укрвуглереструктуризація"',
  edrpou: '39244432',
  kopfh: '140',
  skodu: '00018',
  kved: '05.10',
  industry: 'Вугільна промисловість',
  unit: 'тис. грн',
  stateShare: '100%',
  staffCount: 67,
  location: 'м. Київ, вул. Б. Хмельницького, 4',
  phone: '+380 (44) 235-00-00',
  standards: 'П(с)БОУ',
  director: 'Керівник підприємства'
};

// Назви форм для заголовка
const FORM_TITLES = {
  '680': 'ЗВІТ ПРО ВИКОНАННЯ ФІНАНСОВОГО ПЛАНУ ПІДПРИЄМСТВА',
  '681': '3. Формування фінансових результатів',
  '682': 'II. Розрахунки з бюджетом та позабюджетними фондами',
  '683': 'III. Рух грошових коштів',
  '684': 'IV. Капітальні інвестиції',
  '688': 'VI. Джерела капітальних інвестицій',
  '689': '2. Інформація про бізнес підприємства (розшифровки)',
  '6895': 'VII. Персонал та оплата праці'
};

/**
 * Встановлення заголовкової шапки аркуша Додатку 3
 */
function setupApp3Header(ws, formCode, formTitle) {
  ws.views = [{ showGridLines: true }];

  // Примітка справа (неофіційний документ)
  ws.getCell('E1').value = 'Неофіційний Додаток 3';
  ws.getCell('E2').value = 'Чернетка виконання фінансового плану';
  ws.getCell('E3').value = enterpriseInfo.name;
  for (let r = 1; r <= 3; r++) {
    ws.getCell(`E${r}`).font = { ...fontRegular, italic: true, color: { argb: 'FF888888' } };
  }

  // Реквізити підприємства
  const meta = [
    ['Підприємство:', enterpriseInfo.name, '', 'за ЄДРПОУ', enterpriseInfo.edrpou],
    ['Організаційно-правова форма:', 'Державне підприємство', '', 'за КОПФГ', enterpriseInfo.kopfh],
    ["Суб'єкт управління:", 'Міністерство енергетики України', '', 'за СКОДУ', enterpriseInfo.skodu],
    ['Вид економічної діяльності:', "Добування кам'яного вугілля", '', 'за КВЕД', enterpriseInfo.kved],
    ['Галузь:', enterpriseInfo.industry, '', '', ''],
    ['Одиниця виміру, тис. грн', '', '', '', ''],
    ['Розмір державної частки:', enterpriseInfo.stateShare, '', '', ''],
    ['Середньооблікова кількість штатних працівників:', enterpriseInfo.staffCount, '', '', ''],
    ['Місцезнаходження:', enterpriseInfo.location, '', '', ''],
    ['Телефон:', enterpriseInfo.phone, '', 'Стандарти звітності:', enterpriseInfo.standards]
  ];

  meta.forEach((rowValues, idx) => {
    const rowNum = 5 + idx;
    rowValues.forEach((val, colIdx) => {
      if (val !== '') {
        const cell = ws.getRow(rowNum).getCell(colIdx + 1);
        cell.value = val;
        if (colIdx === 1 || colIdx === 4) cell.font = fontBold;
        else cell.font = fontRegular;
      }
    });
  });

  // Заголовок форми
  ws.getCell('A16').value = formTitle;
  ws.getCell('A16').font = fontTitle;
  ws.getCell('A17').value = 'за 2026 рік (квартал, рік)';
  ws.getCell('A17').font = fontBold;
}

/**
 * Ширина стовпців та 8-колонкова шапка таблиці
 * Form 681 has 9 columns (з Примітками)
 */
function setup8ColTableHead(ws, startRow = 19, hasNotes = false) {
  ws.getRow(startRow).values = [
    'Найменування показника',
    'Код рядка',
    'Факт наростаючим підсумком з початку року',
    '',
    'Звітний період (квартал, рік)',
    '',
    '',
    '',
    ...(hasNotes ? ['Примітки / Джерело'] : [])
  ];

  ws.getRow(startRow + 1).values = [
    '',
    '',
    'минулий рік',
    'поточний рік',
    'план I кв.',
    'план II кв.',
    'план III кв.',
    'план IV кв.',
    ...(hasNotes ? [''] : [])
  ];

  ws.getRow(startRow + 2).values = ['1', '2', '3', '4', '5', '6', '7', '8', ...(hasNotes ? ['9'] : [])];

  for (let r = startRow; r <= startRow + 2; r++) {
    const row = ws.getRow(r);
    row.font = fontBold;
    row.fill = headerFill;
    row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  }

  const cols = [
    { width: 52 }, // A: Назва
    { width: 12 }, // B: Код
    { width: 16 }, // C: Факт мин. рік
    { width: 16 }, // D: Факт поточ. рік
    { width: 15 }, // E: I кв.
    { width: 15 }, // F: II кв.
    { width: 15 }, // G: III кв.
    { width: 15 }, // H: IV кв.
  ];
  if (hasNotes) cols.push({ width: 28 }); // I: Примітки
  ws.columns = cols;

  return startRow + 3; // Перший рядок даних
}

/**
 * Перевірка чи рядок є "сміттям" CSV-парсера (заголовок таблиці)
 */
function isGarbageRow(item) {
  return item.code === 'ка' ||
    item.priorYear === 'минулий' ||
    item.currentYear === 'поточний';
}

/**
 * Числовий формат для звичайних рядків
 */
function numFmt(code) {
  // Коефіцієнти (5010–5040): 4 знаки після коми
  const coeffCodes = ['5010','5011','5012','5013','5014','5015','5020','5021','5030','5031','5040'];
  return coeffCodes.includes(String(code)) ? '0.0000' : '#,##0';
}

/**
 * Додати рядок підпису директора
 */
function appendDirectorSign(ws) {
  ws.addRow([]);
  const signRow = ws.addRow([
    'Керівник',
    '______________________________',
    '(підпис)',
    '______________________________',
    enterpriseInfo.director
  ]);
  signRow.font = fontBold;
}

/**
 * Об'єднати розбитий заголовок з наступним рядком даних.
 * В CSV-парсері довгі назви іноді розбивались: isHeader рядок з першою частиною,
 * і потім data-рядок з другою частиною. Ця функція злипає їх.
 */
function mergeHeaderContinuations(rows) {
  const result = [];
  let i = 0;
  while (i < rows.length) {
    const curr = rows[i];
    const next = rows[i + 1];
    // Якщо поточний — isHeader, а наступний — data-рядок (має code і !isHeader)
    if (curr.isHeader && next && !next.isHeader && next.code && next.code !== 'ка') {
      // Перевіримо: якщо name поточного схоже на "початок речення" для next.name
      // (наприклад, "Чистий дохiд вiд реалiзацiї" + "продукцiї (товарiв, робiт, послуг)")
      const merged = { ...next, name: curr.name + ' ' + next.name };
      result.push(merged);
      i += 2;
    } else {
      result.push(curr);
      i++;
    }
  }
  return result;
}

/**
 * Додати дані одного аркуша форми
 */
function buildFormSheet(wb, formKey, suiteData) {
  const formTitle = FORM_TITLES[formKey] || `Форма ${formKey}`;
  const hasNotes = formKey === '681'; // Тільки ф.681 має стовпець Примітки

  const ws = wb.addWorksheet(formKey);
  setupApp3Header(ws, formKey, formTitle);
  let curRow = setup8ColTableHead(ws, 19, hasNotes);

  const colCount = hasNotes ? 9 : 8;

  // Беремо рядки з app3Suite або з suiteData (якщо є override)
  const rawRows = app3Suite[formKey] || [];

  // Злиття розбитих рядків
  const mergedRows = mergeHeaderContinuations(rawRows);

  mergedRows.forEach(item => {
    // Пропускаємо сміттєві рядки
    if (isGarbageRow(item)) return;

    if (item.isHeader) {
      // Секційний заголовок
      const row = ws.addRow([item.name]);
      row.font = fontBold;
      row.fill = subtotalFill;
      const cell = ws.getCell(`A${curRow}`);
      ws.mergeCells(`A${curRow}:${String.fromCharCode(64 + colCount)}${curRow}`);
      cell.font = fontBold;
      cell.fill = subtotalFill;
      cell.border = thinBorder;
      curRow++;
      return;
    }

    if (!item.code) return; // Пропускаємо порожні рядки без коду

    // Перевіряємо чи є реальне число (або live-дані з suiteData)
    const liveForm = (suiteData && suiteData[formKey]) ? suiteData[formKey] : null;
    const code = String(item.code);

    const priorYear = liveForm && liveForm[code + '_prior'] !== undefined
      ? liveForm[code + '_prior']
      : (typeof item.priorYear === 'number' ? item.priorYear : 0);

    const currentYear = liveForm && liveForm[code] !== undefined
      ? liveForm[code]
      : (typeof item.currentYear === 'number' ? item.currentYear : 0);

    const q1 = liveForm && liveForm[code + '_q1'] !== undefined
      ? liveForm[code + '_q1']
      : (typeof item.q1 === 'number' ? item.q1 : 0);

    const q2 = liveForm && liveForm[code + '_q2'] !== undefined
      ? liveForm[code + '_q2']
      : (typeof item.q2 === 'number' ? item.q2 : 0);

    const q3 = liveForm && liveForm[code + '_q3'] !== undefined
      ? liveForm[code + '_q3']
      : (typeof item.q3 === 'number' ? item.q3 : 0);

    const q4 = liveForm && liveForm[code + '_q4'] !== undefined
      ? liveForm[code + '_q4']
      : (typeof item.q4 === 'number' ? item.q4 : 0);

    const notes = item.notes || '';
    const fmt = numFmt(code);

    const rowValues = [
      item.name,
      item.code,
      priorYear,
      currentYear,
      q1,
      q2,
      q3,
      q4,
      ...(hasNotes ? [notes] : [])
    ];

    const row = ws.addRow(rowValues);
    row.font = fontRegular;
    row.alignment = { vertical: 'middle', wrapText: true };

    // Форматування числових стовпців C–H
    for (let c = 3; c <= 8; c++) {
      const cell = row.getCell(c);
      cell.numFmt = fmt;
      cell.alignment = { horizontal: 'right' };
      cell.border = thinBorder;
    }

    // Код рядка — центр, моноширинний
    const codeCell = row.getCell(2);
    codeCell.alignment = { horizontal: 'center' };
    codeCell.border = thinBorder;
    codeCell.font = { ...fontRegular, name: 'Courier New' };

    // Назва — лівий вирівнювання
    const nameCell = row.getCell(1);
    nameCell.border = thinBorder;

    // Примітки (тільки для ф.681)
    if (hasNotes) {
      const noteCell = row.getCell(9);
      noteCell.font = { ...fontRegular, color: { argb: 'FF666666' } };
      noteCell.alignment = { wrapText: true };
      noteCell.border = thinBorder;
    }

    curRow++;
  });

  appendDirectorSign(ws);
  return ws;
}

/**
 * Аркуш перевірки (Перевірка)
 */
function buildCheckSheet(wb) {
  const ws = wb.addWorksheet('Перевірка');
  ws.views = [{ showGridLines: true }];

  ws.getCell('A1').value = 'Перевірка контрольних співвідношень (Неофіційний Додаток 3)';
  ws.getCell('A1').font = fontTitle;

  const checks = [
    { desc: 'Форма 680: EBITDA (р.1300) = Чистий прибуток (р.1200) + Амортизація', formA: '680', codeA: '1300', formB: '680', codeB: '1200' },
    { desc: 'Форма 680: Доходи - Витрати = Чистий прибуток', note: 'Перевірити вручну за формою 681' },
    { desc: 'Форма 683: Залишок на кінець = Залишок на початок + Зміна', note: 'Рух коштів ф.683 vs рядки 3500, 3400' },
    { desc: 'Форма 6895: Сума підрозділів = Загальна кількість персоналу', note: 'Ф.6895 р.10 = р.11 + р.12 + р.13' }
  ];

  let r = 3;
  checks.forEach(c => {
    ws.getCell(`A${r}`).value = c.desc;
    ws.getCell(`B${r}`).value = c.note || 'Автоматично';
    ws.getCell(`A${r}`).font = fontRegular;
    ws.getCell(`B${r}`).font = { ...fontRegular, color: { argb: 'FF666666' } };
    r++;
  });

  ws.columns = [{ width: 70 }, { width: 35 }];
  return ws;
}

/**
 * Головна функція: генерація повної книги Excel Додатку 3
 * @param {Object} suiteData — Live-дані по формах {680: {...}, 681: {...}, ...}
 * @returns {Buffer} xlsx buffer
 */
async function generateApp3Workbook(suiteData = {}) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'FP 2025 Studio';
  wb.created = new Date();
  wb.title = 'Неофіційний Додаток 3 — Чернетка виконання фінансового плану';
  wb.company = enterpriseInfo.name;

  const formKeys = ['680', '681', '682', '683', '684', '688', '689', '6895'];

  for (const key of formKeys) {
    buildFormSheet(wb, key, suiteData);
  }

  buildCheckSheet(wb);

  return await wb.xlsx.writeBuffer();
}

module.exports = { generateApp3Workbook };

