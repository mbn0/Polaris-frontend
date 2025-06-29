import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "../../../../environments/environment"
import { map } from "rxjs"

export interface StudentAssessment {
  assessmentId: number
  title: string
  description: string
  dueDate: string
  maxScore: number
}

interface StudentAssessmentVisibility {
  assessmentVisibilityId: number
  assessmentId: number
  sectionId: number
  isVisible: boolean
  assessment: StudentAssessment
}

interface StudentInstructor {
  instructorId: number
  userId: string
  user: {
    id: string
    fullName: string
    email: string
  }
}

interface StudentSection {
  sectionId: number
  instructor: StudentInstructor
  assessmentVisibilities: StudentAssessmentVisibility[]
}

export interface StudentProfile {
  studentId: number
  matricNo: string
  email: string
  fullName: string
  sectionId?: number
  sectionName: string
}

export interface StudentResult {
  resultId: number
  studentId: number
  assessmentId: number
  assessmentTitle: string
  score: number
  dateTaken: string
  studentName: string
  matricNo: string
}

interface ApiResponse<T> {
  data: T
  success: boolean
  message: string
}

@Injectable({
  providedIn: "root",
})
export class StudentService {
  private apiUrl = environment.apiUrl + "/api/student"

  constructor(private http: HttpClient) {}

  getCurrentSection(): Observable<StudentSection> {
    return this.http.get<StudentSection>(`${this.apiUrl}/sections/current`)
  }

  getSection(sectionId: number): Observable<StudentSection> {
    return this.http.get<StudentSection>(`${this.apiUrl}/sections/${sectionId}`)
  }

  getProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.apiUrl}/profile`)
  }

  getVisibleAssessments(): Observable<StudentAssessment[]> {
    return this.getCurrentSection().pipe(
      map(section => section.assessmentVisibilities
        .filter(av => av.isVisible)
        .map(av => av.assessment)
      )
    )
  }

  getAssessment(assessmentId: number): Observable<StudentAssessment> {
    return this.getCurrentSection().pipe(
      map(section => {
        const assessmentVisibility = section.assessmentVisibilities
          .find(av => av.assessmentId === assessmentId && av.isVisible)
        if (!assessmentVisibility) {
          throw new Error('Assessment not found or not visible')
        }
        return assessmentVisibility.assessment
      })
    )
  }

  submitResult(assessmentId: number, score: number): Observable<any> {
    const submitData = {
      assessmentId: assessmentId,
      score: score,
      dateTaken: new Date().toISOString()
    }
    return this.http.post(`${this.apiUrl}/results`, submitData)
  }

  getMyResults(): Observable<StudentResult[]> {
    return this.http.get<StudentResult[]>(`${this.apiUrl}/results`)
  }
}
