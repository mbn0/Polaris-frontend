import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Redirect to login if not authenticated or not admin
  router.navigate(['/login']);
  return false;
};

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // If user is logged in, redirect to dashboard
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Store the attempted URL for redirecting
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};