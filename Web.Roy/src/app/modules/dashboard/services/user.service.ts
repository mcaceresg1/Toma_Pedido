import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Usuario } from '../../../../models/User';
import { Empresa } from '../../../../models/Empresa';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly URL = environment.api;
  constructor(private http: HttpClient, private router: Router) {}

  getDataUserLogin(): Observable<Usuario> {
    const url = `${this.URL}user/GetUser`;
    const user = this.http.get<Usuario>(url);
    return user;
  }

  getConnectionDetails(): Observable<string> {
    const url = `${this.URL}user/GetConnectionDetails`;
    return this.http.get<string>(url, {
      responseType: 'text' as 'json',
    });
  }

  getEmpresas(): Observable<Empresa[]> {
    const url = `${this.URL}user/GetEmpresas`;
    return this.http.get<Empresa[]>(url);
  }

  getEmpresa(): Observable<Empresa> {
    const url = `${this.URL}user/GetEmpresa`;
    return this.http.get<Empresa>(url);
  }

  cambiarEmpresa(codigo: string): Observable<any> {
    const url = `${this.URL}user/CambiarEmpresa?codigo=${codigo}`;
    return this.http.post<any>(url, null);
  }
}
