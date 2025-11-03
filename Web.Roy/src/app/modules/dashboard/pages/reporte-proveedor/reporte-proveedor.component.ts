import { Component, OnInit } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DecimalPipe,
  DatePipe,
  NgFor,
  AsyncPipe,
  NgClass,
} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReportesService } from '../../services/reportes.service';
import { ProveedorReport } from '../../../../../models/ProveedorReport';
import {
  filterAndSortPaginated,
  PaginatedResult,
} from '../../../../shared/util/array-utils';
import { exportToPDF, HeaderConfig } from '../../../../shared/util/exportarPDF';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { exportToExcel } from '../../../../shared/util/exportarExcel';

@Component({
  selector: 'app-reporte-proveedor',
  standalone: true,
  templateUrl: './reporte-proveedor.component.html',
  styleUrls: ['./reporte-proveedor.component.scss'],
  imports: [
    CommonModule,
    NgFor,
    AsyncPipe,
    CurrencyPipe,
    DecimalPipe,
    DatePipe,
    FormsModule,
    NgxPaginationModule,
    FormsModule,
    NgClass,
    CommonModule,
    MatToolbarModule,
    MatMenuModule,
  ],
})
export class ReporteProveedorComponent implements OnInit {
  proveedores: ProveedorReport[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 50;

  order: keyof ProveedorReport = 'razonSocial';
  reverse: boolean = false;
  page = 1;
  proveedorSeleccionado: ProveedorReport | null = null;
  modalAbierto: boolean = false;

  constructor(private reporteService: ReportesService) {}

  ngOnInit(): void {
    this.reporteService.getProveedorReporte().subscribe({
      next: (data) => {
        this.proveedores = data;
      },
      error: (err) => {
        console.error('Error al cargar proveedores', err);
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

  toggleOrder(column: keyof ProveedorReport) {
    if (this.order === column) {
      this.reverse = !this.reverse;
    } else {
      this.order = column;
      this.reverse = false;
    }
    this.page = 1;
  }

  get paginatedItems(): PaginatedResult<ProveedorReport> {
    return filterAndSortPaginated(
      this.proveedores,
      this.searchTerm,
      ['ruc','razonSocial'],
      this.order,
      this.reverse,
      this.page,
      this.itemsPerPage
    );
  }

  exportProveedoresToPDF() {
    const headers: HeaderConfig[] = [
      { title: 'Tipo Doc', key: 'tipo_Doc', width: 20 },
      { title: 'RUC', key: 'ruc', width: 28 },
      { title: 'Razón Social', key: 'razonSocial', width: 50 },
      { title: 'Dirección Fiscal', key: 'direccionFiscal', width: 100 },
      { title: 'Teléfono', key: 'telefono', width: 25 },
      { title: 'Rama Gremio', key: 'ramaGremio', width: 25 },
      { title: 'Tipo Gasto', key: 'tipoGasto', width: 35 },
      { title: 'Ubigeo', key: 'ubigeo', width: 35 },
      { title: 'Correo', key: 'correo', width: 30 },
      { title: 'Persona Contacto', key: 'personaContacto', width: 35 },
      { title: 'Vendedor', key: 'vendedor', width: 40 },
      { title: 'Días Crédito', key: 'dias_Credito', width: 20},
      { title: 'Límite Crédito', key: 'limite_Credito', width: 30},
      { title: 'Notas Adicionales', key: 'notasAdicionales', width: 30 },
      { title: 'Clase Auxiliar', key: 'claseAuxiliar', width: 42 },
      { title: 'Grupo Auxiliar', key: 'grupoAuxiliar', width: 30 },
      { title: 'Centro Costo', key: 'centroCosto', width: 25 },
      { title: 'Página Web', key: 'paginaWeb', width: 25 },
      { title: 'Precio Venta', key: 'precioVenta', width: 18, align: 'right' },
      { title: 'Fecha Ingreso', key: 'fechaIngreso', width: 30 },
      { title: 'Condición', key: 'condicion', width: 30 },
      { title: 'Banco', key: 'banco', width: 20 },
      { title: 'Cuenta', key: 'cuenta', width: 40 },
      { title: 'Titular Cuenta', key: 'titularCuenta', width: 30 },
      { title: 'Estado', key: 'estado', width: 25 },
    ];

    const fileName = 'reporte-proveedores.pdf';
    const titleReporte = 'Reporte de Proveedores';
    exportToPDF(this.proveedores, headers, fileName, titleReporte);
  }

  exportarProveedoresExcel() {
  const headers: HeaderConfig[] = [
      { title: 'Tipo Doc', key: 'tipo_Doc', width: 20 },
      { title: 'RUC', key: 'ruc', width: 28 },
      { title: 'Razón Social', key: 'razonSocial', width: 50 },
      { title: 'Dirección Fiscal', key: 'direccionFiscal', width: 100 },
      { title: 'Teléfono', key: 'telefono', width: 25 },
      { title: 'Rama Gremio', key: 'ramaGremio', width: 25 },
      { title: 'Tipo Gasto', key: 'tipoGasto', width: 35 },
      { title: 'Ubigeo', key: 'ubigeo', width: 35 },
      { title: 'Correo', key: 'correo', width: 30 },
      { title: 'Persona Contacto', key: 'personaContacto', width: 35 },
      { title: 'Vendedor', key: 'vendedor', width: 40 },
      { title: 'Días Crédito', key: 'dias_Credito', width: 20},
      { title: 'Límite Crédito', key: 'limite_Credito', width: 30},
      { title: 'Notas Adicionales', key: 'notasAdicionales', width: 30 },
      { title: 'Clase Auxiliar', key: 'claseAuxiliar', width: 42 },
      { title: 'Grupo Auxiliar', key: 'grupoAuxiliar', width: 30 },
      { title: 'Centro Costo', key: 'centroCosto', width: 25 },
      { title: 'Página Web', key: 'paginaWeb', width: 25 },
      { title: 'Precio Venta', key: 'precioVenta', width: 18},
      { title: 'Fecha Ingreso', key: 'fechaIngreso', width: 30 },
      { title: 'Condición', key: 'condicion', width: 30 },
      { title: 'Banco', key: 'banco', width: 20 },
      { title: 'Cuenta', key: 'cuenta', width: 40 },
      { title: 'Titular Cuenta', key: 'titularCuenta', width: 30 },
      { title: 'Estado', key: 'estado', width: 25 },
  ];

  exportToExcel(this.proveedores, headers, 'reporte-proveedores', 'Proveedores');
}

  abrirDetalle(proveedor: ProveedorReport) {
    this.proveedorSeleccionado = proveedor;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.proveedorSeleccionado = null;
  }
}
