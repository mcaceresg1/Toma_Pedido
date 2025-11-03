import { Injectable } from '@angular/core';
import { ProductoReport } from '../../../../models/ProductoReport';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ProveedorReport } from '../../../../models/ProveedorReport';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly URL = environment.api;
  constructor(private http: HttpClient, private cookieService: CookieService) {}

    getProductoReporte(): Observable<ProductoReport[]> {
      const url = `${this.URL}reporte/GetProductosReport`;
      return this.http.get<ProductoReport[]>(url);
    }

    getProveedorReporte(): Observable<ProveedorReport[]> {
      const url = `${this.URL}reporte/GetProveedorReport`;
      return this.http.get<ProveedorReport[]>(url);
    }
}
