import jsPDF from 'jspdf';
import autoTable, { CellInput, RowInput } from 'jspdf-autotable';

export interface HeaderConfig {
  title: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
}

export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  headers: HeaderConfig[],
  fileName: string,
  titleReporte: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  const columns = headers.map((h) => ({
    header: h.title,
    dataKey: h.key,
  }));

  const columnStyles: any = {};
  headers.forEach((h) => {
    columnStyles[h.key] = {
      cellWidth: h.width ?? 'auto',
      halign: h.align ?? 'left',
    };
  });

  // 🔧 Convertimos cada objeto al formato que espera autoTable (plano con las claves deseadas)
  const body: RowInput[] = data.map((item) => {
    const row: Record<string, CellInput> = {};
    headers.forEach((h) => {
      row[h.key] = String(item[h.key] ?? '');
    });
    return row;
  });

  autoTable(doc, {
    columns: columns,
    body: body,
    styles: {
      fontSize: 4,
      overflow: 'linebreak',
      cellPadding: 1.5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    startY: 40,
    margin: { left: 10, right: 10 },
    columnStyles,
    tableWidth: 'wrap',
    didDrawPage: function (data: any) {
      doc.setFontSize(9);
      doc.text(titleReporte, data.settings.margin.left, 30);
    },
  });

  doc.save(fileName);
}
