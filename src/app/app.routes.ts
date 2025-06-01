import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard.component';
import { LoginComponent } from './login/login.component';

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
    path: '**',
    redirectTo: '/register'
  }
];
