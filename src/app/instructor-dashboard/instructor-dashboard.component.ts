import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { MatTooltipModule } from '@angular/material/tooltip'
import { InstructorService } from "../core/services/instructor/instructor.service"
import type {
  Section,
  StudentResultDto,
  SectionAssessmentVisibility,
  ResultDto
} from "../core/services/instructor/instructor.interface"

@Component({
  selector: "app-instructor-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: "./instructor-dashboard.component.html",
  styleUrls: ["./instructor-dashboard.component.css"],
})
export class InstructorDashboardComponent implements OnInit {
  activeTab: "sections" | "assessments" | "results" = "sections"

  // Sections data
  sections: Section[] = []
  selectedSection: Section | null = null
  loadingSections = false
  sectionsError: string | null = null

  // Assessment visibility data
  assessmentVisibilities: SectionAssessmentVisibility[] = []
  loadingAssessments = false
  assessmentsError: string | null = null
  pendingChanges: Record<number, boolean> = {}

  // Results data
  studentResults: StudentResultDto[] = []
  loadingResults = false
  resultsError: string | null = null

  // Filters and search
  searchTerm = ""
  sortBy: "name" | "matricNo" | "score" = "name"
  sortDirection: "asc" | "desc" = "asc"

  // First-time user properties
  isFirstTimeUser = true
  showTooltips = true
  showWelcomeMessage = true
  private readonly TOOLTIPS_DISMISSED_KEY = 'instructor-dashboard-tooltips-dismissed'
  private readonly FIRST_VISIT_KEY = 'instructor-dashboard-first-visit'
  private readonly WELCOME_MESSAGE_DISMISSED_KEY = 'instructor-dashboard-welcome-dismissed'

  constructor(
    private instructorService: InstructorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.checkFirstTimeUser()
    this.loadSections()
  }

  setActiveTab(tab: "sections" | "assessments" | "results"): void {
    this.activeTab = tab

    if (tab === "assessments" && this.selectedSection) {
      this.loadAssessmentVisibilities(this.selectedSection.sectionId)
    } else if (tab === "results" && this.selectedSection) {
      this.loadSectionResults(this.selectedSection.sectionId)
    }
  }

  loadSections(): void {
    this.loadingSections = true
    this.sectionsError = null

    this.instructorService.getInstructorSections().subscribe({
      next: (sections: Section[]) => {
        this.sections = sections
        if (sections.length > 0 && !this.selectedSection) {
          this.selectedSection = sections[0]
        }
        this.loadingSections = false
      },
      error: (error: Error) => {
        this.sectionsError = "Failed to load sections"
        this.loadingSections = false
        console.error("Error loading sections:", error)
      },
    })
  }

  selectSection(section: Section): void {
    this.selectedSection = section

    // Clear previous data
    this.assessmentVisibilities = []
    this.studentResults = []
    this.pendingChanges = {}

    // Load data for current tab
    if (this.activeTab === "assessments") {
      this.loadAssessmentVisibilities(section.sectionId)
    } else if (this.activeTab === "results") {
      this.loadSectionResults(section.sectionId)
    }
  }

  loadAssessmentVisibilities(sectionId: number): void {
    this.loadingAssessments = true
    this.assessmentsError = null

    this.instructorService.getAssessmentVisibilities(sectionId).subscribe({
      next: (visibilities: SectionAssessmentVisibility[]) => {
        this.assessmentVisibilities = visibilities
        this.loadingAssessments = false
      },
      error: (error: Error) => {
        this.assessmentsError = "Failed to load assessment visibilities"
        this.loadingAssessments = false
        console.error("Error loading assessment visibilities:", error)
      },
    })
  }

  loadSectionResults(sectionId: number): void {
    this.loadingResults = true
    this.resultsError = null

    this.instructorService.getSectionResults(sectionId).subscribe({
      next: (results: StudentResultDto[]) => {
        console.log('Instructor Dashboard - Section results received:', results)
        // Debug individual result properties
        if (results.length > 0 && results[0].results.length > 0) {
          console.log('First result sample:', results[0].results[0])
        }
        this.studentResults = results
        this.loadingResults = false
      },
      error: (error: Error) => {
        this.resultsError = "Failed to load student results"
        this.loadingResults = false
        console.error("Error loading student results:", error)
      },
    })
  }

  toggleAssessmentVisibility(assessmentId: number, currentVisibility: boolean): void {
    if (this.pendingChanges.hasOwnProperty(assessmentId)) {
      // If there's already a pending change, toggle it
      this.pendingChanges[assessmentId] = !this.pendingChanges[assessmentId]
      
      // If the pending change matches the original state, remove it
      if (this.pendingChanges[assessmentId] === currentVisibility) {
        delete this.pendingChanges[assessmentId]
      }
    } else {
      // No pending change exists, create one
      this.pendingChanges[assessmentId] = !currentVisibility
    }
    
    // Debug logging to verify synchronization
    console.log(`Toggled assessment ${assessmentId}: current=${currentVisibility}, new=${this.getAssessmentVisibilityStatus(assessmentId, currentVisibility)}, pending changes:`, this.pendingChanges)
  }

  saveAssessmentChanges(): void {
    if (!this.selectedSection || Object.keys(this.pendingChanges).length === 0) {
      return
    }

    this.loadingAssessments = true

    this.instructorService
      .bulkUpdateAssessmentVisibility(this.selectedSection.sectionId, this.pendingChanges)
      .subscribe({
        next: () => {
          // Update local state
          this.assessmentVisibilities.forEach((av) => {
            if (this.pendingChanges.hasOwnProperty(av.assessmentId)) {
              av.isVisible = this.pendingChanges[av.assessmentId]
            }
          })

          this.pendingChanges = {}
          this.loadingAssessments = false
        },
        error: (error: Error) => {
          this.assessmentsError = "Failed to save changes"
          this.loadingAssessments = false
          console.error("Error saving assessment visibility changes:", error)
        },
      })
  }

  cancelAssessmentChanges(): void {
    this.pendingChanges = {}
  }

  getFilteredStudentResults(): StudentResultDto[] {
    let filtered = this.studentResults

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (student) => student.fullName.toLowerCase().includes(term) || student.matricNo.toLowerCase().includes(term),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (this.sortBy) {
        case "name":
          aValue = a.fullName
          bValue = b.fullName
          break
        case "matricNo":
          aValue = a.matricNo
          bValue = b.matricNo
          break
        case "score":
          aValue = this.getAverageScore(a.results)
          bValue = this.getAverageScore(b.results)
          break
        default:
          aValue = a.fullName
          bValue = b.fullName
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const comparison = aValue.localeCompare(bValue)
        return this.sortDirection === "asc" ? comparison : -comparison
      } else {
        const comparison = (aValue as number) - (bValue as number)
        return this.sortDirection === "asc" ? comparison : -comparison
      }
    })

    return filtered
  }

  getAverageScore(results: ResultDto[]): number {
    if (!results || results.length === 0) {
      return 0
    }
    
    let sum = 0
    results.forEach((result) => {
      const score = this.getResultScore(result)
      sum += score
    })
    
    return sum / results.length
  }

  getResultScore(result: ResultDto): number {
    // Handle both PascalCase and camelCase property names
    return (result as any).Score || (result as any).score || 0
  }

  getResultTitle(result: ResultDto): string {
    // Handle both PascalCase and camelCase property names
    return (result as any).AssessmentTitle || (result as any).assessmentTitle || 'Unknown Assessment'
  }

  getResultDateTaken(result: ResultDto): string {
    // Handle both PascalCase and camelCase property names
    return (result as any).DateTaken || (result as any).dateTaken || new Date().toISOString()
  }

  setSortBy(field: "name" | "matricNo" | "score"): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc"
    } else {
      this.sortBy = field
      this.sortDirection = "asc"
    }
  }

  getSortIcon(field: "name" | "matricNo" | "score"): string {
    if (this.sortBy !== field) return "↕️"
    return this.sortDirection === "asc" ? "↑" : "↓"
  }

  getAssessmentVisibilityStatus(assessmentId: number, currentVisibility: boolean): boolean {
    return this.pendingChanges.hasOwnProperty(assessmentId) ? this.pendingChanges[assessmentId] : currentVisibility
  }

  hasPendingChanges(): boolean {
    return Object.keys(this.pendingChanges).length > 0
  }

  trackByAssessmentId(index: number, item: SectionAssessmentVisibility): number {
    return item.assessmentId;
  }

  exportResults(): void {
    if (!this.studentResults || this.studentResults.length === 0) {
      return
    }

    // Create CSV content
    const headers = ["Student Name", "Matric No", "Assessment", "Score", "Date Taken"]
    const csvContent = [
      headers.join(","),
      ...this.studentResults.flatMap((student) =>
        student.results.map((result) =>
          [
            `"${student.fullName}"`,
            student.matricNo,
            `"${this.getResultTitle(result)}"`,
            this.getResultScore(result),
            new Date(this.getResultDateTaken(result)).toLocaleDateString(),
          ].join(","),
        ),
      ),
    ].join("\n")

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `section-${this.selectedSection?.sectionId}-results.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  logout(): void {
    // Implement logout logic
    this.router.navigate(["/login"])
  }

  getTotalAssessmentsCount(section: Section): number {
    return section?.assessmentVisibilities?.length || 0
  }

  getVisibleAssessmentsCount(section: Section): number {
    if (!section?.assessmentVisibilities?.length) {
      return 0
    }
    return section.assessmentVisibilities.filter(av => av.isVisible).length
  }

  toggleStudentDetails(student: StudentResultDto): void {
    student.showDetails = !student.showDetails
  }

  private checkFirstTimeUser(): void {
    const tooltipsDismissed = localStorage.getItem(this.TOOLTIPS_DISMISSED_KEY)
    const firstVisit = localStorage.getItem(this.FIRST_VISIT_KEY)
    const welcomeMessageDismissed = localStorage.getItem(this.WELCOME_MESSAGE_DISMISSED_KEY)
    
    if (!firstVisit) {
      // First time visiting the dashboard
      this.isFirstTimeUser = true
      this.showTooltips = true
      this.showWelcomeMessage = true
      localStorage.setItem(this.FIRST_VISIT_KEY, 'false')
    } else {
      // Not first time, check settings
      this.isFirstTimeUser = false
      this.showTooltips = tooltipsDismissed !== 'true'
      this.showWelcomeMessage = welcomeMessageDismissed !== 'true' && this.showTooltips
    }
  }

  dismissWelcomeMessage(): void {
    this.showWelcomeMessage = false
    localStorage.setItem(this.WELCOME_MESSAGE_DISMISSED_KEY, 'true')
  }

  toggleTooltips(): void {
    this.showTooltips = !this.showTooltips
    localStorage.setItem(this.TOOLTIPS_DISMISSED_KEY, this.showTooltips ? 'false' : 'true')
    
    // If tooltips are disabled, also hide welcome message
    if (!this.showTooltips) {
      this.showWelcomeMessage = false
    }
  }

  enableTooltips(): void {
    this.showTooltips = true
    localStorage.setItem(this.TOOLTIPS_DISMISSED_KEY, 'false')
  }

  dismissTooltips(): void {
    this.showTooltips = false
    this.showWelcomeMessage = false
    localStorage.setItem(this.TOOLTIPS_DISMISSED_KEY, 'true')
    localStorage.setItem(this.WELCOME_MESSAGE_DISMISSED_KEY, 'true')
  }
}
