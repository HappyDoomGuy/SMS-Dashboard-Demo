import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without extension)
 * @param {String} sheetName - Name of the sheet
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Auto-size columns
  const colWidths = [];
  const keys = Object.keys(data[0] || {});
  
  keys.forEach((key, i) => {
    const maxWidth = Math.max(
      key.length,
      ...data.map(row => String(row[key] || '').length)
    );
    colWidths.push({ wch: Math.min(maxWidth + 2, 50) }); // Max width 50
  });
  
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  
  // Create blob and download
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  saveAs(blob, `${filename}.xlsx`);
};

/**
 * Export DataGrid rows to Excel
 * @param {Array} rows - DataGrid rows
 * @param {Array} columns - DataGrid columns
 * @param {String} filename - Name of the file
 */
export const exportDataGridToExcel = (rows, columns, filename = 'export') => {
  // Filter out action columns and prepare data
  const visibleColumns = columns.filter(col => col.field !== 'actions' && !col.hide);
  
  // Map rows to objects with column headers
  const data = rows.map(row => {
    const obj = {};
    visibleColumns.forEach(col => {
      obj[col.headerName || col.field] = row[col.field];
    });
    return obj;
  });
  
  exportToExcel(data, filename, 'Данные');
};

