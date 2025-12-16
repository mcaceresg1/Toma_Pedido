import { Component, inject, OnInit } from '@angular/core';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login-page',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
  private _snackBar = inject(MatSnackBar);

  formLogin = new FormGroup({
    usuario: new FormControl('', [Validators.required]),
    clave: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(12),
    ]),
  });

  //Formulario de Soporte
  errorSession: boolean = false;

  // Información del sistema
  appVersion: string = '2.2.2';
  environmentInfo = {
    ambiente: 'Cargando...',
    bdLogin: '',
    bdData: ''
  };

  constructor(
    private authService: AuthService,
    private cookie: CookieService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadEnvironmentInfo();
  }

  private loadEnvironmentInfo(): void {
    this.authService.getEnvironmentInfo().subscribe({
      next: (data) => {
        this.environmentInfo = data;
      },
      error: () => {
        this.environmentInfo = {
          ambiente: 'No disponible',
          bdLogin: 'N/A',
          bdData: 'N/A'
        };
      }
    });
  }

  //TODO: Formulario de Soporte
  get passwordInvalidfs(): boolean {
    return this.errorSession;
  }

  validateFormSoporte(): void {
    this.formLogin = new FormGroup({
      usuario: new FormControl('', [Validators.required]),
      clave: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(12),
      ]),
    });
  }

  sendLogin(): void {
    this.spinner.show();
    const { usuario, clave } = this.formLogin.value;
    this.authService.sendCredentials(usuario!, clave!).subscribe({
      next: (responseOk) => {
        const tokenSession = responseOk.message;
        const user = responseOk.user;
        
        // Determinar rol (0 = Admin, >0 = Tomapedidos)
        // Guardamos el ID del rol para coincidir con la lógica del Dashboard (0 o 4 en el ejemplo comentado, pero usaremos lógica directa)
        // En el dashboard.ts original: 4 = Admin, 0 = Tomapedidos.
        // Pero en BD: 0 = Admin (Vendedor=0).
        // Vamos a estandarizar: Si vendedor == 0 -> Rol "Admin", Si vendedor > 0 -> Rol "User"
        
        this.cookie.set('token', tokenSession, 4, '/');
        this.cookie.set('userLogin', usuario!, 4, '/');
        this.cookie.set('codVendedor', user.vendedor.toString(), 4, '/');
        // Guardamos userRol: 4 si es Admin (vendedor 0), 0 si es Tomapedidos (para mantener compatibilidad con lo que parecía haber antes)
        this.cookie.set('userRol', user.vendedor === 0 ? '4' : '0', 4, '/');
        
        // Luego del login, entrar al Home dinámico (redirecciona según permisos VE/RV/RC/MV)
        this.router.navigateByUrl('/dashboard/home');
        this.spinner.hide();
      },
      error: (err) => {
        this.errorSession = true;
        this._snackBar.open('Usuario y/o contraseña incorrectos.', 'CERRAR', {
          duration: 4000,
        });
        this.spinner.hide();
      },
    });
  }

  closeAlert(): void {
    this.errorSession = false;
    this._snackBar.dismiss();
  }
}
