import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomePageComponent } from './home-page/home-page.component';
import { DashboardComponent } from './dashboard.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { GestionVentasPageComponent } from './reportes/gestion-ventas-page/gestion-ventas-page.component';
// import { NgChartsModule } from 'ng2-charts';
import { ChartFormaPagoComponent } from './components/chart-forma-pago/chart-forma-pago.component';
import { ChartVentaCanalComponent } from './components/chart-venta-canal/chart-venta-canal.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CabTotalesComponent } from './components/cab-totales/cab-totales.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { AddPedidoComponent } from './pages/add-pedido/add-pedido.component';
import { ModalStockComponent } from './components/modal-stock/modal-stock.component';
import { ModalAddItemComponent } from './components/modal-add-item/modal-add-item.component';
import { ChartProdVendidoComponent } from './components/chart-prod-vendido/chart-prod-vendido.component';
import { ChartProdSubgrupoComponent } from './components/chart-prod-subgrupo/chart-prod-subgrupo.component';
import { ChartProdVentImporteComponent } from './components/chart-prod-vent-importe/chart-prod-vent-importe.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    // NgChartsModule
    NgApexchartsModule,
  ],
})
export class DashboardModule {}
