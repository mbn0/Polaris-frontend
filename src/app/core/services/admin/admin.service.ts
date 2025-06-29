import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import { environment } from "../../../../environments/environment"

export interface User {
  id: string
  email: string
  fullName: string
  roles: string[]
}

export interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number }>
  roleDistribution: Array<{ role: string; count: number; percentage: number }>
  sectionStats: Array<{ sectionId: number; studentCount: number; instructor: string }>
  recentActivity: Array<{ action: string; count: number; trend: "up" | "down" | "stable" }>
}

export interface Section {
  sectionId: number
  instructorId: string
  instructorName: string
  students: {
    userId: string
    fullName: string
    matricNo: string
  }[]
}

export interface StudentBrief {
  studentId: number
  fullName: string
  matricNo: string
}

export interface CreateUserDto {
  email: string
  fullName: string
  password: string
  roles: string[]
  matricNo?: string
  sectionId?: number
}

export interface UpdateUserDto {
  email: string
  fullName: string
  password?: string | null
  roles: string[]
  matricNo?: string
  sectionId?: number
}

export interface CreateSectionDto {
  instructorUserId: string
}

export interface UpdateSectionDto {
  instructorUserId: string
}

export interface InstructorDto {
  instructorId: number
  userId: string
  fullName: string
  email: string
  sectionsCount?: number
}

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private apiUrl = environment.apiUrl + "/api/Admin"

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('Admin Service Error:', error); // Debug log
    let errorMessage = "An error occurred"
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        // Backend sent a structured error response
        errorMessage = error.error.message
        
        // If there are additional errors, include them
        if (error.error.errors && Array.isArray(error.error.errors)) {
          const additionalErrors = error.error.errors.map((err: any) => err.description || err.message || err).join(', ')
          if (additionalErrors) {
            errorMessage += ` Details: ${additionalErrors}`
          }
        }
      } else if (error.error && typeof error.error === 'string') {
        // Backend sent a string error
        errorMessage = error.error
      } else {
        // Try to extract any meaningful message from the error
        if (error.message) {
          errorMessage = error.message
        } else {
          // Fallback to status code and message
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.statusText || 'Unknown error'}`
        }
      }
    }
    return throwError(() => new Error(errorMessage))
  }

  // User Management
  getUsers(): Observable<User[]> {
    console.log('Fetching users from:', `${this.apiUrl}/users`); // Debug log
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      tap(response => console.log('Users response:', response)), // Debug log
      catchError(this.handleError)
    )
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  createUser(user: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user).pipe(
      catchError(this.handleError)
    )
  }

  updateUser(id: string, user: UpdateUserDto): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}`, user).pipe(
      catchError(this.handleError)
    )
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  // Section Management
  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.apiUrl}/sections`).pipe(
      catchError(this.handleError)
    )
  }

  getSection(id: number): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/sections/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  createSection(section: CreateSectionDto): Observable<Section> {
    const payload = {
      instructorUserId: section.instructorUserId
    };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('Sending request to:', `${this.apiUrl}/sections`);
    console.log('Request payload:', payload);
    console.log('Request headers:', headers);
    
    return this.http.post<Section>(`${this.apiUrl}/sections`, payload, { headers }).pipe(
      tap(response => console.log('Create section response:', response)),
      catchError(error => {
        console.error('Create section error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        return this.handleError(error);
      })
    )
  }

  updateSection(id: number, section: UpdateSectionDto): Observable<Section> {
    return this.http.put<Section>(`${this.apiUrl}/sections/${id}`, section).pipe(
      catchError(this.handleError)
    )
  }

  deleteSection(id: number): Observable<void> {
    console.log('Deleting section:', id); // Debug log
    return this.http.delete<void>(`${this.apiUrl}/sections/${id}`).pipe(
      tap(() => console.log('Section deleted successfully')), // Debug log
      catchError(error => {
        console.error('Delete section error details:', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          message: error.message
        });
        return this.handleError(error);
      })
    )
  }

  addStudentToSection(sectionId: number, userId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/sections/${sectionId}/students/${userId}`, {}).pipe(
      catchError(this.handleError)
    )
  }

  removeStudentFromSection(sectionId: number, userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sections/${sectionId}/students/${userId}`).pipe(
      catchError(this.handleError)
    )
  }

  // Get all instructors
  getInstructors(): Observable<InstructorDto[]> {
    return this.http.get<InstructorDto[]>(`${this.apiUrl}/instructors`).pipe(
      tap(response => console.log('Instructors response:', response)),
      catchError(this.handleError)
    )
  }

  // Analytics Methods
  getAnalytics(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.apiUrl}/analytics`).pipe(
      tap(response => console.log('Analytics response:', response)),
      catchError(this.handleError)
    )
  }

  getUserGrowth(): Observable<Array<{ month: string; users: number }>> {
    return this.http.get<Array<{ month: string; users: number }>>(`${this.apiUrl}/analytics/user-growth`).pipe(
      catchError(this.handleError)
    )
  }

  getRoleDistribution(): Observable<Array<{ role: string; count: number; percentage: number }>> {
    return this.http.get<Array<{ role: string; count: number; percentage: number }>>(`${this.apiUrl}/analytics/role-distribution`).pipe(
      catchError(this.handleError)
    )
  }

  getSectionStats(): Observable<Array<{ sectionId: number; studentCount: number; instructor: string }>> {
    return this.http.get<Array<{ sectionId: number; studentCount: number; instructor: string }>>(`${this.apiUrl}/analytics/section-stats`).pipe(
      catchError(this.handleError)
    )
  }

  getRecentActivity(): Observable<Array<{ action: string; count: number; trend: "up" | "down" | "stable" }>> {
    return this.http.get<Array<{ action: string; count: number; trend: "up" | "down" | "stable" }>>(`${this.apiUrl}/analytics/recent-activity`).pipe(
      catchError(this.handleError)
    )
  }
}

