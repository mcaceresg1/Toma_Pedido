import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Zona, ZonaCreateDto, ZonaUpdateDto } from '../../../../models/Zona';

@Injectable({
  providedIn: 'root'
})
export class ZonaService {
  private readonly URL = `${environment.api}zonas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Zona[]> {
    return this.http.get<Zona[]>(this.URL);
  }

  getById(zonaCodigo: string): Observable<Zona> {
    return this.http.get<Zona>(`${this.URL}/${zonaCodigo}`);
  }

  create(zona: ZonaCreateDto): Observable<Zona> {
    return this.http.post<Zona>(this.URL, zona);
  }

  update(zonaCodigo: string, zona: ZonaUpdateDto): Observable<Zona> {
    return this.http.put<Zona>(`${this.URL}/${zonaCodigo}`, zona);
  }

  delete(zonaCodigo: string): Observable<void> {
    return this.http.delete<void>(`${this.URL}/${zonaCodigo}`);
  }
}

