import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cab-totales',
  templateUrl: './cab-totales.component.html',
  styleUrls: ['./cab-totales.component.scss'],
  imports: [CurrencyPipe],
})
export class CabTotalesComponent implements OnInit {
  totalVenta = 0;
  totalNeto = 0;
  totalIgv = 0;
  totalConsumo = 0;
  totalFactura = 0;
  totalBoleta = 0;

  cantFacturas = 0;
  cantBoleta = 0;

  constructor() {}

  ngOnInit(): void {}

  getDataTotales(data: any): void {
    console.log('Datos ===> ', data[0]);

    this.totalVenta = data[0].ventaTotal;
    this.totalNeto = data[0].netoTotal;
    this.totalIgv = data[0].igvTotal;
    this.totalConsumo = data[0].totalRecargoConsumo;
    this.totalFactura = data[0].totalFactura;
    this.totalBoleta = data[0].totalBoleta;
    this.cantFacturas = data[0].facturasEmitidas;
    this.cantBoleta = data[0].boletasEmitidas;
  }
}
