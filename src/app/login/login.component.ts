import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  onSubmit() {
    this.submitted = true;
    this.loginError = false;

    if (this.loginForm.valid) {
      this.isLoading = true;
      console.log('Login data:', this.loginForm.value);

      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;

        // Simulate login validation
        const { email, password } = this.loginForm.value;

        // Simple validation - replace with actual authentication logic
        if (email === 'test@example.com' && password === 'password123') {
          console.log('Login successful');
          this.router.navigate(['/dashboard']);
        } else {
          this.loginError = true;
          console.log('Login failed');
        }
      }, 1500);
    } else {
      console.log('Form is invalid');
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
    console.log('Forgot password clicked');
    // You can navigate to forgot password page or show modal
    alert('Forgot password functionality would be implemented here');
  }
}
