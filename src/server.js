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

// Store uploaded PDFs temporarily in data/uploads
const uploadDir = path.join(__dirname, '../data/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

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
  const priorData = {
    q1: getPeriodData(year, 1),
    q2: getPeriodData(year, 2),
    q3: getPeriodData(year, 3)
  };

  const suite = computeFinPlanSuite(rawData, priorData);
  res.json({ year: Number(year), quarter: Number(quarter), suite });
});

// 3. Upload PDF and parse
app.post('/api/upload-pdf', upload.single('pdfFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const year = Number(req.body.year) || 2026;
    const quarter = Number(req.body.quarter) || 3;

    const buffer = fs.readFileSync(req.file.path);
    const parsed = await extractFinancialReport(buffer);

    // Save parsed data to store
    savePeriodData(year, quarter, parsed.forms);

    // Get prior quarters
    const priorData = {
      q1: getPeriodData(year, 1),
      q2: getPeriodData(year, 2),
      q3: getPeriodData(year, 3)
    };

    const suite = computeFinPlanSuite(parsed.forms, priorData);

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
    const rawData = getPeriodData(year, quarter) || {};
    const priorData = {
      q1: getPeriodData(year, 1),
      q2: getPeriodData(year, 2),
      q3: getPeriodData(year, 3)
    };

    const suite = computeFinPlanSuite(rawData, priorData);
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
    const rawData = getPeriodData(year, quarter) || {};
    const priorData = {
      q1: getPeriodData(year, 1),
      q2: getPeriodData(year, 2),
      q3: getPeriodData(year, 3)
    };

    const suite = computeFinPlanSuite(rawData, priorData);
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
  app.listen(PORT, () => {
    console.log(`FP 2025 Studio server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
