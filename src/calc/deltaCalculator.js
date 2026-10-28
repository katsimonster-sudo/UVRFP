/**
 * Calculates isolated quarterly delta and EBITDA
 */

function calculateQuarterDelta(cumulativeTotal, priorQuartersList = []) {
  const sumPriors = priorQuartersList.reduce((acc, val) => acc + (Number(val) || 0), 0);
  return (Number(cumulativeTotal) || 0) - sumPriors;
}

function calculateEBITDA(opProfitOrLoss, depreciation) {
  return (Number(opProfitOrLoss) || 0) + (Number(depreciation) || 0);
}

module.exports = {
  calculateQuarterDelta,
  calculateEBITDA
};
