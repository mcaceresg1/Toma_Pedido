import { Component, ElementRef, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogModule,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-modal-add-item',
  templateUrl: './modal-add-item.component.html',
  styleUrls: ['./modal-add-item.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    MatCardModule,
    MatBadgeModule,
  ],
})
export class ModalAddItemComponent implements OnInit {
  formBuscarProd: FormGroup = new FormGroup({});

  valorInput: number = 0;
  codMoneda: string = '';
  inputBuscarProd: string = '';
  listProdPrecios: any = [];
  productosFiltrados: any = [];
  puedeCambiarPrecio = signal<boolean>(false);
  addToListaDetalle:
    | ((a: string, b: string, c: number, d: number) => void)
    | null = null;
  readonly dialogRef = inject(MatDialogRef<ModalAddItemComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private el: ElementRef,
    private spinner: NgxSpinnerService
  ) {
    this.createFormBuscarProd();
    this.addToListaDetalle = this.data.addToListaDetalle;
  }

  ngOnInit(): void {
    this.getProductosItem(this.data.codMoneda, this.data.codListPrec);
    this.getUser();
  }

  createFormBuscarProd(): void {
    this.formBuscarProd = this.formBuilder.group({
      inputBuscarProd: [null],
    });
  }

  buscarItem(event: any): void {
    event = event.target.value.toLowerCase();
    this.productosFiltrados = this.listProdPrecios.filter((producto: any) => {
      return (
        producto.codProducto.toLowerCase().includes(event) ||
        producto.descProducto.toLowerCase().includes(event)
      );
    });
  }

  getProductosItem(codMoneda: string, codListPrec: string): void {
    this.spinner.show();
    this.listProdPrecios = [];
    this.productosFiltrados = [];

    this.codMoneda = codMoneda;
    // this._pedidos.getProdPrecios(codListPrec).subscribe((resp) => {
    //   console.log('Productos Lista precios => ', resp);
    //   if (resp.length > 0) {
    //     this.listProdPrecios = resp;
    //     this.productosFiltrados = resp;
    //   }
    // });

    setTimeout(() => {
      this.spinner.hide();
    }, 1000);
  }

  addToLista(
    codProducto: string,
    descProducto: string,
    precSoles: number,
    precDolares: number
  ): void {
    var precio = 0;
    if (this.codMoneda == '001') {
      precio = precSoles;
    } else {
      precio = precDolares;
    }

    var cantidad = this.getInputValue('cnt' + codProducto);

    if (cantidad > 0 && this.addToListaDetalle) {
      this.addToListaDetalle(codProducto, descProducto, precio, cantidad);
    } else {
      alert('La cantidad no debe ser 0');
    }
  }

  getInputValue(id: string): number {
    const inputElement: HTMLInputElement = this.el.nativeElement.querySelector(
      `#${id}`
    );
    return Number(inputElement.value);
  }

  limpiarForm() {
    this.formBuscarProd.controls['inputBuscarProd'].setValue(null);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getUser(): void {
    this.userService.getDataUserLogin().subscribe((resp) => {
      this.puedeCambiarPrecio.set(
        resp.editaPrecio === true || resp.funcionesEspeciales === true
      );
    });
  }
}
