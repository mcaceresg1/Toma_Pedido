import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexPlotOptions,
  ApexTitleSubtitle,
  ApexYAxis,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';

type ApexXAxis = {
  type?: 'category' | 'datetime' | 'numeric';
  categories?: any;
  labels?: {
    style?: {
      colors?: string | string[];
      fontSize?: string;
    };
  };
};

@Component({
  selector: 'app-chart-prod-vendido',
  templateUrl: './chart-prod-vendido.component.html',
  styleUrls: ['./chart-prod-vendido.component.scss'],
  imports: [NgApexchartsModule, CommonModule],
})
export class ChartProdVendidoComponent implements OnInit {
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
      text: 'Ventas por producto [Por Cantidad]',
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

    console.log('DataChart ventasXProducto ====> ', data);

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
      name: 'Cantidad',
      data: dataSeries,
    });
  }

  cleandata(): void {
    //this.chartLabels = [];
    this.xaxis = {};
    this.series = [];
  }
}
