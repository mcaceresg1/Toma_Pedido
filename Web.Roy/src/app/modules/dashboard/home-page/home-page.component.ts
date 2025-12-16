import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  constructor(
    private spinner: NgxSpinnerService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.spinner.show();

    // Home dinámico: redirecciona según permisos del usuario (SUP011: VE/RV/RC/MV)
    this.userService.getDataUserLogin().subscribe({
      next: (user) => {
        const permisos = user?.permisos || [];

        // Orden de prioridad (sin fallbacks a módulos no permitidos)
        if (permisos.includes('VE')) {
          this.router.navigateByUrl('/dashboard/pages/ventas');
        } else if (permisos.includes('RV')) {
          this.router.navigateByUrl('/dashboard/pages/ordenPedidos');
        } else if (permisos.includes('RC')) {
          // Reporte Compras: elegir una pantalla concreta
          this.router.navigateByUrl('/dashboard/pages/reporteProductos');
        } else if (permisos.includes('MV')) {
          // Mantenimiento
          this.router.navigateByUrl('/dashboard/pages/gestion-zonas');
        } else {
          // Sin permisos: se queda en Home mostrando el mensaje
          this.spinner.hide();
          return;
        }

        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      },
    });
  }
}
