import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { VentasService } from '../../services/ventas.service';
import { HistoricoPedidoCabecera, HistoricoPedidoDetalle } from '../../../../../models/Pedido';
import { Vendedor } from '../../../../../models/Vendedor';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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

  ordenes: HistoricoPedidoCabecera[] = [];
  ordenSeleccionada: HistoricoPedidoCabecera | null = null;
  detalleOrden: HistoricoPedidoDetalle[] = [];

  cargando: boolean = false;

  constructor(private ventasService: VentasService) {}

  ngOnInit(): void {
    this.cargarVendedores();
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

    this.ventasService.getHistoricoPedidos(desde, hasta, vendedorId).subscribe({
      next: (data) => {
        this.ordenes = data || [];
        if (this.ordenes.length > 0) {
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
    this.ordenSeleccionada = orden;
    this.detalleOrden = orden.detalles || [];
  }

  limpiarFiltros(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.vendedorSeleccionado = 0;
  
    this.ordenes = [];
    this.detalleOrden = [];
    this.ordenSeleccionada = null;
  }
  
}

