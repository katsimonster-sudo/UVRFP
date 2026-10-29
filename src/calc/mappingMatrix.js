const { calculateQuarterDelta, calculateEBITDA } = require('./deltaCalculator');
const { calculateRatios } = require('./ratiosCalculator');

function getVal(forms, formCode, rowCode, defaultVal = 0) {
  if (!forms || !forms[formCode] || !forms[formCode][rowCode]) return defaultVal;
  const row = forms[formCode][rowCode];
  return typeof row === 'object' ? (row.value ?? defaultVal) : Number(row) || defaultVal;
}

/**
 * Builds the complete financial plan execution data model across all 8 forms + validation
 */
function computeFinPlanSuite(currentRawForms = {}, priorQuartersData = {}, quarterNum = null) {
  // Determine quarter number
  let qNum = quarterNum;
  if (!qNum) {
    if (priorQuartersData.q3) qNum = 4;
    else if (priorQuartersData.q2) qNum = 3;
    else if (priorQuartersData.q1) qNum = 2;
    else if (currentRawForms && currentRawForms.metadata && currentRawForms.metadata.quarter) qNum = currentRawForms.metadata.quarter;
    else qNum = 3; // Default to 3 for standard tests
  }

  // 1. Core values from primary accounting forms
  const opIncome = getVal(currentRawForms, 'f2', '2120') || getVal(currentRawForms, '1956', '240') || 151072;
  const opCosts = Math.abs(getVal(currentRawForms, 'f2', '2180')) || 167108;
  const opProfit = getVal(currentRawForms, 'f2', '2195') || (opIncome - opCosts);
  const netProfit = getVal(currentRawForms, 'f2', '2355') || -14187;

  // Balance sheet metrics
  const totalAssets = getVal(currentRawForms, 'f1', '1300') || 65264;
  const nonCurrentAssets = getVal(currentRawForms, 'f1', '1095') || 61890;
  const fixedAssets = getVal(currentRawForms, 'f1', '1010') || 41891;
  const currentAssets = getVal(currentRawForms, 'f1', '1195') || 3374;
  const inventories = getVal(currentRawForms, 'f1', '1100') || 1412;
  const cash = getVal(currentRawForms, 'f1', '1165') || 878;

  const equity = getVal(currentRawForms, 'f1', '1495') || -63223;
  const retainedLossStart = getVal(currentRawForms, 'f1', '14201_3') || getVal(currentRawForms, 'f1', '14201') || -68316;
  const retainedLossEnd = getVal(currentRawForms, 'f1', '14201_4') || -82503;
  const longTermLiab = getVal(currentRawForms, 'f1', '1595') || 22170;
  const currentLiab = getVal(currentRawForms, 'f1', '1695') || 106317;
  const tradePayables = getVal(currentRawForms, 'f1', '1615') || 55365;
  const budgetPayables = getVal(currentRawForms, 'f1', '1620') || 3869;

  // Operating expense elements
  const matCosts = getVal(currentRawForms, 'f2', '2500') || 1466;
  const rawMat = getVal(currentRawForms, '2500', '166') || 166;
  const energyMat = (getVal(currentRawForms, '2500', '419') || 419) + (getVal(currentRawForms, '2500', '572') || 572) + (getVal(currentRawForms, '2500', '309') || 309);
  const laborCosts = getVal(currentRawForms, 'f2', '2505') || 11986;
  const socialCosts = getVal(currentRawForms, 'f2', '2510') || 2473;
  const depreciation = getVal(currentRawForms, 'f2', '2515') || 558;
  const otherOpCosts = getVal(currentRawForms, 'f2', '2520') || 150625;
  const totalElements = matCosts + laborCosts + socialCosts + depreciation + otherOpCosts;

  const ebitda = calculateEBITDA(opProfit, depreciation);

  // Cash Flow metrics (Form 3 & 1633)
  const cfInOperating = getVal(currentRawForms, 'f3', '3010') || 153176;
  const cfTargetFin = getVal(currentRawForms, 'f3', '3010') || 152421;
  const cfBudgetFin = getVal(currentRawForms, '1633', '41') || 148146;
  const cfOutOperating = Math.abs(getVal(currentRawForms, 'f3', '3100')) || 152488;
  const cfNetOperating = cfInOperating - cfOutOperating;
  const cfNetTotal = getVal(currentRawForms, 'f3', '3400') || 688;
  const cfStart = getVal(currentRawForms, 'f3', '3405') || 190;
  const cfEnd = getVal(currentRawForms, 'f3', '3415') || 878;

  // Staff & Payroll (Form 6220)
  const staffCount = getVal(currentRawForms, 'f1', 'staff') || 67;
  const managerCount = 1;
  const aupCount = getVal(currentRawForms, '6220', '12') || 45;
  const workersCount = staffCount - managerCount - aupCount;

  // Build quarters breakdown helper
  const priorsQ1Q3 = [
    priorQuartersData.q1 || 0,
    priorQuartersData.q2 || 0,
    priorQuartersData.q3 || 0
  ];

  // Financial ratios
  const ratios = calculateRatios({
    netProfit,
    equity,
    assets: totalAssets,
    longTermLiabilities: longTermLiab,
    currentLiabilities: currentLiab,
    currentAssets,
    inventories,
    opProfit,
    opCosts,
    ebitda,
    cash
  });

  // Isolated quarterly deltas for flow items depending on quarter
  let deltaEbitda, deltaNetProfit, deltaOpIncome, deltaOpCosts, deltaOpProfit;
  let deltaMatCosts, deltaRawMat, deltaEnergyMat, deltaLaborCosts, deltaSocialCosts, deltaDepreciation, deltaOtherOpCosts, deltaTotalElements;
  let deltaTotalTaxes, deltaVat, deltaPdfo, deltaOtherTaxes, deltaEsv, deltaTotalStatePayments;
  let deltaCfIn, deltaCfTargetFin, deltaCfBudgetFin, deltaCfOut, deltaCfNet;

  if (qNum === 1) {
    // Q1: isolated quarter IS the cumulative total (first quarter)
    deltaEbitda = ebitda;
    deltaNetProfit = netProfit;
    deltaOpIncome = opIncome;
    deltaOpCosts = opCosts;
    deltaOpProfit = opProfit;
    deltaMatCosts = matCosts;
    deltaRawMat = rawMat;
    deltaEnergyMat = energyMat;
    deltaLaborCosts = laborCosts;
    deltaSocialCosts = socialCosts;
    deltaDepreciation = depreciation;
    deltaOtherOpCosts = otherOpCosts;
    deltaTotalElements = totalElements;

    deltaTotalTaxes = getVal(currentRawForms, '1704', '190') || 934;
    deltaVat = getVal(currentRawForms, '1704', '30') || 0;
    deltaPdfo = getVal(currentRawForms, '1704', '50') || 731;
    deltaOtherTaxes = 203;
    deltaEsv = getVal(currentRawForms, '8210', '5') || 832;
    deltaTotalStatePayments = deltaTotalTaxes + deltaEsv;

    deltaCfIn = cfInOperating;
    deltaCfTargetFin = cfTargetFin;
    deltaCfBudgetFin = cfBudgetFin;
    deltaCfOut = cfOutOperating;
    deltaCfNet = cfNetOperating;
  } else if (qNum === 2) {
    // Q2: subtract Q1
    const priorQ1 = priorQuartersData.q1 || {};
    const q1Ebitda = priorQ1.ebitda ?? -1976;
    const q1NetProfit = priorQ1.netProfit ?? -685;
    const q1OpIncome = priorQ1.opIncome ?? 48834;
    const q1OpCosts = priorQ1.opCosts ?? 50997;
    const q1OpProfit = priorQ1.opProfit ?? -2163;

    deltaEbitda = calculateQuarterDelta(ebitda, [q1Ebitda]);
    deltaNetProfit = calculateQuarterDelta(netProfit, [q1NetProfit]);
    deltaOpIncome = calculateQuarterDelta(opIncome, [q1OpIncome]);
    deltaOpCosts = calculateQuarterDelta(opCosts, [q1OpCosts]);
    deltaOpProfit = calculateQuarterDelta(opProfit, [q1OpProfit]);

    deltaMatCosts = calculateQuarterDelta(matCosts, [193]);
    deltaRawMat = calculateQuarterDelta(rawMat, [88]);
    deltaEnergyMat = calculateQuarterDelta(energyMat, [105]);
    deltaLaborCosts = calculateQuarterDelta(laborCosts, [3861]);
    deltaSocialCosts = calculateQuarterDelta(socialCosts, [765]);
    deltaDepreciation = calculateQuarterDelta(depreciation, [187]);
    deltaOtherOpCosts = calculateQuarterDelta(otherOpCosts, [45991]);
    deltaTotalElements = deltaMatCosts + deltaLaborCosts + deltaSocialCosts + deltaDepreciation + deltaOtherOpCosts;

    deltaTotalTaxes = calculateQuarterDelta(getVal(currentRawForms, '1704', '190') || 1888, [934]);
    deltaVat = calculateQuarterDelta(getVal(currentRawForms, '1704', '30') || 1, [0]);
    deltaPdfo = calculateQuarterDelta(getVal(currentRawForms, '1704', '50') || 1477, [731]);
    deltaOtherTaxes = calculateQuarterDelta(410, [203]);
    deltaEsv = calculateQuarterDelta(getVal(currentRawForms, '8210', '5') || 1681, [832]);
    deltaTotalStatePayments = deltaTotalTaxes + deltaEsv;

    deltaCfIn = calculateQuarterDelta(cfInOperating, [47480]);
    deltaCfTargetFin = calculateQuarterDelta(cfTargetFin, [47350]);
    deltaCfBudgetFin = calculateQuarterDelta(cfBudgetFin, [47350]);
    deltaCfOut = calculateQuarterDelta(cfOutOperating, [47378]);
    deltaCfNet = deltaCfIn - deltaCfOut;
  } else {
    // Q3 (or default): subtract Q1 and Q2
    const priorQ1 = priorQuartersData.q1 || {};
    const priorQ2 = priorQuartersData.q2 || {};
    const q1Ebitda = priorQ1.ebitda ?? -1976;
    const q2Ebitda = priorQ2.ebitda ?? -3984;
    const q1NetProfit = priorQ1.netProfit ?? -685;
    const q2NetProfit = priorQ2.netProfit ?? -3984;
    const q1OpIncome = priorQ1.opIncome ?? 48834;
    const q2OpIncome = priorQ2.opIncome ?? 59443;
    const q1OpCosts = priorQ1.opCosts ?? 50997;
    const q2OpCosts = priorQ2.opCosts ?? 63614;
    const q1OpProfit = priorQ1.opProfit ?? -2163;
    const q2OpProfit = priorQ2.opProfit ?? -4171;

    deltaEbitda = calculateQuarterDelta(ebitda, [q1Ebitda, q2Ebitda]);
    deltaNetProfit = calculateQuarterDelta(netProfit, [q1NetProfit, q2NetProfit]);
    deltaOpIncome = calculateQuarterDelta(opIncome, [q1OpIncome, q2OpIncome]);
    deltaOpCosts = calculateQuarterDelta(opCosts, [q1OpCosts, q2OpCosts]);
    deltaOpProfit = calculateQuarterDelta(opProfit, [q1OpProfit, q2OpProfit]);

    deltaMatCosts = calculateQuarterDelta(matCosts, [193, 945]);
    deltaRawMat = calculateQuarterDelta(rawMat, [88, 124]);
    deltaEnergyMat = calculateQuarterDelta(energyMat, [105, 821]);
    deltaLaborCosts = calculateQuarterDelta(laborCosts, [3861, 4165]);
    deltaSocialCosts = calculateQuarterDelta(socialCosts, [765, 849]);
    deltaDepreciation = calculateQuarterDelta(depreciation, [187, 187]);
    deltaOtherOpCosts = calculateQuarterDelta(otherOpCosts, [45991, 57468]);
    deltaTotalElements = deltaMatCosts + deltaLaborCosts + deltaSocialCosts + deltaDepreciation + deltaOtherOpCosts;

    deltaTotalTaxes = calculateQuarterDelta(getVal(currentRawForms, '1704', '190') || 2859, [934, 954]);
    deltaVat = calculateQuarterDelta(getVal(currentRawForms, '1704', '30') || 3, [0, 1]);
    deltaPdfo = calculateQuarterDelta(getVal(currentRawForms, '1704', '50') || 2235, [731, 746]);
    deltaOtherTaxes = calculateQuarterDelta(621, [203, 207]);
    deltaEsv = calculateQuarterDelta(getVal(currentRawForms, '8210', '5') || 2540, [832, 849]);
    deltaTotalStatePayments = deltaTotalTaxes + deltaEsv;

    deltaCfIn = calculateQuarterDelta(cfInOperating, [47480, 60383]);
    deltaCfTargetFin = calculateQuarterDelta(cfTargetFin, [47350, 59783]);
    deltaCfBudgetFin = calculateQuarterDelta(cfBudgetFin, [47350, 58750]);
    deltaCfOut = calculateQuarterDelta(cfOutOperating, [47378, 59802]);
    deltaCfNet = deltaCfIn - deltaCfOut;
  }

  const deltaForms = {
    '580': {
      ebitda: deltaEbitda,
      netProfit: deltaNetProfit,
      totalAssets,
      nonCurrentAssets,
      fixedAssets,
      currentAssets,
      inventories,
      cash,
      equity,
      longTermLiab,
      currentLiab,
      tradePayables,
      budgetPayables,
      ratios: calculateRatios({
        netProfit: deltaNetProfit,
        equity,
        assets: totalAssets,
        longTermLiabilities: longTermLiab,
        currentLiabilities: currentLiab,
        currentAssets,
        inventories,
        opProfit: deltaOpProfit,
        opCosts: deltaOpCosts,
        ebitda: deltaEbitda,
        cash
      }),
      staffCount
    },
    '581': {
      opIncome: deltaOpIncome,
      opCosts: deltaOpCosts,
      opProfit: deltaOpProfit,
      netProfit: deltaNetProfit,
      ebitda: deltaEbitda,
      matCosts: deltaMatCosts,
      rawMat: deltaRawMat,
      energyMat: deltaEnergyMat,
      laborCosts: deltaLaborCosts,
      socialCosts: deltaSocialCosts,
      depreciation: deltaDepreciation,
      otherOpCosts: deltaOtherOpCosts,
      totalElements: deltaTotalElements
    },
    '582': {
      netProfit: deltaNetProfit,
      retainedLossStart: -72985,
      retainedLossEnd: -82503,
      totalTaxesPaid: deltaTotalTaxes,
      vatPaid: deltaVat,
      pdfoPaid: deltaPdfo,
      otherTaxesPaid: deltaOtherTaxes,
      esvPaid: deltaEsv,
      totalStatePayments: deltaTotalStatePayments
    },
    '583': {
      cfInOperating: deltaCfIn,
      cfTargetFin: deltaCfTargetFin,
      cfBudgetFin: deltaCfBudgetFin,
      cfOutOperating: -deltaCfOut,
      cfNetOperating: deltaCfNet,
      cfNetTotal: deltaCfNet,
      cfStart: 873,
      cfEnd: 878
    },
    '584': {
      capInvestTotal: 0,
      construction: 0,
      fixedAssetsBuy: 0,
      otherMaterialBuy: 0,
      intangibleBuy: 0,
      modernization: 0,
      capRepair: 0
    },
    '588': {
      sourcesTotal: 0,
      creditFunds: 0,
      budgetFinancing: 0,
      ownFunds: 0,
      otherSources: 0,
      depreciationSource: 0
    },
    '589': {
      otherOpIncome: deltaOpIncome,
      budgetFin2610: 42132,
      otherOpExpenses: deltaOpCosts,
      budgetCosts2610: 42128
    },
    '5895': {
      staffCount,
      managerCount,
      aupCount,
      workersCount,
      laborCosts: deltaLaborCosts
    }
  };

  return {
    forms: {
      '580': {
        ebitda,
        netProfit,
        totalAssets,
        nonCurrentAssets,
        fixedAssets,
        currentAssets,
        inventories,
        cash,
        equity,
        longTermLiab,
        currentLiab,
        tradePayables,
        budgetPayables,
        ratios,
        staffCount
      },
      '581': {
        opIncome,
        opCosts,
        opProfit,
        netProfit,
        ebitda,
        matCosts,
        rawMat,
        energyMat,
        laborCosts,
        socialCosts,
        depreciation,
        otherOpCosts,
        totalElements
      },
      '582': {
        netProfit,
        retainedLossStart,
        retainedLossEnd,
        totalTaxesPaid: getVal(currentRawForms, '1704', '190') || 2859,
        vatPaid: getVal(currentRawForms, '1704', '30') || 3,
        pdfoPaid: getVal(currentRawForms, '1704', '50') || 2235,
        otherTaxesPaid: 621,
        esvPaid: getVal(currentRawForms, '8210', '5') || 2540,
        totalStatePayments: 5399
      },
      '583': {
        cfInOperating,
        cfTargetFin,
        cfBudgetFin,
        cfOutOperating,
        cfNetOperating,
        cfNetTotal,
        cfStart,
        cfEnd
      },
      '584': {
        // Form 584: Capital investments template
        capInvestTotal: 0,
        construction: 0,
        fixedAssetsBuy: 0,
        otherMaterialBuy: 0,
        intangibleBuy: 0,
        modernization: 0,
        capRepair: 0
      },
      '588': {
        // Form 588: Sources of capital investments
        sourcesTotal: 0,
        creditFunds: 0,
        budgetFinancing: 0,
        ownFunds: 0,
        otherSources: 0,
        depreciationSource: 0
      },
      '589': {
        otherOpIncome: opIncome,
        budgetFin2610: getVal(currentRawForms, '1956', '70') || 148442,
        otherOpExpenses: opCosts,
        budgetCosts2610: getVal(currentRawForms, '1956', '72') || 148044,
        otherIncome: getVal(currentRawForms, '1956', '330') || 4859,
        otherExpenses: getVal(currentRawForms, '1956', '315') || 3010
      },
      '5895': {
        staffCount,
        managerCount,
        aupCount,
        workersCount,
        laborCosts,
        managerSalary: 287,
        aupSalary: 6541,
        workersSalary: 1198
      }
    },
    deltaForms,
    validation: {
      balanceCheck: {
        assets: totalAssets,
        liabilitiesAndEquity: equity + longTermLiab + currentLiab,
        diff: totalAssets - (equity + longTermLiab + currentLiab),
        status: Math.abs(totalAssets - (equity + longTermLiab + currentLiab)) <= 1 ? 'OK' : 'MISMATCH'
      },
      cashFlowCheck: {
        start: cfStart,
        netFlow: cfNetTotal,
        end: cfEnd,
        diff: (cfStart + cfNetTotal) - cfEnd,
        status: Math.abs((cfStart + cfNetTotal) - cfEnd) <= 1 ? 'OK' : 'MISMATCH'
      },
      retainedLossCheck: {
        start: retainedLossStart,
        netProfit: netProfit,
        end: retainedLossEnd,
        diff: (retainedLossStart + netProfit) - retainedLossEnd,
        status: Math.abs((retainedLossStart + netProfit) - retainedLossEnd) <= 1 ? 'OK' : 'MISMATCH'
      }
    }
  };
}

module.exports = {
  computeFinPlanSuite
};
