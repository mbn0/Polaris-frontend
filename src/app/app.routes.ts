import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { LoginComponent } from './login/login.component';
import { Chapter1Component } from './chapters/chapter1/chapter1.component';
import { Chapter3Component } from './chapters/chapter3/chapter3.component';
import { Chapter5Component } from './chapters/chapter5/chapter5.component';
import { Chapter10Component } from './chapters/chapter10/chapter10.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { adminGuard, noAuthGuard, authGuard, instructorGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/register',
    pathMatch: 'full'
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [noAuthGuard],
    title: 'Register - Create Account'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard],
    title: 'Login - Sign In'
  },
  {
    path: 'dashboard',
    component: StudentDashboardComponent,
    canActivate: [authGuard],
    title: 'Dashboard'
  },
  {
    path: 'Chapter1',
    component: Chapter1Component,
    title: 'Chapter 1 - Introduction to Cryptography'
  },
  {
    path: 'Chapter2',
    loadComponent: () => import('./chapters/chapter2/chapter2.component').then(m => m.Chapter2Component),
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
    loadComponent: () => import('./chapters/chapter6/chapter6.component').then(m => m.Chapter6Component),
    title: 'Chapter 6 - Data Encryption Standard (DES)'
  },
  {
    path: 'Chapter7',
    loadComponent: () => import('./chapters/chapter7/chapter7.component').then(m => m.Chapter7Component),
    title: 'Chapter 7 - Advanced Encryption Standard (AES)'
  },
  {
    path: 'Chapter8',
    loadComponent: () => import('./chapters/chapter8/chapter8.component').then(m => m.Chapter8Component),
    title: 'Chapter 8 - Encipherment Using Modern Symmetric Key Cryptography'
  },
  {
    path: 'Chapter9',
    loadComponent: () => import('./chapters/chapter9/chapter9.component').then(m => m.Chapter9Component),
    title: 'Chapter 9 - Mathematics of Asymmetric-Key Cryptography'
  },
  {
    path: 'Chapter10',
    component: Chapter10Component,
    title: 'Assymetric-key Cryptography'
  },
  {
    path: 'Chapter11',
    loadComponent: () => import('./chapters/chapter11/chapter11.component').then(m => m.Chapter11Component),
    title: 'Chapter 11 - Message Integrity and Message Authentication'
  },
  {
    path: 'Chapter12',
    loadComponent: () => import('./chapters/chapter12/chapter12.component').then(m => m.Chapter12Component),
    title: 'Chapter 12 - Hash Functions'
  },
  {
    path: 'Chapter13',
    loadComponent: () => import('./chapters/chapter13/chapter13.component').then(m => m.Chapter13Component),
    title: 'Chapter 13 - Digital Signatures'
  },
  {
    path: 'Chapter14',
    loadComponent: () => import('./chapters/chapter14/chapter14.component').then(m => m.Chapter14Component),
    title: 'Chapter 14 - Authentication'
  },
  {
    path: 'Chapter15',
    loadComponent: () => import('./chapters/chapter15/chapter15.component').then(m => m.Chapter15Component),
    title: 'Chapter 15 - Key Establishment'
  },
  {
    path: 'Chapter16',
    loadComponent: () => import('./chapters/chapter16/chapter16.component').then(m => m.Chapter16Component),
    title: 'Chapter 16 - Homomorphic Encryption'
  },
  {
    path: 'des',
    loadComponent: () => import('./crypto-tools/des-tool/des-tool.component').then(m => m.DesToolComponent),
    title: 'DES Tool - Data Encryption Standard'
  },
  {
    path: 'rsa',
    loadComponent: () => import('./crypto-tools/rsa/rsa.component').then(m => m.RSAComponent),
    title: 'RSA Tool - RSA Encryption'
  },
  {
    path: 'sha256',
    loadComponent: () => import('./crypto-tools/sha256/sha256.component').then(m => m.Sha256Component),
    title: 'SHA256 Tool - SHA256 Hashing'
  },
  {
    path: 'aes',
    loadComponent: () => import('./crypto-tools/aes/aes.component').then(m => m.AESComponent),
    title: 'AES Tool - Advanced Encryption Standard'
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard],
    title: 'Admin Dashboard'
  },
  {
    path: 'instructor',
    loadComponent: () => import('./instructor-dashboard/instructor-dashboard.component').then(m => m.InstructorDashboardComponent),
    canActivate: [instructorGuard],
    title: 'Instructor Dashboard'
  },
  {
    path: 'assessment/:id',
    loadComponent: () => import('./assessment/assessment.component').then(m => m.AssessmentComponent),
    canActivate: [authGuard],
    title: 'Assessment'
  },
  {
    path: '**',
    component: NotFoundComponent,
    title: '404 - Page Not Found'
  },
];
