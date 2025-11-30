import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { CommonModule, DatePipe } from '@angular/common';
import { GestionVentasService } from '../../services/gestion-ventas.service';
import { CabTotalesComponent } from '../../components/cab-totales/cab-totales.component';
import { ChartVentaCanalComponent } from '../../components/chart-venta-canal/chart-venta-canal.component';
import { ChartFormaPagoComponent } from '../../components/chart-forma-pago/chart-forma-pago.component';
import { ChartProdVendidoComponent } from '../../components/chart-prod-vendido/chart-prod-vendido.component';
import { ChartProdVentImporteComponent } from '../../components/chart-prod-vent-importe/chart-prod-vent-importe.component';
import { ChartProdSubgrupoComponent } from '../../components/chart-prod-subgrupo/chart-prod-subgrupo.component';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  NgSelectModule,
} from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-ventas-page',
  templateUrl: './gestion-ventas-page.component.html',
  styleUrls: ['./gestion-ventas-page.component.scss'],
  imports: [
    NgSelectModule,
    FormsModule,
    CommonModule,
    CabTotalesComponent,
    ChartVentaCanalComponent,
    ChartFormaPagoComponent,
    ChartProdVendidoComponent,
    ChartProdVentImporteComponent,
    ChartProdSubgrupoComponent,
  ],
  providers: [DatePipe],
})
export class GestionVentasPageComponent implements OnInit {
  @ViewChild(CabTotalesComponent) compTotales!: CabTotalesComponent;
  @ViewChild(ChartVentaCanalComponent)
  chartVentasCanal!: ChartVentaCanalComponent;
  @ViewChild(ChartFormaPagoComponent)
  chartVentasTipoPago!: ChartFormaPagoComponent;

  @ViewChild(ChartProdVendidoComponent)
  chartVentasxProducto!: ChartProdVendidoComponent;
  @ViewChild(ChartProdVentImporteComponent)
  chartVentasxProductoImporte!: ChartProdVentImporteComponent;
  @ViewChild(ChartProdSubgrupoComponent)
  chartVentasxProductoSubgrupo!: ChartProdSubgrupoComponent;

  startDate: string | null = null;
  endDate: string | null = null;

  ListLocal: any = [];
  selectedLocal?: string;

  //Datos recepcionados
  TotalesReport: any = [];

  constructor(
    private datePipe: DatePipe,
    private spinner: NgxSpinnerService,
    private _shared: SharedService,
    private _gestionVentas: GestionVentasService
  ) {
    const today = new Date();

    // Primer día del mes actual
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Formateo de fechas y asignacion de valores por defecto
    this.startDate = this.datePipe.transform(firstDayOfMonth, 'yyyy-MM-dd');
    this.endDate = this.datePipe.transform(today, 'yyyy-MM-dd');
  }

  ngOnInit(): void {
    this.spinner.show();
    this.GetAllLocales();

    setTimeout(() => {
      this.spinner.hide();
      this.onfilterSelected();
    }, 1000);
  }

  onfilterSelected() {
    console.log('Local Selected => ', this.selectedLocal);
    this.GetReportGestionVentas();
  }

  GetAllLocales(): void {
    this._shared.getAllLocales().subscribe((resp) => {
      console.log('List Locales =>', resp);
      this.ListLocal = resp;

      this.selectedLocal = this.ListLocal[0].codLocal;
    });
  }

  GetReportGestionVentas(): void {
    const filter = {
      codLocal: this.selectedLocal,
      fechaDesde: this.startDate,
      fechaHasta: this.endDate,
    };

    console.log('filter selected =>', filter);

    this._gestionVentas.getReportGestionVentas(filter).subscribe((resp) => {
      console.log('Totales =>', resp.totales);
      console.log('ventasCanal =>', resp.ventTipoPago);
      console.log('ventasTipoPago =>', resp.ventCanal);

      console.log('ventasXProducto =>', resp.ventxProducto);
      console.log('ventasXSubgrupo =>', resp.ventxSubgrupo);

      if (resp.totales.length > 0) {
        this.compTotales.getDataTotales(resp.totales);
      }

      this.chartVentasCanal.SetDataChart(resp.ventCanal);
      this.chartVentasTipoPago.SetDataChart(resp.ventTipoPago);

      this.chartVentasxProducto.SetDataChart(resp.ventxProducto);
      this.chartVentasxProductoImporte.SetDataChart(resp.ventxProductoImporte);
      this.chartVentasxProductoSubgrupo.SetDataChart(resp.ventxSubgrupo);
    });
  }
}
