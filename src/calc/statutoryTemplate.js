/**
 * Офіційний довідник форм, рядків та реквізитів згідно з:
 * Додаток 2 до Методичних рекомендацій щодо розроблення фінансового плану
 * суб'єкта господарювання державного сектору економіки.
 */

const enterpriseInfo = {
  name: 'ДП "ОК "Укрвуглереструктуризація"',
  edrpou: '39244432',
  kopfh: '140',
  skodu: '00018',
  kved: '05.10',
  industry: 'Вугільна промисловість',
  unit: 'тис. грн',
  stateShare: '100%',
  staffCount: 67,
  location: 'м. Київ, вул. Б. Хмельницького, 4',
  phone: '+380 (44) 235-00-00',
  standards: 'П(с)БОУ',
  director: 'Керівник підприємства'
};

// =========================================================================
//  1. ОСНОВНІ ФІНАНСОВІ ПОКАЗНИКИ (Форма 580 / Додаток 2 Звіт)
// =========================================================================
const template580 = [
  // I. Формування фінансових результатів
  { isHeader: true, name: 'І. Формування фінансових результатів' },
  { code: '1000', name: 'Чистий дохід від реалізації продукції (товарів, робіт, послуг)', field: 'netRevenue' },
  { code: '1010', name: 'Собівартість реалізованої продукції (товарів, робіт, послуг)', field: 'costOfGoods' },
  { code: '1020', name: 'Валовий прибуток/збиток', field: 'grossProfit' },
  { code: '1300', name: 'EBITDA', field: 'ebitda' },
  { code: '1200', name: 'Чистий фінансовий результат', field: 'netProfit' },

  // II. Сплата податків, зборів та інших обов'язкових платежів
  { isHeader: true, name: 'ІІ. Сплата податків, зборів та інших обов\'язкових платежів' },
  { code: '2111', name: 'податок на прибуток підприємств', field: 'incomeTax' },
  { code: '2112', name: 'податок на додану вартість, що підлягає сплаті до бюджету за підсумками звітного періоду', field: 'vatPaid' },
  { code: '2113', name: 'податок на додану вартість, що підлягає відшкодуванню з бюджету за підсумками звітного періоду', field: 'vatRefund' },
  { code: '2131', name: 'відрахування частини чистого прибутку державними унітарними підприємствами та їх об\'єднаннями', field: 'stateDivUnitary' },
  { code: '2132', name: 'відрахування частини чистого прибутку господарськими товариствами... на виплату дивідендів', field: 'stateDivJointStock' },
  { code: '2200', name: 'Усього виплат на користь держави', field: 'totalStatePayments' },

  // III. Капітальні інвестиції
  { isHeader: true, name: 'ІІІ. Капітальні інвестиції' },
  { code: '4000', name: 'Капітальні інвестиції', field: 'capInvestTotal' },

  // IV. Коефіцієнтний аналіз
  { isHeader: true, name: 'ІV. Коефіцієнтний аналіз' },
  { isSubHeader: true, name: 'Коефіцієнти рентабельності' },
  { code: '5010', name: 'Коефіцієнт рентабельності діяльності (р. 1200 / р. 1000)', ratio: 'profitabilityActivity' },
  { code: '5011', name: 'Коефіцієнт рентабельності операційних витрат (р. 1100 / операційні витрати)', ratio: 'opCostProfitability' },
  { code: '5012', name: 'Коефіцієнт зростання операційних витрат', ratio: 'opCostGrowth' },
  { code: '5013', name: 'Коефіцієнт рентабельності EBITDA (р. 1300 / р. 1000)', ratio: 'ebitdaMargin' },
  { code: '5014', name: 'Коефіцієнт рентабельності власного капіталу (р. 1200 / р. 6080)', ratio: 'roe' },
  { code: '5015', name: 'Коефіцієнт рентабельності активів (р. 1200 / р. 6020)', ratio: 'roa' },
  { code: '5016', name: 'Коефіцієнт зростання доходів', ratio: 'revenueGrowth' },

  { isSubHeader: true, name: 'Коефіцієнти платоспроможності' },
  { code: '5020', name: 'Коефіцієнт фінансової стійкості (р. 6080 / (р. 6030 + р. 6040))', ratio: 'financialStability' },
  { code: '5021', name: 'Коефіцієнт покриття EBITDA фінансових витрат (р. 1300 / р. 1140)', ratio: 'ebitdaInterestCoverage' },
  { code: '5022', name: 'Коефіцієнт відношення боргу до EBITDA ((р. 6041 + р. 6031 - р. 6015) / р. 1300)', ratio: 'debtToEbitda' },
  { code: '5023', name: 'Коефіцієнт відношення боргу до власного капіталу ((р. 6041 + р. 6031) / р. 6080)', ratio: 'debtToEquity' },
  { code: '5024', name: 'Коефіцієнт відношення боргу до активів ((р. 6030 + р. 6040) / р. 6020)', ratio: 'debtToAssets' },

  { isSubHeader: true, name: 'Коефіцієнти ліквідності' },
  { code: '5030', name: 'Коефіцієнт поточної ліквідності (р. 6010 / р. 6040)', ratio: 'currentLiquidity' },
  { code: '5031', name: 'Коефіцієнт швидкої ліквідності ((р. 6010 - р. 6011) / р. 6040)', ratio: 'quickLiquidity' },
  { code: '5032', name: 'Коефіцієнт абсолютної ліквідності ((р. 6015 + р. 6014) / р. 6040)', ratio: 'absoluteLiquidity' },
  { code: '5033', name: 'Період обороту дебіторської заборгованості (дні)', ratio: 'arTurnoverDays' },
  { code: '5034', name: 'Період обороту кредиторської заборгованості (дні)', ratio: 'apTurnoverDays' },
  { code: '5040', name: 'Довідково: індекс споживчих цін (%)', ratio: 'cpi' },

  // V. Звіт про фінансовий стан
  { isHeader: true, name: 'V. Звіт про фінансовий стан' },
  { code: '6000', name: 'Необоротні активи, усього, у тому числі:', field: 'nonCurrentAssets' },
  { code: '6001', name: 'основні засоби', field: 'fixedAssets' },
  { code: '6002', name: 'первісна вартість', field: 'fixedAssetsInitial' },
  { code: '6003', name: 'знос', field: 'depreciationTotal' },
  { code: '6010', name: 'Оборотні активи, усього, у тому числі:', field: 'currentAssets' },
  { code: '6011', name: 'запаси', field: 'inventories' },
  { code: '6012', name: 'дебіторська заборгованість за продукцію, товари, роботи, послуги', field: 'arTrade' },
  { code: '6013', name: 'дебіторська заборгованість за розрахунками з бюджетом', field: 'arBudget' },
  { code: '6014', name: 'поточні фінансові інвестиції', field: 'shortTermInvest' },
  { code: '6015', name: 'гроші та їх еквіваленти', field: 'cash' },
  { code: '6020', name: 'Усього активи', field: 'totalAssets' },
  { code: '6030', name: 'Довгострокові зобов\'язання і забезпечення, у тому числі:', field: 'longTermLiab' },
  { code: '6031', name: 'довгострокові кредити банків', field: 'longTermBankLoans' },
  { code: '6040', name: 'Поточні зобов\'язання і забезпечення, у тому числі:', field: 'currentLiab' },
  { code: '6041', name: 'короткострокові кредити банків', field: 'shortTermBankLoans' },
  { code: '6042', name: 'поточна кредиторська заборгованість за товари, роботи, послуги', field: 'tradePayables' },
  { code: '6043', name: 'поточна кредиторська заборгованість за розрахунками з бюджетом', field: 'budgetPayables' },
  { code: '6050', name: 'Усього зобов\'язання і забезпечення, у тому числі:', field: 'totalLiabilities' },
  { code: '6060', name: 'державні гранти і субсидії', field: 'stateGrants' },
  { code: '6070', name: 'фінансові запозичення', field: 'finBorrowings' },
  { code: '6080', name: 'Власний капітал', field: 'equity' },

  // VI. Кредитна політика
  { isHeader: true, name: 'VI. Кредитна політика' },
  { code: '7000', name: 'Заборгованість за кредитами на початок періоду', field: 'loansStart' },
  { code: '7010', name: 'Отримано залучених коштів, усього, у тому числі:', field: 'loansReceived' },
  { code: '7011', name: 'довгострокові зобов\'язання', field: 'loansRecLong' },
  { code: '7012', name: 'короткострокові зобов\'язання', field: 'loansRecShort' },
  { code: '7013', name: 'інші фінансові зобов\'язання', field: 'loansRecOther' },
  { code: '7020', name: 'Повернено залучених коштів, усього, у тому числі:', field: 'loansRepaid' },
  { code: '7021', name: 'довгострокові зобов\'язання', field: 'loansRepLong' },
  { code: '7022', name: 'короткострокові зобов\'язання', field: 'loansRepShort' },
  { code: '7023', name: 'інші фінансові зобов\'язання', field: 'loansRepOther' },
  { code: '7030', name: 'Заборгованість за кредитами на кінець періоду', field: 'loansEnd' },

  // VII. Персонал
  { isHeader: true, name: 'VII. Дані про персонал та витрати на оплату праці' },
  { code: '8000', name: 'Середня кількість працівників, у тому числі:', field: 'staffCount' },
  { code: '8001', name: 'члени наглядової ради', field: 'boardMembers' },
  { code: '8002', name: 'члени правління', field: 'directors' },
  { code: '8003', name: 'керівник', field: 'managerCount' },
  { code: '8004', name: 'адміністративно-управлінський персонал', field: 'aupCount' },
  { code: '8005', name: 'працівники', field: 'workersCount' },
  { code: '8010', name: 'Витрати на оплату праці, у тому числі:', field: 'laborCosts' },
  { code: '8011', name: 'члени наглядової ради', field: 'laborBoard' },
  { code: '8012', name: 'члени правління', field: 'laborDirectors' },
  { code: '8013', name: 'керівник', field: 'laborManager' },
  { code: '8014', name: 'адміністративно-управлінський персонал', field: 'laborAup' },
  { code: '8015', name: 'працівники', field: 'laborWorkers' },
  { code: '8020', name: 'Середньомісячні витрати на оплату праці одного працівника (грн), усього:', field: 'avgWageTotal' },
  { code: '8021', name: 'член наглядової ради', field: 'avgWageBoard' },
  { code: '8022', name: 'член правління', field: 'avgWageDirectors' },
  { code: '8023', name: 'керівник', field: 'avgWageManager' },
  { code: '8023/1', name: 'посадовий оклад', field: 'salaryBaseManager' },
  { code: '8023/2', name: 'преміювання', field: 'salaryBonusManager' },
  { code: '8023/3', name: 'інші виплати, передбачені законодавством', field: 'salaryOtherManager' },
  { code: '8024', name: 'адміністративно-управлінський працівник', field: 'avgWageAup' },
  { code: '8025', name: 'працівник', field: 'avgWageWorker' }
];

// =========================================================================
//  2. ТАБЛИЦЯ 3. ФОРМУВАННЯ ФІНАНСОВИХ РЕЗУЛЬТАТІВ (Форма 581)
// =========================================================================
const template581 = [
  { isHeader: true, name: 'Доходи і витрати (деталізація)' },
  { code: '1000', name: 'Чистий дохід від реалізації продукції (товарів, робіт, послуг)', field: 'netRevenue' },
  { code: '1010', name: 'Собівартість реалізованої продукції (товарів, робіт, послуг)', field: 'costOfGoods' },
  { code: '1011', name: 'Витрати на сировину та основні матеріали', field: 'rawMat' },
  { code: '1012', name: 'Витрати на паливо', field: 'fuelCosts' },
  { code: '1013', name: 'Витрати на електроенергію', field: 'energyCosts' },
  { code: '1014', name: 'Витрати на оплату праці', field: 'productionLabor' },
  { code: '1015', name: 'Відрахування на соціальні заходи', field: 'productionSocial' },
  { code: '1016', name: 'Витрати для підтримання об’єкта в робочому стані (ремонт, техогляд)', field: 'maintenanceCosts' },
  { code: '1017', name: 'Амортизація основних засобів і нематеріальних активів', field: 'productionDeprec' },
  { code: '1018', name: 'Рентна плата (розшифрувати)', field: 'rentPayments' },
  { code: '1019', name: 'Інші витрати (розшифрувати)', field: 'otherProductionCosts' },
  { code: '1020', name: 'Валовий прибуток (збиток)', field: 'grossProfit' },

  { code: '1030', name: 'Адміністративні витрати, у тому числі:', field: 'adminCosts' },
  { code: '1031', name: 'витрати на власні службові автомобілі', field: 'adminCars' },
  { code: '1032', name: 'витрати на оренду службових автомобілів', field: 'adminCarRent' },
  { code: '1033', name: 'витрати на консалтингові послуги', field: 'adminConsult' },
  { code: '1034', name: 'витрати на страхові послуги', field: 'adminInsurance' },
  { code: '1035', name: 'витрати на аудиторські послуги', field: 'adminAudit' },
  { code: '1036', name: 'витрати на службові відрядження', field: 'adminTravel' },
  { code: '1037', name: 'витрати на зв’язок', field: 'adminComm' },
  { code: '1038', name: 'витрати на оплату праці', field: 'adminLabor' },
  { code: '1039', name: 'відрахування на соціальні заходи', field: 'adminSocial' },
  { code: '1040', name: 'амортизація ОЗ і нематеріальних активів загальногосподарського призначення', field: 'adminDeprec' },
  { code: '1041', name: 'операційна оренда ОЗ та роялті', field: 'adminRentRoyalty' },
  { code: '1042', name: 'страхування майна загальногосподарського призначення', field: 'adminPropInsurance' },
  { code: '1043', name: 'страхування загальногосподарського персоналу', field: 'adminStaffInsurance' },
  { code: '1044', name: 'організаційно-технічні послуги', field: 'adminTechServices' },
  { code: '1045', name: 'консультаційні та інформаційні послуги', field: 'adminInfoServices' },
  { code: '1046', name: 'юридичні послуги', field: 'adminLegal' },
  { code: '1047', name: 'послуги з оцінки майна', field: 'adminValuation' },
  { code: '1048', name: 'охорона праці загальногосподарського персоналу', field: 'adminSafety' },
  { code: '1049', name: 'підвищення кваліфікації та перепідготовка кадрів', field: 'adminTraining' },
  { code: '1050', name: 'утримання основних фондів, інших необоротних активів загальногосподарського використання', field: 'adminMaintenance' },
  { code: '1050/1', name: 'витрати на поліпшення основних фондів', field: 'adminImprovements' },
  { code: '1051', name: 'інші адміністративні витрати (розшифрувати)', field: 'adminOther' },

  { code: '1060', name: 'Витрати на збут, у тому числі:', field: 'sellingCosts' },
  { code: '1061', name: 'транспортні витрати', field: 'sellingTransport' },
  { code: '1062', name: 'витрати на зберігання та упаковку', field: 'sellingStorage' },
  { code: '1063', name: 'витрати на оплату праці', field: 'sellingLabor' },
  { code: '1064', name: 'відрахування на соціальні заходи', field: 'sellingSocial' },
  { code: '1065', name: 'амортизація ОЗ і нематеріальних активів', field: 'sellingDeprec' },
  { code: '1066', name: 'витрати на рекламу', field: 'sellingAds' },
  { code: '1067', name: 'інші витрати на збут (розшифрувати)', field: 'sellingOther' },

  { code: '1070', name: 'Інші операційні доходи, усього, у тому числі:', field: 'opIncome' },
  { code: '1071', name: 'курсові різниці', field: 'opForexGain' },
  { code: '1072', name: 'нетипові операційні доходи (розшифрувати)', field: 'opNonTypicalIncome' },
  { code: '1073', name: 'інші операційні доходи (розшифрувати)', field: 'opOtherIncome' },

  { code: '1080', name: 'Інші операційні витрати, усього, у тому числі:', field: 'opCosts' },
  { code: '1081', name: 'курсові різниці', field: 'opForexLoss' },
  { code: '1082', name: 'нетипові операційні витрати (розшифрувати)', field: 'opNonTypicalExpense' },
  { code: '1083', name: 'витрати на благодійну допомогу', field: 'opCharity' },
  { code: '1084', name: 'відрахування до резерву сумнівних боргів', field: 'opBadDebt' },
  { code: '1085', name: 'відрахування до недержавних пенсійних фондів', field: 'opPension' },
  { code: '1086', name: 'інші операційні витрати (розшифрувати)', field: 'opOtherExpense' },

  { code: '1100', name: 'Фінансовий результат від операційної діяльності', field: 'opProfit' },
  { code: '1110', name: 'Дохід від участі в капіталі (розшифрувати)', field: 'equityIncome' },
  { code: '1120', name: 'Втрати від участі в капіталі (розшифрувати)', field: 'equityLoss' },
  { code: '1130', name: 'Інші фінансові доходи (розшифрувати)', field: 'otherFinIncome' },
  { code: '1140', name: 'Фінансові витрати (розшифрувати)', field: 'finExpense' },
  { code: '1150', name: 'Інші доходи, усього, у тому числі:', field: 'otherIncomeTotal' },
  { code: '1151', name: 'курсові різниці', field: 'forexGainNonOp' },
  { code: '1152', name: 'інші доходи (розшифрувати)', field: 'otherIncomeNonOp' },
  { code: '1160', name: 'Інші витрати, усього, у тому числі:', field: 'otherExpenseTotal' },
  { code: '1161', name: 'курсові різниці', field: 'forexLossNonOp' },
  { code: '1162', name: 'інші витрати (розшифрувати)', field: 'otherExpenseNonOp' },
  { code: '1170', name: 'Фінансовий результат до оподаткування', field: 'profitBeforeTax' },
  { code: '1180', name: 'Витрати з податку на прибуток', field: 'taxExpense' },
  { code: '1181', name: 'Дохід з податку на прибуток', field: 'taxIncome' },
  { code: '1190', name: 'Прибуток від припиненої діяльності після оподаткування', field: 'discontinuedProfit' },
  { code: '1191', name: 'Збиток від припиненої діяльності після оподаткування', field: 'discontinuedLoss' },
  { code: '1200', name: 'Чистий фінансовий результат, у тому числі:', field: 'netProfit' },
  { code: '1201', name: 'прибуток', field: 'netProfitPos' },
  { code: '1202', name: 'збиток', field: 'netProfitNeg' },
  { code: '1210', name: 'Усього доходів', field: 'totalRevenue' },
  { code: '1220', name: 'Усього витрат', field: 'totalExpenses' },
  { code: '1230', name: 'Неконтрольована частка', field: 'nonControllingShare' },
  { code: '1300', name: 'EBITDA (р. 1100 + амортизація р. 1430)', field: 'ebitda' },

  { isHeader: true, name: 'Елементи операційних витрат' },
  { code: '1400', name: 'Матеріальні витрати, у тому числі:', field: 'matCosts' },
  { code: '1401', name: 'витрати на сировину та основні матеріали', field: 'rawMat' },
  { code: '1402', name: 'витрати на паливо та енергію', field: 'energyMat' },
  { code: '1410', name: 'Витрати на оплату праці', field: 'laborCosts' },
  { code: '1420', name: 'Відрахування на соціальні заходи', field: 'socialCosts' },
  { code: '1430', name: 'Амортизація', field: 'depreciation' },
  { code: '1440', name: 'Інші операційні витрати', field: 'otherOpCosts' },
  { code: '1450', name: 'Усього елементів', field: 'totalElements' }
];

// =========================================================================
//  3. ТАБЛИЦЯ II. РОЗРАХУНКИ З БЮДЖЕТОМ (Форма 582)
// =========================================================================
const template582 = [
  { isHeader: true, name: 'Розподіл чистого прибутку' },
  { code: '1200', name: 'Чистий фінансовий результат', field: 'netProfit' },
  { code: '2000', name: 'Залишок нерозподіленого прибутку (непокритого збитку) на початок періоду', field: 'retainedLossStart' },
  { code: '2005', name: 'Коригування, зміна облікової політики (розшифрувати)', field: 'accountingAdjustments' },
  { code: '2009', name: 'Скоригований залишок нерозподіленого прибутку (непокритого збитку) на початок періоду', field: 'adjustedRetainedStart' },
  { code: '2010', name: 'Нараховані до сплати відрахування частини чистого прибутку, у тому числі:', field: 'accruedDividendsTotal' },
  { code: '2011', name: 'державними унітарними підприємствами до держбюджету', field: 'accruedDivState' },
  { code: '2012', name: 'господарськими товариствами на виплату дивідендів', field: 'accruedDivCompanies' },
  { code: '2012/1', name: 'у тому числі на державну частку', field: 'accruedDivStateShare' },
  { code: '2020', name: 'Перенесено з додаткового капіталу', field: 'transferFromAddCap' },
  { code: '2030', name: 'Розвиток виробництва', field: 'prodDevelopment' },
  { code: '2031', name: 'у тому числі за основними видами діяльності за КВЕД', field: 'prodDevKved' },
  { code: '2040', name: 'Резервний фонд', field: 'reserveFund' },
  { code: '2050', name: 'Інші фонди (розшифрувати)', field: 'otherFunds' },
  { code: '2060', name: 'Інші цілі (розшифрувати)', field: 'otherPurposes' },
  { code: '2070', name: 'Залишок нерозподіленого прибутку (непокритого збитку) на кінець звітного періоду', field: 'retainedLossEnd' },

  { isHeader: true, name: 'Сплата податків, зборів та інших обов\'язкових платежів' },
  { code: '2110', name: 'Сплата податків та зборів до Державного бюджету України, усього:', field: 'taxesStateTotal' },
  { code: '2111', name: 'податок на прибуток підприємств', field: 'taxProfit' },
  { code: '2112', name: 'ПДВ, що підлягає сплаті до бюджету за підсумками звітного періоду', field: 'vatPaid' },
  { code: '2113', name: 'ПДВ, що підлягає відшкодуванню з бюджету за підсумками звітного періоду', field: 'vatRefund' },
  { code: '2114', name: 'акцизний податок', field: 'exciseTax' },
  { code: '2115', name: 'рентна плата за транспортування', field: 'rentTransport' },
  { code: '2116', name: 'рентна плата за користування надрами', field: 'rentSubsoil' },
  { code: '2117', name: 'податок на доходи фізичних осіб', field: 'pdfoPaid' },
  { code: '2118', name: 'інші податки та збори (розшифрувати)', field: 'otherTaxesPaid' },

  { code: '2120', name: 'Сплата податків та зборів до місцевих бюджетів, усього:', field: 'taxesLocalTotal' },
  { code: '2121', name: 'податок на доходи фізичних осіб (місцевий)', field: 'pdfoLocal' },
  { code: '2122', name: 'земельний податок', field: 'landTax' },
  { code: '2123', name: 'орендна плата', field: 'rentLocal' },
  { code: '2124', name: 'інші податки та збори (місцеві)', field: 'otherLocalTaxes' },

  { code: '2130', name: 'Інші податки, збори та платежі на користь держави, усього:', field: 'otherStatePayments' },
  { code: '2131', name: 'відрахування частини чистого прибутку унітарними підприємствами', field: 'divUnitaryPaid' },
  { code: '2132', name: 'дивіденди на державну частку господарськими товариствами', field: 'divJointStockPaid' },
  { code: '2133', name: 'митні платежі', field: 'customsPayments' },
  { code: '2134', name: 'єдиний внесок на загальнообов\'язкове державне соціальне страхування (ЄСВ)', field: 'esvPaid' },
  { code: '2135', name: 'інші податки, збори та платежі (розшифрувати)', field: 'otherStateFees' },

  { code: '2140', name: 'Погашення податкового боргу, усього, у тому числі:', field: 'taxDebtRepaid' },
  { code: '2141', name: 'погашення реструктуризованих та відстрочених сум', field: 'restructuredDebt' },
  { code: '2142', name: 'інші (штрафи, пені, неустойки)', field: 'penaltiesFines' },
  { code: '2200', name: 'Усього виплат на користь держави', field: 'totalStatePayments' }
];

// =========================================================================
//  4. ТАБЛИЦЯ III. РУХ ГРОШОВИХ КОШТІВ (Форма 583)
// =========================================================================
const template583 = [
  { isHeader: true, name: 'І. Рух коштів у результаті операційної діяльності' },
  { code: '3000', name: 'Надходження грошових коштів від операційної діяльності', field: 'cfInOperating' },
  { code: '3010', name: 'Виручка від реалізації продукції (товарів, робіт, послуг)', field: 'cfRevGoods' },
  { code: '3020', name: 'Повернення податків і зборів, у тому числі:', field: 'cfTaxRefund' },
  { code: '3030', name: 'податку на додану вартість', field: 'cfVatRefund' },
  { code: '3040', name: 'Цільове фінансування, у тому числі:', field: 'cfTargetFin' },
  { code: '3041', name: 'бюджетне фінансування', field: 'cfBudgetFin' },
  { code: '3042', name: 'інші надходження (розшифрувати)', field: 'cfOtherTarget' },
  { code: '3050', name: 'Надходження авансів від покупців і замовників', field: 'cfAdvances' },
  { code: '3060', name: 'Отримання коштів за короткостроковими зобов\'язаннями:', field: 'cfShortLoansIn' },
  { code: '3061', name: 'кредити', field: 'cfLoansInBank' },
  { code: '3062', name: 'позики', field: 'cfLoansInOther' },
  { code: '3063', name: 'облігації', field: 'cfBondsIn' },
  { code: '3070', name: 'Інші надходження (розшифрувати)', field: 'cfOtherIn' },

  { code: '3100', name: 'Витрачання грошових коштів від операційної діяльності', field: 'cfOutOperating' },
  { code: '3110', name: 'Розрахунки за продукцію (товари, роботи та послуги)', field: 'cfOutGoods' },
  { code: '3120', name: 'Розрахунки з оплати праці', field: 'cfOutLabor' },
  { code: '3130', name: 'Відрахування на соціальні заходи', field: 'cfOutSocial' },
  { code: '3140', name: 'Повернення коштів за короткостроковими зобов\'язаннями:', field: 'cfOutShortLoans' },
  { code: '3141', name: 'кредити', field: 'cfOutBankLoans' },
  { code: '3142', name: 'позики', field: 'cfOutOtherLoans' },
  { code: '3143', name: 'облігації', field: 'cfOutBonds' },
  { code: '3150', name: 'Зобов’язання з податків, зборів та інших платежів:', field: 'cfOutTaxes' },
  { code: '3151', name: 'податок на прибуток', field: 'cfOutTaxProfit' },
  { code: '3152', name: 'податок на додану вартість', field: 'cfOutVat' },
  { code: '3153', name: 'акцизний податок', field: 'cfOutExcise' },
  { code: '3154', name: 'рентна плата', field: 'cfOutRent' },
  { code: '3155', name: 'податок на доходи фізичних осіб', field: 'cfOutPdfo' },
  { code: '3156', name: 'інші зобов’язання з податків і зборів:', field: 'cfOutOtherTaxes' },
  { code: '3156/1', name: 'відрахування частини чистого прибутку унітарними підприємствами', field: 'cfOutDivUnitary' },
  { code: '3156/2', name: 'дивіденди на державну частку господарськими товариствами', field: 'cfOutDivState' },
  { code: '3157', name: 'інші платежі (розшифрувати)', field: 'cfOutOtherFees' },
  { code: '3160', name: 'Повернення коштів до бюджету', field: 'cfReturnToBudget' },
  { code: '3170', name: 'Інші витрачання (розшифрувати)', field: 'cfOtherOut' },
  { code: '3195', name: 'Чистий рух коштів від операційної діяльності', field: 'cfNetOperating' },

  { isHeader: true, name: 'II. Рух коштів у результаті інвестиційної діяльності' },
  { code: '3200', name: 'Надходження грошових коштів від інвестиційної діяльності', field: 'cfInInvest' },
  { code: '3210', name: 'Надходження від реалізації фінансових інвестицій', field: 'cfInFinInvest' },
  { code: '3215', name: 'надходження від продажу акцій та облігацій', field: 'cfInStocksBonds' },
  { code: '3220', name: 'Надходження від реалізації необоротних активів', field: 'cfInFixedAssetsSale' },
  { code: '3225', name: 'Надходження від отриманих відсотків', field: 'cfInInterest' },
  { code: '3230', name: 'Надходження дивідендів', field: 'cfInDividends' },
  { code: '3235', name: 'Надходження від деривативів', field: 'cfInDerivatives' },
  { code: '3240', name: 'Інші надходження (розшифрувати)', field: 'cfInInvestOther' },
  { code: '3255', name: 'Витрачання грошових коштів від інвестиційної діяльності', field: 'cfOutInvest' },
  { code: '3260', name: 'Витрачання на придбання фінансових інвестицій', field: 'cfOutFinInvest' },
  { code: '3265', name: 'витрачання на придбання акцій та облігацій', field: 'cfOutStocks' },
  { code: '3270', name: 'Витрачання на придбання необоротних активів:', field: 'cfOutNonCurrent' },
  { code: '3271', name: 'придбання (створення) основних засобів', field: 'cfOutFixedAssetsBuy' },
  { code: '3272', name: 'капітальне будівництво', field: 'cfOutConstruction' },
  { code: '3273', name: 'придбання (створення) нематеріальних активів', field: 'cfOutIntangibleBuy' },
  { code: '3274', name: 'інші необоротні активи', field: 'cfOutOtherAssets' },
  { code: '3280', name: 'Виплати за деривативами', field: 'cfOutDerivatives' },
  { code: '3290', name: 'Інші платежі (розшифрувати)', field: 'cfOutInvestOther' },
  { code: '3295', name: 'Чистий рух коштів від інвестиційної діяльності', field: 'cfNetInvest' },

  { isHeader: true, name: 'III. Рух коштів у результаті фінансової діяльності' },
  { code: '3300', name: 'Надходження грошових коштів від фінансової діяльності', field: 'cfInFin' },
  { code: '3305', name: 'Надходження від власного капіталу', field: 'cfInEquity' },
  { code: '3310', name: 'Отримання коштів за довгостроковими зобов\'язаннями:', field: 'cfInLongLoans' },
  { code: '3311', name: 'кредити', field: 'cfInLongBankLoans' },
  { code: '3312', name: 'позики', field: 'cfInLongOtherLoans' },
  { code: '3313', name: 'облігації', field: 'cfInLongBonds' },
  { code: '3320', name: 'Інші надходження (розшифрувати)', field: 'cfInFinOther' },
  { code: '3330', name: 'Витрачання грошових коштів від фінансової діяльності', field: 'cfOutFin' },
  { code: '3335', name: 'Витрачання на викуп власних акцій', field: 'cfOutBuyback' },
  { code: '3340', name: 'Повернення коштів за довгостроковими зобов\'язаннями:', field: 'cfOutLongLoans' },
  { code: '3341', name: 'кредити', field: 'cfOutLongBankLoans' },
  { code: '3342', name: 'позики', field: 'cfOutLongOtherLoans' },
  { code: '3343', name: 'облігації', field: 'cfOutLongBonds' },
  { code: '3350', name: 'Сплата дивідендів', field: 'cfOutDividends' },
  { code: '3360', name: 'Витрачення на сплату відсотків', field: 'cfOutInterest' },
  { code: '3370', name: 'Витрачення на сплату заборгованості з фінансової оренди', field: 'cfOutLease' },
  { code: '3380', name: 'Інші платежі (розшифрувати)', field: 'cfOutFinOther' },
  { code: '3395', name: 'Чистий рух коштів від фінансової діяльності', field: 'cfNetFin' },

  { isHeader: true, name: 'Підсумок руху коштів' },
  { code: '3400', name: 'Чистий рух грошових коштів за звітний період', field: 'cfNetTotal' },
  { code: '3405', name: 'Залишок коштів на початок періоду', field: 'cfStart' },
  { code: '3410', name: 'Вплив зміни валютних курсів на залишок коштів', field: 'cfForexEffect' },
  { code: '3415', name: 'Залишок коштів на кінець періоду', field: 'cfEnd' }
];

// =========================================================================
//  5. ТАБЛИЦЯ IV. КАПІТАЛЬНІ ІНВЕСТИЦІЇ (Форма 584)
// =========================================================================
const template584 = [
  { code: '4000', name: 'Капітальні інвестиції, усього, у тому числі:', field: 'capInvestTotal', isFormulaTotal: true },
  { code: '4010', name: 'капітальне будівництво', field: 'construction' },
  { code: '4020', name: 'придбання (виготовлення) основних засобів', field: 'fixedAssetsBuy' },
  { code: '4030', name: 'придбання (виготовлення) інших необоротних матеріальних активів', field: 'otherTangibleBuy' },
  { code: '4040', name: 'придбання (створення) нематеріальних активів', field: 'intangibleBuy' },
  { code: '4050', name: 'модернізація, модифікація основних засобів', field: 'modernization' },
  { code: '4060', name: 'капітальний ремонт', field: 'capRepair' }
];

// =========================================================================
//  6. ТАБЛИЦЯ V. ІНФОРМАЦІЯ ЩОДО ЗАЛУЧЕНИХ КОШТІВ (Форма 585 / Кредити)
// =========================================================================
const template585 = [
  { name: 'Довгострокові зобов\'язання, усього, у тому числі:' },
  { name: 'короткострокові зобов\'язання, усього, у тому числі:' },
  { name: 'інші фінансові зобов\'язання, усього, у тому числі:' },
  { name: 'Усього' }
];

// =========================================================================
//  7. ТАБЛИЦЯ VI. ДЖЕРЕЛА КАПІТАЛЬНИХ ІНВЕСТИЦІЙ (Форма 588)
// =========================================================================
const template588 = [
  { num: '1', name: 'капітальне будівництво' },
  { num: '2', name: 'придбання (виготовлення) основних засобів (розшифрувати)' },
  { num: '3', name: 'придбання (виготовлення) інших необоротних матеріальних активів' },
  { num: '4', name: 'придбання (створення) нематеріальних активів (розшифрувати)' },
  { num: '5', name: 'модернізація, модифікація (добудова, реконструкція)' },
  { num: '6', name: 'капітальний ремонт' },
  { num: '', name: 'Усього', isFormulaTotal: true }
];

// =========================================================================
//  8. ТАБЛИЦЯ VII. КАПІТАЛЬНЕ БУДІВНИЦТВО (Форма 587)
// =========================================================================
const template587 = [
  { num: '1', name: 'Об\'єкт капітального будівництва (шаблон)' }
];

// =========================================================================
//  9. ТАБЛИЦЯ 2. ІНФОРМАЦІЯ ПРО БІЗНЕС (Форма 589 / Розшифровки)
// =========================================================================
const template589 = [
  { name: 'Добування кам\'яного вугілля (КВЕД 05.10)', kved: '05.10' }
];

// =========================================================================
//  10. ДАНІ ПРО ПЕРСОНАЛ ТА ОПЛАТУ ПРАЦІ (Форма 5895 / Розділ VII)
// =========================================================================
const template5895 = [
  { code: '8000', name: 'Середня кількість працівників, у тому числі:' },
  { code: '8001', name: 'члени наглядової ради' },
  { code: '8002', name: 'члени правління' },
  { code: '8003', name: 'керівник' },
  { code: '8004', name: 'адміністративно-управлінський персонал' },
  { code: '8005', name: 'працівники' },
  { code: '8010', name: 'Витрати на оплату праці, у тому числі:' },
  { code: '8011', name: 'члени наглядової ради' },
  { code: '8012', name: 'члени правління' },
  { code: '8013', name: 'керівник' },
  { code: '8014', name: 'адміністративно-управлінський персонал' },
  { code: '8015', name: 'працівники' },
  { code: '8020', name: 'Середньомісячні витрати на оплату праці одного працівника (грн), усього:' },
  { code: '8023', name: 'керівник' },
  { code: '8024', name: 'адміністративно-управлінський працівник' },
  { code: '8025', name: 'працівник' }
];

module.exports = {
  enterpriseInfo,
  template580,
  template581,
  template582,
  template583,
  template584,
  template585,
  template588,
  template587,
  template589,
  template5895
};

