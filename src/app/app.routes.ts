import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { LoginComponent } from './login/login.component';
import { Chapter1Component } from './chapter1/chapter1.component';
import { Chapter3Component } from './chapter3/chapter3.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/register',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent,
    title: 'Register - Create Account'
  },
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Sign In'
  },
  {
    path: 'dashboard',
    component: StudentDashboardComponent,
    title: 'Dashboard'
  },
  {
    path: 'Chapter1',
    component: Chapter1Component,
    title: 'Chapter 1 - Introduction to Cryptography'
  },
  {
    path: 'Chapter2',
    loadComponent: () => import('./chapter2/chapter2.component').then(m => m.Chapter2Component),
    title: 'Chapter 2 - Traditional Symmetric-Key Ciphers'
  },
  {
    path: 'Chapter3',
    component: Chapter3Component,
    title: 'Chapter 3 - Introduction to Modern Symmetric-key Ciphers'
  },
  {
    path: '**',
    redirectTo: '/register'
  },
];
