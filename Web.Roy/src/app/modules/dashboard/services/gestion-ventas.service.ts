import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GestionVentasService {
  private readonly URL = environment.api;

  constructor(private http: HttpClient) {}

  getReportGestionVentas(data: any): Observable<any> {
    const url = `${this.URL}report/GetReportGestionVentas`;
    return this.http.post<any>(url, data);
  }
}
