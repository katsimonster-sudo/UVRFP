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

    console.log('✓ server.test.js passed');
    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('Server test error:', err);
    server.close(() => {
      process.exit(1);
    });
  }
});
