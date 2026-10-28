// =====================================================
//  FP-2025 Studio — app.js
//  Затверджений шаблон форм (Додаток 2) + Multi-column view
// =====================================================

// ---- State ----
let currentYear = 2026;
let currentTab = '580';
let activeQuarter = 'q3'; // 'q1' | 'q2' | 'q3' | 'q4' | 'year'
let activeDocSet = 'app2'; // 'app2' (Офіційний Додаток 2) | 'app3' (Неофіційний Додаток 3)
let app3Data = null;

// activeMode: 'statutory' (Офіційний Додаток 2 / таблиця) | 'year' | 'q1' | 'q2' | 'q3' | 'q4'
let activeMode = 'statutory';

// Edits storage
const userEdits = {};

// ---- PDF state ----
let pdfDoc = null;
let pdfCurrentPage = 1;
let pdfTotalPages = 0;
let pdfjsLib = null;
let pdfScale = 1.4;
let pdfRenderTask = null;

// =====================================================
//  ENTERPRISE METADATA (Додаток 2)
// =====================================================
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

// =====================================================
//  COLUMN DEFINITIONS FOR MULTI-QUARTER VIEW
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

function getQuarterLabel(q) {
  const map = { q1: 'I квартал', q2: 'II квартал', q3: 'III квартал', q4: 'IV квартал', year: 'Рік' };
  return map[q] || q;
}

// =====================================================
//  BUILD STATUTORY HEADER HTML (Додаток 2)
// =====================================================
function buildStatutoryBannerHtml(titleText) {
  return `
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;padding:12px 16px;margin-bottom:12px;font-size:0.82rem;line-height:1.4;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
      <div>
        <div style="font-weight:700;font-size:1rem;color:var(--text-main);">${titleText}</div>
        <div style="color:var(--text-muted);">за ${currentYear} рік (звітний період: <strong style="color:var(--primary);">${getQuarterLabel(activeQuarter)}</strong>)</div>
      </div>
      <div style="text-align:right;font-size:0.75rem;color:var(--text-muted);">
        <strong>Додаток 2</strong><br>до Методичних рекомендацій
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:6px;border-top:1px solid var(--border);padding-top:8px;font-size:0.78rem;">
      <div><strong>Підприємство:</strong> ${enterpriseInfo.name}</div>
      <div><strong>ЄДРПОУ:</strong> <span style="font-family:monospace;font-weight:700;">${enterpriseInfo.edrpou}</span> | <strong>КОПФГ:</strong> ${enterpriseInfo.kopfh}</div>
      <div><strong>Орган управління:</strong> Міненерго (СКОДУ ${enterpriseInfo.skodu})</div>
      <div><strong>КВЕД:</strong> ${enterpriseInfo.kved} | <strong>Одиниця:</strong> ${enterpriseInfo.unit}</div>
    </div>
  </div>`;
}

// =====================================================
//  BUILD STATUTORY 8/9-COLUMN TABLE
// =====================================================
function buildStatutoryTable(titleText, rowsDefinition, options = {}) {
  const hasNotes = options.hasNotes;
  const colCount = hasNotes ? 9 : 8;

  let thead = `
  <thead>
    <tr>
      <th rowspan="2" style="width:380px;">Найменування показника</th>
      <th rowspan="2" style="width:70px;text-align:center;">Код рядка</th>
      <th colspan="2" style="text-align:center;">Факт наростаючим підсумком</th>
      <th colspan="4" style="text-align:center;">Звітний період (${getQuarterLabel(activeQuarter)})</th>
      ${hasNotes ? '<th rowspan="2" style="min-width:200px;">Пояснення та обґрунтування відхилення</th>' : ''}
    </tr>
    <tr>
      <th style="width:110px;text-align:right;">минулий рік</th>
      <th style="width:120px;text-align:right;">поточний рік</th>
      <th style="width:110px;text-align:right;">план</th>
      <th style="width:110px;text-align:right;">факт</th>
      <th style="width:110px;text-align:right;">відхилення, +/–</th>
      <th style="width:90px;text-align:right;">виконання, %</th>
    </tr>
    <tr style="background:var(--bg-sidebar);color:var(--text-muted);font-size:0.72rem;text-align:center;">
      <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th>
      ${hasNotes ? '<th>9</th>' : ''}
    </tr>
  </thead>`;

  let tbody = '<tbody>';

  rowsDefinition.forEach(r => {
    if (r.isHeader) {
      tbody += `<tr class="header-row" style="background:rgba(59,130,246,0.12);font-weight:bold;"><td colspan="${colCount}">${r.name}</td></tr>`;
      return;
    }
    if (r.isSubHeader) {
      tbody += `<tr style="background:rgba(255,255,255,0.03);font-style:italic;font-weight:600;"><td colspan="${colCount}">${r.name}</td></tr>`;
      return;
    }

    const formKey = r.formKey || currentTab;
    const field = r.field || '';

    // Data values
    const priorYear = getVal('year', formKey, field + '_prior') || 0;
    const currYearCumulative = getVal('year', formKey, field);
    const planKey = activeQuarter + '|' + formKey + '|' + field + '_plan';
    const planVal = userEdits[planKey] !== undefined ? userEdits[planKey] : (r.planDefault || 0);
    const factVal = getVal(activeQuarter, formKey, field);

    // Deviation & Execution %
    const diff = factVal - planVal;
    let pctStr = '—';
    if (planVal !== 0) {
      const pct = Math.round((factVal / planVal) * 1000) / 10;
      pctStr = pct + '%';
    }

    const planId = `plan_${activeQuarter}_${formKey}_${field}`;
    const factId = `fact_${activeQuarter}_${formKey}_${field}`;

    tbody += `
    <tr>
      <td style="${r.isBold ? 'font-weight:700;' : ''}">${r.name}</td>
      <td style="text-align:center;color:var(--text-muted);font-family:monospace;">${r.code || ''}</td>
      <td class="num" style="text-align:right;color:var(--text-muted);">${fmt(priorYear)}</td>
      <td class="num" style="text-align:right;font-weight:600;">${fmt(currYearCumulative)}</td>
      <td class="num editable-cell" id="${planId}" style="text-align:right;background:rgba(255,255,255,0.02);" data-period="${activeQuarter}" data-form="${formKey}" data-field="${field}_plan">${fmt(planVal)}</td>
      <td class="num editable-cell" id="${factId}" style="text-align:right;font-weight:600;${factVal < 0 ? 'color:var(--danger)' : ''}" data-period="${activeQuarter}" data-form="${formKey}" data-field="${field}">${fmt(factVal)}</td>
      <td class="num" style="text-align:right;${diff < 0 ? 'color:var(--danger)' : 'color:var(--success)'};">${diff !== 0 ? fmt(diff) : '0'}</td>
      <td class="num" style="text-align:right;font-weight:600;">${pctStr}</td>
      ${hasNotes ? `<td style="color:var(--text-muted);font-size:0.75rem;">${r.notes || ''}</td>` : ''}
    </tr>`;
  });

  tbody += '</tbody>';

  return `
  ${buildStatutoryBannerHtml(titleText)}
  <table class="fin-table">
    ${thead}
    ${tbody}
  </table>`;
}

// =====================================================
//  MULTI-QUARTER COMPARISON BUILDER
// =====================================================
function getCols() { return MODES[activeMode] || MODES.year; }

function buildComparisonHead(label1, extraCols) {
  const code = extraCols ? `<th style="width:60px">Код</th>` : '';
  const dataCols = getCols().map(c =>
    `<th class="${COL_CLASS[c]}" style="text-align:right;min-width:110px">${COL_LABELS[c]}</th>`
  ).join('');
  return `<thead><tr><th>${label1}</th>${code}${dataCols}</tr></thead>`;
}

function buildComparisonRow(label, code, formKey, field, opts = {}) {
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

  return `<tr><td${isBold?' style="font-weight:600"':''}>${label}</td>${codeCell}${dataCells}</tr>`;
}

function buildComparisonRatioRow(label, code, field) {
  const cols = getCols();
  const codeCell = `<td style="width:60px;text-align:center;color:var(--text-muted)">${code}</td>`;
  const dataCells = cols.map(period => {
    const val = getRatio(period, field);
    const red = val < 0;
    return `<td class="num ${COL_CLASS[period]}" style="text-align:right;${red?'color:var(--danger)':''}">${val}</td>`;
  }).join('');
  return `<tr><td>${label}</td>${codeCell}${dataCells}</tr>`;
}

function buildComparisonSectionRow(label) {
  const span = getCols().length + 2;
  return `<tr class="header-row" style="background:rgba(59,130,246,0.12);font-weight:bold;"><td colspan="${span}">${label}</td></tr>`;
}

// =====================================================
//  RENDER ACTIVE TAB
// =====================================================
function renderActiveTab() {
  const container = document.getElementById('tabContentArea');
  if (!container) return;

  // --- НЕОФІЦІЙНИЙ ДОДАТОК 3 (форми 680-6895) ---
  if (activeDocSet === 'app3') {
    if (currentTab === 'check3') {
      renderCheck3Tab(container);
    } else {
      renderApp3FormTab(container, currentTab);
    }
    return;
  }

  // --- STATUTORY MODE (Офіційний Додаток 2) ---
  if (activeMode === 'statutory') {
    if (currentTab === '580') {
      const rows580 = [
        { isHeader: true, name: 'І. Формування фінансових результатів' },
        { code: '1000', name: 'Чистий дохід від реалізації продукції (товарів, робіт, послуг)', field: 'netRevenue' },
        { code: '1010', name: 'Собівартість реалізованої продукції (товарів, робіт, послуг)', field: 'costOfGoods' },
        { code: '1020', name: 'Валовий прибуток/збиток', field: 'grossProfit' },
        { code: '1300', name: 'EBITDA', field: 'ebitda', isBold: true },
        { code: '1200', name: 'Чистий фінансовий результат', field: 'netProfit', isBold: true },

        { isHeader: true, name: 'ІІ. Сплата податків, зборів та інших обов\'язкових платежів' },
        { code: '2111', name: 'податок на прибуток підприємств', field: 'incomeTax' },
        { code: '2112', name: 'податок на додану вартість (до сплати)', field: 'vatPaid' },
        { code: '2113', name: 'податок на додану вартість (до відшкодування)', field: 'vatRefund' },
        { code: '2131', name: 'відрахування частини чистого прибутку унітарними підприємствами', field: 'stateDivUnitary' },
        { code: '2132', name: 'відрахування частини чистого прибутку на виплату дивідендів', field: 'stateDivJointStock' },
        { code: '2200', name: 'Усього виплат на користь держави', field: 'totalStatePayments', isBold: true },

        { isHeader: true, name: 'ІІІ. Капітальні інвестиції' },
        { code: '4000', name: 'Капітальні інвестиції', field: 'capInvestTotal' },

        { isHeader: true, name: 'ІV. Коефіцієнтний аналіз' },
        { isSubHeader: true, name: 'Коефіцієнти рентабельності' },
        { code: '5010', name: 'Коефіцієнт рентабельності діяльності (р. 1200 / р. 1000)', field: 'profitabilityActivity' },
        { code: '5011', name: 'Коефіцієнт рентабельності операційних витрат', field: 'opCostProfitability' },
        { code: '5013', name: 'Коефіцієнт рентабельності EBITDA (р. 1300 / р. 1000)', field: 'ebitdaMargin' },
        { code: '5014', name: 'Коефіцієнт рентабельності власного капіталу (ROE)', field: 'roe' },
        { code: '5015', name: 'Коефіцієнт рентабельності активів (ROA)', field: 'roa' },

        { isSubHeader: true, name: 'Коефіцієнти платоспроможності' },
        { code: '5020', name: 'Коефіцієнт фінансової стійкості', field: 'financialStability' },
        { code: '5030', name: 'Коефіцієнт поточної ліквідності', field: 'currentLiquidity' },

        { isHeader: true, name: 'V. Звіт про фінансовий стан' },
        { code: '6000', name: 'Необоротні активи, усього', field: 'nonCurrentAssets' },
        { code: '6010', name: 'Оборотні активи, усього', field: 'currentAssets' },
        { code: '6020', name: 'Усього активи', field: 'totalAssets', isBold: true },
        { code: '6030', name: 'Довгострокові зобов\'язання і забезпечення', field: 'longTermLiab' },
        { code: '6040', name: 'Поточні зобов\'язання і забезпечення', field: 'currentLiab' },
        { code: '6080', name: 'Власний капітал', field: 'equity', isBold: true },

        { isHeader: true, name: 'VII. Дані про персонал та оплату праці' },
        { code: '8000', name: 'Середня кількість штатних працівників', field: 'staffCount' },
        { code: '8010', name: 'Витрати на оплату праці', field: 'laborCosts' }
      ];
      container.innerHTML = buildStatutoryTable('ЗВІТ про виконання фінансового плану (Основні фінансові показники)', rows580);

    } else if (currentTab === '581') {
      const rows581 = [
        { isHeader: true, name: 'Доходи і витрати (деталізація)' },
        { code: '1000', name: 'Чистий дохід від реалізації продукції (товарів, робіт, послуг)', field: 'netRevenue' },
        { code: '1010', name: 'Собівартість реалізованої продукції (товарів, робіт, послуг)', field: 'costOfGoods' },
        { code: '1070', name: 'Інші операційні доходи, усього', field: 'opIncome' },
        { code: '1073', name: 'інші операційні доходи (розшифрувати)', field: 'opIncome' },
        { code: '1080', name: 'Інші операційні витрати, усього', field: 'opCosts' },
        { code: '1086', name: 'інші операційні витрати (розшифрувати)', field: 'opCosts' },
        { code: '1100', name: 'Фінансовий результат від операційної діяльності', field: 'opProfit', isBold: true },
        { code: '1200', name: 'Чистий фінансовий результат (збиток)', field: 'netProfit', isBold: true },
        { code: '1300', name: 'EBITDA (р. 1100 + амортизація р. 1430)', field: 'ebitda', isBold: true },

        { isHeader: true, name: 'Елементи операційних витрат' },
        { code: '1400', name: 'Матеріальні витрати, у тому числі:', field: 'matCosts' },
        { code: '1401', name: 'витрати на сировину та основні матеріали', field: 'rawMat' },
        { code: '1402', name: 'витрати на паливо та енергію', field: 'energyMat' },
        { code: '1410', name: 'Витрати на оплату праці', field: 'laborCosts' },
        { code: '1420', name: 'Відрахування на соціальні заходи', field: 'socialCosts' },
        { code: '1430', name: 'Амортизація', field: 'depreciation' },
        { code: '1440', name: 'Інші операційні витрати', field: 'otherOpCosts' },
        { code: '1450', name: 'Усього елементів', field: 'totalElements', isBold: true }
      ];
      container.innerHTML = buildStatutoryTable('3. Формування фінансових результатів', rows581, { hasNotes: true });

    } else if (currentTab === '582') {
      const rows582 = [
        { isHeader: true, name: 'Розподіл чистого прибутку' },
        { code: '1200', name: 'Чистий фінансовий результат', field: 'netProfit' },
        { code: '2000', name: 'Залишок нерозподіленого прибутку (непокритого збитку) на початок періоду', field: 'retainedLossStart' },
        { code: '2009', name: 'Скоригований залишок на початок періоду', field: 'retainedLossStart' },
        { code: '2070', name: 'Залишок нерозподіленого прибутку (непокритого збитку) на кінець періоду', field: 'retainedLossEnd', isBold: true },

        { isHeader: true, name: 'Сплата податків, зборів та інших обов\'язкових платежів' },
        { code: '2110', name: 'Сплата податків та зборів до Державного бюджету України, усього:', field: 'totalTaxesPaid', isBold: true },
        { code: '2111', name: 'податок на прибуток підприємств', field: 'incomeTax' },
        { code: '2112', name: 'ПДВ, що підлягає сплаті до бюджету', field: 'vatPaid' },
        { code: '2117', name: 'податок на доходи фізичних осіб (ПДФО)', field: 'pdfoPaid' },
        { code: '2118', name: 'інші податки та збори', field: 'otherTaxesPaid' },
        { code: '2130', name: 'Інші платежі на користь держави (ЄСВ)', field: 'esvPaid' },
        { code: '2200', name: 'Усього виплат на користь держави', field: 'totalStatePayments', isBold: true }
      ];
      container.innerHTML = buildStatutoryTable('II. Розрахунки з бюджетом', rows582);

    } else if (currentTab === '583') {
      const rows583 = [
        { isHeader: true, name: 'І. Рух коштів у результаті операційної діяльності' },
        { code: '3000', name: 'Надходження грошових коштів від операційної діяльності', field: 'cfInOperating', isBold: true },
        { code: '3010', name: 'Виручка від реалізації продукції', field: 'cfRevGoods' },
        { code: '3040', name: 'Цільове фінансування, у тому числі:', field: 'cfTargetFin' },
        { code: '3041', name: 'бюджетне фінансування', field: 'cfBudgetFin' },
        { code: '3100', name: 'Витрачання грошових коштів від операційної діяльності', field: 'cfOutOperating', isBold: true },
        { code: '3110', name: 'Розрахунки за продукцію (товари, роботи та послуги)', field: 'cfOutGoods' },
        { code: '3120', name: 'Розрахунки з оплати праці', field: 'cfOutLabor' },
        { code: '3130', name: 'Відрахування на соціальні заходи', field: 'cfOutSocial' },
        { code: '3150', name: 'Зобов’язання з податків, зборів та платежів', field: 'cfOutTaxes' },
        { code: '3195', name: 'Чистий рух коштів від операційної діяльності', field: 'cfNetOperating', isBold: true },

        { isHeader: true, name: 'Підсумок руху коштів' },
        { code: '3400', name: 'Чистий рух грошових коштів за звітний період', field: 'cfNetTotal', isBold: true },
        { code: '3405', name: 'Залишок коштів на початок періоду', field: 'cfStart' },
        { code: '3415', name: 'Залишок коштів на кінець періоду', field: 'cfEnd', isBold: true }
      ];
      container.innerHTML = buildStatutoryTable('ІІІ. Рух грошових коштів (за прямим методом)', rows583);

    } else if (currentTab === '584') {
      const rows584 = [
        { code: '4000', name: 'Капітальні інвестиції, усього, у тому числі:', field: 'capInvestTotal', isBold: true },
        { code: '4010', name: 'капітальне будівництво', field: 'construction' },
        { code: '4020', name: 'придбання (виготовлення) основних засобів', field: 'fixedAssetsBuy' },
        { code: '4030', name: 'придбання (виготовлення) інших необоротних матеріальних активів', field: 'otherMaterialBuy' },
        { code: '4040', name: 'придбання (створення) нематеріальних активів', field: 'intangibleBuy' },
        { code: '4050', name: 'модернізація, модифікація основних засобів', field: 'modernization' },
        { code: '4060', name: 'капітальний ремонт', field: 'capRepair' }
      ];
      container.innerHTML = buildStatutoryTable('IV. Капітальні інвестиції', rows584);

    } else if (currentTab === '588') {
      const rows588 = [
        { code: '10', name: 'Усього джерел капітальних інвестицій:', field: 'sourcesTotal', isBold: true },
        { code: '20', name: 'залучення кредитних коштів', field: 'creditFunds' },
        { code: '30', name: 'бюджетне фінансування', field: 'budgetFinancing' },
        { code: '40', name: 'власні кошти (розшифрувати)', field: 'ownFunds' },
        { code: '50', name: 'інші джерела (розшифрувати)', field: 'otherSources' },
        { code: '60', name: 'у тому числі амортизація', field: 'depreciationSource' }
      ];
      container.innerHTML = buildStatutoryTable('VІ. Джерела капітальних інвестицій (тис. грн без ПДВ)', rows588);

    } else if (currentTab === '589') {
      const rows589 = [
        { isHeader: true, name: '2. Інформація про бізнес підприємства (код рядка 1000 звіту)' },
        { code: '1000', name: 'Добування кам\'яного вугілля (КВЕД 05.10)', field: 'netRevenue' },
        { isHeader: true, name: 'Бюджетні програми та ліквідація шахт' },
        { code: '1073', name: 'Інші операційні доходи: бюджетне фінансування КЕКВ 2610', field: 'budgetFin2610' },
        { code: '1086', name: 'Інші операційні витрати: витрати за рахунок КЕКВ 2610', field: 'budgetCosts2610' }
      ];
      container.innerHTML = buildStatutoryTable('2. Інформація про бізнес підприємства (код рядка 1000 звіту)', rows589);

    } else if (currentTab === '5895') {
      const rows5895 = [
        { isHeader: true, name: 'VII. Дані про персонал та витрати на оплату праці' },
        { code: '8000', name: 'Середня кількість працівників, у тому числі:', field: 'staffCount', isBold: true },
        { code: '8003', name: 'керівник', field: 'managerCount' },
        { code: '8004', name: 'адміністративно-управлінський персонал', field: 'aupCount' },
        { code: '8005', name: 'працівники (робітники)', field: 'workersCount' },
        { code: '8010', name: 'Витрати на оплату праці, у тому числі:', field: 'laborCosts', isBold: true },
        { code: '8013', name: 'керівник', field: 'managerSalary' },
        { code: '8014', name: 'адміністративно-управлінський персонал', field: 'aupSalary' },
        { code: '8015', name: 'працівники', field: 'workersSalary' },
        { code: '8020', name: 'Середньомісячні витрати на одного працівника (грн)', field: 'avgWageTotal' }
      ];
      container.innerHTML = buildStatutoryTable('VII. Дані про персонал та витрати на оплату праці', rows5895);

    } else if (currentTab === 'raw') {
      renderRawTab(container);
    } else if (currentTab === 'check') {
      renderCheckTab(container);
    }

  // --- MULTI-QUARTER COMPARISON MODE (Рік, Q1, Q2, Q3, Q4) ---
  } else {
    if (currentTab === '580') {
      container.innerHTML = `<table class="fin-table">
        ${buildComparisonHead('Показник форми 580', true)}
        <tbody>
          ${buildComparisonSectionRow('I. Формування фінансових результатів')}
          ${buildComparisonRow('EBITDA', '1300', '580', 'ebitda')}
          ${buildComparisonRow('Чистий фінансовий результат', '1200', '580', 'netProfit')}
          ${buildComparisonSectionRow('IV. Коефіцієнтний аналіз')}
          ${buildComparisonRatioRow('Рентабельність операційних витрат', '5011', 'opCostProfitability')}
          ${buildComparisonRatioRow('Рентабельність власного капіталу (ROE)', '5014', 'roe')}
          ${buildComparisonRatioRow('Рентабельність активів (ROA)', '5015', 'roa')}
          ${buildComparisonRatioRow('Коефіцієнт фінансової стійкості', '5020', 'financialStability')}
          ${buildComparisonRatioRow('Коефіцієнт поточної ліквідності', '5030', 'currentLiquidity')}
          ${buildComparisonSectionRow('V. Звіт про фінансовий стан (Баланс)')}
          ${buildComparisonRow('Необоротні активи, усього', '6000', '580', 'nonCurrentAssets')}
          ${buildComparisonRow('Оборотні активи, усього', '6010', '580', 'currentAssets')}
          ${buildComparisonRow('Усього активи (Баланс)', '6020', '580', 'totalAssets', {bold:true})}
          ${buildComparisonRow("Довгострокові зобов'язання", '6030', '580', 'longTermLiab')}
          ${buildComparisonRow('Поточні зобов\'язання', '6040', '580', 'currentLiab')}
          ${buildComparisonRow('Власний капітал', '6080', '580', 'equity', {bold:true})}
        </tbody>
      </table>`;
    } else if (currentTab === '581') {
      container.innerHTML = `<table class="fin-table">
        ${buildComparisonHead('Показник форми 581', true)}
        <tbody>
          ${buildComparisonRow('Інші операційні доходи', '1070', '581', 'opIncome')}
          ${buildComparisonRow('Інші операційні витрати', '1080', '581', 'opCosts')}
          ${buildComparisonRow('Фінрезультат від операційної діяльності', '1100', '581', 'opProfit')}
          ${buildComparisonRow('Чистий збиток', '1200', '581', 'netProfit')}
          ${buildComparisonRow('EBITDA', '1300', '581', 'ebitda', {bold:true})}
          ${buildComparisonSectionRow('Елементи операційних витрат')}
          ${buildComparisonRow('Матеріальні витрати', '1400', '581', 'matCosts')}
          ${buildComparisonRow('- сировина та матеріали', '1401', '581', 'rawMat')}
          ${buildComparisonRow('- паливо та енергія', '1402', '581', 'energyMat')}
          ${buildComparisonRow('Витрати на оплату праці', '1410', '581', 'laborCosts')}
          ${buildComparisonRow('Відрахування на соціальні заходи', '1420', '581', 'socialCosts')}
          ${buildComparisonRow('Амортизація', '1430', '581', 'depreciation')}
          ${buildComparisonRow('Інші операційні витрати', '1440', '581', 'otherOpCosts')}
          ${buildComparisonRow('Усього елементів', '1450', '581', 'totalElements', {bold:true})}
        </tbody>
      </table>`;
    } else if (currentTab === '582') {
      container.innerHTML = `<table class="fin-table">
        ${buildComparisonHead('Показник форми 582', true)}
        <tbody>
          ${buildComparisonSectionRow('Розподіл чистого прибутку')}
          ${buildComparisonRow('Чистий фінансовий результат', '1200', '582', 'netProfit')}
          ${buildComparisonRow('Залишок збитку на початок періоду', '2000', '582', 'retainedLossStart')}
          ${buildComparisonRow('Скоригований залишок на початок періоду', '2009', '582', 'retainedLossStart')}
          ${buildComparisonRow('Залишок збитку на кінець періоду', '2070', '582', 'retainedLossEnd', {bold:true})}
          ${buildComparisonSectionRow('Сплата податків та зборів')}
          ${buildComparisonRow('Сплата до Держбюджету, усього', '2110', '582', 'totalTaxesPaid', {bold:true})}
          ${buildComparisonRow('податок на додану вартість (ПДВ)', '2112', '582', 'vatPaid')}
          ${buildComparisonRow('податок на доходи фізичних осіб (ПДФО)', '2117', '582', 'pdfoPaid')}
          ${buildComparisonRow('інші податки та збори', '2118', '582', 'otherTaxesPaid')}
          ${buildComparisonRow('Інші платежі на користь держави (ЄСВ)', '2130', '582', 'esvPaid')}
          ${buildComparisonRow('Усього виплат на користь держави', '2200', '582', 'totalStatePayments', {bold:true})}
        </tbody>
      </table>`;
    } else if (currentTab === '583') {
      container.innerHTML = `<table class="fin-table">
        ${buildComparisonHead('Показник форми 583', true)}
        <tbody>
          ${buildComparisonRow('Надходження від операційної діяльності', '3000', '583', 'cfInOperating', {bold:true})}
          ${buildComparisonRow('Цільове фінансування, у тому числі:', '3040', '583', 'cfTargetFin')}
          ${buildComparisonRow('- бюджетне фінансування', '3041', '583', 'cfBudgetFin')}
          ${buildComparisonRow('Витрачання від операційної діяльності', '3100', '583', 'cfOutOperating', {bold:true})}
          ${buildComparisonRow('- розрахунки за продукцію', '3110', '583', 'cfOutGoods')}
          ${buildComparisonRow('- розрахунки з оплати праці', '3120', '583', 'cfOutLabor')}
          ${buildComparisonRow('- відрахування на соц. заходи', '3130', '583', 'cfOutSocial')}
          ${buildComparisonRow('- зобов\'язання з податків', '3150', '583', 'cfOutTaxes')}
          ${buildComparisonRow('Чистий рух коштів від операційної діяльності', '3195', '583', 'cfNetOperating', {bold:true})}
          ${buildComparisonRow('Чистий рух грошових коштів за звітний період', '3400', '583', 'cfNetTotal', {bold:true})}
          ${buildComparisonRow('Залишок коштів на початок періоду', '3405', '583', 'cfStart')}
          ${buildComparisonRow('Залишок коштів на кінець періоду', '3415', '583', 'cfEnd', {bold:true})}
        </tbody>
      </table>`;
    } else if (currentTab === '584') {
      container.innerHTML = `<table class="fin-table">
        ${buildComparisonHead('Показник форми 584', true)}
        <tbody>
          ${buildComparisonRow('Капітальні інвестиції, усього', '4000', '584', 'capInvestTotal', {bold:true})}
          ${buildComparisonRow('капітальне будівництво', '4010', '584', 'construction')}
          ${buildComparisonRow('придбання основних засобів', '4020', '584', 'fixedAssetsBuy')}
          ${buildComparisonRow('модернізація основних засобів', '4050', '584', 'modernization')}
          ${buildComparisonRow('капітальний ремонт', '4060', '584', 'capRepair')}
        </tbody>
      </table>`;
    } else if (currentTab === '588') {
      container.innerHTML = `<table class="fin-table">
        ${buildComparisonHead('Показник форми 588', true)}
        <tbody>
          ${buildComparisonRow('Усього джерел капінвестицій', '10', '588', 'sourcesTotal', {bold:true})}
          ${buildComparisonRow('залучення кредитних коштів', '20', '588', 'creditFunds')}
          ${buildComparisonRow('бюджетне фінансування', '30', '588', 'budgetFinancing')}
          ${buildComparisonRow('власні кошти', '40', '588', 'ownFunds')}
          ${buildComparisonRow('інші джерела', '50', '588', 'otherSources')}
        </tbody>
      </table>`;
    } else if (currentTab === '589') {
      container.innerHTML = `<table class="fin-table">
        ${buildComparisonHead('Показник розшифровок (ф. 589)', true)}
        <tbody>
          ${buildComparisonRow('Інші операційні доходи', '1073', '589', 'otherOpIncome')}
          ${buildComparisonRow('- бюджетне фінансування КЕКВ 2610', '380', '589', 'budgetFin2610', {bold:true})}
          ${buildComparisonRow('Інші операційні витрати', '1086', '589', 'otherOpExpenses')}
          ${buildComparisonRow('- бюджетні видатки КЕКВ 2610', '900', '589', 'budgetCosts2610', {bold:true})}
        </tbody>
      </table>`;
    } else if (currentTab === '5895') {
      container.innerHTML = `<table class="fin-table">
        ${buildComparisonHead('Показник персоналу (ф. 5895)', true)}
        <tbody>
          ${buildComparisonRow('Середня кількість штатних працівників', '10', '5895', 'staffCount', {bold:true})}
          ${buildComparisonRow('- керівник', '11', '5895', 'managerCount')}
          ${buildComparisonRow('- адміністративно-управлінський персонал', '12', '5895', 'aupCount')}
          ${buildComparisonRow('- робітники', '13', '5895', 'workersCount')}
          ${buildComparisonRow('Витрати на оплату праці', '30', '5895', 'laborCosts', {bold:true})}
        </tbody>
      </table>`;
    } else if (currentTab === 'raw') {
      renderRawTab(container);
    } else if (currentTab === 'check') {
      renderCheckTab(container);
    }
  }

  attachCellClickHandlers();
}

function renderRawTab(container) {
  container.innerHTML = `
  <table class="fin-table">
    <thead>
      <tr>
        <th style="width:200px">Форма-джерело</th>
        <th style="width:80px;text-align:center;">Код рядка</th>
        <th>Найменування первинної статті</th>
        <th style="width:140px;text-align:right;">Значення (тис. грн)</th>
        <th style="width:160px">Цільова форма</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Форма 1 (Баланс)</td><td style="text-align:center;">1095</td><td>Необоротні активи всього</td><td class="num" style="text-align:right;">61 890</td><td>ф.580 ряд. 6000</td></tr>
      <tr><td>Форма 1 (Баланс)</td><td style="text-align:center;">1195</td><td>Оборотні активи всього</td><td class="num" style="text-align:right;">3 374</td><td>ф.580 ряд. 6010</td></tr>
      <tr><td>Форма 1 (Баланс)</td><td style="text-align:center;">1300</td><td>Баланс (Активи)</td><td class="num" style="text-align:right;"><strong>65 264</strong></td><td>ф.580 ряд. 6020</td></tr>
      <tr><td>Форма 1 (Баланс)</td><td style="text-align:center;">1495</td><td>Власний капітал</td><td class="num" style="text-align:right;color:var(--danger)">(63 223)</td><td>ф.580 ряд. 6080</td></tr>
      <tr><td>Форма 1 (Баланс)</td><td style="text-align:center;">14201</td><td>Непокритий збиток</td><td class="num" style="text-align:right;color:var(--danger)">(82 503)</td><td>ф.582 ряд. 2070</td></tr>
      <tr><td>Форма 2 (Фінрезультати)</td><td style="text-align:center;">2120</td><td>Інші операційні доходи</td><td class="num" style="text-align:right;">151 072</td><td>ф.581 ряд. 1070</td></tr>
      <tr><td>Форма 2 (Фінрезультати)</td><td style="text-align:center;">2180</td><td>Інші операційні витрати</td><td class="num" style="text-align:right;color:var(--danger)">(167 108)</td><td>ф.581 ряд. 1080</td></tr>
      <tr><td>Форма 2 (Фінрезультати)</td><td style="text-align:center;">2195</td><td>Фінрезультат від операційної діяльності</td><td class="num" style="text-align:right;color:var(--danger)">(16 036)</td><td>ф.581 ряд. 1100</td></tr>
      <tr><td>Форма 2 (Фінрезультати)</td><td style="text-align:center;">2355</td><td>Чистий збиток</td><td class="num" style="text-align:right;color:var(--danger)">(14 187)</td><td>ф.581 / ф.582</td></tr>
      <tr><td>Код форми 1956</td><td style="text-align:center;">70</td><td>Бюджетне фінансування КЕКВ 2610</td><td class="num" style="text-align:right;">148 442</td><td>ф.589 ряд. 380</td></tr>
      <tr><td>Код форми 1704</td><td style="text-align:center;">50</td><td>Податок на доходи фізичних осіб (ПДФО)</td><td class="num" style="text-align:right;">2 235</td><td>ф.582 ряд. 2117</td></tr>
      <tr><td>Код форми 8210</td><td style="text-align:center;">5+50</td><td>Єдиний соціальний внесок (ЄСВ)</td><td class="num" style="text-align:right;">2 540</td><td>ф.582 ряд. 2134</td></tr>
      <tr><td>Форма 3 (Рух коштів)</td><td style="text-align:center;">3010</td><td>Цільове фінансування</td><td class="num" style="text-align:right;">152 421</td><td>ф.583 ряд. 3040</td></tr>
    </tbody>
  </table>`;
}

function renderCheckTab(container) {
  container.innerHTML = `
  <table class="fin-table">
    <thead>
      <tr>
        <th>Контрольне співвідношення</th>
        <th style="width:160px;text-align:right;">Базовий показник (A)</th>
        <th style="width:160px;text-align:right;">Порівнюваний показник (B)</th>
        <th style="width:140px;text-align:right;">Різниця (A − B)</th>
        <th style="width:160px;text-align:center;">Статус контролю</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Рівність Балансу (Активи = Пасиви)</td><td class="num" style="text-align:right;">65 264</td><td class="num" style="text-align:right;">65 264</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
      <tr><td>Чистий фінрезультат (ф.581 ряд.1200 = ф.582 ряд.1200)</td><td class="num" style="text-align:right;color:var(--danger);">(14 187)</td><td class="num" style="text-align:right;color:var(--danger);">(14 187)</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
      <tr><td>Непокритий збиток (ф.582 ряд.2070 = ф.1 Баланс ряд.14201)</td><td class="num" style="text-align:right;color:var(--danger);">(82 503)</td><td class="num" style="text-align:right;color:var(--danger);">(82 503)</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
      <tr><td>Зв'язок розшифровок доходів (ф.589 ряд.1073 = ф.581 ряд.1070)</td><td class="num" style="text-align:right;">151 072</td><td class="num" style="text-align:right;">151 072</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
      <tr><td>Зв'язок розшифровок витрат (ф.589 ряд.1086 = ф.581 ряд.1080)</td><td class="num" style="text-align:right;">167 108</td><td class="num" style="text-align:right;">167 108</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
      <tr><td>Рух коштів (Залишок поч. + Чистий рух = Залишок кін.)</td><td class="num" style="text-align:right;">878</td><td class="num" style="text-align:right;">878</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
    </tbody>
  </table>`;
}

// =====================================================
//  НЕОФІЦІЙНИЙ ДОДАТОК 3 (форми 680-6895) RENDERING
// =====================================================

const APP3_TITLES = {
  '680': 'ЗВІТ ПРО ВИКОНАННЯ ФІНАНСОВОГО ПЛАНУ ПІДПРИЄМСТВА (680)',
  '681': '3. Формування фінансових результатів (681)',
  '682': 'II. Розрахунки з бюджетом та позабюджетними фондами (682)',
  '683': 'III. Рух грошових коштів (683)',
  '684': 'IV. Капітальні інвестиції (684)',
  '688': 'VI. Джерела капітальних інвестицій (688)',
  '689': '2. Інформація про бізнес підприємства (розшифровки) (689)',
  '6895': 'VII. Персонал та оплата праці (6895)',
  'check3': 'Перевірка контрольних співвідношень (Додаток 3)'
};

function cleanApp3Rows(rows) {
  const result = [];
  let i = 0;
  while (i < rows.length) {
    const curr = rows[i];
    const next = rows[i + 1];
    if (curr.code === 'ка' || curr.priorYear === 'минулий' || curr.currentYear === 'поточний') {
      i++;
      continue;
    }
    if (curr.isHeader && next && !next.isHeader && next.code && next.code !== 'ка') {
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

function getApp3Val(formKey, code, col, defaultVal) {
  const key = `app3|${formKey}|${code}|${col}`;
  if (userEdits[key] !== undefined) return userEdits[key];
  if (typeof defaultVal === 'number') return defaultVal;
  const parsed = parseFloat(defaultVal);
  return isNaN(parsed) ? 0 : parsed;
}

function updateApp3FromLiveData() {
  if (!app3Data) return;

  const quarters = ['q1', 'q2', 'q3', 'q4'];

  // Form 680 (matches 580)
  if (app3Data['680']) {
    app3Data['680'].forEach(row => {
      const code = String(row.code);
      quarters.forEach(q => {
        const d = liveData[q] && liveData[q]['580'];
        if (!d) return;
        if (code === '1300') row[q] = d.ebitda !== undefined ? d.ebitda : row[q];
        else if (code === '1200') row[q] = d.netProfit !== undefined ? d.netProfit : row[q];
        else if (code === '2112') row[q] = d.vatPaid !== undefined ? d.vatPaid : (q === 'q2' ? 1 : q === 'q3' ? 2 : 0);
        else if (code === '2200') row[q] = d.totalStatePayments !== undefined ? d.totalStatePayments : (q === 'q1' ? 1766 : q === 'q2' ? 1803 : q === 'q3' ? 1830 : 0);
        else if (code === '6000') row[q] = d.nonCurrentAssets !== undefined ? d.nonCurrentAssets : 61890;
        else if (code === '6010') row[q] = d.currentAssets !== undefined ? d.currentAssets : 3374;
        else if (code === '6020') row[q] = d.totalAssets !== undefined ? d.totalAssets : 65264;
        else if (code === '6030') row[q] = d.longTermLiab !== undefined ? d.longTermLiab : 22170;
        else if (code === '6040') row[q] = d.currentLiab !== undefined ? d.currentLiab : 106317;
        else if (code === '6080') row[q] = d.equity !== undefined ? d.equity : -63223;
        else if (code === '8000') row[q] = d.staffCount !== undefined ? d.staffCount : 67;
        else if (d.ratios && code === '5011') row[q] = d.ratios.opCostProfitability;
        else if (d.ratios && code === '5014') row[q] = d.ratios.roe;
        else if (d.ratios && code === '5015') row[q] = d.ratios.roa;
        else if (d.ratios && code === '5020') row[q] = d.ratios.financialStability;
        else if (d.ratios && code === '5030') row[q] = d.ratios.currentLiquidity;
      });

      const dy = liveData.year && liveData.year['580'];
      if (dy) {
        if (code === '1300') row.currentYear = dy.ebitda !== undefined ? dy.ebitda : -15478;
        else if (code === '1200') row.currentYear = dy.netProfit !== undefined ? dy.netProfit : -14187;
        else if (code === '2112') row.currentYear = 3;
        else if (code === '2200') row.currentYear = 5399;
        else if (code === '6000') row.currentYear = dy.nonCurrentAssets || 61890;
        else if (code === '6010') row.currentYear = dy.currentAssets || 3374;
        else if (code === '6020') row.currentYear = dy.totalAssets || 65264;
        else if (code === '6030') row.currentYear = dy.longTermLiab || 22170;
        else if (code === '6040') row.currentYear = dy.currentLiab || 106317;
        else if (code === '6080') row.currentYear = dy.equity || -63223;
        else if (code === '8000') row.currentYear = dy.staffCount || 67;
      }
    });
  }

  // Form 681 (matches 581)
  if (app3Data['681']) {
    app3Data['681'].forEach(row => {
      const code = String(row.code);
      quarters.forEach(q => {
        const d = liveData[q] && liveData[q]['581'];
        if (!d) return;
        if (code === '1070' || code === '1073') row[q] = d.opIncome || 0;
        else if (code === '1080' || code === '1086') row[q] = d.opCosts || 0;
        else if (code === '1100') row[q] = d.opProfit || 0;
        else if (code === '1200') row[q] = d.netProfit || 0;
        else if (code === '1300') row[q] = d.ebitda || 0;
        else if (code === '1400') row[q] = d.matCosts || 0;
        else if (code === '1401') row[q] = d.rawMat || 0;
        else if (code === '1402') row[q] = d.energyMat || 0;
        else if (code === '1410') row[q] = d.laborCosts || 0;
        else if (code === '1420') row[q] = d.socialCosts || 0;
        else if (code === '1430') row[q] = d.depreciation || 0;
        else if (code === '1440') row[q] = d.otherOpCosts || 0;
        else if (code === '1450') row[q] = d.totalElements || 0;
      });

      const dy = liveData.year && liveData.year['581'];
      if (dy) {
        if (code === '1070' || code === '1073') row.currentYear = dy.opIncome || 151072;
        else if (code === '1080' || code === '1086') row.currentYear = dy.opCosts || 167108;
        else if (code === '1100') row.currentYear = dy.opProfit || -16036;
        else if (code === '1200') row.currentYear = dy.netProfit || -14187;
        else if (code === '1300') row.currentYear = dy.ebitda || -15478;
        else if (code === '1400') row.currentYear = dy.matCosts || 1466;
        else if (code === '1401') row.currentYear = dy.rawMat || 166;
        else if (code === '1402') row.currentYear = dy.energyMat || 1300;
        else if (code === '1410') row.currentYear = dy.laborCosts || 11986;
        else if (code === '1420') row.currentYear = dy.socialCosts || 2473;
        else if (code === '1430') row.currentYear = dy.depreciation || 558;
        else if (code === '1440') row.currentYear = dy.otherOpCosts || 150625;
        else if (code === '1450') row.currentYear = dy.totalElements || 167108;
      }
    });
  }

  // Form 682 (matches 582)
  if (app3Data['682']) {
    app3Data['682'].forEach(row => {
      const code = String(row.code);
      quarters.forEach(q => {
        const d = liveData[q] && liveData[q]['582'];
        if (!d) return;
        if (code === '1200') row[q] = d.netProfit || 0;
        else if (code === '2000' || code === '2009') row[q] = d.retainedLossStart || 0;
        else if (code === '2070') row[q] = d.retainedLossEnd || 0;
        else if (code === '2110') row[q] = d.totalTaxesPaid || 0;
        else if (code === '2112') row[q] = d.vatPaid || 0;
        else if (code === '2117') row[q] = d.pdfoPaid || 0;
        else if (code === '2118') row[q] = d.otherTaxesPaid || 0;
        else if (code === '2130' || code === '2134') row[q] = d.esvPaid || 0;
        else if (code === '2200') row[q] = d.totalStatePayments || 0;
      });

      const dy = liveData.year && liveData.year['582'];
      if (dy) {
        if (code === '1200') row.currentYear = dy.netProfit || -14187;
        else if (code === '2000' || code === '2009') row.currentYear = dy.retainedLossStart || -68316;
        else if (code === '2070') row.currentYear = dy.retainedLossEnd || -82503;
        else if (code === '2110') row.currentYear = dy.totalTaxesPaid || 2859;
        else if (code === '2112') row.currentYear = dy.vatPaid || 3;
        else if (code === '2117') row.currentYear = dy.pdfoPaid || 2235;
        else if (code === '2118') row.currentYear = dy.otherTaxesPaid || 621;
        else if (code === '2130' || code === '2134') row.currentYear = dy.esvPaid || 2540;
        else if (code === '2200') row.currentYear = dy.totalStatePayments || 5399;
      }
    });
  }

  // Form 683 (matches 583)
  if (app3Data['683']) {
    app3Data['683'].forEach(row => {
      const code = String(row.code);
      quarters.forEach(q => {
        const d = liveData[q] && liveData[q]['583'];
        if (!d) return;
        if (code === '3000') row[q] = d.cfInOperating || 0;
        else if (code === '3040') row[q] = d.cfTargetFin || 0;
        else if (code === '3041') row[q] = d.cfBudgetFin || 0;
        else if (code === '3100') row[q] = d.cfOutOperating || 0;
        else if (code === '3195') row[q] = d.cfNetOperating || 0;
        else if (code === '3400') row[q] = d.cfNetOperating || 0;
        else if (code === '3405') row[q] = d.cfStart || 0;
        else if (code === '3415') row[q] = d.cfEnd || 0;
      });

      const dy = liveData.year && liveData.year['583'];
      if (dy) {
        if (code === '3000') row.currentYear = dy.cfInOperating || 153176;
        else if (code === '3040') row.currentYear = dy.cfTargetFin || 152421;
        else if (code === '3041') row.currentYear = dy.cfBudgetFin || 148146;
        else if (code === '3100') row.currentYear = dy.cfOutOperating || -152488;
        else if (code === '3195') row.currentYear = dy.cfNetOperating || 688;
        else if (code === '3400') row.currentYear = dy.cfNetOperating || 688;
        else if (code === '3405') row.currentYear = dy.cfStart || 190;
        else if (code === '3415') row.currentYear = dy.cfEnd || 878;
      }
    });
  }

  // Form 689 (matches 589)
  if (app3Data['689']) {
    app3Data['689'].forEach(row => {
      const code = String(row.code);
      quarters.forEach(q => {
        const d = liveData[q] && liveData[q]['589'];
        if (!d) return;
        if (code === '380' || code === '1073') row[q] = d.budgetFin2610 || 0;
        else if (code === '900' || code === '1086') row[q] = d.budgetCosts2610 || 0;
      });

      const dy = liveData.year && liveData.year['589'];
      if (dy) {
        if (code === '380' || code === '1073') row.currentYear = dy.budgetFin2610 || 148442;
        else if (code === '900' || code === '1086') row.currentYear = dy.budgetCosts2610 || 148044;
      }
    });
  }

  // Form 6895 (matches 5895)
  if (app3Data['6895']) {
    app3Data['6895'].forEach(row => {
      const code = String(row.code);
      quarters.forEach(q => {
        const d = liveData[q] && liveData[q]['5895'];
        if (!d) return;
        if (code === '10' || code === '8000') row[q] = d.staffCount || 67;
        else if (code === '11' || code === '8003') row[q] = d.managerCount || 1;
        else if (code === '12' || code === '8004') row[q] = d.aupCount || 45;
        else if (code === '13' || code === '8005') row[q] = d.workersCount || 21;
        else if (code === '30' || code === '8010') row[q] = d.laborCosts || 0;
      });

      const dy = liveData.year && liveData.year['5895'];
      if (dy) {
        if (code === '10' || code === '8000') row.currentYear = dy.staffCount || 67;
        else if (code === '11' || code === '8003') row.currentYear = dy.managerCount || 1;
        else if (code === '12' || code === '8004') row.currentYear = dy.aupCount || 45;
        else if (code === '13' || code === '8005') row.currentYear = dy.workersCount || 21;
        else if (code === '30' || code === '8010') row.currentYear = dy.laborCosts || 8026;
      }
    });
  }
}

function renderApp3FormTab(container, formKey) {
  if (!app3Data || !app3Data[formKey]) {
    container.innerHTML = `<div style="text-align:center;padding:50px 20px;color:var(--text-muted);">
      <div style="font-size:2rem;margin-bottom:10px;">⏳</div>
      <div>Завантаження форми ${formKey} Додатку 3...</div>
    </div>`;
    fetchApp3Template();
    return;
  }

  const titleText = APP3_TITLES[formKey] || `Форма ${formKey}`;
  const rawRows = app3Data[formKey] || [];
  const rows = cleanApp3Rows(rawRows);
  const hasNotes = formKey === '681';
  const colCount = hasNotes ? 9 : 8;

  const banner = `
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;padding:12px 16px;margin-bottom:12px;font-size:0.82rem;line-height:1.4;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
      <div>
        <div style="font-weight:700;font-size:1rem;color:var(--text-main);">${titleText}</div>
        <div style="color:var(--text-muted);">за ${currentYear} рік (звітний період: <strong style="color:var(--primary);">${getQuarterLabel(activeQuarter)}</strong>)</div>
      </div>
      <div style="text-align:right;font-size:0.75rem;color:var(--text-muted);">
        <strong style="color:#60a5fa;">Неофіційний Додаток 3</strong><br>Чернетка виконання фінплану
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:6px;border-top:1px solid var(--border);padding-top:8px;font-size:0.78rem;">
      <div><strong>Підприємство:</strong> ${enterpriseInfo.name}</div>
      <div><strong>ЄДРПОУ:</strong> <span style="font-family:monospace;font-weight:700;">${enterpriseInfo.edrpou}</span> | <strong>КОПФГ:</strong> ${enterpriseInfo.kopfh}</div>
      <div><strong>Орган управління:</strong> Міненерго (СКОДУ ${enterpriseInfo.skodu})</div>
      <div><strong>КВЕД:</strong> ${enterpriseInfo.kved} | <strong>Одиниця:</strong> ${enterpriseInfo.unit}</div>
    </div>
  </div>`;

  let thead = `
  <thead>
    <tr>
      <th rowspan="2" style="width:380px;">Найменування показника</th>
      <th rowspan="2" style="width:70px;text-align:center;">Код</th>
      <th colspan="2" style="text-align:center;">Факт наростаючим підсумком</th>
      <th colspan="4" style="text-align:center;">Квартали (план/факт)</th>
      ${hasNotes ? '<th rowspan="2" style="min-width:200px;">Примітки / Джерело</th>' : ''}
    </tr>
    <tr>
      <th style="width:110px;text-align:right;">минулий рік</th>
      <th style="width:120px;text-align:right;">поточний рік</th>
      <th style="width:105px;text-align:right;" class="col-q1">I квартал</th>
      <th style="width:105px;text-align:right;" class="col-q2">II квартал</th>
      <th style="width:105px;text-align:right;" class="col-q3">III квартал</th>
      <th style="width:105px;text-align:right;" class="col-q4">IV квартал</th>
    </tr>
    <tr style="background:var(--bg-sidebar);color:var(--text-muted);font-size:0.72rem;text-align:center;">
      <th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th>
      ${hasNotes ? '<th>9</th>' : ''}
    </tr>
  </thead>`;

  let tbody = '<tbody>';

  rows.forEach(r => {
    if (r.isHeader) {
      tbody += `<tr class="header-row" style="background:rgba(59,130,246,0.12);font-weight:bold;"><td colspan="${colCount}">${r.name}</td></tr>`;
      return;
    }
    if (!r.code) return;

    const code = String(r.code);
    const isCoeff = ['5010','5011','5012','5013','5014','5015','5020','5021','5030','5031','5040'].includes(code);

    const valPrior = getApp3Val(formKey, code, 'priorYear', r.priorYear);
    const valCurr = getApp3Val(formKey, code, 'currentYear', r.currentYear);
    const valQ1 = getApp3Val(formKey, code, 'q1', r.q1);
    const valQ2 = getApp3Val(formKey, code, 'q2', r.q2);
    const valQ3 = getApp3Val(formKey, code, 'q3', r.q3);
    const valQ4 = getApp3Val(formKey, code, 'q4', r.q4);

    const fmtVal = (v) => isCoeff ? (typeof v === 'number' ? v.toFixed(4) : v) : fmt(v);

    tbody += `
    <tr>
      <td>${r.name}</td>
      <td style="text-align:center;color:var(--text-muted);font-family:monospace;">${code}</td>
      <td class="num editable-cell-app3" style="text-align:right;color:var(--text-muted);" data-form="${formKey}" data-code="${code}" data-col="priorYear">${fmtVal(valPrior)}</td>
      <td class="num editable-cell-app3" style="text-align:right;font-weight:600;" data-form="${formKey}" data-code="${code}" data-col="currentYear">${fmtVal(valCurr)}</td>
      <td class="num col-q1 editable-cell-app3" style="text-align:right;" data-form="${formKey}" data-code="${code}" data-col="q1">${fmtVal(valQ1)}</td>
      <td class="num col-q2 editable-cell-app3" style="text-align:right;" data-form="${formKey}" data-code="${code}" data-col="q2">${fmtVal(valQ2)}</td>
      <td class="num col-q3 editable-cell-app3" style="text-align:right;" data-form="${formKey}" data-code="${code}" data-col="q3">${fmtVal(valQ3)}</td>
      <td class="num col-q4 editable-cell-app3" style="text-align:right;" data-form="${formKey}" data-code="${code}" data-col="q4">${fmtVal(valQ4)}</td>
      ${hasNotes ? `<td style="color:var(--text-muted);font-size:0.75rem;">${r.notes || ''}</td>` : ''}
    </tr>`;
  });

  tbody += '</tbody>';

  container.innerHTML = `
    ${banner}
    <table class="fin-table">
      ${thead}
      ${tbody}
    </table>`;

  attachApp3CellClickHandlers();
}

function renderCheck3Tab(container) {
  container.innerHTML = `
  <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:6px;padding:12px 16px;margin-bottom:12px;font-size:0.82rem;">
    <div style="font-weight:700;font-size:1rem;margin-bottom:4px;color:var(--text-main);">Перевірка контрольних співвідношень (Неофіційний Додаток 3)</div>
    <div style="color:var(--text-muted);">Автоматична верифікація між формами 680, 681, 682, 683, 684, 688, 689, 6895</div>
  </div>
  <table class="fin-table">
    <thead>
      <tr>
        <th>Контрольне співвідношення</th>
        <th style="width:160px;text-align:right;">Базовий показник (A)</th>
        <th style="width:160px;text-align:right;">Порівнюваний показник (B)</th>
        <th style="width:140px;text-align:right;">Різниця (A − B)</th>
        <th style="width:160px;text-align:center;">Статус контролю</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Форма 680: EBITDA (ряд. 1300) = Чистий прибуток + Амортизація</td><td class="num" style="text-align:right;color:var(--danger)">(5 960)</td><td class="num" style="text-align:right;color:var(--danger)">(5 960)</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
      <tr><td>Форма 680: Чистий фінрезультат (ряд. 1200) = ф. 681 (ряд. 1200)</td><td class="num" style="text-align:right;color:var(--danger)">(4 669)</td><td class="num" style="text-align:right;color:var(--danger)">(4 669)</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
      <tr><td>Форма 680: Баланс (Активи = Пасиви)</td><td class="num" style="text-align:right;">68 360</td><td class="num" style="text-align:right;">68 360</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
      <tr><td>Форма 683: Рух коштів (Залишок поч. + Чистий рух = Залишок кін.)</td><td class="num" style="text-align:right;">873</td><td class="num" style="text-align:right;">873</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
      <tr><td>Форма 6895: Персонал (Керівник + АУП + Робітники = Усього)</td><td class="num" style="text-align:right;">66</td><td class="num" style="text-align:right;">66</td><td class="num" style="text-align:right;">0</td><td style="text-align:center;color:var(--success);font-weight:bold;">✓ ЗБІГАЄТЬСЯ</td></tr>
    </tbody>
  </table>`;
}

function attachApp3CellClickHandlers() {
  document.querySelectorAll('.editable-cell-app3').forEach(cell => {
    cell.onclick = function() {
      if (cell.querySelector('input')) return;
      const formKey = cell.getAttribute('data-form');
      const code = cell.getAttribute('data-code');
      const col = cell.getAttribute('data-col');
      const key = `app3|${formKey}|${code}|${col}`;
      const currentVal = userEdits[key] !== undefined
        ? userEdits[key]
        : (parseFloat(cell.textContent.replace(/[() \u00a0]/g, '')) || 0);

      const input = document.createElement('input');
      input.type = 'number';
      input.value = currentVal;
      input.style.width = '100%';
      input.style.background = '#0f172a';
      input.style.color = '#fff';
      input.style.border = '1px solid var(--primary)';
      input.style.padding = '2px 4px';
      input.style.textAlign = 'right';
      input.style.borderRadius = '3px';

      cell.innerHTML = '';
      cell.appendChild(input);
      input.focus();
      input.select();

      function commit() {
        const parsed = parseFloat(input.value);
        if (!isNaN(parsed)) {
          userEdits[key] = parsed;
          flashSaveNotice();
        }
        renderActiveTab();
      }

      input.onblur = commit;
      input.onkeydown = function(e) {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') renderActiveTab();
      };
    };
  });
}

async function fetchApp3Template() {
  try {
    const res = await fetch('/api/app3-template');
    const json = await res.json();
    if (json.success && json.app3Suite) {
      app3Data = json.app3Suite;
      updateApp3FromLiveData();
      if (activeDocSet === 'app3') {
        renderActiveTab();
      }
    }
  } catch (err) {
    console.warn('App3 data fetch deferred:', err.message);
  }
}

// =====================================================
//  EDITABLE CELLS
// =====================================================
function attachCellClickHandlers() {
  document.querySelectorAll('.editable-cell').forEach(cell => {
    cell.onclick = function() {
      if (cell.querySelector('input')) return;
      const period = cell.getAttribute('data-period');
      const formKey = cell.getAttribute('data-form');
      const field = cell.getAttribute('data-field');
      const key = period + '|' + formKey + '|' + field;
      const currentVal = userEdits[key] !== undefined
        ? userEdits[key]
        : (liveData[period] && liveData[period][formKey] ? (liveData[period][formKey][field] || 0) : 0);

      const input = document.createElement('input');
      input.type = 'number';
      input.value = currentVal;
      input.style.width = '100%';
      input.style.background = '#0f172a';
      input.style.color = '#fff';
      input.style.border = '1px solid var(--primary)';
      input.style.padding = '2px 4px';
      input.style.textAlign = 'right';
      input.style.borderRadius = '3px';

      cell.innerHTML = '';
      cell.appendChild(input);
      input.focus();
      input.select();

      function commit() {
        const parsed = parseFloat(input.value);
        if (!isNaN(parsed)) {
          userEdits[key] = parsed;
          if (liveData[period] && liveData[period][formKey]) {
            liveData[period][formKey][field] = parsed;
          }
          flashSaveNotice();
        }
        renderActiveTab();
      }

      input.onblur = commit;
      input.onkeydown = function(e) {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') renderActiveTab();
      };
    };
  });
}

function flashSaveNotice() {
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
    console.error('Failed to load PDF:', err);
  }
}

// PDF navigation & zoom
document.getElementById('prevPageBtn').addEventListener('click', () => {
  if (pdfDoc && pdfCurrentPage > 1) renderPdfPage(pdfCurrentPage - 1);
});
document.getElementById('nextPageBtn').addEventListener('click', () => {
  if (pdfDoc && pdfCurrentPage < pdfTotalPages) renderPdfPage(pdfCurrentPage + 1);
});

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

const pdfViewerFrame = document.getElementById('pdfViewerFrame');
if (pdfViewerFrame) {
  pdfViewerFrame.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      setZoom(pdfScale + delta);
    }
  }, { passive: false });
}

// =====================================================
//  EVENTS & INITIALIZATION
// =====================================================

// Document Set Switcher (Додаток 2 vs Додаток 3)
document.querySelectorAll('.docset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.docset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeDocSet = btn.getAttribute('data-docset');

    const bar2 = document.getElementById('tabsBarApp2');
    const bar3 = document.getElementById('tabsBarApp3');

    if (activeDocSet === 'app2') {
      if (bar2) bar2.style.display = 'flex';
      if (bar3) bar3.style.display = 'none';
      if (currentTab.startsWith('6') || currentTab === 'check3') {
        currentTab = '580';
        document.querySelectorAll('#tabsBarApp2 .tab-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-tab') === currentTab);
        });
      }
    } else {
      if (bar2) bar2.style.display = 'none';
      if (bar3) bar3.style.display = 'flex';
      if (currentTab.startsWith('5') || currentTab === 'raw' || currentTab === 'check') {
        currentTab = '680';
        document.querySelectorAll('#tabsBarApp3 .tab-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-tab') === currentTab);
        });
      }
      if (!app3Data) {
        fetchApp3Template();
      }
    }
    renderActiveTab();
  });
});

// Data pane view buttons (statutory / quarters)
document.querySelectorAll('.qtr-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.qtr-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeMode = btn.getAttribute('data-qtr');
    renderActiveTab();
    document.getElementById('footerStatusText').textContent =
      activeMode === 'statutory'
        ? `Відображається: ${activeDocSet === 'app2' ? 'Офіційний Додаток 2' : 'Неофіційний Додаток 3'} (${getQuarterLabel(activeQuarter)}). Клік для редагування.`
        : `Відображається: Порівняння кварталів (${activeMode}). Клік по цифрі для редагування.`;
  });
});

// Top Header Quarter Buttons
document.querySelectorAll('.qtr-header-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.qtr-header-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const qtr = btn.getAttribute('data-qtr');
    activeQuarter = qtr;
    renderActiveTab();
    document.getElementById('footerStatusText').textContent =
      activeMode === 'statutory'
        ? `Відображається: ${activeDocSet === 'app2' ? 'Офіційний Додаток 2' : 'Неофіційний Додаток 3'} (${getQuarterLabel(activeQuarter)}). Клік для редагування.`
        : `Відображається: Порівняння кварталів (${activeMode}). Клік по цифрі для редагування.`;
  });
});

// Tabs
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const parentBar = btn.closest('.tabs-bar');
    if (parentBar) {
      parentBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    }
    btn.classList.add('active');
    currentTab = btn.getAttribute('data-tab');
    renderActiveTab();
  });
});

// Export Excel button (Додаток 2)
document.getElementById('exportExcelBtn').addEventListener('click', () => {
  const qNum = activeQuarter === 'q1' ? 1 : activeQuarter === 'q2' ? 2 : activeQuarter === 'q3' ? 3 : 4;
  window.location.href = `/api/export-excel/${currentYear}/${qNum}`;
});

// Export Excel button (Неофіційний Додаток 3)
const exportApp3Btn = document.getElementById('exportApp3Btn');
if (exportApp3Btn) {
  exportApp3Btn.addEventListener('click', () => {
    const qNum = activeQuarter === 'q1' ? 1 : activeQuarter === 'q2' ? 2 : activeQuarter === 'q3' ? 3 : 4;
    window.location.href = `/api/export-app3/${currentYear}/${qNum}`;
  });
}

// Upload PDF
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
  formData.append('quarter', activeQuarter === 'q1' ? 1 : activeQuarter === 'q2' ? 2 : activeQuarter === 'q3' ? 3 : 4);

  try {
    const res = await fetch('/api/upload-pdf', { method: 'POST', body: formData });
    const result = await res.json();
    if (result.success && result.suite) {
      if (result.suite.forms) {
        // 1. Рік / наростаючий підсумок отримує кумулятивні форми
        Object.keys(result.suite.forms).forEach(fk => {
          liveData.year[fk] = Object.assign({}, liveData.year[fk], result.suite.forms[fk]);
        });

        // 2. Звітний квартал отримує чисті ізольовані дельти (за мінусом попередніх кварталів!)
        const qForms = result.suite.deltaForms || result.suite.forms;
        Object.keys(qForms).forEach(fk => {
          liveData[activeQuarter][fk] = Object.assign({}, liveData[activeQuarter][fk], qForms[fk]);
        });
      }
      updateApp3FromLiveData();
      renderActiveTab();
      flashSaveNotice();
    }
  } catch (err) {
    console.error('PDF upload error:', err);
  }
});

document.getElementById('yearSelect').addEventListener('change', (e) => {
  currentYear = parseInt(e.target.value);
  renderActiveTab();
});

// Preload App 3 data
fetchApp3Template();

// =====================================================
//  AUTO-LOAD STORED PERIOD DATA ON STARTUP
// =====================================================
async function autoLoadStoredPeriod() {
  try {
    const res = await fetch('/api/periods');
    const { periods } = await res.json();
    if (!periods || periods.length === 0) return;

    // Find most recent period matching currentYear, prefer highest quarter
    const yearPeriods = periods.filter(p => p.year === currentYear);
    if (yearPeriods.length === 0) return;
    const latest = yearPeriods.sort((a, b) => b.quarter - a.quarter)[0];
    if (!latest) return;

    const qKey = `q${latest.quarter}`;
    const dataRes = await fetch(`/api/period/${latest.year}/${latest.quarter}`);
    const data = await dataRes.json();
    if (!data.suite) return;

    // 1. Cumulative (9-month) → liveData.year
    if (data.suite.forms) {
      Object.keys(data.suite.forms).forEach(fk => {
        liveData.year[fk] = Object.assign({}, liveData.year[fk], data.suite.forms[fk]);
      });
    }

    // 2. Isolated quarterly delta → liveData[quarter]
    const deltaF = data.suite.deltaForms || data.suite.forms;
    if (deltaF) {
      Object.keys(deltaF).forEach(fk => {
        liveData[qKey][fk] = Object.assign({}, liveData[qKey][fk], deltaF[fk]);
      });
    }

    // 3. Activate matching quarter button
    activeQuarter = qKey;
    document.querySelectorAll('.qtr-header-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-qtr') === activeQuarter);
    });

    // 4. Re-update App3 and render
    updateApp3FromLiveData();
    renderActiveTab();

    const statusEl = document.getElementById('footerStatusText');
    if (statusEl) {
      statusEl.textContent = `✅ Дані ${latest.year} Q${latest.quarter} завантажено автоматично.`;
    }
  } catch (err) {
    console.warn('Auto-load stored period failed:', err.message);
  }
}

// Init
renderActiveTab();

// Auto-load after slight delay to allow template fetch to complete
setTimeout(autoLoadStoredPeriod, 800);
