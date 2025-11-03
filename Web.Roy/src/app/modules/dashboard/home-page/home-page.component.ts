import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private cookie: CookieService
  ) {}

  ngOnInit(): void {
    let idRolUsuario = Number(this.cookie.get('userRol'));

    if (idRolUsuario == 4) {
      this.router.navigateByUrl('/dashboard/reportes/gestionVentas');
    } else {
      this.router.navigateByUrl('/dashboard/pages/ventas');
    }
  }
}
