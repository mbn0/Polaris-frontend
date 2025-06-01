import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registrationForm: FormGroup;
  submitted = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registrationForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      matricNumber: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.registrationForm.valid) {
      console.log('Registration data:', this.registrationForm.value);
      // Handle successful registration here
      // You can call your registration service here

      // Simulate successful registration and redirect
      setTimeout(() => {
        alert('Registration successful! Redirecting to login...');
        this.router.navigate(['/login']);
      }, 1000);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registrationForm.controls).forEach(key => {
      const control = this.registrationForm.get(key);
      control?.markAsTouched();
    });
  }
}
