import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService, FeedbackResponse } from '../../core/services/feedback/feedback.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-admin-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-feedback.component.html',
  styleUrls: ['./admin-feedback.component.css']
})
export class AdminFeedbackComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  feedbackList: FeedbackResponse[] = [];
  filteredFeedbackList: FeedbackResponse[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isAdmin = false;
  
  activeTab: 'all' | 'unresolved' = 'all';
  selectedRole: 'all' | 'Student' | 'Instructor' = 'all';
  searchTerm = '';

  constructor(
    private feedbackService: FeedbackService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.isAdmin();
    if (this.isAdmin) {
      this.loadFeedback();
    }
  }

  loadFeedback() {
    this.isLoading = true;
    this.errorMessage = '';

    const loadFeedbackObservable = this.activeTab === 'all' 
      ? this.feedbackService.getAllFeedback()
      : this.feedbackService.getUnresolvedFeedback();

    loadFeedbackObservable.subscribe({
      next: (feedback) => {
        this.feedbackList = feedback.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to load feedback. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.feedbackList];

    // Filter by role
    if (this.selectedRole !== 'all') {
      filtered = filtered.filter(feedback => feedback.userRole === this.selectedRole);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(feedback => 
        feedback.subject.toLowerCase().includes(searchLower) ||
        feedback.message.toLowerCase().includes(searchLower) ||
        feedback.userFullName.toLowerCase().includes(searchLower) ||
        feedback.userEmail.toLowerCase().includes(searchLower)
      );
    }

    this.filteredFeedbackList = filtered;
  }

  onTabChange(tab: 'all' | 'unresolved') {
    this.activeTab = tab;
    this.loadFeedback();
  }

  onRoleFilterChange(role: 'all' | 'Student' | 'Instructor') {
    this.selectedRole = role;
    this.applyFilters();
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.applyFilters();
  }

  toggleResolveStatus(feedback: FeedbackResponse) {
    const action = feedback.isResolved ? 'unresolve' : 'resolve';
    const serviceCall = feedback.isResolved 
      ? this.feedbackService.unresolveFeedback(feedback.feedbackId)
      : this.feedbackService.resolveFeedback(feedback.feedbackId);

    serviceCall.subscribe({
      next: () => {
        feedback.isResolved = !feedback.isResolved;
        this.showSuccessMessage(`Feedback ${action}d successfully`);
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = error.message || `Failed to ${action} feedback. Please try again.`;
      }
    });
  }

  deleteFeedback(feedback: FeedbackResponse) {
    if (!confirm(`Are you sure you want to delete this feedback from ${feedback.userFullName}?`)) {
      return;
    }

    this.feedbackService.deleteFeedback(feedback.feedbackId).subscribe({
      next: () => {
        this.feedbackList = this.feedbackList.filter(f => f.feedbackId !== feedback.feedbackId);
        this.applyFilters();
        this.showSuccessMessage('Feedback deleted successfully');
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to delete feedback. Please try again.';
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

  showSuccessMessage(message: string) {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  onClose() {
    this.close.emit();
  }

  onRefresh() {
    this.loadFeedback();
  }

  get unresolvedCount(): number {
    return this.feedbackList.filter(f => !f.isResolved).length;
  }
} 