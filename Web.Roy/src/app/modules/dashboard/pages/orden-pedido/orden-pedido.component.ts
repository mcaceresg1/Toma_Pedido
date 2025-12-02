import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { VentasService } from '../../services/ventas.service';
import { HistoricoPedidoCabecera, HistoricoPedidoDetalle } from '../../../../../models/Pedido';
import { Vendedor } from '../../../../../models/Vendedor';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { exportToExcel, HeaderConfig } from '../../../../shared/util/exportarExcel';
import { exportToPDF } from '../../../../shared/util/exportarPDF';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-orden-pedido',
  standalone: true,
  imports: [    
    CommonModule,
    FormsModule,
    MatToolbarModule,
    DatePipe,
    CurrencyPipe,
    DecimalPipe,
    MatProgressSpinnerModule
  ],
  templateUrl: './orden-pedido.component.html',
  styleUrls: ['./orden-pedido.component.scss']
})
export class OrdenPedidoComponent implements OnInit {
  fechaDesde: string | null = null;
  fechaHasta: string | null = null;

  vendedorSeleccionado: number = 0;
  vendedores: Vendedor[] = [];
  filtroDespacho: string = 'todos'; // 'todos', 'con_despacho', 'sin_despacho'

  ordenes: HistoricoPedidoCabecera[] = [];
  ordenSeleccionada: HistoricoPedidoCabecera | null = null;
  detalleOrden: HistoricoPedidoDetalle[] = [];

  cargando: boolean = false;
  modoZona: boolean = false;

  constructor(
    private ventasService: VentasService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar si está en modo zona desde la ruta
    this.modoZona = this.route.snapshot.data['modo'] === 'zona';
    
    // Establecer fechas por defecto: 30 días antes hasta hoy
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    // Formatear fechas como YYYY-MM-DD para inputs de tipo date
    this.fechaHasta = hoy.toISOString().split('T')[0];
    this.fechaDesde = hace30Dias.toISOString().split('T')[0];
    
    this.cargarVendedores();
    
    // Ejecutar búsqueda automáticamente al cargar
    this.buscar();
  }

  cargarVendedores(): void {
    this.ventasService.getVendedores().subscribe({
      next: (data) => {
        this.vendedores = data || [];
      },
      error: (err) => {
        console.error('Error al cargar vendedores', err);
        alert('Error al cargar la lista de vendedores');
      }
    });
  }

  buscar(): void {
    // Validar si hay fechas y si están en el orden correcto
    if (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta) {
      alert('La fecha desde no puede ser mayor que la fecha hasta.');
      return;
    }

    this.cargando = true;
    this.ordenSeleccionada = null;
    this.detalleOrden = [];
    this.ordenes = [];

    // Preparar parámetros
    const desde: string | null = this.fechaDesde?.trim() || null;
    const hasta: string | null = this.fechaHasta?.trim() || null;
     
    const vendedorId: number | null = this.vendedorSeleccionado !== 0 ? this.vendedorSeleccionado : null;
    const conDespacho: boolean | null = this.modoZona && this.filtroDespacho === 'con_despacho' ? true : 
                                        (this.modoZona && this.filtroDespacho === 'sin_despacho' ? false : null);

    // Usar el método apropiado según el modo
    const servicio = this.modoZona 
      ? this.ventasService.getHistoricoPedidosPorZona(desde, hasta, vendedorId, conDespacho)
      : this.ventasService.getHistoricoPedidos(desde, hasta, vendedorId);

    servicio.subscribe({
      next: (data) => {
        this.ordenes = data || [];
        // Ordenar por VENDEDOR y ZONA
        this.ordenarPorVendedorYZona();
        // Solo seleccionar orden automáticamente si NO está en modo zona
        if (!this.modoZona && this.ordenes.length > 0) {
          this.seleccionarOrden(this.ordenes[0]);
        }
      },
      error: (error) => {
        console.error('Error al obtener pedidos:', error);
        alert('Error al obtener los pedidos.');
        this.ordenes = [];
      },
      complete: () => {
        this.cargando = false;
      }
    });
  }

  seleccionarOrden(orden: HistoricoPedidoCabecera): void {
    // En modo zona, no se selecciona orden (no hay detalle)
    if (this.modoZona) {
      return;
    }
    this.ordenSeleccionada = orden;
    this.detalleOrden = orden.detalles || [];
  }

  limpiarFiltros(): void {
    // Restaurar fechas por defecto: 30 días antes hasta hoy
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    this.fechaHasta = hoy.toISOString().split('T')[0];
    this.fechaDesde = hace30Dias.toISOString().split('T')[0];
    this.vendedorSeleccionado = 0;
    this.filtroDespacho = 'todos';
  
    this.ordenes = [];
    this.detalleOrden = [];
    this.ordenSeleccionada = null;
  }

  truncarTexto(texto: string | null | undefined, longitud: number = 30): string {
    if (!texto) return '-';
    return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto;
  }

  ordenarPorVendedorYZona(): void {
    this.ordenes.sort((a, b) => {
      // Primero ordenar por ZONA (descripción)
      const zonaA = (a.zona || '').toUpperCase();
      const zonaB = (b.zona || '').toUpperCase();
      
      if (zonaA < zonaB) return -1;
      if (zonaA > zonaB) return 1;
      
      // Si las zonas son iguales, ordenar por VENDEDOR
      const vendedorA = (a.vendedor || '').toUpperCase();
      const vendedorB = (b.vendedor || '').toUpperCase();
      
      if (vendedorA < vendedorB) return -1;
      if (vendedorA > vendedorB) return 1;
      
      // Si vendedores son iguales, ordenar por UBIGEO (descripción)
      const ubigeoA = (a.ubigeo || '').toUpperCase();
      const ubigeoB = (b.ubigeo || '').toUpperCase();
      
      if (ubigeoA < ubigeoB) return -1;
      if (ubigeoA > ubigeoB) return 1;
      
      return 0;
    });
  }

  exportarExcel(): void {
    if (this.ordenes.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Formatear fechas antes de exportar
    const datosFormateados = this.ordenes.map(orden => ({
      ...orden,
      fecha: this.formatearFecha(orden.fecha)
    }));

    const headers: HeaderConfig[] = [
      { title: 'ZONA', key: 'zona', width: 10 },
      { title: 'VENDEDOR', key: 'vendedor', width: 20 },
      { title: 'UBIGEO', key: 'ubigeo', width: 30 },
      { title: 'TRASANC', key: 'operacion', width: 10 },
      { title: 'FECHA', key: 'fecha', width: 12 },
      { title: 'CLIENTE', key: 'cliente', width: 40 },
      { title: 'REFERENCIA', key: 'referencia', width: 12 },
      { title: 'GUÍA', key: 'guia', width: 15 },
      { title: 'FACTURA', key: 'factura', width: 15 },
      { title: 'TOTAL', key: 'total', width: 12, align: 'right' },
      { title: 'ESTADO', key: 'estado', width: 12 },
      { title: 'SUNAT', key: 'aceptadaPorLaSunat', width: 10 },
      { title: 'ORIGINAL', key: 'orginal', width: 10, align: 'right' },
      { title: 'DESPACHADA', key: 'despachada', width: 12, align: 'right' }
    ];

    const fileName = this.modoZona 
      ? `Pedidos_Por_Zona_${new Date().toISOString().split('T')[0]}`
      : `Pedidos_Por_Vendedor_${new Date().toISOString().split('T')[0]}`;

    exportToExcel(datosFormateados, headers, fileName, 'Pedidos');
  }

  formatearFecha(fecha: any): string {
    if (!fecha) return '';
    
    // Si es string en formato YYYY-MM-DD (del input date), parsear directamente
    if (typeof fecha === 'string' && fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [anio, mes, dia] = fecha.split('-');
      return `${dia}/${mes}/${anio}`;
    }
    
    // Para otros formatos, usar Date
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  exportarExcelDetallado(): void {
    if (this.ordenes.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Formatear fechas antes de exportar
    const datosFormateados = this.ordenes.map(orden => ({
      ...orden,
      fecha: this.formatearFecha(orden.fecha)
    }));

    const headers: HeaderConfig[] = [
      { title: 'TRANSACCION', key: 'operacion', width: 12 },
      { title: 'FECHA', key: 'fecha', width: 12 },
      { title: 'RAZON SOCIAL', key: 'cliente', width: 40 },
      { title: 'DOCUMENTO', key: 'ruc', width: 12 },
      { title: 'TOTAL', key: 'total', width: 12, align: 'right' },
      { title: 'GUIA', key: 'guia', width: 15 },
      { title: 'FACTURA', key: 'factura', width: 15 },
      { title: 'ESTADO', key: 'estado', width: 12 },
      { title: 'UBIGEO', key: 'ubigeo', width: 30 },
      { title: 'ZONA', key: 'zona', width: 15 },
      { title: 'VENDEDOR', key: 'vendedor', width: 20 }
    ];

    const fileName = `Pedidos_Detallado_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(datosFormateados, headers, fileName, 'Pedidos Detallado');
  }

  exportarResumen(): void {
    if (this.ordenes.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Agrupar por ZONA, VENDEDOR, UBIGEO
    const agrupado = new Map<string, { 
      zona: string, 
      vendedor: string, 
      ubigeo: string, 
      despachado: number,
      pendiente: number,
      total: number
    }>();

    this.ordenes.forEach(orden => {
      const key = `${orden.zona || 'SIN ZONA'}|${orden.vendedor}|${orden.ubigeo || 'SIN UBIGEO'}`;
      
      const importeOrden = orden.total || 0;
      const esDespachado = orden.estado === 'DESPACHADO';
      const esPendiente = orden.estado === 'PENDIENTE' || orden.estado === 'PARCIAL';
      
      if (agrupado.has(key)) {
        const grupo = agrupado.get(key)!;
        grupo.total += importeOrden;
        if (esDespachado) {
          grupo.despachado += importeOrden;
        }
        if (esPendiente) {
          grupo.pendiente += importeOrden;
        }
      } else {
        agrupado.set(key, {
          zona: orden.zona || 'SIN ZONA',
          vendedor: orden.vendedor || '',
          ubigeo: orden.ubigeo || 'SIN UBIGEO',
          despachado: esDespachado ? importeOrden : 0,
          pendiente: esPendiente ? importeOrden : 0,
          total: importeOrden
        });
      }
    });

    const resumenData = Array.from(agrupado.values());

    const headers: HeaderConfig[] = [
      { title: 'ZONA', key: 'zona', width: 15 },
      { title: 'VENDEDOR', key: 'vendedor', width: 25 },
      { title: 'UBIGEO', key: 'ubigeo', width: 35 },
      { title: 'DESPACHADO', key: 'despachado', width: 15, align: 'right' },
      { title: 'PENDIENTE', key: 'pendiente', width: 15, align: 'right' },
      { title: 'TOTAL SOLES', key: 'total', width: 15, align: 'right' }
    ];

    const fileName = `Resumen_Pedidos_Por_Zona_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(resumenData, headers, fileName, 'Resumen');
  }

  imprimirResumenPDF(): void {
    if (this.ordenes.length === 0) {
      alert('No hay datos para imprimir');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    // Título principal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    const titulo = `RESUMEN DE PEDIDOS POR ZONA`;
    doc.text(titulo, 40, 30);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const subtitulo = `Del ${this.formatearFecha(this.fechaDesde)} al ${this.formatearFecha(this.fechaHasta)}`;
    doc.text(subtitulo, 40, 45);

    // Agrupar datos por ZONA → VENDEDOR → UBIGEO
    const zonas = new Map<string, Map<string, any[]>>();
    
    this.ordenes.forEach(orden => {
      const zona = orden.zona || 'SIN ZONA';
      const vendedor = orden.vendedor || 'SIN VENDEDOR';
      const ubigeo = orden.ubigeo || 'SIN UBIGEO';
      
      if (!zonas.has(zona)) {
        zonas.set(zona, new Map());
      }
      
      const vendedoresMap = zonas.get(zona)!;
      if (!vendedoresMap.has(vendedor)) {
        vendedoresMap.set(vendedor, []);
      }
      
      vendedoresMap.get(vendedor)!.push(orden);
    });

    let yPosition = 60;

    // Generar PDF con estructura jerárquica
    zonas.forEach((vendedoresMap, zona) => {
      // ZONA (Subtítulo)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 139);
      doc.text(`ZONA: ${zona}`, 40, yPosition);
      yPosition += 20;

      vendedoresMap.forEach((ordenes, vendedor) => {
        // VENDEDOR (Sub-subtítulo, indentado)
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(`  VENDEDOR: ${vendedor}`, 60, yPosition);
        yPosition += 15;

        // Agrupar por UBIGEO
        const ubigeosMap = new Map<string, any[]>();
        ordenes.forEach(orden => {
          const ubigeo = orden.ubigeo || 'SIN UBIGEO';
          if (!ubigeosMap.has(ubigeo)) {
            ubigeosMap.set(ubigeo, []);
          }
          ubigeosMap.get(ubigeo)!.push(orden);
        });

        // Tabla de ubigeos (indentada)
        const tableData: any[] = [];
        let totalDespachado = 0;
        let totalPendiente = 0;
        let totalVendedor = 0;
        
        ubigeosMap.forEach((ordenesUbigeo, ubigeo) => {
          // Calcular importes despachados y pendientes
          const despachado = ordenesUbigeo
            .filter(o => o.estado === 'DESPACHADO')
            .reduce((sum, o) => sum + (o.total || 0), 0);
          
          const pendiente = ordenesUbigeo
            .filter(o => o.estado === 'PENDIENTE' || o.estado === 'PARCIAL')
            .reduce((sum, o) => sum + (o.total || 0), 0);
          
          const total = ordenesUbigeo.reduce((sum, o) => sum + (o.total || 0), 0);
          
          totalDespachado += despachado;
          totalPendiente += pendiente;
          totalVendedor += total;
          
          tableData.push([
            ubigeo,
            'S/ ' + despachado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'S/ ' + pendiente.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            'S/ ' + total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          ]);
        });

        // Agregar fila de subtotal del vendedor
        tableData.push([
          { content: 'SUBTOTAL VENDEDOR', styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
          { content: 'S/ ' + totalDespachado.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right' } },
          { content: 'S/ ' + totalPendiente.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right' } },
          { content: 'S/ ' + totalVendedor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right' } }
        ]);

        autoTable(doc, {
          head: [['UBIGEO', 'DESPACHADO', 'PENDIENTE', 'TOTAL SOLES']],
          body: tableData,
          startY: yPosition,
          margin: { left: 80 },
          styles: {
            fontSize: 8,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [200, 200, 200],
            textColor: 0,
            fontStyle: 'bold',
            halign: 'center',
          },
          columnStyles: {
            0: { halign: 'left', cellWidth: 180 },
            1: { halign: 'right', cellWidth: 80 },
            2: { halign: 'right', cellWidth: 80 },
            3: { halign: 'right', cellWidth: 80 }
          },
          didDrawPage: function(data: any) {
            yPosition = data.cursor.y + 10;
          }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      });

      yPosition += 5;
    });

    const fileName = `Resumen_Pedidos_Por_Zona_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
  
}

