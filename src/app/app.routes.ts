import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/login/login.component';
import { DashboardPageComponent } from './features/category/category.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent, title: 'SRP Quiz - Login' },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/login/login.routres').then((m) => m.loginRoutes),
    data: { title: 'SRP Quiz - Login' },
  },

  { path: 'dashboard', component: DashboardPageComponent },
];
