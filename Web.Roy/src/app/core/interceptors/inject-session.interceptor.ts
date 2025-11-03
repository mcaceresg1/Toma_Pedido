import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable()
export class InjectSessionInterceptor implements HttpInterceptor {
  constructor(private cookieService: CookieService, private router: Router) {}

  errorHandler = (error: HttpErrorResponse) => {
    if (error.status === 401) {
      // Solo borrar cookies en 401 Unauthorized (autenticación fallida)
      console.log('>>> Interceptor: 401 Unauthorized, borrando cookies');
      this.cookieService.deleteAll();
      this.cookieService.delete('token', '/');
      this.cookieService.delete('userRol', '/');
      this.cookieService.delete('userLogin', '/');
      this.cookieService.delete('userData', '/');
      this.cookieService.delete('codVendedor', '/');
      window.location.reload();
    } else if (error.status === 0) {
      // Status 0 = Error de red/CORS - NO borrar cookies
      console.warn('>>> Interceptor: Error de red/CORS (status 0), manteniendo sesión');
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
    }
    return throwError(() => error);
  };

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    try {
      const token = this.cookieService.get('token');
      let newRequest = request;
      newRequest = request.clone({
        setHeaders: {
          authorization: `Bearer ${token}`,
        },
      });

      return next.handle(newRequest).pipe(catchError(this.errorHandler));
    } catch (e) {
      return next.handle(request).pipe(catchError(this.errorHandler));
    }
  }
}
