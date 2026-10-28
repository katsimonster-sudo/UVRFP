const assert = require('assert');
const { calculateQuarterDelta, calculateEBITDA } = require('../src/calc/deltaCalculator');
const { calculateRatios } = require('../src/calc/ratiosCalculator');
const { computeFinPlanSuite } = require('../src/calc/mappingMatrix');

// 1. Delta calculation
const delta = calculateQuarterDelta(151072, [48834, 59443, 42795]);
assert.strictEqual(delta, 0);

// 2. EBITDA: -16036 (ряд. 1100) + 558 (ряд. 1430) = -15478
const ebitda = calculateEBITDA(-16036, 558);
assert.strictEqual(ebitda, -15478);

// 3. Financial Ratios test with sample figures from 3rd Quarter 2026:
// Чистий фінрез = -14187, Власний капітал = -63223, Активи = 65264, Довгострокові зобов. = 22170, Поточні = 106317
// Оборотні активи = 3374, Запаси = 1412
const ratios = calculateRatios({
  netProfit: -14187,
  equity: -63223,
  assets: 65264,
  longTermLiabilities: 22170,
  currentLiabilities: 106317,
  currentAssets: 3374,
  inventories: 1412,
  opProfit: -16036,
  opCosts: 167108,
  ebitda: -15478,
  cash: 878,
  shortDebt: 0,
  longDebt: 0
});

// ROE: -14187 / -63223 = ~0.2244
assert.ok(Math.abs(ratios.roe - 0.2244) < 0.001, `ROE should be ~0.2244, got ${ratios.roe}`);
// ROA: -14187 / 65264 = ~-0.2174
assert.ok(Math.abs(ratios.roa - (-0.2174)) < 0.001, `ROA should be ~-0.2174, got ${ratios.roa}`);
// Current Liquidity: 3374 / 106317 = ~0.0317
assert.ok(Math.abs(ratios.currentLiquidity - 0.0317) < 0.001, `Current liquidity should be ~0.0317, got ${ratios.currentLiquidity}`);
// Quick Liquidity: (3374 - 1412) / 106317 = ~0.0185
assert.ok(Math.abs(ratios.quickLiquidity - 0.0185) < 0.001, `Quick liquidity should be ~0.0185, got ${ratios.quickLiquidity}`);

console.log('✓ calc.test.js passed');
