import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { VentasService } from '../../services/ventas.service';
import { ModalStockComponent } from '../../components/modal-stock/modal-stock.component';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule, Location } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { isNil } from 'lodash';
import {
  ModalStockData,
  ProductoAgregado,
  ProductoNuevoPedido,
  StockProductoReserva,
} from '../../../../../models/Producto';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActualizarPedido,
  Pedido,
  ProductoPedido,
} from '../../../../../models/Pedido';

@Component({
  selector: 'app-update-pedido',
  templateUrl: './update-pedido.component.html',
  styleUrls: ['./update-pedido.component.scss'],
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgSelectModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    NgxSpinnerModule,
  ],
})
export class UpdatePedidoComponent implements OnInit, OnDestroy {
  private _snackBar = inject(MatSnackBar);
  listProductosAgregados: ProductoAgregado[] = [];

  formPedido: FormGroup = new FormGroup<{
    observaciones?: FormControl<string | null>;
    oc?: FormControl<string | null>;
  }>({
    observaciones: new FormControl(),
    oc: new FormControl(),
  });
  readonly stockDialog = inject(MatDialog);
  total: number = 0;
  numPedido: string = '';
  pedido?: Pedido;
  productos?: ProductoPedido[] = [];
  moneda = signal<string>('');

  constructor(
    private spinner: NgxSpinnerService,
    private pedidos: VentasService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.numPedido = this.route.snapshot.paramMap.get('numPedido')!;
  }

  ngOnInit(): void {
    this.getPedido(this.numPedido);
    this.getPedidoProductos(this.numPedido);
  }

  getPedido(numPedido: string): void {
    this.spinner.show('pedido');
    this.pedidos.getPedido(numPedido).subscribe({
      next: (resp) => {
        this.pedido = resp;
        this.moneda.set(this.pedido.moneda);
        this.formPedido.patchValue({
          observaciones: this.pedido.observaciones,
          oc: this.pedido.ordenCompra,
        });
        this.spinner.hide('pedido');
      },
      error: () => {
        this.spinner.hide('pedido');
        Swal.fire({
          title: 'Error al cargar el pedido.',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  getPedidoProductos(numPedido: string): void {
    this.spinner.show('productos');
    this.pedidos.getPedidoProductos(numPedido).subscribe({
      next: (resp) => {
        this.productos = resp;
        console.log('Productos: ', resp);
        for (let producto of resp) {
          const igv = producto.monto - producto.monto * 0.18;
          const nuevoItem: ProductoAgregado = {
            codProducto: producto.codProducto,
            descProducto: producto.descripcion,
            precio: igv,
            cantidad: producto.cantidad,
            importe: producto.monto,
            igv: producto.monto - igv,
            almacen: producto.codAlmacen,
          };
          this.agregarElemento(nuevoItem, true);
          this.total = this.calcularTotal();
        }
        this.spinner.hide('productos');
      },
      error: () => {
        Swal.fire({
          title: 'Error al cargar los productos.',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
        this.spinner.hide('productos');
      },
    });
  }

  ngOnDestroy(): void {
    this.pedidos.reservas.set(new Map());
  }

  calcularTotal(): number {
    return this.listProductosAgregados.reduce(
      (total, item) => total + item.importe,
      0
    );
  }
  calcularIgv(): number {
    return this.listProductosAgregados.reduce(
      (total, item) => total + item.igv,
      0
    );
  }
  calcularSubtotal(): number {
    return this.calcularTotal() - this.calcularIgv();
  }

  deleteItem(codProd: string): void {
    Swal.fire({
      title: '¿Quitar producto de la lista?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#17a2b8',
      cancelButtonColor: '#343a40',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        if (!isNil(codProd)) {
          const index = this.listProductosAgregados.findIndex(
            (item) => item.codProducto === codProd
          );

          if (index !== -1) {
            this.listProductosAgregados.splice(index, 1);
          }
          this.total = this.calcularTotal();
          const reservas = this.pedidos.reservas();
          reservas.delete(codProd);
          this.pedidos.reservas.set(reservas);
        }
      }
    });
  }

  openStockDialog(): void {
    this.stockDialog.open<any, ModalStockData>(ModalStockComponent, {
      minWidth: '80vw',
      data: {
        listaPrecio: '1',
        rucCliente: this.pedido!.rucCliente,
        agregarProducto: this.agregarProducto.bind(this),
      },
    });
  }

  openAddItemDialog(): void {
    this.openStockDialog();
  }

  agregarProducto(
    producto: StockProductoReserva,
    cantidad: number,
    silent: boolean = false
  ) {
    const importe =
      Number(producto.precio * cantidad) *
      (1 + (!producto.usaImpuesto ? producto.impuesto / 100 : 0));
    const nuevoItem: ProductoAgregado = {
      codProducto: producto.codProducto,
      descProducto: producto.nombProducto,
      precio: importe - (producto.impuesto / 100) * importe,
      cantidad: cantidad,
      importe,
      igv: (producto.impuesto / 100) * importe,
      almacen: producto.almacen,
    };
    this.agregarElemento(nuevoItem, silent);
    this.total = this.calcularTotal();
  }

  async agregarElemento(nuevoItem: ProductoAgregado, silent: boolean = false) {
    const elementoExistente = this.listProductosAgregados.find(
      (item) => item.codProducto == nuevoItem.codProducto
    );
    if (elementoExistente) {
      elementoExistente.cantidad += nuevoItem.cantidad;
      elementoExistente.importe += nuevoItem.importe;
    } else {
      this.listProductosAgregados.push(nuevoItem);
    }

    if (!silent) {
      Swal.fire({
        title: 'Atención!',
        text: 'Producto agregado a la lista',
        icon: 'warning',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
    }
  }

  /**Accion */
  cancelarPedido(): void {
    Swal.fire({
      title: '¿Cancelar edición de pedido?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#17a2b8',
      cancelButtonColor: '#343a40',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.limpiarDatosPedido();
        this.goBack();
      }
    });
  }

  registrarPedido(): void {
    if (this.listProductosAgregados.length == 0) {
      Swal.fire({
        title: 'Hola!',
        text: 'Debe agregar productos al pedido.',
        icon: 'warning',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
    } else {
      this.savePedido();
    }
  }

  savePedido(): void {
    this.spinner.show();

    const productos: ProductoNuevoPedido[] = this.listProductosAgregados.map(
      (item, index) => {
        return {
          codProd: item.codProducto,
          cantProd: item.cantidad,
          preUnit: item.precio / item.cantidad, // precio unitario sin igv
          igv: item.igv,
          preTot: item.precio, // precio total sin igv
          numSec: index + 1,
          impUnit: item.importe / item.cantidad, // precio unitario con Igv
          impTot: item.importe, // precio total con Igv
          almacen: item.almacen,
          descripcion: item.descProducto,
        };
      }
    );

    const data: ActualizarPedido = {
      subtotal: parseFloat(this.calcularSubtotal().toFixed(9)),
      igv: parseFloat(this.calcularIgv().toFixed(9)),
      total: parseFloat(this.calcularTotal().toFixed(9)),
      productos,
      observaciones: this.formPedido.get('observaciones')?.value,
      oc: this.formPedido.get('oc')?.value,
    };

    this.pedidos.updatePedido(this.numPedido, data).subscribe({
      next: (resp) => {
        if (resp.ok) {
          setTimeout(() => {
            this.spinner.hide();
            Swal.fire({
              title: 'Pedido actualizado exitosamente.',
              icon: 'success',
              showCancelButton: false,
              confirmButtonColor: '#17a2b8',
              cancelButtonColor: '#343a40',
              confirmButtonText: 'Confirmar',
              cancelButtonText: 'Cancelar',
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                this.limpiarDatosPedido();
                this.goBack();
              }
            });
          }, 2000);
        } else {
          this.spinner.hide();
          Swal.fire({
            title: 'Error al registrar el pedido.',
            icon: 'error',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
          });
        }
      },
      error: (err) => {
        this.spinner.hide();
        this._snackBar.open('Ocurrió un error al guardar el pedido...', 'OK', {
          duration: 3000,
        });
      },
    });
  }

  limpiarDatosPedido(): void {
    this.listProductosAgregados = [];
  }

  goBack() {
    this.router.navigate([`/dashboard/pages/ventas/${this.numPedido}`]);
  }
}
