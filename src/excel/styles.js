/**
 * Excel styling constants matching Ukrainian Ministry FinPlan templates
 */

const thinBorder = {
  top: { style: 'thin' },
  left: { style: 'thin' },
  bottom: { style: 'thin' },
  right: { style: 'thin' }
};

const headerFill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFF2F2F2' }
};

const subtotalFill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFEBF1F5' }
};

const fontRegular = { name: 'Calibri', size: 10 };
const fontBold = { name: 'Calibri', size: 10, bold: true };
const fontTitle = { name: 'Calibri', size: 12, bold: true };

module.exports = {
  thinBorder,
  headerFill,
  subtotalFill,
  fontRegular,
  fontBold,
  fontTitle
};
