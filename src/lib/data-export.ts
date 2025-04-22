
import * as XLSX from 'xlsx';

export interface DataPoint {
  [key: string]: any;
}

export const exportToExcel = (data: DataPoint[], fileName: string) => {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    
    // Generate file and trigger download
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting data to Excel:', error);
    return false;
  }
};
