import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly URL = environment.api;
  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  sendCredentials(usuario: string, clave: string): Observable<any> {
    const body = {
      usuario,
      clave,
    };
    const url = `${this.URL}login/Authenticate`;

    return this.http.post<any>(url, body);
  }

  getEnvironmentInfo(): Observable<any> {
    const url = `${this.URL}login/GetEnvironmentInfo`;
    return this.http.get<any>(url);
  }

  logout() {
    console.log('=== INICIANDO LOGOUT ===');
    console.log('Cookies antes de eliminar:', this.cookieService.getAll());
    
    // Eliminar cookies sin especificar path (usa el path por defecto)
    this.cookieService.delete('token');
    this.cookieService.delete('userRol');
    this.cookieService.delete('userLogin');
    this.cookieService.delete('userData');
    this.cookieService.delete('codVendedor');
    this.cookieService.delete('test');
    
    // También intentar eliminar con path '/' por si acaso
    this.cookieService.delete('token', '/');
    this.cookieService.delete('userRol', '/');
    this.cookieService.delete('userLogin', '/');
    this.cookieService.delete('userData', '/');
    this.cookieService.delete('codVendedor', '/');
    this.cookieService.delete('test', '/');
    
    // Limpiar localStorage por si se usa
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('Cookies después de eliminar:', this.cookieService.getAll());
    console.log('=== LOGOUT COMPLETADO - Redirigiendo a auth ===');
    
    // Usar window.location.href para forzar una navegación completa y evitar problemas con el router
    // Esto evita que los guards o interceptores interfieran con la navegación
    window.location.href = '/auth';
  }
}
