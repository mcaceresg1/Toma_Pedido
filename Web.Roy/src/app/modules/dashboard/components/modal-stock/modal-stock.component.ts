import { Component, inject, OnInit, signal } from '@angular/core';
import { VentasService } from '../../services/ventas.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import {
  ModalStockData,
  StockProducto,
  StockProductoReserva,
} from '../../../../../models/Producto';
import { MatCardModule } from '@angular/material/card';
import { isNil } from 'lodash';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-modal-stock',
  templateUrl: './modal-stock.component.html',
  styleUrls: ['./modal-stock.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
  ],
})
export class ModalStockComponent implements OnInit {
  formStock: FormGroup = new FormGroup({
    producto: new FormControl(''),
  });
  readonly dialogRef = inject(MatDialogRef<ModalStockComponent>);
  listProductos = signal<Array<StockProducto>>([]);
  productCounter = signal<Map<string, number>>(new Map());
  serviceProductCounter = signal<Map<string, number>>(new Map());
  listStockLocal = signal<Array<StockProductoReserva>>([]);
  puedeCambiarPrecio = signal<boolean>(false);

  /* ========== paginacion ======== */
  page: number = 1;
  pageSize: number = 10;
  currentPage!: number;
  numberOfPages!: number;
  totalRecords: number = 0;
  previousPage!: number;
  pageSizes = [10, 20, 50, 100];
  paginatorIndex: number = 0;
  readonly data = inject<ModalStockData>(MAT_DIALOG_DATA);
  private _snackbar = inject(MatSnackBar);

  constructor(
    private pedidos: VentasService,
    private spinner: NgxSpinnerService,
    private userService: UserService
  ) {
    this.serviceProductCounter.set(pedidos.reservas());
  }

  ngOnInit(): void {
    this.fnIniciaCarga();
    this.getUser();
  }

  fnIniciaCarga(): void {
    this.GetAllStock();
  }
  cargarInput(): void {
    const searchTerm = this.formStock.value.producto || '';
    if (searchTerm.length > 2) {
      this.page = 1;
      this.GetAllStock();
    }
    if (searchTerm.length == 0) {
      this.page = 1;
      this.GetAllStock();
    }
  }

  filtrar(): void {
    this.page = 1;
    this.GetAllStock();
  }

  GetAllStock(): void {
    this.spinner.show();
    this.pedidos
      .getAllStock(
        {
          producto: this.formStock.value.producto || '',
          clases: '3,25',
          codAlmacen: 7,
        },
        this.data.rucCliente,
        this.page,
        this.pageSize
      )
      .subscribe({
        next: (resp) => {
          this.spinner.hide();
          if (resp.length > 0) {
            this.listProductos.set(resp);
            this.listStockLocal.set(
              resp.map((it) => {
                const localCount =
                  this.productCounter().get(it.codProducto) || 0;
                const inListCount =
                  this.serviceProductCounter().get(it.codProducto) || 0;
                return {
                  ...it,
                  reservando_local: localCount,
                  disponible:
                    it.stock + it.reservado - localCount - inListCount,
                  precio: (it as any)[`precio${this.data.listaPrecio}`],
                  enLista: inListCount,
                };
              })
            );

            this.totalRecords = resp[0].totalReg;
            this.currentPage = this.page;
            this.paginatorIndex = this.page - 1;
            this.pageSize = this.pageSize;
          } else {
            this.listProductos.set([]);
            this.listStockLocal.set([]);
            this.paginatorIndex = 0;
            this.totalRecords = 0;
            this.currentPage = this.page;
            this.pageSize = this.pageSize;
          }
        },
        error: () => {
          this.spinner.hide();
          this._snackbar.open(
            'Ocurrió un error al obtener los productos.',
            'OK',
            {
              duration: 3000,
            }
          );
        },
      });
  }

  agregarProducto(producto: StockProductoReserva, cantidad: number) {
    if (producto.precio <= 0 || cantidad <= 0) {
      Swal.fire({
        title: 'Atención!',
        text: 'El precio y la cantidad deben ser diferentes a 0.',
        icon: 'warning',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
      return;
    }
    const currentMap = this.pedidos.reservas();
    currentMap.set(
      producto.codProducto,
      (currentMap.get(producto.codProducto) || 0) + cantidad
    );
    this.pedidos.reservas.set(currentMap);
    this.serviceProductCounter.set(this.pedidos.reservas());
    this.cambiarCantidad(producto, 0, {
      target: {
        value: 0,
      },
    } as any);
    this.data.agregarProducto(producto, cantidad);
  }

  cambiarPrecio(item: StockProductoReserva, e: any) {
    this.listStockLocal.set(
      this.listStockLocal().map((it) => {
        if (it.codProducto === item.codProducto) {
          it.precio = Number.parseFloat(e.target.value);
        }
        return it;
      })
    );
  }

  cambiarCantidad(
    producto: StockProducto | null,
    cantidad: number,
    event?: Event
  ) {
    console.log(producto);
    if (!!producto) {
      const currentMap = this.productCounter();
      const realAmount = !isNil(event)
        ? Number.parseInt((event?.target as any)?.value)
        : (currentMap.get(producto.codProducto) || 0) + cantidad;

      currentMap.set(producto.codProducto, realAmount);
      this.productCounter.set(currentMap);
    }

    this.listStockLocal.set(
      this.listStockLocal().map((it) => {
        const localCount = this.productCounter().get(it.codProducto) || 0;
        const inListCount =
          this.serviceProductCounter().get(it.codProducto) || 0;
        let x = 1,
          p = 1;
        let item = it as any;
        for (let i = 1; i < 6; i++) {
          const correlacion = item['correlacion' + i];
          const nextCorrelacion = item['correlacion' + (i + 1)];
          if (!!nextCorrelacion) continue;
          if (correlacion === 0) {
            x = Math.max(1, i - 1);
            break;
          } else {
            x = i;
          }
        }
        for (let i = 1; i < x + 1; i++) {
          p = i;
          if (localCount <= 0 && item['correlacion' + i] > 0) {
            break;
          } else if (
            localCount > (item['correlacion' + (i - 1)] ?? 0) &&
            localCount <= item['correlacion' + i]
          ) {
            break;
          }
        }

        return {
          ...it,
          reservando_local: localCount,
          disponible: it.stock - localCount - inListCount - -it.reservado,
          precio: item['precio' + p],
          enLista: inListCount,
        };
      })
    );
  }

  getUser(): void {
    this.userService.getDataUserLogin().subscribe((resp) => {
      this.puedeCambiarPrecio.set(
        resp.editaPrecio === true || resp.funcionesEspeciales === true
      );
    });
  }

  /* ========== paginacion ======== */

  handlePageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.page = event.pageIndex + 1;
    this.paginatorIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.GetAllStock();
  }
  /* ========== paginacion ======== */

  limpiarForm() {
    this.formStock.patchValue({
      producto: '',
    });
  }
  onNoClick(): void {
    this.listStockLocal.set([]);
    this.listProductos.set([]);
    this.productCounter.set(new Map());
    this.dialogRef.close();
  }
}
