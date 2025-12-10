import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { VentasService } from '../../services/ventas.service';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { Usuario } from '../../../../../models/User';
import { Empresa } from '../../../../../models/Empresa';
import { Condicion } from '../../../../../models/Condicion';
import { NuevoCliente } from '../../../../../models/Cliente';
import { MatDialog } from '@angular/material/dialog';
import { ModalUbigeoData, Ubigeo } from '../../../../../models/Ubigeo';
import { ModalUbigeoComponent } from '../../components/modal-ubigeo/modal-ubigeo.component';
import { TipoDocumento } from '../../../../../models/TipoDocumento';

@Component({
  selector: 'app-add-cliente',
  templateUrl: './add-cliente.component.html',
  styleUrls: ['./add-cliente.component.scss'],
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
  standalone: true,
})
export class AddClienteComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);
  usuario = signal<Usuario | null>(null);
  empresa = signal<Empresa | null>(null);
  condiciones = signal<Condicion[]>([]);
  tiposDocumento = signal<TipoDocumento[]>([]);
  precios = signal<{ codigo: string; label: string }[]>([]);
  ubigeo = signal<Ubigeo | null>(null);
  readonly ubigeoDialog = inject(MatDialog);
  formCliente: FormGroup = new FormGroup<{
    razon?: FormControl<string | null>;
    ruc?: FormControl<string | null>;
    direccion?: FormControl<string | null>;
    telefono?: FormControl<string | null>;
    ciudad?: FormControl<string | null>;
    contacto?: FormControl<string | null>;
    telefonoContacto?: FormControl<string | null>;
    correo?: FormControl<string | null>;
    ubigeo?: FormControl<string | null>;
    condicion?: FormControl<string | null>;
    diasCredito?: FormControl<number | null>;
    tipoDocumento?: FormControl<string | null>;
  }>({
    razon: new FormControl<string>('', [Validators.required]),
    ruc: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(/^\d{11}$/),
    ]),
    direccion: new FormControl<string>('', [Validators.required]),
    telefono: new FormControl<string>('', [Validators.required]),
    ciudad: new FormControl<string>('', [Validators.required]),
    contacto: new FormControl<string>('', [Validators.required]),
    telefonoContacto: new FormControl<string>(''),
    correo: new FormControl<string>(''),
    ubigeo: new FormControl<string>('', [Validators.required]),
    condicion: new FormControl<string>(''),
    diasCredito: new FormControl<number>(0, [
      Validators.required,
      Validators.max(9999),
      Validators.min(0),
    ]),
    tipoDocumento: new FormControl<string>('', [Validators.required]),
  });

  constructor(
    private userService: UserService,
    private pedidosService: VentasService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUserLogin();
    this.getEmpresa();
    this.getCondiciones();
    this.getTiposDocumento();
  }

  getUserLogin(): void {
    this.spinner.show('create_usuario');
    this.userService.getDataUserLogin().subscribe({
      next: (resp) => {
        this.usuario.set(resp);
        this.spinner.hide('create_usuario');
      },
      error: (err) => {
        this.spinner.hide('create_usuario');
        Swal.fire({
          title: 'Error al obtener el usuario vendedor.',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  getEmpresa(): void {
    this.spinner.show('create_empresa');
    this.userService.getEmpresa().subscribe({
      next: (resp) => {
        this.empresa.set(resp);
        this.spinner.hide('create_empresa');
      },
      error: (err) => {
        this.spinner.hide('create_empresa');
        Swal.fire({
          title: 'Error al obtener información de la empresa..',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  getCondiciones(): void {
    this.spinner.show('create_condicion');
    this.pedidosService.getCondiciones().subscribe({
      next: (resp) => {
        this.condiciones.set(resp);
        this.formCliente.controls['condicion'].setValue(
          resp[resp.length - 2].codigo
        );
        this.spinner.hide('create_condicion');
      },
      error: (err) => {
        this.spinner.hide('create_condicion');
        Swal.fire({
          title: 'Error al obtener las condiciones de la empresa...',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  getTiposDocumento(): void {
    this.spinner.show('tipos_doc');
    this.pedidosService.getTiposDocumento().subscribe({
      next: (resp) => {
        this.tiposDocumento.set(resp);
        const rucTipo = resp.filter((it) => it.descripcion === 'RUC')?.[0];
        this.formCliente.controls['tipoDocumento'].setValue(rucTipo.tipo);
        this.spinner.hide('tipos_doc');
      },
      error: (err) => {
        this.spinner.hide('tipos_doc');
        Swal.fire({
          title: 'Error al obtener los tipos de documento...',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  /**Accion */
  cancelarCliente(): void {
    Swal.fire({
      title: '¿Cancelar creación de cliente?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#17a2b8',
      cancelButtonColor: '#343a40',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        this.limpiarDatosPedido();
        this.router.navigate(['/dashboard/pages/addpedido']);
      }
    });
  }

  registrarCliente(): void {
    if (this.formCliente.invalid) {
      return Object.values(this.formCliente.controls).forEach((control) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach((control) =>
            control.markAsTouched()
          );
        } else {
          control.markAsTouched();
        }
      });
    }
    this.saveCliente();
  }

  saveCliente(): void {
    this.spinner.show();

    // Limpiar el RUC: eliminar espacios y caracteres no numéricos, tomar solo los primeros 11 dígitos
    const rucRaw = this.formCliente.get('ruc')?.value || '';
    const rucLimpio = rucRaw.toString().replace(/\D/g, '').substring(0, 11);

    // Validar que el RUC tenga exactamente 11 dígitos
    if (rucLimpio.length !== 11) {
      this.spinner.hide();
      Swal.fire({
        title: 'Error de validación',
        text: 'El RUC debe tener exactamente 11 dígitos numéricos.',
        icon: 'error',
        confirmButtonColor: '#17a2b8',
        confirmButtonText: 'Ok',
      });
      return;
    }

    const data: NuevoCliente = {
      ...this.formCliente.value,
      ruc: rucLimpio, // Usar el RUC limpio
      ubigeo: this.ubigeo()?.ubigeo,
    };
    this.pedidosService.crearCliente(data).subscribe({
      next: (resp) => {
        if (resp.ok) {
          setTimeout(() => {
            this.spinner.hide();
            Swal.fire({
              title: 'Cliente registrado exitosamente.',
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
            title: 'Error al crear el cliente..',
            icon: 'error',
            confirmButtonColor: '#17a2b8',
            confirmButtonText: 'Ok',
          });
        }
      },
      error: (err) => {
        this.spinner.hide();
        Swal.fire({
          title: 'Error al crear el cliente..',
          text: err.error ?? err.message,
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
      },
    });
  }

  limpiarDatosPedido(): void {
    this.formCliente.reset();
  }

  goBack() {
    this.router.navigate(['/dashboard/pages/addpedido']);
  }

  openUbigeoDialog(): void {
    this.ubigeoDialog.open<any, ModalUbigeoData>(ModalUbigeoComponent, {
      minWidth: '80vw',
      data: {
        seleccionarUbigeo: this.seleccionarUbigeo.bind(this),
      },
    });
  }

  seleccionarUbigeo(ubigeo: Ubigeo) {
    this.formCliente.controls['ubigeo'].setValue(
      ubigeo.ubigeo
        ? `${ubigeo.departamento}, ${ubigeo.provincia}, ${ubigeo.distrito}`
        : null
    );
    this.ubigeo.set(ubigeo);
  }
}
