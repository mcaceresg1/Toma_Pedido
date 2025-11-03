import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionGuard implements CanActivate {
  constructor(private cookieService: CookieService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.checkCookieSession();
  }

  checkCookieSession(): boolean {
    try {
      const token: boolean = this.cookieService.check('token');
      console.log('>>> SessionGuard - Token exists:', token);
      
      if (!token) {
        console.log('>>> SessionGuard - NO HAY TOKEN, redirigiendo a auth');
        this.router.navigate(['/', 'auth']);
        return false;
      }
      
      console.log('>>> SessionGuard - TOKEN OK, permitiendo acceso');
      return true;
    } catch (e) {
      console.log('>>> SessionGuard - Error al consultar token: ', e);
      this.router.navigate(['/', 'auth']);
      return false;
    }
  }
}
