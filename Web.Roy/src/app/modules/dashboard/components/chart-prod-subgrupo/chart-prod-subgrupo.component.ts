import { Component, OnInit } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexTitleSubtitle,
  ApexXAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

@Component({
  selector: 'app-chart-prod-subgrupo',
  templateUrl: './chart-prod-subgrupo.component.html',
  styleUrls: ['./chart-prod-subgrupo.component.scss'],
  imports: [NgApexchartsModule],
})
export class ChartProdSubgrupoComponent implements OnInit {
  chartTitle?: ApexTitleSubtitle;
  chart?: ApexChart;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;

  series?: ApexAxisChartSeries = [];
  xaxis?: ApexXAxis = {};

  constructor() {}

  ngOnInit(): void {
    this.cleandata();
    this.initializeChartOption();
  }

  initializeChartOption(): void {
    this.chartTitle = {
      text: 'Ventas por subgrupo [Por Importe]',
      align: 'left',
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
      },
    };

    // this.series = [
    //   {
    //     name: "basic",
    //     data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
    //   }
    // ];

    this.chart = {
      type: 'bar',
      height: 400,
    };

    this.plotOptions = {
      bar: {
        horizontal: true,
      },
    };

    this.dataLabels = {
      enabled: false,
    };

    // this.xaxis= {
    //   categories: [
    //     "South Korea",
    //     "Canada",
    //     "United Kingdom",
    //     "Netherlands",
    //     "Italy",
    //     "France",
    //     "Japan",
    //     "United States",
    //     "China",
    //     "Germany"
    //   ]
    // }
  }

  SetDataChart(data: any): void {
    this.cleandata();
    this.initializeChartOption();

    let category = [];
    let dataSeries = [];

    for (let i = 0; i < data.length; i++) {
      category.push(data[i].desSubGrupo);
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
    this.xaxis = {};
    this.series = [];
  }
}
