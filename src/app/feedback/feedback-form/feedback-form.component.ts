import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackService, FeedbackRequest } from '../../core/services/feedback/feedback.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-form.component.html',
  styleUrls: ['./feedback-form.component.css']
})
export class FeedbackFormComponent implements OnInit {
  @Output() feedbackSubmitted = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  feedback: FeedbackRequest = {
    subject: '',
    message: ''
  };

  isSubmitting = false;
  showSuccess = false;
  errorMessage = '';
  isLoggedIn = false;

  constructor(
    private feedbackService: FeedbackService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  get subjectCharCount(): number {
    return this.feedback.subject.length;
  }

  get messageCharCount(): number {
    return this.feedback.message.length;
  }

  get isFormValid(): boolean {
    return this.feedback.subject.trim().length > 0 && 
           this.feedback.subject.length <= 100 &&
           this.feedback.message.trim().length > 0 && 
           this.feedback.message.length <= 1000;
  }

  onSubmit() {
    if (!this.isFormValid || this.isSubmitting || !this.isLoggedIn) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.feedbackService.createFeedback(this.feedback).subscribe({
      next: (response) => {
        this.showSuccess = true;
        this.feedback = { subject: '', message: '' };
        this.feedbackSubmitted.emit();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.showSuccess = false;
          this.close.emit();
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to submit feedback. Please try again.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  onCancel() {
    this.feedback = { subject: '', message: '' };
    this.errorMessage = '';
    this.close.emit();
  }
} 