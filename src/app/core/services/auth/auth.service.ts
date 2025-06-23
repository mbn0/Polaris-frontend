import { Injectable, PLATFORM_ID, Inject } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { BehaviorSubject, Observable, throwError } from "rxjs"
import { map, catchError } from "rxjs/operators"
import { Router } from "@angular/router"
import { environment } from "../../../../environments/environment"
import { isPlatformBrowser } from "@angular/common"

export interface LoginRequest {
  email: string 
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  matricNo: string
}

export interface RegisterResponse {
  id: string
  email: string
  fullName: string
  roles: string[]
  token: string
  matricNo?: string
  sectionId?: number
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
    console.log('Constructor - Stored user from localStorage:', storedUser)
    this.currentUserSubject = new BehaviorSubject<RegisterResponse | null>(storedUser ? JSON.parse(storedUser) : null)
    this.currentUser = this.currentUserSubject.asObservable()
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Auth Service Error:', error)
    let errorMessage = "An error occurred"
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
    }
    return throwError(() => new Error(errorMessage))
  }

  public get currentUserValue(): RegisterResponse | null {
    const value = this.currentUserSubject.value
    console.log('Getting current user value:', value)
    return value
  }

  login(credentials: LoginRequest): Observable<RegisterResponse> {
    console.log('Login attempt with email:', credentials.email)
    return this.http.post<RegisterResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map((user) => {
        console.log('Login response:', user)
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem("currentUser", JSON.stringify(user))
          console.log('User stored in localStorage:', localStorage.getItem("currentUser"))
        }
        this.currentUserSubject.next(user)
        return user
      }),
      catchError(this.handleError)
    )
  }

  register(userData: RegisterRequest): Observable<RegisterResponse> {
    console.log('Register attempt:', userData)
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, userData).pipe(
      map((user) => {
        console.log('Register response:', user)
        if (!user.token) {
          throw new Error('Registration successful but no token received');
        }
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem("currentUser", JSON.stringify(user))
          console.log('User stored in localStorage after registration:', localStorage.getItem("currentUser"))
        }
        this.currentUserSubject.next(user)
        return user
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Registration error:', error);
        if (error.status === 400) {
          return throwError(() => new Error(error.error.message || 'Invalid registration data'));
        } else if (error.status === 409) {
          return throwError(() => new Error('A user with this email already exists'));
        }
        return throwError(() => new Error('Registration failed. Please try again later.'));
      })
    )
  }

  logout(): void {
    console.log('Logging out')
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem("currentUser")
    }
    this.currentUserSubject.next(null)
    this.router.navigate(["/login"])
  }

  getCurrentUser(): RegisterResponse | null {
    const user = this.currentUserValue
    console.log('Getting current user:', user)
    return user
  }

  isLoggedIn(): boolean {
    const isLoggedIn = !!this.currentUserValue
    console.log('Checking if logged in:', isLoggedIn)
    return isLoggedIn
  }

  hasRole(role: string): boolean {
    const user = this.currentUserValue
    console.log(`hasRole(${role}) - User:`, user)
    console.log(`hasRole(${role}) - User roles:`, user?.roles)
    const hasRole = user ? user.roles.includes(role) : false
    console.log(`Checking role ${role}:`, hasRole)
    return hasRole
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

