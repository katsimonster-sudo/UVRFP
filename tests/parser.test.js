const assert = require('assert');
const { identifyFormType, parseAccountingNumber, extractRowCodeAndValue } = require('../src/parser/formSignatures');

// 1. Identification
assert.strictEqual(identifyFormType('Баланс (Звіт про фінансовий стан)\nФорма №1 Код за ДКУД 1801001'), 'f1');
assert.strictEqual(identifyFormType('Звіт про фінансові результати (Звіт про сукупний дохід)\nФорма №2 Код за ДКУД 1801003'), 'f2');
assert.strictEqual(identifyFormType('Звіт про рух грошових коштів (за прямим методом)\nФорма №3 Код за ДКУД 1801004'), 'f3');
assert.strictEqual(identifyFormType('Розшифровка рядків 2120,2180,2200,2220\nКод форми 1956'), '1956');
assert.strictEqual(identifyFormType('Розшифровка Розрахунки з бюджетом\nКод форми 1704'), '1704');
assert.strictEqual(identifyFormType('Розшифровка рядка 1630 ф.1 "З оплати праці"\nКод форми 6220'), '6220');

// 2. Number parsing with accounting brackets
assert.strictEqual(parseAccountingNumber("151'072"), 151072);
assert.strictEqual(parseAccountingNumber("(167'108)"), -167108);
assert.strictEqual(parseAccountingNumber("-14'187"), -14187);
assert.strictEqual(parseAccountingNumber("---"), 0);
assert.strictEqual(parseAccountingNumber(""), 0);

// 3. Row code and value extraction from sample line
const sampleLine = "Інші операційні доходи 2120 151'072 72'244";
const parsed = extractRowCodeAndValue(sampleLine);
assert.ok(parsed, 'Line should be extracted');
assert.strictEqual(parsed.code, '2120');
assert.strictEqual(parsed.value, 151072);

console.log('✓ parser.test.js passed');
