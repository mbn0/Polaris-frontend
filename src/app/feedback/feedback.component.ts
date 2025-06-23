import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth/auth.service';
import { FeedbackFormComponent } from './feedback-form/feedback-form.component';
import { FeedbackListComponent } from './feedback-list/feedback-list.component';
import { AdminFeedbackComponent } from './admin-feedback/admin-feedback.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FeedbackFormComponent, FeedbackListComponent, AdminFeedbackComponent],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit, OnDestroy {
  showFeedbackForm = false;
  showFeedbackList = false;
  showAdminFeedback = false;
  isLoggedIn = false;
  isAdmin = false;
  isStudent = false;
  isInstructor = false;
  currentUserName = '';
  private authSubscription: Subscription;

  constructor(private authService: AuthService) {
    // Subscribe to authentication changes
    this.authSubscription = this.authService.currentUser.subscribe(user => {
      this.updateUserState();
    });
  }

  ngOnInit() {
    this.updateUserState();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateUserState() {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
    this.isStudent = this.authService.isStudent();
    this.isInstructor = this.authService.isInstructor();
    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserName = currentUser.fullName || currentUser.email || 'User';
    }

    // Debug logging to help troubleshoot
    console.log('FeedbackComponent - User State Updated:', {
      isLoggedIn: this.isLoggedIn,
      isAdmin: this.isAdmin,
      isStudent: this.isStudent,
      isInstructor: this.isInstructor,
      currentUser: currentUser
    });
  }

  openFeedbackForm() {
    if (!this.isLoggedIn) {
      return;
    }
    this.closeAllModals();
    this.showFeedbackForm = true;
  }

  openFeedbackList() {
    if (!this.isLoggedIn) {
      return;
    }
    this.closeAllModals();
    this.showFeedbackList = true;
  }

  openAdminFeedback() {
    if (!this.isAdmin) {
      return;
    }
    this.closeAllModals();
    this.showAdminFeedback = true;
  }

  closeAllModals() {
    this.showFeedbackForm = false;
    this.showFeedbackList = false;
    this.showAdminFeedback = false;
  }

  onFeedbackSubmitted() {
    // Refresh user state if needed
    this.updateUserState();
  }

  canSendFeedback(): boolean {
    return this.isLoggedIn && (this.isStudent || this.isInstructor);
  }

  canViewFeedback(): boolean {
    return this.isLoggedIn && (this.isStudent || this.isInstructor);
  }

  canManageFeedback(): boolean {
    return this.isLoggedIn && this.isAdmin;
  }
} 