import { Component, OnInit } from '@angular/core';
import { CurrencyPipe, NgFor, AsyncPipe, DecimalPipe, DatePipe, NgClass, CommonModule } from '@angular/common';
import { ReportesService } from '../../services/reportes.service';
import { ProductoReport } from '../../../../../models/ProductoReport';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { filterAndSortPaginated, PaginatedResult } from '../../../../shared/util/array-utils';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { exportToPDF, HeaderConfig } from '../../../../shared/util/exportarPDF';
import { exportToExcel } from '../../../../shared/util/exportarExcel';

@Component({
  selector: 'app-reporte-productos',
  standalone: true, 
  templateUrl: './reporte-productos.component.html',
  styleUrls: ['./reporte-productos.component.scss'],
  imports: [    
    NgFor,
    AsyncPipe,
    CurrencyPipe,
    DecimalPipe,   
    DatePipe,
    NgxPaginationModule,
    FormsModule,  
    NgClass,
    CommonModule,
    MatToolbarModule,
    MatMenuModule   
]
})
export class ReporteProductosComponent implements OnInit {
productos: ProductoReport[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 25;

  order: keyof ProductoReport = 'descripcion';
  reverse: boolean = false;

  page = 1;
  productoSeleccionado: ProductoReport | null = null;
  modalAbierto: boolean = false;

  constructor(private reporteService: ReportesService) {}

  ngOnInit(): void {
    this.reporteService.getProductoReporte().subscribe({
      next: (data) => {
        this.productos = data;
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
      },
    });
  }

   onSearch(term: string) {
    this.searchTerm = term;
    this.page = 1; // reiniciar a la primera página
  }

  changePage(newPage: number) {
    this.page = newPage;
  }

  toggleOrder(column: keyof ProductoReport) {
    if (this.order === column) {
      this.reverse = !this.reverse;
    } else {
      this.order = column;
      this.reverse = false;
    }
    this.page = 1;
  }

   get paginatedItems(): PaginatedResult<ProductoReport> {
    return filterAndSortPaginated(
      this.productos,
      this.searchTerm,
      ['codigo', 'descripcion','codigo_de_Barra_SKU'],
      this.order,
      this.reverse,
      this.page,
      this.itemsPerPage 
    );
  }



exportProductosToPDF() {
  const headers: HeaderConfig[] = [
    { title: 'Codigo', key: 'codigo', width: 30, align: 'center' },
    { title: 'Descripción', key: 'descripcion', width: 100 },
    { title: 'Clase', key: 'descripcionClase', width: 30 },
    { title: 'Marca', key: 'descripcionMarca', width: 50 },
    { title: 'UDM', key: 'descripcionUDM', width: 20 },
    { title: 'Departamento', key: 'descripcionDepartamento', width: 40 },
    { title: 'Versión', key: 'desctipcionVersion', width: 30 },
    { title: 'Tipo Mercadería', key: 'descripcionTipoMercaderia', width: 30 },
    { title: 'SKU', key: 'codigo_de_Barra_SKU', width: 30 },
    { title: 'Empaque', key: 'empaque', width: 15 },
    { title: 'Peso', key: 'peso_Unitario', width: 15 },
    { title: '% Comisión', key: 'porc_Comision', width: 15 },
    { title: 'Ubicación', key: 'ubicacion', width: 15 },
    { title: 'SUNAT', key: 'codigo_Sunat', width: 15 },
    { title: 'Costo Compra', key: 'costo_de_Compra', width: 15, align: 'right' },
    { title: 'Soles', key: 'soles', width: 15, align: 'right' },
    { title: 'Existencia', key: 'existencia', width: 20 },
    { title: 'Costo Prom.', key: 'costo_Promedio', width: 30, align: 'right' },
    { title: 'Últ. Compra', key: 'ultima_Compra', width: 30 },
    { title: 'Costo $', key: 'costo_Dolar', width: 15, align: 'right' },
    { title: 'IGV', key: 'tipo_IGV', width: 15 },
    { title: 'Stock Max', key: 'stock_Maximo', width: 15 },
    { title: 'Stock Min', key: 'sock_Minimo', width: 15 },
    { title: 'Últ. Inventario', key: 'ultimo_Inventario', width: 45 },
    { title: 'Tipo Existencia', key: 'tipo_Existencia', width: 15 },
    { title: 'Unitario', key: 'unitario', width: 15 },
    { title: 'Cat. B', key: 'cat_B', width: 15 },
    { title: 'Cat. A', key: 'cat_A', width: 15 },
    { title: 'Personalizado', key: 'personalizado', width: 40 },
    { title: 'Disponible', key: 'disponible', width: 40 },
    { title: 'Estado', key: 'estado', width: 25 }

  ];

  const fileName = 'reporte-productos.pdf';
  const titleReporte = 'Reporte de Productos';
  exportToPDF(this.productos, headers, fileName,titleReporte);
}

  exportarProductosExcel() {
  const headers: HeaderConfig[] = [
    { title: 'Codigo', key: 'codigo', width: 30, align: 'center' },
    { title: 'Descripción', key: 'descripcion', width: 100 },
    { title: 'Clase', key: 'descripcionClase', width: 30 },
    { title: 'Marca', key: 'descripcionMarca', width: 50 },
    { title: 'UDM', key: 'descripcionUDM', width: 20 },
    { title: 'Departamento', key: 'descripcionDepartamento', width: 40 },
    { title: 'Versión', key: 'desctipcionVersion', width: 30 },
    { title: 'Tipo Mercadería', key: 'descripcionTipoMercaderia', width: 30 },
    { title: 'SKU', key: 'codigo_de_Barra_SKU', width: 30 },
    { title: 'Empaque', key: 'empaque', width: 15 },
    { title: 'Peso', key: 'peso_Unitario', width: 15 },
    { title: '% Comisión', key: 'porc_Comision', width: 15 },
    { title: 'Ubicación', key: 'ubicacion', width: 15 },
    { title: 'SUNAT', key: 'codigo_Sunat', width: 15 },
    { title: 'Costo Compra', key: 'costo_de_Compra', width: 15, align: 'right' },
    { title: 'Soles', key: 'soles', width: 15, align: 'right' },
    { title: 'Existencia', key: 'existencia', width: 20 },
    { title: 'Costo Prom.', key: 'costo_Promedio', width: 30, align: 'right' },
    { title: 'Últ. Compra', key: 'ultima_Compra', width: 30 },
    { title: 'Costo $', key: 'costo_Dolar', width: 15, align: 'right' },
    { title: 'IGV', key: 'tipo_IGV', width: 15 },
    { title: 'Stock Max', key: 'stock_Maximo', width: 15 },
    { title: 'Stock Min', key: 'sock_Minimo', width: 15 },
    { title: 'Últ. Inventario', key: 'ultimo_Inventario', width: 45 },
    { title: 'Tipo Existencia', key: 'tipo_Existencia', width: 15 },
    { title: 'Unitario', key: 'unitario', width: 15 },
    { title: 'Cat. B', key: 'cat_B', width: 15 },
    { title: 'Cat. A', key: 'cat_A', width: 15 },
    { title: 'Personalizado', key: 'personalizado', width: 40 },
    { title: 'Disponible', key: 'disponible', width: 40 },
    { title: 'Estado', key: 'estado', width: 25 }
  ];

  exportToExcel(this.productos, headers, 'reporte-prductos', 'Productos');
}

  abrirDetalle(producto: ProductoReport) {
    this.productoSeleccionado = producto;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.productoSeleccionado = null;
  }
}
