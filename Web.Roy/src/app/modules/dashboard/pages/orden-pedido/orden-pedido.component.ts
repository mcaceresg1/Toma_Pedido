import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule, DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
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
      // Primero ordenar por VENDEDOR
      const vendedorA = (a.vendedor || '').toUpperCase();
      const vendedorB = (b.vendedor || '').toUpperCase();
      
      if (vendedorA < vendedorB) return -1;
      if (vendedorA > vendedorB) return 1;
      
      // Si los vendedores son iguales, ordenar por ZONA
      const zonaA = (a.zona || '').toUpperCase();
      const zonaB = (b.zona || '').toUpperCase();
      
      if (zonaA < zonaB) return -1;
      if (zonaA > zonaB) return 1;
      
      return 0;
    });
  }
  
}

