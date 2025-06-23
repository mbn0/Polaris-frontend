import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService, MyFeedbackResponse } from '../../core/services/feedback/feedback.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-feedback-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./feedback-list.component.css']
})
export class FeedbackListComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  feedbackList: MyFeedbackResponse[] = [];
  isLoading = false;
  errorMessage = '';
  isLoggedIn = false;

  constructor(
    private feedbackService: FeedbackService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.loadMyFeedback();
    }
  }

  loadMyFeedback() {
    this.isLoading = true;
    this.errorMessage = '';

    this.feedbackService.getMyFeedback().subscribe({
      next: (feedback) => {
        this.feedbackList = feedback.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load feedback. Please try again.';
        this.isLoading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onClose() {
    this.close.emit();
  }

  onRefresh() {
    this.loadMyFeedback();
  }
} 