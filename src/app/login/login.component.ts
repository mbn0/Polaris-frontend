import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  loginError = false;
  isLoading = false;
  private returnUrl: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
    
    // Get return url from route parameters or default to dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  onSubmit() {
    this.submitted = true;
    this.loginError = false;

    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login({
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // If there's a returnUrl and the user has appropriate access, use it
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
            return;
          }
          
          // Otherwise, redirect based on user role
          if (response.roles?.includes('Admin')) {
            this.router.navigate(['/admin']);
          } else if (response.roles?.includes('Instructor')) {
            this.router.navigate(['/instructor']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.loginError = true;
          // Optionally, show error.message to the user
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Method to handle forgot password
  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
