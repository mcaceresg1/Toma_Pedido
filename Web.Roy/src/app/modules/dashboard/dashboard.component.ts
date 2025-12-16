import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import Swal from 'sweetalert2';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBars, faClose } from '@fortawesome/free-solid-svg-icons';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environments/environment';
import { Empresa } from '../../../models/Empresa';
import { CookieService } from 'ngx-cookie-service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from './services/user.service';
import { AuthService } from '../auth/services/auth.service';
import { Usuario } from '../../../models/User';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    RouterLink,
    RouterOutlet,
    CommonModule,
    MatSidenavModule,
    FontAwesomeModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatButtonModule,
    NgxSpinnerModule,
  ],
})
export class DashboardComponent implements OnInit {
  opened: boolean = true;
  isSmallScreen: boolean = false;
  faBars = faBars;
  faClose = faClose;
  usuario = signal<Usuario | null>(null);
  empresa = signal<Empresa | null>(null);
  logoEmpresa = signal<string>('');
  connectionDetails = signal<string>('');
  userEmpresas = signal<Empresa[]>([]);
  _snackbar = inject(MatSnackBar);
  mostrarImpuesto = signal<boolean>(false);
  appVersion: string = '2.2.2';

  // Estados de expansión de menús
  ventasExpanded: boolean = false;
  reporteVentasExpanded: boolean = false;
  reporteComprasExpanded: boolean = false;
  mantenimientoExpanded: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private cookie: CookieService
  ) { }

  toggleDrawer() {
    this.opened = !this.opened;
  }

  ngOnInit(): void {
    this.getUserLogin();
    this.getConnectionDetails();
    this.getUserEmpresas();
    this.getUserEmpresa();
    this.checkScreenSize();
  }

  getUserLogin(): void {
    this.spinner.show('usuario');
    this.userService.getDataUserLogin().subscribe({
      next: (resp) => {
        this.usuario.set(resp);
        this.logoEmpresa.set(
          `${environment.api.replace('/api/', '/public/')}${resp.empresaDefecto
          }.png`
        );
        this.spinner.hide('usuario');
      },
      error: (err) => {
        this._snackbar.open(
          'No se pudo obtener la información del usuario.',
          'ACEPTAR'
        );
        this.spinner.hide('usuario');
      },
    });
  }

  getUserEmpresas(): void {
    this.spinner.show('empresas');
    this.userService.getEmpresas().subscribe({
      next: (resp) => {
        this.userEmpresas.set(
          resp.map((it) => ({
            ...it,
            logo: `${environment.api.replace('/api/', '/public/')}${it.codigo
              }.png`,
          }))
        );
        this.spinner.hide('empresas');
      },
      error: (err) => {
        this._snackbar.open(
          'No se pudo obtener la lista de empresas.',
          'ACEPTAR'
        );
        this.spinner.hide('empresas');
      },
    });
  }

  getUserEmpresa(): void {
    this.spinner.show('empresa');
    this.userService.getEmpresa().subscribe({
      next: (resp) => {
        this.empresa.set(resp);
        this.mostrarImpuesto.set(!resp.precioUsaImpuesto);
        this.spinner.hide('empresa');
      },
      error: (err) => {
        this._snackbar.open(
          'No se pudo obtener la empresa del usuario.',
          'ACEPTAR'
        );
        this.spinner.hide('empresa');
      },
    });
  }

  cambiarEmpresa(codigo: string): void {
    this.spinner.show();
    this.userService.cambiarEmpresa(codigo).subscribe({
      next: () => {
        window.location.reload();
        this.spinner.hide();
      },
      error: (err) => {
        Swal.fire({
          title: 'Error al cambiar de empresa.',
          icon: 'error',
          confirmButtonColor: '#17a2b8',
          confirmButtonText: 'Ok',
        });
        this.spinner.hide();
      },
    });
  }

  getConnectionDetails(): void {
    this.userService.getConnectionDetails().subscribe({
      next: (resp) => {
        this.connectionDetails.set(resp);
      },
      error: (err) => {
        this.connectionDetails.set('Error al obtener información de BD');
      }
    });
  }

  getPermisos(pantalla: string): boolean {
    const permisos = this.usuario()?.permisos || [];

    switch (pantalla) {
      case 'Home': return true;
      case 'Ventas': return permisos.includes('VE');
      case 'ReporteVentas': return permisos.includes('RV');
      case 'Reportes': return permisos.includes('RC'); // Reporte Compras
      case 'Mantenimiento': return permisos.includes('MV');
      default: return false;
    }
  }

  navegarA(ruta: string): void {
    this.router.navigate([ruta]);
    // Cerrar menú en móvil después de navegar
    if (this.isSmallScreen) {
      this.opened = false;
    }
  }

  toggleVentas(): void {
    this.ventasExpanded = !this.ventasExpanded;
  }

  toggleReporteVentas(): void {
    this.reporteVentasExpanded = !this.reporteVentasExpanded;
  }

  toggleReporteCompras(): void {
    this.reporteComprasExpanded = !this.reporteComprasExpanded;
  }

  toggleMantenimiento(): void {
    this.mantenimientoExpanded = !this.mantenimientoExpanded;
  }

  logout($event?: Event) {
    // Prevenir propagación de eventos si se proporciona
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $event.stopImmediatePropagation();
    }

    // Usar setTimeout para evitar conflictos con mat-menu
    setTimeout(() => {
      Swal.fire({
        title: '¿Está seguro de cerrar sesión?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#17a2b8',
        cancelButtonColor: '#343a40',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        allowOutsideClick: false,
        allowEscapeKey: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.authService.logout();
        }
      });
    }, 0);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isSmallScreen = window.matchMedia('(max-width: 600px)').matches;
  }
}
