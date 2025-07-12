import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../core/services/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  submitted = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  email = '';
  currentStep = 1; // 1: Enter OTP, 2: Enter new password
  otpVerified = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get email from query parameters
    this.email = this.route.snapshot.queryParams['email'] || '';
    if (this.email) {
      this.resetPasswordForm.patchValue({ email: this.email });
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onVerifyOtp() {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.resetPasswordForm.get('otp')?.valid) {
      this.isLoading = true;

      this.authService.verifyOtp({
        email: this.resetPasswordForm.value.email,
        otp: this.resetPasswordForm.value.otp
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.otpVerified = true;
          this.currentStep = 2;
          this.successMessage = 'OTP verified successfully. Please enter your new password.';
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Invalid or expired OTP.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.resetPasswordForm.valid && this.otpVerified) {
      this.isLoading = true;

      this.authService.resetPassword({
        email: this.resetPasswordForm.value.email,
        otp: this.resetPasswordForm.value.otp,
        newPassword: this.resetPasswordForm.value.newPassword,
        confirmPassword: this.resetPasswordForm.value.confirmPassword
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Password reset successfully! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to reset password.';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  onBackToLogin() {
    this.router.navigate(['/login']);
  }

  onBackToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
} 