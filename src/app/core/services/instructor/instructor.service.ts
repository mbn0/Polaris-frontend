import { Injectable } from "@angular/core"
import { HttpClient, HttpErrorResponse } from "@angular/common/http"
import { Observable, catchError, throwError, map } from "rxjs"
import { environment } from "../../../../environments/environment"
import type {
  Section,
  StudentResultDto,
  SectionAssessmentVisibility,
  ApiResponse
} from "./instructor.interface"

@Injectable({
  providedIn: "root",
})
export class InstructorService {
  private readonly apiUrl = `${environment.apiUrl}/api/Instructor`

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    let errorMessage = "An error occurred"
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message
    } else {
      // Server-side error
      errorMessage = error.error?.message || `Error Code: ${error.status}`
    }
    console.error("API Error:", error)
    return throwError(() => new Error(errorMessage))
  }

  // Get all sections assigned to the instructor
  getInstructorSections(): Observable<Section[]> {
    return this.http
      .get<ApiResponse<Section[]>>(`${this.apiUrl}/sections`)
      .pipe(
        catchError(this.handleError),
        map(response => response.data)
      )
  }

  // Get detailed section information including students and their results
  getSectionDetails(sectionId: number): Observable<Section> {
    return this.http
      .get<ApiResponse<Section>>(`${this.apiUrl}/sections/${sectionId}`)
      .pipe(
        catchError(this.handleError),
        map(response => response.data)
      )
  }

  // Get student results for a specific section
  getSectionResults(sectionId: number): Observable<StudentResultDto[]> {
    return this.http
      .get<ApiResponse<StudentResultDto[]>>(`${this.apiUrl}/sections/${sectionId}/results`)
      .pipe(
        catchError(this.handleError),
        map(response => response.data)
      )
  }

  // Get all assessment visibilities for a section
  getAssessmentVisibilities(sectionId: number): Observable<SectionAssessmentVisibility[]> {
    return this.http
      .get<ApiResponse<SectionAssessmentVisibility[]>>(`${this.apiUrl}/sections/${sectionId}/assessments/visibility`)
      .pipe(
        catchError(this.handleError),
        map(response => response.data)
      )
  }

  // Update assessment visibility for a section
  updateAssessmentVisibility(
    sectionId: number,
    assessmentId: number,
    isVisible: boolean,
  ): Observable<SectionAssessmentVisibility> {
    return this.http
      .put<ApiResponse<SectionAssessmentVisibility>>(
        `${this.apiUrl}/sections/${sectionId}/assessments/${assessmentId}/visibility`,
        { isVisible }
      )
      .pipe(
        catchError(this.handleError),
        map(response => response.data)
      )
  }

  // Bulk update assessment visibility for a section
  bulkUpdateAssessmentVisibility(
    sectionId: number,
    assessmentVisibilities: Record<number, boolean>
  ): Observable<void> {
    return this.http
      .put<ApiResponse<void>>(
        `${this.apiUrl}/sections/${sectionId}/assessments/visibility/bulk`,
        assessmentVisibilities
      )
      .pipe(
        catchError(this.handleError),
        map(response => response.data)
      )
  }
}
 