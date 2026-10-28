/**
 * Rules and patterns to identify standard accounting forms and parse accounting numbers
 */

function identifyFormType(text) {
  if (!text) return 'unknown';

  if (/1801001|Баланс.*\(Звіт про фінансовий стан\)|Форма\s*№?\s*1\b/i.test(text)) {
    return 'f1';
  }
  if (/1801003|Звіт про фінансові результати|Форма\s*№?\s*2\b/i.test(text)) {
    return 'f2';
  }
  if (/1801004|Звіт про рух грошових коштів|Форма\s*№?\s*3\b/i.test(text)) {
    return 'f3';
  }

  // Ministerial codes
  const codeMatch = text.match(/Код\s+форми\s+(\d{4})/i);
  if (codeMatch) {
    return codeMatch[1];
  }

  if (/ряд\.?\s*2500.*МАТЕРІАЛЬНІ ЗАТРАТИ/i.test(text)) return '2500';
  if (/Рядка?\s+2120.*Рядка?\s+2180/i.test(text)) return '1956';
  if (/Розрахунки\s+з\s+бюджетом/i.test(text)) return '1704';
  if (/З\s+оплати\s+праці/i.test(text)) return '6220';
  if (/Розрахунки\s+зі\s+страхування/i.test(text)) return '8210';
  if (/використання\s+бюджетних\s+коштів/i.test(text)) return '2060';

  return 'unknown';
}

function parseAccountingNumber(raw) {
  if (raw === null || raw === undefined) return 0;
  let str = String(raw).trim();
  if (!str || str === '---' || str === '-' || str === 'X' || str === 'x') return 0;

  // Check brackets: (14'187) -> -14187
  let isNegative = false;
  if ((str.startsWith('(') && str.endsWith(')')) || str.startsWith('-')) {
    isNegative = true;
    str = str.replace(/[()\-]/g, '').trim();
  }

  // Remove thousands separators: apostrophes, spaces, thin spaces
  str = str.replace(/['’`\s]/g, '');
  // Replace comma with dot
  str = str.replace(/,/g, '.');

  const num = parseFloat(str);
  if (isNaN(num)) return 0;
  return isNegative ? -Math.abs(num) : num;
}

function extractRowCodeAndValue(line) {
  if (!line) return null;

  // Split line into tokens
  const tokens = line.trim().split(/\s+/);
  // Find token that looks like row code (2 to 5 digits without letters/symbols)
  let codeIdx = -1;
  for (let i = 0; i < tokens.length; i++) {
    if (/^\d{2,5}$/.test(tokens[i])) {
      codeIdx = i;
      break;
    }
  }

  if (codeIdx === -1 || codeIdx >= tokens.length - 1) return null;

  const code = tokens[codeIdx];
  const numTokens = tokens.slice(codeIdx + 1);
  const values = numTokens.map(parseAccountingNumber);

  return {
    code,
    value: values[0] || 0,
    allValues: values
  };
}

module.exports = {
  identifyFormType,
  parseAccountingNumber,
  extractRowCodeAndValue
};
