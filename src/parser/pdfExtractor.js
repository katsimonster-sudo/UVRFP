const pdfParse = require('pdf-parse');
const { identifyFormType, extractRowCodeAndValue } = require('./formSignatures');

/**
 * Extracts financial data from a multi-page PDF buffer
 * @param {Buffer} pdfBuffer
 * @returns {Promise<Object>} Form-structured extracted numbers
 */
async function extractFinancialReport(pdfBuffer) {
  const result = {
    metadata: {},
    forms: {},
    rawPages: []
  };

  const parsed = await pdfParse(pdfBuffer, {
    // Custom page render to capture text per page
    pagerender: function (pageData) {
      return pageData.getTextContent().then(function (textContent) {
        let lastY, text = '';
        for (let item of textContent.items) {
          if (lastY == item.transform[5] || !lastY) {
            text += item.str + ' ';
          } else {
            text += '\n' + item.str + ' ';
          }
          lastY = item.transform[5];
        }
        return text;
      });
    }
  });

  // Extract Enterprise info and period date if present
  const fullText = parsed.text;
  const edrpouMatch = fullText.match(/ЄДРПОУ\s*(\d{8})/i);
  if (edrpouMatch) result.metadata.edrpou = edrpouMatch[1];

  const dateMatch = fullText.match(/(\d{4})\s*(\d{2})\s*(\d{2})/);
  if (dateMatch) {
    result.metadata.year = parseInt(dateMatch[1]);
    result.metadata.month = parseInt(dateMatch[2]);
    result.metadata.quarter = Math.ceil(result.metadata.month / 3);
  }

  // Split text by form headings or page boundaries
  // Process line by line
  const lines = fullText.split('\n').map(l => l.trim()).filter(Boolean);
  let currentForm = 'general';

  for (const line of lines) {
    const detectedForm = identifyFormType(line);
    if (detectedForm !== 'unknown') {
      currentForm = detectedForm;
      if (!result.forms[currentForm]) {
        result.forms[currentForm] = {};
      }
    }

    const row = extractRowCodeAndValue(line);
    if (row && currentForm !== 'general') {
      if (!result.forms[currentForm]) result.forms[currentForm] = {};
      result.forms[currentForm][row.code] = {
        value: row.value,
        allValues: row.allValues,
        rawLine: line
      };
    }
  }

  return result;
}

module.exports = {
  extractFinancialReport
};
