import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Ubigeo } from '../../../../models/Ubigeo';

@Injectable({
  providedIn: 'root'
})
export class UbigeoService {
  private readonly URL = `${environment.api}ubigeos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Ubigeo[]> {
    return this.http.get<Ubigeo[]>(this.URL);
  }

  getUbigeosByZona(zonaCodigo: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.URL}/zona/${zonaCodigo}`);
  }

  setUbigeosZona(zonaCodigo: string, ubigeos: string[]): Observable<void> {
    return this.http.post<void>(`${this.URL}/zona/${zonaCodigo}`, ubigeos);
  }
}

