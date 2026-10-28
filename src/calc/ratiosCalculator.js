/**
 * Financial ratio calculations for Form 580 Section IV
 */

function round4(val) {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return 0;
  return Math.round(val * 10000) / 10000;
}

function calculateRatios(params = {}) {
  const {
    netProfit = 0,
    equity = 0,
    assets = 0,
    longTermLiabilities = 0,
    currentLiabilities = 0,
    currentAssets = 0,
    inventories = 0,
    opProfit = 0,
    opCosts = 0,
    ebitda = 0,
    cash = 0,
    shortDebt = 0,
    longDebt = 0
  } = params;

  // Рентабельність операційних витрат: ряд. 1100 / операційні витрати
  const opCostProfitability = opCosts !== 0 ? round4(opProfit / opCosts) : 0;

  // Рентабельність власного капіталу (ROE): ряд. 1200 / власний капітал
  const roe = equity !== 0 ? round4(netProfit / equity) : 0;

  // Рентабельність активів (ROA): ряд. 1200 / сукупні активи
  const roa = assets !== 0 ? round4(netProfit / assets) : 0;

  // Фінансова стійкість: власний капітал / (довгострокові зобов. + поточні зобов.)
  const totalLiabilities = (longTermLiabilities || 0) + (currentLiabilities || 0);
  const financialStability = totalLiabilities !== 0 ? round4(equity / totalLiabilities) : 0;

  // Відношення боргу до EBITDA: ((короткострокові кредити + довгострокові кредити) - (гроші + фін. інвестиції)) / EBITDA
  const netDebt = (shortDebt + longDebt) - cash;
  const debtToEbitda = ebitda !== 0 ? round4(netDebt / ebitda) : 0;

  // Поточна ліквідність: оборотні активи / поточні зобов'язання
  const currentLiquidity = currentLiabilities !== 0 ? round4(currentAssets / currentLiabilities) : 0;

  // Швидка ліквідність: (оборотні активи - запаси) / поточні зобов'язання
  const quickLiquidity = currentLiabilities !== 0 ? round4((currentAssets - inventories) / currentLiabilities) : 0;

  // Абсолютна ліквідність: гроші / поточні зобов'язання
  const absoluteLiquidity = currentLiabilities !== 0 ? round4(cash / currentLiabilities) : 0;

  return {
    opCostProfitability,
    roe,
    roa,
    financialStability,
    debtToEbitda,
    currentLiquidity,
    quickLiquidity,
    absoluteLiquidity
  };
}

module.exports = {
  calculateRatios
};
