import {
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VentasService } from '../../services/ventas.service';
import { ModalStockComponent } from '../../components/modal-stock/modal-stock.component';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { Cliente } from '../../../../../models/Cliente';
import { DEFAULT_PRECIOS, Moneda } from '../../../../../models/Moneda';
import { filter, first, isEmpty, isNil } from 'lodash';
import {
  ModalStockData,
  ProductoAgregado,
  ProductoNuevoPedido,
  StockProductoReserva,
} from '../../../../../models/Producto';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NuevoPedido } from '../../../../../models/Pedido';

@Component({
  selector: 'app-add-pedido',
  templateUrl: './add-pedido.component.html',
  styleUrls: ['./add-pedido.component.scss'],
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
export class AddPedidoComponent implements OnInit, OnDestroy {
  @ViewChild(AddPedidoComponent) _compAddPedido!: AddPedidoComponent;
  private _snackBar = inject(MatSnackBar);

  formPedido: FormGroup = new FormGroup<{
    cliente?: FormControl<string | null>;
    moneda?: FormControl<string | null>;
    listaPrecios?: FormControl<string>;
    observaciones?: FormControl<string | null>;
    oc?: FormControl<string | null>;
  }>({
    cliente: new FormControl<string>('', [Validators.required]),
    moneda: new FormControl('01', [Validators.required]),
    listaPrecios: new FormControl(),
    observaciones: new FormControl(),
    oc: new FormControl(),
  });
  rucCliente?: string;
  listClientes: Cliente[] = [];
  listMoneda: Moneda[] = [];
  listPreciosVisible = signal(false);
  listPrecios = DEFAULT_PRECIOS;
  readonly stockDialog = inject(MatDialog);
  readonly addProductDialog = inject(MatDialog);
  moneda?: string;
  listProdAgregados: ProductoAgregado[] = [];
  // subtotal: number = 0.00;
  // igv: number = 0.00;
  total: number = this.calcularTotal();

  constructor(
    private pedidos: VentasService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    this.GetSelectMoneda();
    this.loadData('');
    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.pedidos.reservas.set(new Map());
  }

  onClienteChanged() {
    const rucSeleccionado = this.formPedido.get('cliente')?.value;
    const cliente = first(
      filter(this.listClientes, (it) => it.rucCliente === rucSeleccionado)
    );
    this.listPreciosVisible.set(!!cliente && isEmpty(cliente.precio));
  }

  monedaSelected() {
    this.moneda = first(
      filter(
        this.listMoneda.filter((it) => it.id == this.formPedido.value.moneda)
      )
    )?.value;
  }
  calcularTotal(): number {
    return this.listProdAgregados.reduce(
      (total, item) => total + item.importe,
      0
    );
  }
  calcularIgv(): number {
    return this.listProdAgregados.reduce((total, item) => total + item.igv, 0);
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
          const index = this.listProdAgregados.findIndex(
            (item) => item.codProducto === codProd
          );

          if (index !== -1) {
            this.listProdAgregados.splice(index, 1);
          }
          this.total = this.calcularTotal();
          const reservas = this.pedidos.reservas();
          reservas.delete(codProd);
          this.pedidos.reservas.set(reservas);
        }
      }
    });
  }

  loadData(query: string) {
    this.spinner.show('customers');
    this.pedidos.getSearchClientes(query).subscribe({
      next: (resp) => {
        this.listClientes = resp;
        this.spinner.hide('customers');
      },
      error: () => {
        this.spinner.hide('customers');
        this._snackBar.open('Ocurrió un error al cargar los clientes.', 'OK', {
          duration: 3000,
        });
      },
    });
  }

  onSearch(search: any) {
    const selectedValue = search.term.toLowerCase();
    this.loadData(selectedValue);
  }

  GetSelectMoneda(): void {
    this.spinner.show('currencies');
    this.pedidos.getMonedas().subscribe({
      next: (resp) => {
        this.spinner.hide('currencies');
        this.listMoneda = resp;
        this.formPedido.patchValue({
          moneda: '01',
        });
        this.monedaSelected();
      },
      error: () => {
        this.spinner.hide('currencies');
        this._snackBar.open('Ocurrió un error al cargar las monedas.', 'OK', {
          duration: 3000,
        });
      },
    });
  }

  get clienteInvalid() {
    return (
      this.formPedido.get('cliente')?.invalid &&
      this.formPedido.get('cliente')?.touched
    );
  }
  get monedaInvalid() {
    return (
      this.formPedido.get('moneda')?.invalid &&
      this.formPedido.get('moneda')?.touched
    );
  }
  get lPreciosInvalid() {
    return (
      this.formPedido.get('listaPrecios')?.invalid &&
      this.formPedido.get('listaPrecios')?.touched
    );
  }

  openStockDialog(): void {
    const rucSeleccionado = this.formPedido.get('cliente')?.value;
    const cliente = first(
      filter(this.listClientes, (it) => it.rucCliente === rucSeleccionado)
    );
    const listaPrecio =
      !!cliente && !!cliente.precio
        ? cliente.precio
        : this.formPedido.value.listaPrecios;
    if (
      isEmpty(listaPrecio) ||
      isNil(listaPrecio) ||
      isNil(rucSeleccionado) ||
      isEmpty(rucSeleccionado)
    ) {
      Swal.fire({
        title: 'Atención!',
        text: 'Debe seleccionar un cliente de la lista.',
        icon: 'warning',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
    } else {
      this.stockDialog.open<any, ModalStockData>(ModalStockComponent, {
        minWidth: '80vw',
        data: {
          listaPrecio,
          rucCliente: rucSeleccionado!,
          agregarProducto: this.agregarProducto.bind(this),
        },
      });
    }
  }

  openAddItemDialog(): void {
    this.openStockDialog();
  }

  agregarProducto(producto: StockProductoReserva, cantidad: number) {
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
    this.agregarElemento(nuevoItem);
    this.total = this.calcularTotal();
  }

  async agregarElemento(nuevoItem: ProductoAgregado) {
    const elementoExistente = this.listProdAgregados.find(
      (item) => item.codProducto === nuevoItem.codProducto
    );

    if (elementoExistente) {
      elementoExistente.cantidad += nuevoItem.cantidad;
      elementoExistente.importe += nuevoItem.importe;
    } else {
      this.listProdAgregados.push(nuevoItem);
    }

    Swal.fire({
      title: 'Atención!',
      text: 'Producto agregado a la lista',
      icon: 'warning',
      confirmButtonColor: '#17a2b8',
      confirmButtonText: 'Ok',
    });
  }

  /**Accion */
  cancelarPedido(): void {
    Swal.fire({
      title: '¿Cancelar pedido?',
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
    if (this.formPedido.invalid) {
      return Object.values(this.formPedido.controls).forEach((control) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach((control) =>
            control.markAsTouched()
          );
        } else {
          control.markAsTouched();
        }
      });
    }

    if (this.listProdAgregados.length == 0) {
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

    // Validar que haya productos
    if (this.listProdAgregados.length === 0) {
      this.spinner.hide();
      Swal.fire({
        title: 'Error de validación',
        text: 'Debe incluir al menos un producto en el pedido.',
        icon: 'error',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
      return;
    }

    // Extraer y limpiar el RUC (solo números, máximo 11 dígitos)
    const rucRaw = this.formPedido.get('cliente')?.value || '';
    const rucLimpio = rucRaw.toString().replace(/\D/g, '').substring(0, 11);

    if (rucLimpio.length !== 11) {
      this.spinner.hide();
      Swal.fire({
        title: 'Error de validación',
        text: 'El RUC debe tener exactamente 11 dígitos.',
        icon: 'error',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
      return;
    }

    const productos: ProductoNuevoPedido[] = this.listProdAgregados.map(
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

    console.log('Productos: ', productos);
    console.log('RUC limpio: ', rucLimpio);

    const data: NuevoPedido = {
      ruc: rucLimpio,
      precio: this.formPedido.get('listaPrecios')?.value,
      moneda: this.formPedido.get('moneda')?.value,
      subtotal: parseFloat(this.calcularSubtotal().toFixed(9)),
      igv: parseFloat(this.calcularIgv().toFixed(9)),
      total: parseFloat(this.calcularTotal().toFixed(9)),
      productos,
      observaciones: this.formPedido.get('observaciones')?.value,
      oc: this.formPedido.get('oc')?.value,
    };

    this.pedidos.savePedido(data).subscribe({
      next: (resp) => {
        if (resp.ok) {
          setTimeout(() => {
            this.spinner.hide();
            Swal.fire({
              title: 'Pedido registrado exitosamente.',
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
        
        // Mostrar errores de validación específicos si están disponibles
        let mensajeError = 'Ocurrió un error al guardar el pedido.';
        if (err.error && err.error.errors && Array.isArray(err.error.errors)) {
          const errores = err.error.errors.map((e: any) => {
            if (e.Errors && Array.isArray(e.Errors)) {
              return e.Errors.join(', ');
            }
            return e.ErrorMessage || e;
          }).join('\n');
          mensajeError = `Error de validación:\n${errores}`;
        } else if (err.error && err.error.message) {
          mensajeError = err.error.message;
        }

        Swal.fire({
          title: 'Error al guardar pedido',
          text: mensajeError,
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  limpiarDatosPedido(): void {
    this.listClientes = [];
    this.listMoneda = [];
    this.listProdAgregados = [];
    this.listPreciosVisible.set(false);
    this.formPedido.controls['cliente'].setValue(null);
    this.formPedido.controls['moneda'].setValue('');
    this.formPedido.controls['listaPrecios'].setValue('');
  }

  goBack() {
    this.router.navigate(['/dashboard/pages/ventas']);
  }

  goCrearCliente() {
    this.router.navigate(['dashboard/pages/addcliente']);
  }
}
