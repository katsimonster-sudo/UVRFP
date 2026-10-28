const assert = require('assert');
const app = require('../src/server');

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Check GET /api/periods
    const resPeriods = await fetch(`${baseUrl}/api/periods`);
    assert.strictEqual(resPeriods.status, 200, 'GET /api/periods should return 200');
    const jsonPeriods = await resPeriods.json();
    assert.ok(Array.isArray(jsonPeriods.periods), 'periods should be array');

    // 2. Check GET /api/export-excel/2026/3
    const resExcel = await fetch(`${baseUrl}/api/export-excel/2026/3`);
    assert.strictEqual(resExcel.status, 200, 'Excel export should return 200');
    assert.strictEqual(resExcel.headers.get('content-type'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await resExcel.arrayBuffer();

    // 3. Check GET /api/pdfs-status/2026
    const resPdfStatus = await fetch(`${baseUrl}/api/pdfs-status/2026`);
    assert.strictEqual(resPdfStatus.status, 200, 'GET /api/pdfs-status should return 200');
    const jsonPdfStatus = await resPdfStatus.json();
    assert.ok(jsonPdfStatus.quarters, 'quarters object should exist');
    assert.strictEqual(jsonPdfStatus.quarters['3'].available, true, 'Q3 PDF should be available');

    // 4. Check GET /api/pdf/2026/3
    const resPdf = await fetch(`${baseUrl}/api/pdf/2026/3`);
    assert.strictEqual(resPdf.status, 200, 'GET /api/pdf/2026/3 should return 200');
    assert.strictEqual(resPdf.headers.get('content-type'), 'application/pdf');
    await resPdf.arrayBuffer();

    console.log('✓ server.test.js passed');
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 100);
  } catch (err) {
    console.error('Server test error:', err);
    if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
    server.close(() => process.exit(1));
    setTimeout(() => process.exit(1), 100);
  }
});
