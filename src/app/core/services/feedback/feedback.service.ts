import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface FeedbackRequest {
  subject: string;
  message: string;
}

export interface FeedbackResponse {
  feedbackId: number;
  subject: string;
  message: string;
  createdAt: string;
  isResolved: boolean;
  userFullName: string;
  userEmail: string;
  userRole: string;
}

export interface MyFeedbackResponse {
  feedbackId: number;
  subject: string;
  createdAt: string;
  isResolved: boolean;
  userFullName: string;
  userRole: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = `${environment.apiUrl}/api/feedback`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.token) {
      return new HttpHeaders({
        'Authorization': `Bearer ${currentUser.token}`,
        'Content-Type': 'application/json'
      });
    }
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Create feedback (Students & Instructors)
  createFeedback(feedback: FeedbackRequest): Observable<FeedbackResponse> {
    return this.http.post<FeedbackResponse>(this.apiUrl, feedback, {
      headers: this.getAuthHeaders()
    });
  }

  // Get my feedback (Students & Instructors)
  getMyFeedback(): Observable<MyFeedbackResponse[]> {
    return this.http.get<MyFeedbackResponse[]>(`${this.apiUrl}/my`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get single feedback details
  getFeedbackById(id: number): Observable<FeedbackResponse> {
    return this.http.get<FeedbackResponse>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin-only: Get all feedback
  getAllFeedback(): Observable<FeedbackResponse[]> {
    return this.http.get<FeedbackResponse[]>(this.apiUrl, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin-only: Get unresolved feedback
  getUnresolvedFeedback(): Observable<FeedbackResponse[]> {
    return this.http.get<FeedbackResponse[]>(`${this.apiUrl}/unresolved`, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin-only: Mark as resolved
  resolveFeedback(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/resolve`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin-only: Mark as unresolved
  unresolveFeedback(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/unresolve`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // Admin-only: Delete feedback
  deleteFeedback(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
} 