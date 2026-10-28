const assert = require('assert');
const ExcelJS = require('exceljs');
const { generateFinPlanWorkbook } = require('../src/excel/excelGenerator');
const { computeFinPlanSuite } = require('../src/calc/mappingMatrix');

async function runTest() {
  const sampleSuite = computeFinPlanSuite();
  const buffer = await generateFinPlanWorkbook(sampleSuite);

  assert.ok(buffer && buffer.length > 0, 'Buffer should not be empty');

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const expectedSheets = [
    '580', '581', '582', '583', '584', '588', '589', '5895', 'Дані_ПДФ', 'Перевірка'
  ];

  assert.strictEqual(wb.worksheets.length, 10, 'Workbook must contain exactly 10 sheets');

  for (const name of expectedSheets) {
    const ws = wb.getWorksheet(name);
    assert.ok(ws, `Sheet "${name}" must exist in generated workbook`);
    assert.ok(ws.rowCount > 5, `Sheet "${name}" should have rows`);
  }

  // Check form 584 formula or row
  const ws584 = wb.getWorksheet('584');
  const wsCheck = wb.getWorksheet('Перевірка');
  assert.ok(ws584, '584 exists');
  assert.ok(wsCheck, 'Перевірка exists');

  console.log('✓ excel.test.js passed');
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
