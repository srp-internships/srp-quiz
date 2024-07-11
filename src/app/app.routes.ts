import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/login/login.component';
import { CategoryComponent } from './features/category/category.component';
import { authGuard } from './core/guard/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'SRP Quiz - Login',
    loadComponent: () =>
      import('./features/login/login.component').then(
        (c) => c.LoginPageComponent
      ),
  },

  { path: 'category', component: CategoryComponent , canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' },
];
