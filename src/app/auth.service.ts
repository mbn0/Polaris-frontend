import { Injectable, PLATFORM_ID, Inject } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { BehaviorSubject, Observable, throwError } from "rxjs"
import { map, catchError } from "rxjs/operators"
import { Router } from "@angular/router"
import { environment } from "../environments/environment"
import { isPlatformBrowser } from "@angular/common"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  matricNo?: string
}

export interface RegisterResponse {
  id: string
  email: string
  fullName: string
  roles: string[]
  token: string
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<RegisterResponse | null>
  public currentUser: Observable<RegisterResponse | null>
  private apiUrl = environment.apiUrl + "/api/auth"

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    const storedUser = isPlatformBrowser(this.platformId) ? localStorage.getItem("currentUser") : null
    this.currentUserSubject = new BehaviorSubject<RegisterResponse | null>(storedUser ? JSON.parse(storedUser) : null)
    this.currentUser = this.currentUserSubject.asObservable()
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = "An error occurred"
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
    }
    return throwError(() => new Error(errorMessage))
  }

  public get currentUserValue(): RegisterResponse | null {
    return this.currentUserSubject.value
  }

  login(credentials: LoginRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map((user) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem("currentUser", JSON.stringify(user))
        }
        this.currentUserSubject.next(user)
        return user
      }),
      catchError(this.handleError)
    )
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
      map((user) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem("currentUser", JSON.stringify(user))
        }
        this.currentUserSubject.next(user)
        return user
      }),
      catchError(this.handleError)
    )
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("currentUser")
    }
    this.currentUserSubject.next(null)
    this.router.navigate(["/login"])
  }

  getCurrentUser(): RegisterResponse | null {
    return this.currentUserValue
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue
    return user ? user.roles.includes(role) : false
  }

  isAdmin(): boolean {
    return this.hasRole("Admin")
  }

  isInstructor(): boolean {
    return this.hasRole("Instructor")
  }

  isStudent(): boolean {
    return this.hasRole("Student")
  }
}

