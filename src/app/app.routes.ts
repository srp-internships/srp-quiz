import { Routes } from '@angular/router';
import { CategoryComponent } from './features/category/category.component';
import { QuizComponent } from './features/quiz/quiz.component';
import { authGuard } from './core/guard/auth.guard';
import { StudentComponent } from './features/student/student.component';
import { QuestionsComponent } from './features/questions/questions.component';
import { RatingComponent } from './features/rating/rating.component';

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
  { path: 'quiz', component: QuizComponent , canActivate: [authGuard] },
  { path: 'student', component: StudentComponent , canActivate: [authGuard] },
  { path: 'question/:categoryId', component: QuestionsComponent , canActivate: [authGuard] },
  { path: 'rating/:categoryId', component: RatingComponent, canActivate: [authGuard] }, 
  { path: '**', redirectTo: '/login' },
];
