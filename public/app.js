// =====================================================
//  FP-2025 Studio — app.js
//  Multi-column quarter view + editable cells + PDF navigation
// =====================================================

// ---- State ----
let currentYear = 2026;
let currentTab = '580';

// activeMode: 'year' | 'q1' | 'q2' | 'q3' | 'q4'
// 'year'  → columns: Q1 | Q2 | Q3 | Q4 | Рік
// 'q1'    → columns: Q1 | Рік
// 'q2'    → columns: Q1 | Q2 | Рік
// 'q3'    → columns: Q1 | Q2 | Q3 | Рік
// 'q4'    → columns: Q1 | Q2 | Q3 | Q4 | Рік  (same as year)
let activeMode = 'year';

// Edits: { 'q1|580|netProfit': -685, ... }
const userEdits = {};

// ---- PDF state ----
let pdfDoc = null;
let pdfCurrentPage = 1;
let pdfTotalPages = 0;
let pdfjsLib = null;
let pdfScale = 1.4;
let pdfRenderTask = null;

// =====================================================
//  COLUMN DEFINITIONS per mode
// =====================================================
const MODES = {
  year: ['q1','q2','q3','q4','year'],
  q1:   ['q1','year'],
  q2:   ['q1','q2','year'],
  q3:   ['q1','q2','q3','year'],
  q4:   ['q1','q2','q3','q4','year']
};

const COL_LABELS = {
  q1:   '1 квартал',
  q2:   '2 квартал',
  q3:   '3 квартал',
  q4:   '4 квартал (Δ)',
  year: 'Рік (факт)'
};

const COL_CLASS = {
  q1: 'col-q1', q2: 'col-q2', q3: 'col-q3', q4: 'col-q4', year: 'col-year'
};

function getModeLabel(mode) {
  const map = {
    year: 'Рік — всі квартали',
    q1: 'I квартал + Рік',
    q2: 'I + II квартали + Рік',
    q3: 'I + II + III квартали + Рік',
    q4: 'Всі квартали + Рік'
  };
  return map[mode] || mode;
}

// =====================================================
//  DEMO DATA
// =====================================================
const demoData = {
  q1: {
    '580': { ebitda:-1976, netProfit:-685, totalAssets:68090, nonCurrentAssets:65094, currentAssets:2996, cash:292, equity:-49577, longTermLiab:22375, currentLiab:95292, tradePayables:50000, budgetPayables:3000, ratios:{ opCostProfitability:-0.0423, roe:0.0138, roa:-0.0101, financialStability:-0.4213, currentLiquidity:0.0314 } },
    '581': { opIncome:48834, opCosts:50997, opProfit:-2163, netProfit:-685, ebitda:-1976, matCosts:193, rawMat:88, energyMat:105, laborCosts:3861, socialCosts:765, depreciation:187, otherOpCosts:45991, totalElements:50997 },
    '582': { netProfit:-685, retainedLossStart:-68316, retainedLossEnd:-69001, totalTaxesPaid:934, vatPaid:0, pdfoPaid:731, otherTaxesPaid:203, esvPaid:832, totalStatePayments:1766 },
    '583': { cfInOperating:47480, cfTargetFin:47350, cfBudgetFin:47350, cfOutOperating:-47378, cfNetOperating:102, cfStart:190, cfEnd:292 },
    '584': { capInvestTotal:0, construction:0, fixedAssetsBuy:0, modernization:0, capRepair:0 },
    '588': { sourcesTotal:0, creditFunds:0, budgetFinancing:0, ownFunds:0, otherSources:0 },
    '589': { otherOpIncome:48834, budgetFin2610:47441, otherOpExpenses:50997, budgetCosts2610:47046 },
    '5895': { staffCount:67, managerCount:1, aupCount:45, workersCount:21, laborCosts:3861 },
    _validation: { balanceCheck:{assets:68090,liabEq:68090,diff:0}, cashCheck:{start:190,net:102,end:292,diff:0}, retLoss:{start:-68316,np:-685,end:-69001,diff:0} }
  },
  q2: {
    '580': { ebitda:-3984, netProfit:-3984, totalAssets:68360, nonCurrentAssets:64907, currentAssets:3453, cash:873, equity:-53635, longTermLiab:22256, currentLiab:99739, tradePayables:52000, budgetPayables:3200, ratios:{ opCostProfitability:-0.0656, roe:0.0743, roa:-0.0583, financialStability:-0.4396, currentLiquidity:0.0346 } },
    '581': { opIncome:59443, opCosts:63614, opProfit:-4171, netProfit:-3984, ebitda:-3984, matCosts:945, rawMat:124, energyMat:821, laborCosts:4165, socialCosts:849, depreciation:187, otherOpCosts:57468, totalElements:63614 },
    '582': { netProfit:-3984, retainedLossStart:-69001, retainedLossEnd:-72985, totalTaxesPaid:954, vatPaid:1, pdfoPaid:746, otherTaxesPaid:207, esvPaid:849, totalStatePayments:1803 },
    '583': { cfInOperating:60383, cfTargetFin:59783, cfBudgetFin:58750, cfOutOperating:-59802, cfNetOperating:581, cfStart:292, cfEnd:873 },
    '584': { capInvestTotal:0, construction:0, fixedAssetsBuy:0, modernization:0, capRepair:0 },
    '588': { sourcesTotal:0, creditFunds:0, budgetFinancing:0, ownFunds:0, otherSources:0 },
    '589': { otherOpIncome:59443, budgetFin2610:58869, otherOpExpenses:63614, budgetCosts2610:58870 },
    '5895': { staffCount:66, managerCount:1, aupCount:44, workersCount:21, laborCosts:4165 },
    _validation: { balanceCheck:{assets:68360,liabEq:68360,diff:0}, cashCheck:{start:292,net:581,end:873,diff:0}, retLoss:{start:-69001,np:-3984,end:-72985,diff:0} }
  },
  q3: {
    '580': { ebitda:-9518, netProfit:-9518, totalAssets:65264, nonCurrentAssets:61890, currentAssets:3374, cash:878, equity:-63223, longTermLiab:22170, currentLiab:106317, tradePayables:55365, budgetPayables:3869, ratios:{ opCostProfitability:-0.1753, roe:0.1505, roa:-0.1458, financialStability:-0.4921, currentLiquidity:0.0300 } },
    '581': { opIncome:42795, opCosts:52497, opProfit:-9702, netProfit:-9518, ebitda:-9518, matCosts:328, rawMat:-46, energyMat:374, laborCosts:3960, socialCosts:859, depreciation:184, otherOpCosts:47166, totalElements:52497 },
    '582': { netProfit:-9518, retainedLossStart:-72985, retainedLossEnd:-82503, totalTaxesPaid:971, vatPaid:2, pdfoPaid:758, otherTaxesPaid:211, esvPaid:859, totalStatePayments:1830 },
    '583': { cfInOperating:45313, cfTargetFin:45288, cfBudgetFin:42046, cfOutOperating:-45308, cfNetOperating:5, cfStart:873, cfEnd:878 },
    '584': { capInvestTotal:0, construction:0, fixedAssetsBuy:0, modernization:0, capRepair:0 },
    '588': { sourcesTotal:0, creditFunds:0, budgetFinancing:0, ownFunds:0, otherSources:0 },
    '589': { otherOpIncome:42795, budgetFin2610:42132, otherOpExpenses:52497, budgetCosts2610:42128 },
    '5895': { staffCount:67, managerCount:1, aupCount:45, workersCount:21, laborCosts:3960 },
    _validation: { balanceCheck:{assets:65264,liabEq:65264,diff:0}, cashCheck:{start:873,net:5,end:878,diff:0}, retLoss:{start:-72985,np:-9518,end:-82503,diff:0} }
  },
  q4: {
    '580': { ebitda:0, netProfit:0, totalAssets:0, nonCurrentAssets:0, currentAssets:0, cash:0, equity:0, longTermLiab:0, currentLiab:0, tradePayables:0, budgetPayables:0, ratios:{ opCostProfitability:0, roe:0, roa:0, financialStability:0, currentLiquidity:0 } },
    '581': { opIncome:0, opCosts:0, opProfit:0, netProfit:0, ebitda:0, matCosts:0, rawMat:0, energyMat:0, laborCosts:0, socialCosts:0, depreciation:0, otherOpCosts:0, totalElements:0 },
    '582': { netProfit:0, retainedLossStart:0, retainedLossEnd:0, totalTaxesPaid:0, vatPaid:0, pdfoPaid:0, otherTaxesPaid:0, esvPaid:0, totalStatePayments:0 },
    '583': { cfInOperating:0, cfTargetFin:0, cfBudgetFin:0, cfOutOperating:0, cfNetOperating:0, cfStart:0, cfEnd:0 },
    '584': { capInvestTotal:0, construction:0, fixedAssetsBuy:0, modernization:0, capRepair:0 },
    '588': { sourcesTotal:0, creditFunds:0, budgetFinancing:0, ownFunds:0, otherSources:0 },
    '589': { otherOpIncome:0, budgetFin2610:0, otherOpExpenses:0, budgetCosts2610:0 },
    '5895': { staffCount:0, managerCount:0, aupCount:0, workersCount:0, laborCosts:0 },
    _validation: { balanceCheck:{assets:0,liabEq:0,diff:0}, cashCheck:{start:0,net:0,end:0,diff:0}, retLoss:{start:0,np:0,end:0,diff:0} }
  },
  year: {
    '580': { ebitda:-15478, netProfit:-14187, totalAssets:65264, nonCurrentAssets:61890, currentAssets:3374, cash:878, equity:-63223, longTermLiab:22170, currentLiab:106317, tradePayables:55365, budgetPayables:3869, ratios:{ opCostProfitability:-0.0943, roe:0.2244, roa:-0.2174, financialStability:-0.4921, currentLiquidity:0.0317 } },
    '581': { opIncome:151072, opCosts:167108, opProfit:-16036, netProfit:-14187, ebitda:-15478, matCosts:1466, rawMat:166, energyMat:1300, laborCosts:11986, socialCosts:2473, depreciation:558, otherOpCosts:150625, totalElements:167108 },
    '582': { netProfit:-14187, retainedLossStart:-68316, retainedLossEnd:-82503, totalTaxesPaid:2859, vatPaid:3, pdfoPaid:2235, otherTaxesPaid:621, esvPaid:2540, totalStatePayments:5399 },
    '583': { cfInOperating:153176, cfTargetFin:152421, cfBudgetFin:148146, cfOutOperating:-152488, cfNetOperating:688, cfStart:190, cfEnd:878 },
    '584': { capInvestTotal:0, construction:0, fixedAssetsBuy:0, modernization:0, capRepair:0 },
    '588': { sourcesTotal:0, creditFunds:0, budgetFinancing:0, ownFunds:0, otherSources:0 },
    '589': { otherOpIncome:151072, budgetFin2610:148442, otherOpExpenses:167108, budgetCosts2610:148044 },
    '5895': { staffCount:67, managerCount:1, aupCount:45, workersCount:21, laborCosts:8026 },
    _validation: { balanceCheck:{assets:65264,liabEq:65264,diff:0}, cashCheck:{start:190,net:688,end:878,diff:0}, retLoss:{start:-68316,np:-14187,end:-82503,diff:0} }
  }
};

// Merged live data (replaced when PDF uploaded)
let liveData = JSON.parse(JSON.stringify(demoData));

// =====================================================
//  UTILITY
// =====================================================
function fmt(n) {
  const num = Number(n);
  if (isNaN(num)) return '—';
  if (num < 0) return '(' + Math.abs(num).toLocaleString('uk-UA') + ')';
  return num.toLocaleString('uk-UA');
}

function getVal(period, formKey, field) {
  const key = period + '|' + formKey + '|' + field;
  if (userEdits[key] !== undefined) return userEdits[key];
  return (liveData[period] && liveData[period][formKey] && liveData[period][formKey][field] !== undefined)
    ? liveData[period][formKey][field] : 0;
}

function getRatio(period, field) {
  const key = period + '|580r|' + field;
  if (userEdits[key] !== undefined) return userEdits[key];
  const r = liveData[period] && liveData[period]['580'] && liveData[period]['580'].ratios;
  return r ? (r[field] !== undefined ? r[field] : 0) : 0;
}

// =====================================================
//  TABLE BUILDER — multi-column
// =====================================================

// cols: array of period keys from MODES[activeMode]
function getCols() { return MODES[activeMode]; }

function buildHead(label1, extraCols) {
  // extraCols: [] means no extra cols (for code col)
  const code = extraCols ? `<th style="width:60px">Код</th>` : '';
  const dataCols = getCols().map(c =>
    `<th class="${COL_CLASS[c]}" style="text-align:right;min-width:110px">${COL_LABELS[c]}</th>`
  ).join('');
  return `<thead><tr><th>${label1}</th>${code}${dataCols}</tr></thead>`;
}

function buildRow(label, code, formKey, field, opts = {}) {
  const cols = getCols();
  const isNeg = opts.alwaysRed;
  const isBold = opts.bold;
  const codeCell = `<td style="width:60px;text-align:center;color:var(--text-muted)">${code}</td>`;

  const dataCells = cols.map(period => {
    const val = getVal(period, formKey, field);
    const red = isNeg || val < 0;
    const style = `text-align:right;${red?'color:var(--danger)':''}`;
    const id = `c_${period}_${formKey}_${field}`;
    const content = isBold ? `<strong>${fmt(val)}</strong>` : fmt(val);
    return `<td class="num ${COL_CLASS[period]} editable-cell" id="${id}" style="${style}" data-period="${period}" data-form="${formKey}" data-field="${field}">${content}</td>`;
  }).join('');

  const rowStyle = opts.headerRow ? ' class="header-row"' : '';
  return `<tr${rowStyle}><td${isBold?' style="font-weight:600"':''}>${label}</td>${codeCell}${dataCells}</tr>`;
}

function buildRatioRow(label, code, field) {
  const cols = getCols();
  const codeCell = `<td style="width:60px;text-align:center;color:var(--text-muted)">${code}</td>`;
  const dataCells = cols.map(period => {
    const val = getRatio(period, field);
    const red = val < 0;
    return `<td class="num ${COL_CLASS[period]}" style="text-align:right;${red?'color:var(--danger)':''}">${val}</td>`;
  }).join('');
  return `<tr><td>${label}</td>${codeCell}${dataCells}</tr>`;
}

function buildSectionRow(label) {
  const span = getCols().length + 2;
  return `<tr class="header-row"><td colspan="${span}">${label}</td></tr>`;
}

// =====================================================
//  RENDER ACTIVE TAB
// =====================================================
function renderActiveTab() {
  const container = document.getElementById('tabContentArea');
  if (!container) return;

  let html = '';

  if (currentTab === '580') {
    html = `<table class="fin-table">
      ${buildHead('Показник форми 580', true)}
      <tbody>
        ${buildSectionRow('I. Формування фінансових результатів')}
        ${buildRow('EBITDA', '1300', '580', 'ebitda')}
        ${buildRow('Чистий фінансовий результат', '1200', '580', 'netProfit')}
        ${buildSectionRow('IV. Коефіцієнтний аналіз')}
        ${buildRatioRow('Рентабельність операційних витрат', '5011', 'opCostProfitability')}
        ${buildRatioRow('Рентабельність власного капіталу (ROE)', '5014', 'roe')}
        ${buildRatioRow('Рентабельність активів (ROA)', '5015', 'roa')}
        ${buildRatioRow('Коефіцієнт фінансової стійкості', '5020', 'financialStability')}
        ${buildRatioRow('Коефіцієнт поточної ліквідності', '5030', 'currentLiquidity')}
        ${buildSectionRow('V. Звіт про фінансовий стан (Баланс)')}
        ${buildRow('Необоротні активи, усього', '6000', '580', 'nonCurrentAssets')}
        ${buildRow('Оборотні активи, усього', '6010', '580', 'currentAssets')}
        ${buildRow('Усього активи (Баланс)', '6020', '580', 'totalAssets', {bold:true})}
        ${buildRow("Довгострокові зобов'язання", '6030', '580', 'longTermLiab')}
        ${buildRow('Поточні зобов\'язання', '6040', '580', 'currentLiab')}
        ${buildRow('Власний капітал', '6080', '580', 'equity', {bold:true})}
      </tbody>
    </table>`;

  } else if (currentTab === '581') {
    html = `<table class="fin-table">
      ${buildHead('Показник форми 581', true)}
      <tbody>
        ${buildRow('Інші операційні доходи', '1070', '581', 'opIncome')}
        ${buildRow('Інші операційні витрати', '1080', '581', 'opCosts')}
        ${buildRow('Фінрезультат від операційної діяльності', '1100', '581', 'opProfit')}
        ${buildRow('Чистий збиток', '1200', '581', 'netProfit')}
        ${buildRow('EBITDA', '1300', '581', 'ebitda', {bold:true})}
        ${buildSectionRow('Елементи операційних витрат')}
        ${buildRow('Матеріальні витрати', '1400', '581', 'matCosts')}
        ${buildRow('- сировина та матеріали', '1401', '581', 'rawMat')}
        ${buildRow('- паливо та енергія', '1402', '581', 'energyMat')}
        ${buildRow('Витрати на оплату праці', '1410', '581', 'laborCosts')}
        ${buildRow('Відрахування на соціальні заходи', '1420', '581', 'socialCosts')}
        ${buildRow('Амортизація', '1430', '581', 'depreciation')}
        ${buildRow('Інші операційні витрати', '1440', '581', 'otherOpCosts')}
        ${buildRow('Разом елементів', '1450', '581', 'totalElements', {bold:true, headerRow:true})}
      </tbody>
    </table>`;

  } else if (currentTab === '582') {
    html = `<table class="fin-table">
      ${buildHead('Показник форми 582', true)}
      <tbody>
        ${buildSectionRow('Розподіл чистого прибутку')}
        ${buildRow('Чистий збиток', '1200', '582', 'netProfit')}
        ${buildRow('Залишок збитку на початок', '2000', '582', 'retainedLossStart')}
        ${buildRow('Залишок збитку на кінець', '2070', '582', 'retainedLossEnd')}
        ${buildSectionRow('Сплата податків і зборів до Держбюджету')}
        ${buildRow('Податкові платежі, усього', '2110', '582', 'totalTaxesPaid')}
        ${buildRow('- ПДВ', '2112', '582', 'vatPaid')}
        ${buildRow('- ПДФО', '2117', '582', 'pdfoPaid')}
        ${buildRow('- Військовий збір + екоподаток', '2118', '582', 'otherTaxesPaid')}
        ${buildRow('Єдиний соціальний внесок (ЄСВ)', '2134', '582', 'esvPaid')}
        ${buildRow('Усього виплат на користь держави', '2200', '582', 'totalStatePayments', {bold:true, headerRow:true})}
      </tbody>
    </table>`;

  } else if (currentTab === '583') {
    html = `<table class="fin-table">
      ${buildHead('Показник форми 583 (Рух грошових коштів)', true)}
      <tbody>
        ${buildRow('Надходження від операційної діяльності', '3000', '583', 'cfInOperating')}
        ${buildRow('Цільове фінансування', '3040', '583', 'cfTargetFin')}
        ${buildRow('- бюджетне (КЕКВ 2610)', '3041', '583', 'cfBudgetFin')}
        ${buildRow('Витрачання грошових коштів', '3100', '583', 'cfOutOperating')}
        ${buildRow('Чистий рух коштів від опер. діяльності', '3195', '583', 'cfNetOperating', {bold:true})}
        ${buildRow('Залишок коштів на початок', '3405', '583', 'cfStart')}
        ${buildRow('Залишок коштів на кінець', '3415', '583', 'cfEnd', {bold:true})}
      </tbody>
    </table>`;

  } else if (currentTab === '584') {
    html = `<table class="fin-table">
      ${buildHead('Форма 584 — Капітальні інвестиції', true)}
      <tbody>
        ${buildRow('Капітальні інвестиції, усього:', '4000', '584', 'capInvestTotal', {bold:true, headerRow:true})}
        ${buildRow('капітальне будівництво', '4010', '584', 'construction')}
        ${buildRow('придбання (виготовлення) основних засобів', '4020', '584', 'fixedAssetsBuy')}
        ${buildRow('модернізація, модифікація основних засобів', '4050', '584', 'modernization')}
        ${buildRow('капітальний ремонт', '4060', '584', 'capRepair')}
      </tbody>
    </table>`;

  } else if (currentTab === '588') {
    html = `<table class="fin-table">
      ${buildHead('Форма 588 — Джерела капітальних інвестицій', true)}
      <tbody>
        ${buildRow('Усього джерел капінвестицій:', '10', '588', 'sourcesTotal', {bold:true, headerRow:true})}
        ${buildRow('залучення кредитних коштів', '20', '588', 'creditFunds')}
        ${buildRow('бюджетне фінансування', '30', '588', 'budgetFinancing')}
        ${buildRow('власні кошти', '40', '588', 'ownFunds')}
        ${buildRow('інші джерела', '50', '588', 'otherSources')}
      </tbody>
    </table>`;

  } else if (currentTab === '589') {
    html = `<table class="fin-table">
      ${buildHead('Форма 589 — Розшифровки', true)}
      <tbody>
        ${buildSectionRow('Інші операційні доходи:')}
        ${buildRow('Всього інші операційні доходи', '1073', '589', 'otherOpIncome')}
        ${buildRow('- бюджетне фінансування ліквідації шахт (КЕКВ 2610)', '380', '589', 'budgetFin2610')}
        ${buildSectionRow('Інші операційні витрати:')}
        ${buildRow('Всього інші операційні витрати', '1086', '589', 'otherOpExpenses')}
        ${buildRow('- бюджетні видатки (КЕКВ 2610)', '900', '589', 'budgetCosts2610')}
      </tbody>
    </table>`;

  } else if (currentTab === '5895') {
    html = `<table class="fin-table">
      ${buildHead('Форма 5895 — Персонал та ФОП', true)}
      <tbody>
        ${buildRow('Середня кількість працівників, усього:', '10', '5895', 'staffCount', {bold:true, headerRow:true})}
        ${buildRow('- керівник', '11', '5895', 'managerCount')}
        ${buildRow('- АУП', '12', '5895', 'aupCount')}
        ${buildRow('- робітники', '13', '5895', 'workersCount')}
        ${buildRow('Витрати на оплату праці, тис. грн', '30', '5895', 'laborCosts', {bold:true, headerRow:true})}
      </tbody>
    </table>`;

  } else if (currentTab === 'raw') {
    // show current quarter's raw values — use last non-year period in mode
    const periods = getCols().filter(c => c !== 'year');
    const colHd = periods.map(c => `<th class="${COL_CLASS[c]}" style="text-align:right">${COL_LABELS[c]}</th>`).join('');
    const rows = [
      ['Форма 1 (Баланс)','1095','Необоротні активи всього','580','nonCurrentAssets','ф.580 р.6000'],
      ['Форма 1 (Баланс)','1195','Оборотні активи всього','580','currentAssets','ф.580 р.6010'],
      ['Форма 1 (Баланс)','1300','Баланс (Активи)','580','totalAssets','ф.580 р.6020'],
      ['Форма 1 (Баланс)','1495','Власний капітал','580','equity','ф.580 р.6080'],
      ['Форма 2 (Фінрезультати)','2120','Інші операційні доходи','581','opIncome','ф.581 р.1070'],
      ['Форма 2 (Фінрезультати)','2180','Інші операційні витрати','581','opCosts','ф.581 р.1080'],
      ['Форма 2 (Фінрезультати)','2355','Чистий збиток','581','netProfit','ф.581 р.1200'],
      ['Форма 3 (Рух коштів)','3415','Залишок коштів на кінець','583','cfEnd','ф.583 р.3415'],
    ].map(([src, code, nm, fk, f, link]) => {
      const dcells = periods.map(p => {
        const v = getVal(p, fk, f);
        return `<td class="num ${COL_CLASS[p]}" style="${v<0?'color:var(--danger)':''}">${fmt(v)}</td>`;
      }).join('');
      return `<tr><td>${src}</td><td style="text-align:center">${code}</td><td>${nm}</td>${dcells}<td style="color:var(--text-muted)">${link}</td></tr>`;
    }).join('');
    html = `<table class="fin-table"><thead><tr><th>Форма-джерело</th><th style="width:70px">Код</th><th>Первинна стаття</th>${colHd}<th>Прив'язка</th></tr></thead><tbody>${rows}</tbody></table>`;

  } else if (currentTab === 'check') {
    const periods = getCols();
    const colHd = periods.map(c => `<th class="${COL_CLASS[c]}" style="text-align:center">${COL_LABELS[c]}</th>`).join('');

    const statusCell = (diff) => diff === 0
      ? `<td style="text-align:center;color:var(--success);font-weight:bold">✓</td>`
      : `<td style="text-align:center;color:var(--danger);font-weight:bold">✗ ${fmt(diff)}</td>`;

    const checks = [
      { label: 'Рівність Балансу (Активи = Пасиви)', fn: (p) => {
          const v = (liveData[p] && liveData[p]._validation && liveData[p]._validation.balanceCheck) || {};
          return statusCell(v.diff || 0);
      }},
      { label: 'Чистий фінрезультат (ф.581 = ф.582)', fn: (p) => {
          const d = getVal(p,'581','netProfit') - getVal(p,'582','netProfit');
          return statusCell(d);
      }},
      { label: 'Рух коштів: Початок + Чистий рух = Кінець', fn: (p) => {
          const v = (liveData[p] && liveData[p]._validation && liveData[p]._validation.cashCheck) || {};
          return statusCell(v.diff || 0);
      }},
      { label: 'Непокритий збиток (ф.582:2070 = Баланс)', fn: (p) => {
          const v = (liveData[p] && liveData[p]._validation && liveData[p]._validation.retLoss) || {};
          return statusCell(v.diff || 0);
      }},
    ];
    const rows = checks.map(ch =>
      `<tr><td>${ch.label}</td>${periods.map(ch.fn).join('')}</tr>`
    ).join('');
    html = `<table class="fin-table"><thead><tr><th>Контрольне співвідношення</th>${colHd}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  container.innerHTML = html;

  // Attach editable listeners to all .editable-cell
  container.querySelectorAll('.editable-cell').forEach(td => {
    attachEditable(td);
  });
}

// =====================================================
//  EDITABLE CELLS
// =====================================================
function attachEditable(td) {
  td.addEventListener('click', () => {
    if (td.querySelector('input')) return;
    const period = td.dataset.period;
    const formKey = td.dataset.form;
    const field = td.dataset.field;
    if (!period || !formKey || !field) return;
    const currentVal = getVal(period, formKey, field);

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentVal;
    input.style.cssText = 'width:100%;min-width:80px;background:#1e2a3a;color:#fff;border:1px solid var(--accent);border-radius:3px;padding:2px 4px;font-size:0.82rem;text-align:right;box-sizing:border-box;';
    td.textContent = '';
    td.appendChild(input);
    input.focus();
    input.select();

    const save = () => {
      const raw = input.value.trim().replace(/\s/g, '').replace(',', '.');
      const num = parseFloat(raw);
      const key = period + '|' + formKey + '|' + field;
      if (!isNaN(num)) {
        userEdits[key] = num;
        // Also propagate to liveData
        if (liveData[period] && liveData[period][formKey]) {
          liveData[period][formKey][field] = num;
        }
        td.innerHTML = (Math.abs(num) === num && num !== 0)
          ? fmt(num)
          : `<span style="color:var(--danger)">${fmt(num)}</span>`;
        td.dataset.period = period;
        td.dataset.form = formKey;
        td.dataset.field = field;
        showSaveNotice();
      } else {
        td.textContent = fmt(currentVal);
      }
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { save(); }
      if (e.key === 'Escape') { td.textContent = fmt(currentVal); }
    });
  });
}

function showSaveNotice() {
  const el = document.getElementById('saveNotice');
  if (!el) return;
  el.style.opacity = '1';
  setTimeout(() => { el.style.opacity = '0'; }, 1800);
}

// =====================================================
//  PDF VIEWER
// =====================================================
async function loadPdfJs() {
  if (pdfjsLib) return;
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = () => {
      pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve();
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function renderPdfPage(pageNum) {
  if (!pdfDoc) return;
  pdfCurrentPage = Math.max(1, Math.min(pageNum, pdfTotalPages));
  document.getElementById('currentPageNum').textContent = pdfCurrentPage;
  const zoomLabel = document.getElementById('zoomLevelLabel');
  if (zoomLabel) zoomLabel.textContent = Math.round(pdfScale * 100) + '%';

  // Cancel any ongoing render
  if (pdfRenderTask) {
    try {
      pdfRenderTask.cancel();
    } catch (_) {}
  }

  try {
    const page = await pdfDoc.getPage(pdfCurrentPage);
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');
    const vp = page.getViewport({ scale: pdfScale });
    canvas.width = vp.width;
    canvas.height = vp.height;
    pdfRenderTask = page.render({ canvasContext: ctx, viewport: vp });
    await pdfRenderTask.promise;
    pdfRenderTask = null;
  } catch (err) {
    if (err && err.name !== 'RenderingCancelledException') {
      console.error('PDF render error:', err);
    }
  }
}

function setZoom(newScale) {
  pdfScale = Math.max(0.4, Math.min(3.5, Math.round(newScale * 100) / 100));
  renderPdfPage(pdfCurrentPage);
}

async function loadPdf(buffer) {
  try {
    await loadPdfJs();
    pdfDoc = await pdfjsLib.getDocument({ data: buffer }).promise;
    pdfTotalPages = pdfDoc.numPages;
    pdfCurrentPage = 1;
    document.getElementById('totalPageNum').textContent = pdfTotalPages;
    document.getElementById('pdfPageContent').style.display = 'none';
    document.getElementById('pdfCanvasWrap').style.display = 'block';
    await renderPdfPage(1);
  } catch (err) {
    alert('Помилка відображення PDF: ' + err.message);
  }
}

// Page navigation
document.getElementById('prevPageBtn').addEventListener('click', () => {
  if (pdfDoc && pdfCurrentPage > 1) renderPdfPage(pdfCurrentPage - 1);
});
document.getElementById('nextPageBtn').addEventListener('click', () => {
  if (pdfDoc && pdfCurrentPage < pdfTotalPages) renderPdfPage(pdfCurrentPage + 1);
});

// Zoom controls
document.getElementById('zoomInBtn').addEventListener('click', () => {
  if (!pdfDoc) return;
  setZoom(pdfScale + 0.25);
});
document.getElementById('zoomOutBtn').addEventListener('click', () => {
  if (!pdfDoc) return;
  setZoom(pdfScale - 0.25);
});
document.getElementById('zoomResetBtn').addEventListener('click', () => {
  if (!pdfDoc) return;
  setZoom(1.0);
});
document.getElementById('zoomFitBtn').addEventListener('click', async () => {
  if (!pdfDoc) return;
  try {
    const page = await pdfDoc.getPage(pdfCurrentPage);
    const wrap = document.getElementById('pdfCanvasWrap');
    const availWidth = Math.max(300, (wrap.clientWidth || 500) - 40);
    const unscaledVp = page.getViewport({ scale: 1.0 });
    const fitScale = availWidth / unscaledVp.width;
    setZoom(fitScale);
  } catch (err) {
    console.error(err);
  }
});

// Ctrl + Mouse Wheel zoom inside PDF pane
const pdfViewerFrame = document.getElementById('pdfViewerFrame');
if (pdfViewerFrame) {
  pdfViewerFrame.addEventListener('wheel', (e) => {
    if (!pdfDoc) return;
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom(pdfScale + delta);
    }
  }, { passive: false });
}

// =====================================================
//  QUARTER MODE — data pane filter bar
// =====================================================
document.querySelectorAll('.qtr-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.qtr-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeMode = btn.getAttribute('data-qtr');
    renderActiveTab();
    document.getElementById('footerStatusText').textContent =
      'Відображається: ' + getModeLabel(activeMode) + '. Клікніть цифру для редагування.';
  });
});

// =====================================================
//  QUARTER HEADER BUTTONS (top panel)
// =====================================================
document.querySelectorAll('.qtr-header-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.qtr-header-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const qtr = btn.getAttribute('data-qtr');
    // Sync with the data pane mode
    activeMode = qtr;
    document.querySelectorAll('.qtr-btn').forEach(b => {
      if (b.getAttribute('data-qtr') === qtr) b.classList.add('active');
      else b.classList.remove('active');
    });
    renderActiveTab();
    document.getElementById('footerStatusText').textContent =
      'Відображається: ' + getModeLabel(activeMode) + '. Клікніть цифру для редагування.';
  });
});

// =====================================================
//  TABS
// =====================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.getAttribute('data-tab');
    renderActiveTab();
  });
});

// =====================================================
//  EXPORT
// =====================================================
document.getElementById('exportExcelBtn').addEventListener('click', () => {
  window.location.href = '/api/export-excel/' + currentYear + '/4';
});

// =====================================================
//  PDF UPLOAD
// =====================================================
document.getElementById('pdfFileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('currentPdfName').textContent = file.name + ' (завантаження...)';
  const buf = await file.arrayBuffer();
  await loadPdf(buf.slice(0));
  document.getElementById('currentPdfName').textContent = file.name + ' (' + pdfTotalPages + ' стор.)';

  const formData = new FormData();
  formData.append('pdfFile', file);
  formData.append('year', currentYear);
  formData.append('quarter', 3);

  try {
    const res = await fetch('/api/upload-pdf', { method: 'POST', body: formData });
    const result = await res.json();
    if (result.success && result.suite) {
      // Merge into q3 and year
      if (result.suite.forms) {
        Object.keys(result.suite.forms).forEach(fk => {
          liveData.q3[fk] = Object.assign({}, liveData.q3[fk], result.suite.forms[fk]);
          liveData.year[fk] = Object.assign({}, liveData.year[fk], result.suite.forms[fk]);
        });
      }
      renderActiveTab();
    }
  } catch (_) { /* server optional */ }
});

// =====================================================
//  YEAR SELECT
// =====================================================
document.getElementById('yearSelect').addEventListener('change', (e) => {
  currentYear = parseInt(e.target.value);
});

// =====================================================
//  INIT
// =====================================================
renderActiveTab();
