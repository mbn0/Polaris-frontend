import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: './student-dashboard.component.html'
})
export class StudentDashboardComponent {
  constructor(private router: Router) {}

  logout() {
    // Handle logout logic here
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }
}
