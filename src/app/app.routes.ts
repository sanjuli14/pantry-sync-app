import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
  },
  {
    path: 'items',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/items/list/items-list.component').then((m) => m.ItemsListComponent),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./features/items/create/items-create.component').then(
            (m) => m.ItemsCreateComponent,
          ),
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then((m) => m.LoginComponent),
        canActivate: [guestGuard],
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
        canActivate: [guestGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
