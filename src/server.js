const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { savePeriodData, getPeriodData, getAllPeriods } = require('./storage/periodStore');
const { extractFinancialReport } = require('./parser/pdfExtractor');
const { computeFinPlanSuite } = require('./calc/mappingMatrix');
const { generateFinPlanWorkbook } = require('./excel/excelGenerator');
const { generateApp3Workbook } = require('./excel/app3Generator');
const { app3Suite } = require('./calc/app3Template');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Store uploaded PDFs in data/uploads
const uploadDir = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const pdfMetaPath = path.join(uploadDir, 'pdf_meta.json');
function getPdfMeta() {
  if (fs.existsSync(pdfMetaPath)) {
    try {
      return JSON.parse(fs.readFileSync(pdfMetaPath, 'utf8'));
    } catch (_) {}
  }
  return {};
}
function savePdfMeta(meta) {
  try {
    fs.writeFileSync(pdfMetaPath, JSON.stringify(meta, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving PDF meta:', err);
  }
}

function resolveQuarterPdf(year, quarter) {
  const customPath = path.join(uploadDir, `${year}_q${quarter}.pdf`);
  if (fs.existsSync(customPath)) {
    const meta = getPdfMeta();
    const info = meta[`${year}_q${quarter}`] || {};
    return {
      filePath: customPath,
      filename: info.filename || `${year}_q${quarter}.pdf`,
      available: true
    };
  }

  // Fallback for default Q3 scan
  if (Number(year) === 2026 && Number(quarter) === 3) {
    const def3 = path.join(__dirname, '../data/3квЛМ001.pdf');
    if (fs.existsSync(def3)) {
      return {
        filePath: def3,
        filename: '3квЛМ001.pdf',
        available: true
      };
    }
  }

  return {
    filePath: null,
    filename: null,
    available: false
  };
}

const upload = multer({ dest: uploadDir });

// 1. List available periods
app.get('/api/periods', (req, res) => {
  res.json({ periods: getAllPeriods() });
});

// 2. Get data for a specific period
app.get('/api/period/:year/:quarter', (req, res) => {
  const { year, quarter } = req.params;
  const rawData = getPeriodData(year, quarter);
  if (!rawData) {
    return res.status(404).json({ error: 'Period data not found' });
  }

  // Fetch prior quarters for delta calculation
  const qNum = Number(quarter);
  const priorData = {
    q1: qNum >= 2 ? getPeriodData(year, 1) : null,
    q2: qNum >= 3 ? getPeriodData(year, 2) : null,
    q3: qNum >= 4 ? getPeriodData(year, 3) : null
  };

  const suite = computeFinPlanSuite(rawData, priorData, qNum);
  res.json({ year: Number(year), quarter: qNum, suite });
});

// 2a. Get PDF file for a specific quarter
app.get('/api/pdf/:year/:quarter', (req, res) => {
  const { year, quarter } = req.params;
  const resolved = resolveQuarterPdf(year, quarter);
  if (!resolved.available || !resolved.filePath) {
    return res.status(404).json({ error: 'PDF not found for period', available: false });
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(resolved.filename)}"`);
  fs.createReadStream(resolved.filePath).pipe(res);
});

// 2b. Status of available PDFs across quarters for a year
app.get('/api/pdfs-status/:year', (req, res) => {
  const { year } = req.params;
  const quarters = {};
  for (let q = 1; q <= 4; q++) {
    const resolved = resolveQuarterPdf(year, q);
    quarters[q] = {
      available: resolved.available,
      filename: resolved.filename
    };
  }
  res.json({ year: Number(year), quarters });
});

// 3. Upload PDF and parse
app.post('/api/upload-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const year = Number(req.body.year) || 2026;
    const quarter = Number(req.body.quarter) || 3;

    // Permanently save uploaded PDF for this specific quarter
    const destPdfPath = path.join(uploadDir, `${year}_q${quarter}.pdf`);
    try {
      fs.copyFileSync(req.file.path, destPdfPath);
      const meta = getPdfMeta();
      meta[`${year}_q${quarter}`] = {
        filename: req.file.originalname || `${year}_q${quarter}.pdf`,
        size: req.file.size,
        uploadedAt: new Date().toISOString()
      };
      savePdfMeta(meta);
    } catch (saveErr) {
      console.warn('Warning: could not persist PDF file:', saveErr.message);
    }

    const buffer = fs.readFileSync(req.file.path);
    const parsed = await extractFinancialReport(buffer, { year, quarter });

    // Save parsed data to store
    savePeriodData(year, quarter, parsed.forms);

    // Get prior quarters (exclude current quarter to avoid double-counting in delta)
    const priorData = {
      q1: quarter >= 2 ? getPeriodData(year, 1) : null,
      q2: quarter >= 3 ? getPeriodData(year, 2) : null,
      q3: quarter >= 4 ? getPeriodData(year, 3) : null
    };

    const suite = computeFinPlanSuite(parsed.forms, priorData, quarter);

    res.json({
      success: true,
      year,
      quarter,
      metadata: parsed.metadata,
      suite
    });
  } catch (err) {
    console.error('Error processing PDF:', err);
    res.status(500).json({ error: 'Failed to process PDF: ' + err.message });
  }
});

// 4. Recalculate with modified user values
app.post('/api/recalculate', (req, res) => {
  try {
    const { year, quarter, currentRawForms, priorQuartersData } = req.body;
    const suite = computeFinPlanSuite(currentRawForms, priorQuartersData);
    res.json({ success: true, suite });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Export to Excel (.xlsx)
app.get('/api/export-excel/:year/:quarter', async (req, res) => {
  try {
    const { year, quarter } = req.params;
    const qNum = Number(quarter) || 3;
    const rawData = getPeriodData(year, quarter) || {};
    const priorData = {
      q1: qNum >= 2 ? getPeriodData(year, 1) : null,
      q2: qNum >= 3 ? getPeriodData(year, 2) : null,
      q3: qNum >= 4 ? getPeriodData(year, 3) : null
    };

    const suite = computeFinPlanSuite(rawData, priorData, qNum);
    const buffer = await generateFinPlanWorkbook(suite);

    const filename = `Звіт_Викон_Фін_Пл_за_${quarter}_кв_${year}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Export failed: ' + err.message });
  }
});

// 6. Get App3 (Неофіційний Додаток 3) Template Data
app.get('/api/app3-template', (req, res) => {
  res.json({ success: true, app3Suite });
});

// 7. Export App3 to Excel (.xlsx)
app.get('/api/export-app3/:year/:quarter', async (req, res) => {
  try {
    const { year, quarter } = req.params;
    const qNum = Number(quarter) || 3;
    const rawData = getPeriodData(year, quarter) || {};
    const priorData = {
      q1: qNum >= 2 ? getPeriodData(year, 1) : null,
      q2: qNum >= 3 ? getPeriodData(year, 2) : null,
      q3: qNum >= 4 ? getPeriodData(year, 3) : null
    };

    const suite = computeFinPlanSuite(rawData, priorData, qNum);
    const buffer = await generateApp3Workbook(suite);

    const filename = `Чернетка_Фін_Пл_за_${quarter}_кв_${year}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.send(buffer);
  } catch (err) {
    console.error('Export App3 error:', err);
    res.status(500).json({ error: 'Export App3 failed: ' + err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FP 2025 Studio server running at http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
