import { Component, inject, OnInit, signal } from '@angular/core';
import { VentasService } from '../../services/ventas.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  MatDatepickerModule,
  MatDatepickerInputEvent,
} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FiltroPedidos } from '../../../../../models/Filtro';
import { dateToString } from '../../../../core/utils/date';
import { Pedido } from '../../../../../models/Pedido';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  providers: [provideNativeDateAdapter()],
})
export class VentasComponent implements OnInit {
  searchTimeout: any = null;
  formBuscar: FormGroup = new FormGroup({});
  typeFilter: string | null = null;
  inputBuscar: string = '';
  searchSpinnerHidden = signal(true);
  /* ========== paginacion ======== */
  allPedidosList: Pedido[] = [];
  currentPage!: number;
  page: number = 1;
  pageSize: number = 10;
  paginatorIndex: number = 0;
  numberOfPages!: number;
  totalRecords: number = 0;
  previousPage!: number;
  pageSizes = [10, 20, 50, 100];
  private _snackBar = inject(MatSnackBar);

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  /* ========== paginacion ======== */

  constructor(
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private pedidos: VentasService,
    private router: Router
  ) {
    this.createFormBuscar();
  }

  ngOnInit(): void {
    this.getAllPedidos();
  }

  onCardClicked(pedido: any) {
    this.router.navigate([`/dashboard/pages/ventas/${pedido.numPedido}`]);
  }

  createFormBuscar(): void {
    this.formBuscar = this.formBuilder.group({
      inputBuscar: [''],
      range: {
        start: null,
        end: null,
      },
      typeFilter: null,
    });
  }

  cargarInput(event: any): void {
    event.stopPropagation();
    this.inputBuscar = this.formBuscar.controls['inputBuscar'].value;
    if (
      (event.inputType === 'insertText' ||
        event.inputType === 'deleteContentBackward') &&
      this.inputBuscar.length > 0
    ) {
      if (!!this.searchTimeout) {
        clearTimeout(this.searchTimeout);
        this.searchSpinnerHidden.set(false);
      }
      if (this.inputBuscar.length == 0) {
        this.page = 1;
        this.getAllPedidos();
      } else {
        this.searchTimeout = setTimeout(() => {
          this.searchSpinnerHidden.set(true);
          this.getAllPedidos();
        }, 2000);
      }
    } else if (event.type === 'input') {
      this.searchSpinnerHidden.set(true);
      this.page = 1;
      this.getAllPedidos();
    }
  }

  filtrarPorRango(event: MatDatepickerInputEvent<any>) {
    this.getAllPedidos();
  }

  filtrarPorEstado() {
    this.getAllPedidos();
  }

  getAllPedidos(): void {
    let filtros: FiltroPedidos = {
      busqueda: this.inputBuscar,
    };

    if (!!this.range.value.start && !!this.range.value.end) {
      const start = this.range.value.start;
      const fStart = dateToString(start);
      filtros.fechaInicio = fStart;
      const end = this.range.value.end;
      const fEnd = dateToString(end);
      filtros.fechaFinal = fEnd;
    }
    this.spinner.show();
    filtros.estado = this.typeFilter ?? undefined;
    this.pedidos.getAllPedidos(filtros, this.page, this.pageSize).subscribe({
      next: (resp) => {
        this.spinner.hide();
        if (resp.length > 0) {
          this.allPedidosList = resp;
          this.totalRecords = resp[0].totalReg;
          this.currentPage = this.page;
          this.paginatorIndex = this.page - 1;
          this.pageSize = this.pageSize;
        } else {
          this.allPedidosList = [];
          this.totalRecords = 0;
          this.currentPage = this.page;
          this.paginatorIndex = 0;
          this.pageSize = this.pageSize;
        }
      },
      error: (err) => {
        this.spinner.hide();
        this._snackBar.open('Ocurrió un error al cargar las ventas.', 'OK', {
          duration: 3000,
        });
      },
    });
  }

  /* ========== paginacion ======== */
  handlePageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.page = event.pageIndex + 1;
    this.paginatorIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAllPedidos();
  }

  /* ========== paginacion ======== */
}
