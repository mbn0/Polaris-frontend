import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http"
import { Observable, throwError } from "rxjs"
import { catchError, tap } from "rxjs/operators"
import { environment } from "../environments/environment"

export interface User {
  id: string
  email: string
  fullName: string
  roles: string[]
}

export interface Section {
  sectionId: number
  instructorId: string
  instructorName: string
  students: StudentBrief[]
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
}

export interface CreateSectionDto {
  instructorUserId: string
}

export interface UpdateSectionDto {
  instructorUserId: string
}

export interface InstructorDto {
  id: number
  userId: string
  name: string
  email: string
  sectionsCount: number
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
      errorMessage = `Error: ${error.error.message}`
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
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
    return this.http.delete<void>(`${this.apiUrl}/sections/${id}`).pipe(
      catchError(this.handleError)
    )
  }

  addStudentToSection(sectionId: number, studentId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/sections/${sectionId}/students/${studentId}`, {}).pipe(
      catchError(this.handleError)
    )
  }

  removeStudentFromSection(sectionId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sections/${sectionId}/students/${studentId}`).pipe(
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
}

