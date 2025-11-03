import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private readonly URL = environment.api;

  constructor(private http: HttpClient) {}

  getAllLocales(): Observable<any> {
    const url = `${this.URL}shared/GetAllLocal`;
    return this.http.get<any>(url);
  }
}
