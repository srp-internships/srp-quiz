import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/login-page/login-page.component';
import { DashboardPageComponent } from './features/dashboard-page/dashboard-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent, title: 'SRP Quiz - Login' },
  { path: 'dashboard', component: DashboardPageComponent }
];
