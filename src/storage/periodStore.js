const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data');
const PERIODS_DIR = path.join(DATA_DIR, 'periods');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getPeriodFilePath(year, quarter) {
  ensureDir(PERIODS_DIR);
  return path.join(PERIODS_DIR, `${year}_q${quarter}.json`);
}

function savePeriodData(year, quarter, data) {
  const filePath = getPeriodFilePath(year, quarter);
  const payload = {
    year: Number(year),
    quarter: Number(quarter),
    updatedAt: new Date().toISOString(),
    data: data || {}
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  return payload;
}

function getPeriodData(year, quarter) {
  const filePath = getPeriodFilePath(year, quarter);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return parsed.data || null;
  } catch (err) {
    console.error(`Error reading period data for ${year} Q${quarter}:`, err);
    return null;
  }
}

function getAllPeriods() {
  ensureDir(PERIODS_DIR);
  const files = fs.readdirSync(PERIODS_DIR).filter(f => f.endsWith('.json'));
  const list = [];
  for (const f of files) {
    try {
      const raw = fs.readFileSync(path.join(PERIODS_DIR, f), 'utf-8');
      const parsed = JSON.parse(raw);
      list.push({
        year: parsed.year,
        quarter: parsed.quarter,
        updatedAt: parsed.updatedAt
      });
    } catch (e) {
      // ignore corrupted file
    }
  }
  return list.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.quarter - b.quarter));
}

module.exports = {
  savePeriodData,
  getPeriodData,
  getAllPeriods
};
