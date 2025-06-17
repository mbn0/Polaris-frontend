import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const user = auth.getCurrentUser();
  
  console.log('Current user:', user); // Debug log
  
  if (user?.token) {
    // Clone and add the Authorization header
    const modifiedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${user.token}`
      }
    });
    
    console.log('Request headers:', modifiedReq.headers.get('Authorization')); // Debug log
    
    return next(modifiedReq).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('HTTP Error:', error); // Debug log
        if (error.status === 401) {
          // Token expired or invalid
          auth.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP Error (no token):', error); // Debug log
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};

