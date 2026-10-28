const fs = require('fs');
const path = require('path');

function parseCsv(content) {
  const lines = content.split(/\r?\n/);
  const rows = [];
  let inQuotes = false;
  let curRow = [];
  let curCell = '';

  for (let l = 0; l < lines.length; l++) {
    const line = lines[l];
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        curRow.push(curCell.trim());
        curCell = '';
      } else {
        curCell += c;
      }
    }
    if (!inQuotes) {
      curRow.push(curCell.trim());
      rows.push(curRow);
      curRow = [];
      curCell = '';
    } else {
      curCell += '\n';
    }
  }
  return rows;
}

const csvPath = path.resolve(__dirname, '../data/templates/app3_source.csv');
const raw = fs.readFileSync(csvPath, 'utf-8');
const allRows = parseCsv(raw);

const forms = {};
let curForm = '680';
forms[curForm] = [];

for (const row of allRows) {
  const lineText = row.join(' ');
  if (lineText.includes('Форма 580') || lineText.includes('Форма 680')) curForm = '680';
  else if (lineText.includes('Форма 581') || lineText.includes('Форма 681')) curForm = '681';
  else if (lineText.includes('Форма 582') || lineText.includes('Форма 682')) curForm = '682';
  else if (lineText.includes('Форма 583') || lineText.includes('Форма 683')) curForm = '683';
  else if (lineText.includes('Форма 584') || lineText.includes('Форма 684')) curForm = '684';
  else if (lineText.includes('Форма 588') || lineText.includes('Форма 688')) curForm = '688';
  else if (lineText.includes('Форма 5895') || lineText.includes('Форма 6895')) curForm = '6895';
  else if (lineText.includes('Форма 589') || lineText.includes('Форма 689')) curForm = '689';

  if (!forms[curForm]) forms[curForm] = [];
  forms[curForm].push(row);
}

// Helper to sanitize numeric values or keep string if note/parentheses
function cleanVal(v) {
  if (!v || v === '()' || v === 'NaN' || v === 'X') return 0;
  const num = parseFloat(v.replace(/\s+/g, '').replace(',', '.'));
  return isNaN(num) ? v : num;
}

// Convert parsed CSV rows into clean model for each form
const app3Suite = {};

Object.keys(forms).forEach(fKey => {
  const rows = forms[fKey];
  const items = [];

  rows.forEach((row, idx) => {
    // Skip separator lines or page breaks like @#_x0012_
    const full = row.join(' ');
    if (full.includes('@#_x0012_') || full.includes('---')) return;
    if (full.startsWith('Форма') || full.startsWith('Деpжавне') || full.startsWith('Пpомисловiсть') || full.startsWith('Пiдпрiємство')) return;
    if (row[0] === 'А' && row[1] === 'Б') return;
    if (row[1] === 'Код' || row[1] === 'pяд-') return;

    // Check if section header
    if (row[0] && !row[1] && !row[2] && !row[3] && !row[4]) {
      const text = row[0].trim();
      if (text.length > 2 && !text.startsWith('за ') && !text.startsWith('Основнi')) {
        items.push({ isHeader: true, name: text });
      }
      return;
    }

    const name = row[0] ? row[0].trim() : '';
    const code = row[1] ? row[1].trim() : '';

    if (!name && !code) return;

    // Data row
    // Notes can be in row[8], row[9], row[10] or whichever non-empty cell after row[7]
    let notes = '';
    for (let c = 8; c < row.length; c++) {
      if (row[c] && row[c].trim() && isNaN(Number(row[c]))) {
        notes = (notes ? notes + ' | ' : '') + row[c].trim();
      }
    }

    items.push({
      name,
      code,
      priorYear: cleanVal(row[2]),
      currentYear: cleanVal(row[3]),
      q1: cleanVal(row[4]),
      q2: cleanVal(row[5]),
      q3: cleanVal(row[6]),
      q4: cleanVal(row[7]),
      notes
    });
  });

  app3Suite[fKey] = items;
  console.log(`Structured Form ${fKey}: ${items.length} items`);
});

// Write to src/calc/app3Template.js
const outJs = `/**
 * Автоматично структурований шаблон «Неофіційний Додаток 3» (форми 680-6895)
 * Створено на основі затвердженого робочого файлу Excel ДП "ОК "Укрвуглереструктуризація".
 */

const app3Suite = ${JSON.stringify(app3Suite, null, 2)};

module.exports = {
  app3Suite
};
`;

fs.writeFileSync(path.resolve(__dirname, '../src/calc/app3Template.js'), outJs, 'utf-8');
console.log('Successfully written src/calc/app3Template.js');
