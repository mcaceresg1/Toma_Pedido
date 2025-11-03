import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

export interface HeaderConfig {
  title: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  headers: HeaderConfig[],
  fileName: string,
  sheetName: string = 'Hoja1'
): void {
  if (!data || data.length === 0 || !headers || headers.length === 0) {
    console.warn('No hay datos o encabezados para exportar.');
    return;
  }

  // Crear data con títulos personalizados
  const dataWithTitles = data.map(item => {
    const row: any = {};
    headers.forEach(header => {
      row[header.title] = item[header.key] ?? '';
    });
    return row;
  });

  // Crear hoja
  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataWithTitles);

  // Ajustar ancho de columnas
  worksheet['!cols'] = headers.map(header => ({
    wch: header.width ?? 20  // wch = width in characters
  }));

  // Crear libro
  const workbook: XLSX.WorkBook = {
    Sheets: { [sheetName]: worksheet },
    SheetNames: [sheetName]
  };

  // Convertir a archivo
  const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  // Descargar
  FileSaver.saveAs(blob, `${fileName}.xlsx`);
}
