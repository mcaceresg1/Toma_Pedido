import { Routes } from '@angular/router';
import { DirectionLoginGuard } from './core/guards/direction-login.guard';
import { SessionGuard } from './core/guards/session.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
    canActivate: [DirectionLoginGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./modules/dashboard/dashboard.module').then(
        (m) => m.DashboardModule
      ),
    canActivate: [SessionGuard],
  },
  {
    path: '**',
    redirectTo: 'auth',
  },
];
