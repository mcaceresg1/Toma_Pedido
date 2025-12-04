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

  //NOTA: BORRAR LOS cookieService QUE NO SE USAN
  logout() {
    this.cookieService.delete('token', '/');
    this.cookieService.delete('userRol', '/');
    this.cookieService.delete('userLogin', '/');
    this.cookieService.delete('userData', '/');
    this.cookieService.delete('codVendedor', '/');

    this.router.navigate(['/', 'auth']);
  }
}
