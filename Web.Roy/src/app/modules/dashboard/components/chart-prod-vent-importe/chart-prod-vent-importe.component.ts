import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

@Component({
  selector: 'app-chart-prod-vent-importe',
  templateUrl: './chart-prod-vent-importe.component.html',
  styleUrls: ['./chart-prod-vent-importe.component.scss'],
  imports: [NgApexchartsModule],
})
export class ChartProdVentImporteComponent implements OnInit {
  chartTitle?: ApexTitleSubtitle;
  chart?: ApexChart;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  yaxis?: ApexYAxis;
  grid?: ApexGrid;
  legend?: ApexLegend;
  // colors?: string[];

  series?: ApexAxisChartSeries = [];
  xaxis?: ApexXAxis = {};

  constructor() {}

  ngOnInit(): void {
    this.cleandata();
    this.initializeChartOption();
  }

  initializeChartOption(): void {
    this.chartTitle = {
      text: 'Ventas por producto [Por Importe]',
      align: 'left',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
      },
    };

    this.chart = {
      height: 400,
      type: 'bar',
      events: {
        click: function (chart, w, e) {
          // console.log(chart, w, e)
        },
      },
    };

    this.plotOptions = {
      bar: {
        columnWidth: '45%',
        distributed: true,
      },
    };

    this.dataLabels = {
      enabled: false,
    };

    this.legend = {
      show: false,
    };

    this.grid = {
      show: false,
    };
  }

  SetDataChart(data: any): void {
    this.cleandata();
    this.initializeChartOption();

    // console.log('DataChart ventasXProductoImporte ====> ', data)

    let category = [];
    let dataSeries = [];

    for (let i = 0; i < data.length; i++) {
      category.push(data[i].desProducto);
      dataSeries.push(data[i].total);
    }

    this.xaxis = {
      categories: category,
    };
    this.series?.push({
      name: 'Importe',
      data: dataSeries,
    });
  }

  cleandata(): void {
    //this.chartLabels = [];
    this.xaxis = {};
    this.series = [];
  }
}
