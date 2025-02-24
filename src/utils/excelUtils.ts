
import * as XLSX from 'xlsx';

export const generateExcel = (data: any[]) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data.map(item => ({
    'Plant Name': item.plant_name,
    'Common Names': item.plant_details?.common_names?.join(', ') || '',
    'Confidence': `${Math.round(item.probability * 100)}%`,
  })));
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plant Identification Results');
  XLSX.writeFile(workbook, 'plant-identification-results.xlsx');
};

