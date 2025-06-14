import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { LoginComponent } from './login/login.component';
import { Chapter1Component } from './chapter1/chapter1.component';
import { Chapter3Component } from './chapter3/chapter3.component';
import { Chapter5Component } from './chapter5/chapter5.component';
import { Chapter10Component } from './chapter10/chapter10.component';

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
    title: 'Chapter 3 - Traditional Symmetric-key Ciphers'

  },
  {
    path: 'Chapter5',
    component: Chapter5Component,
    title: 'Chapter 5 - Introduction to Modern Symmetric-key Ciphers'
  },
  {
    path: 'Chapter6',
    loadComponent: () => import('./chapter6/chapter6.component').then(m => m.Chapter6Component),
    title: 'Chapter 6 - Data Encryption Standard (DES)'
  },
  {
    path: 'Chapter7',
    loadComponent: () => import('./chapter7/chapter7.component').then(m => m.Chapter7Component),
    title: 'Chapter 7 - Advanced Encryption Standard (AES)'
  },
  {
    path: 'Chapter8',
    loadComponent: () => import('./chapter8/chapter8.component').then(m => m.Chapter8Component),
    title: 'Chapter 8 - Encipherment Using Modern Symmetric Key Cryptography'

  },
  {
    path: 'Chapter9',
    loadComponent: () => import('./chapter9/chapter9.component').then(m => m.Chapter9Component),
    title: 'Chapter 9 - Mathematics of Asymmetric-Key Cryptography'
  },
  {
    path: 'Chapter10',
    component: Chapter10Component,
    title: ' Assymetric-key Cryptography'
  },
  {
    path: '**',
    redirectTo: '/register'
  },
];
