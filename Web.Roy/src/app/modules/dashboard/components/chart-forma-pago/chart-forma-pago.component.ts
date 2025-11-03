import { formatCurrency } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ApexNonAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexPlotOptions,
  NgApexchartsModule,
} from 'ng-apexcharts';

@Component({
  selector: 'app-chart-forma-pago',
  templateUrl: './chart-forma-pago.component.html',
  styleUrls: ['./chart-forma-pago.component.scss'],
  imports: [NgApexchartsModule],
})
export class ChartFormaPagoComponent implements OnInit {
  chartTitle?: ApexTitleSubtitle;
  chartDetails?: ApexChart;
  chartTooltip?: ApexTooltip;
  chartPlotOptions?: ApexPlotOptions;

  chartLabels: string[] = [];
  chartSeries: ApexNonAxisChartSeries = [];

  constructor() {}

  ngOnInit(): void {
    this.cleandata();
    this.initializeChartOption();
  }

  private initializeChartOption(): void {
    this.chartTitle = {
      text: 'Ventas por tipo de pago',
      align: 'left',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
      },
    };

    this.chartDetails = {
      type: 'donut',
      toolbar: {
        show: true,
      },
      height: '400', //tamaño
      redrawOnParentResize: true,
    };

    this.chartTooltip = {
      enabled: true,
      enabledOnSeries: undefined,
      shared: true,
      followCursor: false,
      intersect: false,
      inverseOrder: false,
      custom: undefined,
      fillSeriesColor: false,
      style: {
        fontSize: '12px',
        fontFamily: undefined,
      },
      onDatasetHover: {
        highlightDataSeries: false,
      },
      marker: {
        show: true,
      },
      fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
      },
    };

    this.chartPlotOptions = {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              label: 'Total',
              fontSize: '18px',
              fontWeight: 600,
              showAlways: true,
              show: true,
              formatter: function (args) {
                // console.log('args ser => ', args.config.series)

                let total = 0;
                args.config.series.forEach((element: any) => {
                  total += element;
                });

                let totalRedondeado = formatCurrency(total, 'es-PE', 'S/');
                return totalRedondeado;
              },
            },
          },
        },
      },
    };
  }

  SetDataChart(data: any): void {
    this.cleandata();
    this.initializeChartOption();

    console.log('DataChart2 ====> ', data);

    for (let i = 0; i < data.length; i++) {
      this.chartLabels.push(data[i].desTipoPago);
      this.chartSeries.push(data[i].total);
    }
  }

  cleandata(): void {
    this.chartLabels = [];
    this.chartSeries = [];
  }
}
