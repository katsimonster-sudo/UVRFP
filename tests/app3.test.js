const assert = require('assert');
const ExcelJS = require('exceljs');
const { generateApp3Workbook } = require('../src/excel/app3Generator');

async function runTest() {
  console.log('Testing App3 Excel workbook generator...');
  const buffer = await generateApp3Workbook({});
  assert.ok(buffer && buffer.length > 5000, 'App3 Excel buffer should be > 5KB');

  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);

  const expectedSheets = ['680', '681', '682', '683', '684', '688', '689', '6895', 'Перевірка'];
  assert.strictEqual(wb.worksheets.length, 9, 'Should have exactly 9 worksheets');

  for (const sheetName of expectedSheets) {
    const ws = wb.getWorksheet(sheetName);
    assert.ok(ws, `Worksheet ${sheetName} must exist`);
    assert.ok(ws.rowCount >= 5, `Worksheet ${sheetName} must have at least 5 rows (has ${ws.rowCount})`);
  }

  // Check specific content on 680
  const ws680 = wb.getWorksheet('680');
  assert.ok(ws680.getCell('A16').value.toString().includes('ЗВІТ ПРО ВИКОНАННЯ'), 'Form 680 title mismatch');

  // Check specific content on 681
  const ws681 = wb.getWorksheet('681');
  assert.ok(ws681.columns.length >= 9, 'Form 681 should have at least 9 columns');

  console.log('✓ app3.test.js passed successfully');
}

runTest().catch(err => {
  console.error('✗ app3.test.js failed:', err);
  process.exit(1);
});

