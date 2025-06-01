import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';

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
    loadComponent: () => import('./login/login.component').then(c => c.LoginComponent),
    title: 'Login - Sign In'
  },
  {
    path: 'dashboard',
    component: StudentDashboardComponent,
    title: 'Dashboard'
  },
  {
    path: '**',
    redirectTo: '/register'
  }
];
