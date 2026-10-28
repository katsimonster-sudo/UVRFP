const assert = require('assert');
const {
  enterpriseInfo,
  template580,
  template581,
  template582,
  template583,
  template584,
  template585,
  template588,
  template587,
  template5895
} = require('../src/calc/statutoryTemplate');

// 1. Enterprise info checks
assert.strictEqual(enterpriseInfo.edrpou, '39244432');
assert.ok(enterpriseInfo.name.includes('Укрвуглереструктуризація'));
assert.strictEqual(enterpriseInfo.kved, '05.10');

// 2. Form 580 (Основні показники) checks
assert.ok(Array.isArray(template580));
const row1000 = template580.find(r => r.code === '1000');
const row1300 = template580.find(r => r.code === '1300');
const row5010 = template580.find(r => r.code === '5010');
const row6000 = template580.find(r => r.code === '6000');
const row8000 = template580.find(r => r.code === '8000');

assert.ok(row1000, 'Row 1000 must exist');
assert.ok(row1300, 'Row 1300 EBITDA must exist');
assert.ok(row5010, 'Row 5010 profitability ratio must exist');
assert.ok(row6000, 'Row 6000 non-current assets must exist');
assert.ok(row8000, 'Row 8000 staff count must exist');

// 3. Form 581 (Таблиця 3. Формування фінансових результатів)
assert.ok(Array.isArray(template581));
const row1011 = template581.find(r => r.code === '1011');
const row1400 = template581.find(r => r.code === '1400');
const row1450 = template581.find(r => r.code === '1450');
assert.ok(row1011, 'Row 1011 raw materials must exist');
assert.ok(row1400, 'Row 1400 material costs must exist');
assert.ok(row1450, 'Row 1450 total cost elements must exist');

// 4. Form 582, 583, 584, 585, 588, 587
assert.ok(template582.some(r => r.code === '2000'));
assert.ok(template582.some(r => r.code === '2200'));
assert.ok(template583.some(r => r.code === '3000'));
assert.ok(template583.some(r => r.code === '3415'));
assert.ok(template584.some(r => r.code === '4000'));
assert.ok(template588.length > 0);

console.log('✓ statutory.test.js passed');

