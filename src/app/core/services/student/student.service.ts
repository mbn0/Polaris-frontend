import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import type { Observable } from "rxjs"
import { environment } from "../../../../environments/environment"

interface Assessment {
  assessmentId: number
  title: string
  description: string
  dueDate: string
  maxScore: number
}

interface AssessmentVisibility {
  assessmentVisibilityId: number
  assessmentId: number
  sectionId: number
  isVisible: boolean
  assessment: Assessment
}

interface Instructor {
  instructorId: number
  userId: string
  user: {
    id: string
    fullName: string
    email: string
  }
}

interface Section {
  sectionId: number
  instructorId: number
  instructor: Instructor
  assessmentVisibilities: AssessmentVisibility[]
}

export interface StudentProfile {
  studentId: number
  matricNo: string
  email: string
  fullName: string
  sectionId?: number
  sectionName: string
}

@Injectable({
  providedIn: "root",
})
export class StudentService {
  private apiUrl = environment.apiUrl + "/api/student"

  constructor(private http: HttpClient) {}

  getCurrentSection(): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/sections/current`)
  }

  getSection(sectionId: number): Observable<Section> {
    return this.http.get<Section>(`${this.apiUrl}/sections/${sectionId}`)
  }

  getProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.apiUrl}/profile`)
  }
}
