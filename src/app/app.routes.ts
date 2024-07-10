import { Routes } from '@angular/router';
import { LoginPageComponent } from './features/login-page/login-page.component';
import { categoryComponent } from './features/category/category.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent, title: 'SRP Quiz - Login' },
  {
    path: 'login',
    loadChildren: () =>
      import('../app/features/login-page/login.module').then(
        (m) => m.LoginModule
      ),
    data: { title: 'SRP Quiz - Login' },
  },
  { path: 'category', component: categoryComponent },
];
