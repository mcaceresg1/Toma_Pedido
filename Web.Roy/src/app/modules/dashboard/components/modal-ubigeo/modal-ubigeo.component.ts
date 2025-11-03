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
import { MatPaginatorModule } from '@angular/material/paginator';
import { ModalStockData } from '../../../../../models/Producto';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ModalUbigeoData, Ubigeo } from '../../../../../models/Ubigeo';
@Component({
  selector: 'app-modal-ubigeo',
  templateUrl: './modal-ubigeo.component.html',
  styleUrls: ['./modal-ubigeo.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
  ],
})
export class ModalUbigeoComponent implements OnInit {
  formUbigeo: FormGroup = new FormGroup({
    busqueda: new FormControl(''),
  });
  readonly dialogRef = inject(MatDialogRef<ModalUbigeoComponent>);
  listUbigeos = signal<Array<Ubigeo>>([]);
  displayedColumns = ['ubigeo', 'distrito', 'departamento', 'provincia'];
  timeout: any;

  readonly data = inject<ModalUbigeoData>(MAT_DIALOG_DATA);
  private _snackbar = inject(MatSnackBar);

  constructor(
    private pedidos: VentasService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.GetAllUbigeos();
  }

  cargarInput(): void {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.GetAllUbigeos();
    }, 2000);
  }

  filtrar(): void {
    this.GetAllUbigeos();
  }

  GetAllUbigeos(): void {
    this.spinner.show();
    this.pedidos.getSearchUbigeo(this.formUbigeo.value.busqueda).subscribe({
      next: (resp) => {
        this.spinner.hide();
        this.listUbigeos.set(resp);
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

  seleccionarUbigeo(ubigeo: Ubigeo) {
    this.data.seleccionarUbigeo(ubigeo);
    this.onNoClick();
  }

  limpiarForm() {
    this.formUbigeo.patchValue({
      busqueda: '',
    });
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
