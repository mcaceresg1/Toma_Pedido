/**
 * NOTA IMPORTANTE:
 * Esta utilidad usa 'xlsx-js-style' que genera un warning en consola:
 * "Module stream has been externalized for browser compatibility"
 * 
 * Este warning es COSMÉTICO y NO afecta la funcionalidad.
 * Es necesario para mantener los estilos (negritas, colores) en Excel.
 * El warning puede ignorarse de forma segura.
 */
import * as XLSX from 'xlsx-js-style';
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

  // Aplicar estilos a la cabecera (primera fila)
  const headerStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: 'F5F5DC' } }, // Beige/crema
    alignment: { horizontal: 'center', vertical: 'center' }
  };

  // Aplicar estilo a cada celda de la cabecera
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = headerStyle;
    }
  }

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
