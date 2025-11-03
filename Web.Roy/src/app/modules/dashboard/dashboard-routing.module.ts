import { DashboardComponent } from './dashboard.component';
import { HomePageComponent } from './home-page/home-page.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionVentasPageComponent } from './reportes/gestion-ventas-page/gestion-ventas-page.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { AddPedidoComponent } from './pages/add-pedido/add-pedido.component';
import { DetallePedidoComponent } from './pages/detalle-pedido/detalle-pedido.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { AddClienteComponent } from './pages/add-cliente/add-cliente.component';
import { ImprimirPedidoComponent } from './pages/imprimir-pedido/imprimir-pedido.component';
import { UpdatePedidoComponent } from './pages/update-pedido/update-pedido.component';
import { ReporteProveedorComponent } from './pages/reporte-proveedor/reporte-proveedor.component';
import { ReporteProductosComponent } from './pages/reporte-productos/reporte-productos.component';
import { OrdenPedidoComponent } from './pages/orden-pedido/orden-pedido.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'home', component: HomePageComponent },
      { path: 'reportes/gestionVentas', component: GestionVentasPageComponent },
      { path: 'pages/ventas', component: VentasComponent },
      { path: 'pages/addpedido', component: AddPedidoComponent },
      { path: 'pages/addcliente', component: AddClienteComponent },
      { path: 'pages/reporteProductos', component: ReporteProductosComponent },
      { path: 'pages/reporteProveedor', component: ReporteProveedorComponent },
      { path: 'pages/ordenPedidos', component: OrdenPedidoComponent },
      {
        path: 'pages/ventas/:numPedido',
        component: DetallePedidoComponent,
      },
      {
        path: 'pages/ventas/:numPedido/print',
        component: ImprimirPedidoComponent,
      },
      {
        path: 'pages/ventas/:numPedido/update',
        component: UpdatePedidoComponent,
      },
      {
        path: 'pages/clientes',
        component: ClientesComponent,
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: '**', redirectTo: 'home' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
