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
export class DirectionLoginGuard implements CanActivate {
  constructor(private cookieService: CookieService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const hasToken = this.cookieService.check('token');
    console.log('>>> DirectionLoginGuard - Token exists:', hasToken);
    
    if (!hasToken) {
      console.log('>>> DirectionLoginGuard - NO HAY TOKEN, permitiendo acceso a login');
      return true;
    } else {
      console.log('>>> DirectionLoginGuard - HAY TOKEN, redirigiendo a dashboard');
      this.router.navigate(['/', 'dashboard']);
      return false;
    }
  }
}
