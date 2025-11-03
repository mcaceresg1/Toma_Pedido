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

  constructor(
    private authService: AuthService,
    private cookie: CookieService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {}

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
        console.log('>>> Respuesta login:', responseOk);
        
        let tokenSession = responseOk.message;
        
        // Configurar cookies con opciones explícitas
        const cookieOptions = {
          path: '/',
          sameSite: 'Lax' as const,
          secure: false // false porque usamos http en desarrollo
        };
        
        this.cookie.set('token', tokenSession, { expires: 4, ...cookieOptions });
        this.cookie.set('userLogin', usuario!, { expires: 4, ...cookieOptions });
        this.cookie.set('test', 'ABCD', { expires: 4, ...cookieOptions });
        
        console.log('>>> Cookies guardadas con opciones');
        console.log('>>> Token check:', this.cookie.check('token'));
        console.log('>>> Token get:', this.cookie.get('token')?.substring(0, 50) + '...');
        console.log('>>> Todas las cookies:', this.cookie.getAll());
        
        setTimeout(() => {
          console.log('>>> ANTES DE NAVEGAR - Token check:', this.cookie.check('token'));
          this.router.navigate(['/', 'dashboard']).then(
            (success) => {
              console.log('>>> Navegación exitosa:', success);
              console.log('>>> DESPUES DE NAVEGAR - Token check:', this.cookie.check('token'));
              this.spinner.hide();
            },
            (error) => {
              console.error('>>> Error en navegación:', error);
              this.spinner.hide();
            }
          );
        }, 100);
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
