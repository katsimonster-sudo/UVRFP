const assert = require('assert');
const path = require('path');
const fs = require('fs');
const { savePeriodData, getPeriodData, getAllPeriods } = require('../src/storage/periodStore');

const testYear = 2099;
const testQuarter = 4;
const sampleData = {
  'f1_1300': 65264,
  'f1_1900': 65264,
  'f2_2120': 151072,
  'f2_2180': -167108
};

savePeriodData(testYear, testQuarter, sampleData);
const loaded = getPeriodData(testYear, testQuarter);

assert.ok(loaded, 'Loaded period data should not be null');
assert.strictEqual(loaded['f1_1300'], 65264);
assert.strictEqual(loaded['f2_2120'], 151072);

const periods = getAllPeriods();
const found = periods.some(p => p.year === testYear && p.quarter === testQuarter);
assert.ok(found, 'Saved period should be listed in getAllPeriods');

// Clean up test file so it does not pollute storage
const testFile = path.resolve(__dirname, `../data/periods/${testYear}_q${testQuarter}.json`);
if (fs.existsSync(testFile)) fs.unlinkSync(testFile);

console.log('✓ storage.test.js passed');
