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
import { Cliente } from '../../../../../models/Cliente';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],
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
export class ClientesComponent implements OnInit {
  searchTimeout: any = null;
  formBuscar: FormGroup = new FormGroup({});
  inputBuscar: string = '';
  searchSpinnerHidden = signal(true);
  allClientes = signal<Cliente[]>([]);

  private _snackBar = inject(MatSnackBar);

  constructor(
    private formBuilder: FormBuilder,
    private pedidos: VentasService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    this.createFormBuscar();
  }

  ngOnInit(): void {}

  createFormBuscar(): void {
    this.formBuscar = this.formBuilder.group({
      inputBuscar: [''],
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
        //this.searchClientes();
      } else {
        this.searchTimeout = setTimeout(() => {
          this.searchSpinnerHidden.set(true);
          if (this.inputBuscar.length > 3) {
            this.searchClientes();
          }
        }, 2000);
      }
    } else if (event.type === 'input') {
      this.searchSpinnerHidden.set(true);
      this.searchClientes();
    }
  }

  searchClientes(): void {
    this.pedidos.getSearchClientes(this.inputBuscar).subscribe({
      next: (resp) => {
        this.spinner.hide();
        if (resp.length > 0) {
        } else {
        }
      },
      error: (err) => {
        console.log(err);
        this.spinner.hide();
        this._snackBar.open('Ocurrió un error al cargar las ventas.', 'OK', {
          duration: 3000,
        });
      },
    });
  }
}
