const assert = require('assert');
const ExcelJS = require('exceljs');
const { computeFinPlanSuite } = require('../src/calc/mappingMatrix');
const { generateFinPlanWorkbook } = require('../src/excel/excelGenerator');
const { savePeriodData, getPeriodData } = require('../src/storage/periodStore');

async function runE2E() {
  console.log('Running End-to-End Financial Plan Suite Verification...');

  // 1. Simulate parsed data matching 3квЛМ001.pdf exactly
  const raw3Q = {
    f1: {
      '1095': { value: 61890 }, // Необоротні активи
      '1100': { value: 1412 },  // Запаси
      '1165': { value: 878 },   // Гроші
      '1195': { value: 3374 },  // Оборотні активи
      '1300': { value: 65264 }, // Баланс Активи
      '1495': { value: -63223 },// Власний капітал
      '14201_3': { value: -68316 }, // Збиток поч.
      '14201_4': { value: -82503 }, // Збиток кін.
      '1595': { value: 22170 }, // Довгострокові зобов.
      '1695': { value: 106317 },// Поточні зобов.
      '1615': { value: 55365 }, // Кредиторка товари
      '1620': { value: 3869 },  // Розрахунки з бюджетом
      'staff': 67
    },
    f2: {
      '2120': { value: 151072 },
      '2180': { value: -167108 },
      '2195': { value: -16036 },
      '2240': { value: 4859 },
      '2270': { value: -3010 },
      '2355': { value: -14187 },
      '2500': { value: 1466 },
      '2505': { value: 11986 },
      '2510': { value: 2473 },
      '2515': { value: 558 },
      '2520': { value: 150625 }
    },
    f3: {
      '3010': { value: 152421 },
      '3095': { value: 755 },
      '3100': { value: -152488 },
      '3105': { value: -9525 },
      '3110': { value: -2540 },
      '3115': { value: -2859 },
      '3195': { value: 688 },
      '3400': { value: 688 },
      '3405': { value: 190 },
      '3415': { value: 878 }
    },
    '1956': {
      '240': { value: 151072 },
      '70': { value: 148442 },
      '72': { value: 148044 },
      '330': { value: 4859 },
      '315': { value: 3010 }
    },
    '1704': {
      '190': { value: 2859 },
      '30': { value: 3 },
      '50': { value: 2235 }
    },
    '8210': {
      '5': { value: 2540 }
    },
    '1633': {
      '41': { value: 148146 },
      '140': { value: 6198 }
    },
    '6220': {
      '12': { value: 45 },
      '1630': { value: 8026 }
    }
  };

  // Prior quarters data
  const priorData = {
    q1: { opIncome: 48834, opCosts: 50997, opProfit: -2163, netProfit: -685 },
    q2: { opIncome: 59443, opCosts: 63614, opProfit: -4171, netProfit: -3984 },
    q3: { opIncome: 42795, opCosts: 52497, opProfit: -9702, netProfit: -9518 }
  };

  // 2. Compute Suite
  const suite = computeFinPlanSuite(raw3Q, priorData);
  assert.ok(suite, 'Suite must be generated');

  // Verify core figures matching user's Excel exactly
  const f580 = suite.forms['580'];
  const f581 = suite.forms['581'];
  const f582 = suite.forms['582'];
  const f583 = suite.forms['583'];

  assert.strictEqual(f580.ebitda, -15478, 'Form 580 EBITDA must be -15478');
  assert.strictEqual(f580.netProfit, -14187, 'Form 580 Net Profit must be -14187');
  assert.strictEqual(f581.opIncome, 151072, 'Form 581 Row 1070 must be 151072');
  assert.strictEqual(f581.opCosts, 167108, 'Form 581 Row 1080 must be 167108');
  assert.strictEqual(f582.retainedLossStart, -68316, 'Form 582 Row 2000 must be -68316');
  assert.strictEqual(f582.retainedLossEnd, -82503, 'Form 582 Row 2070 must be -82503');
  assert.strictEqual(f583.cfInOperating, 152421, 'Form 583 Row 3000 must be 152421');
  assert.strictEqual(f583.cfEnd, 878, 'Form 583 Ending cash must be 878');

  // Verify Validation Matrix
  assert.strictEqual(suite.validation.balanceCheck.status, 'OK', 'Balance check must be OK');
  assert.strictEqual(suite.validation.cashFlowCheck.status, 'OK', 'Cash flow check must be OK');
  assert.strictEqual(suite.validation.retainedLossCheck.status, 'OK', 'Retained loss check must be OK');

  // 3. Test Excel Export Output
  const buffer = await generateFinPlanWorkbook(suite);
  assert.ok(buffer && buffer.length > 5000, 'Excel file should be a valid binary buffer > 5KB');

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  assert.strictEqual(wb.worksheets.length, 10, 'Excel must have all 10 sheets');

  // Verify Form 584 formulas
  const ws584 = wb.getWorksheet('584');
  const sumFormulaCell = ws584.getCell('C9');
  assert.ok(sumFormulaCell.formula || ws584.getCell('D9').formula, 'Sheet 584 must have SUM formula');

  console.log('✓ All 10 sheets verified successfully');
  console.log('✓ All mathematical cross-form balances match 100%');
  console.log('✓ e2e.test.js passed');
}

runE2E().catch(err => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
