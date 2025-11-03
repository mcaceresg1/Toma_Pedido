import { formatCurrency } from '@angular/common';
import {
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexTooltip,
} from './../../../../../../node_modules/ng-apexcharts/lib/model/apex-types.d';
import { Component, OnInit } from '@angular/core';

import {
  ApexNonAxisChartSeries,
  ApexChart,
  NgApexchartsModule,
} from 'ng-apexcharts';

@Component({
  selector: 'app-chart-venta-canal',
  templateUrl: './chart-venta-canal.component.html',
  styleUrls: ['./chart-venta-canal.component.scss'],
  imports: [NgApexchartsModule],
})
export class ChartVentaCanalComponent implements OnInit {
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
      text: 'Ventas por canal',
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
              fontSize: '20px',
              fontWeight: 600,
              showAlways: true,
              show: true,
              formatter: function (args) {
                console.log('args ser => ', args.config.series);

                var total = 0;
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

    console.log('DataChart1 ====> ', data);

    for (let i = 0; i < data.length; i++) {
      this.chartLabels.push(data[i].desCanal);
      this.chartSeries.push(data[i].total);
    }
  }

  cleandata(): void {
    this.chartLabels = [];
    this.chartSeries = [];
  }
}
