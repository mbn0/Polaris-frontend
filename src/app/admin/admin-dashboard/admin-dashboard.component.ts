import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { MatTooltipModule } from '@angular/material/tooltip'
import { AuthService, type RegisterResponse } from "../../core/services/auth/auth.service"
import { AdminService } from "../../core/services/admin/admin.service"
import { TooltipService } from "../../services/tooltip.service"
import { UserManagementComponent } from "../user-management/user-management.component"
import { SectionManagementComponent } from "../section-management/section-management.component"
import { AdminAnalyticsComponent } from "../admin-analytics/admin-analytics.component"

interface DashboardStats {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalSections: number
  recentActivity: Array<{
    action: string
    user: string
    time: string
  }>
}

@Component({
  selector: "app-admin-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    UserManagementComponent,
    SectionManagementComponent,
    AdminAnalyticsComponent,
    MatTooltipModule
  ],
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent implements OnInit {
  activeTab = "analytics"
  user: RegisterResponse | null = null
  loading = true
  error: string | null = null

  // First-time user properties
  isFirstTimeUser = true
  showTooltips = true
  showWelcomeMessage = true
  private readonly TOOLTIPS_DISMISSED_KEY = 'admin-dashboard-tooltips-dismissed'
  private readonly FIRST_VISIT_KEY = 'admin-dashboard-first-visit'
  private readonly WELCOME_MESSAGE_DISMISSED_KEY = 'admin-dashboard-welcome-dismissed'

  stats: DashboardStats = {
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalSections: 0,
    recentActivity: [],
  }

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private tooltipService: TooltipService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.checkFirstTimeUser()
    // Subscribe to tooltip state changes
    this.tooltipService.tooltipState$.subscribe(state => {
      this.showTooltips = state
    })
    this.user = this.authService.getCurrentUser()
    if (!this.user || !this.user.roles?.includes("Admin")) {
      this.router.navigate(["/login"])
      return
    }
    this.loadDashboardStats()
  }

  setActiveTab(tab: string) {
    this.activeTab = tab
  }

  loadDashboardStats() {
    this.loading = true
    this.error = null

    // Load users and sections data
    Promise.all([
      this.adminService.getUsers().toPromise(),
      this.adminService.getSections().toPromise(),
    ])
      .then(([users, sections]) => {
        if (!users || !sections) {
          throw new Error("Failed to load dashboard data")
        }

        const students = users.filter((user) => user.roles.includes("Student"))
        const instructors = users.filter((user) => user.roles.includes("Instructor"))

        this.stats = {
          totalUsers: users.length,
          totalStudents: students.length,
          totalInstructors: instructors.length,
          totalSections: sections.length,
          recentActivity: [
            // In a real application, you would have an API endpoint for recent activity
            // For now, we'll create some activity based on the loaded data
            {
              action: "New student registered",
              user: students[0]?.fullName || "Unknown",
              time: "2 hours ago",
            },
            {
              action: "Section created",
              user: instructors[0]?.fullName || "Unknown",
              time: "4 hours ago",
            },
            {
              action: "User role updated",
              user: users[0]?.fullName || "Unknown",
              time: "1 day ago",
            },
          ],
        }
      })
      .catch((error) => {
        this.error = error.message || "Failed to load dashboard statistics"
        console.error("Error loading dashboard stats:", error)
      })
      .finally(() => {
        this.loading = false
      })
  }

  logout() {
    this.authService.logout()
    this.router.navigate(["/login"])
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
    const newState = !this.showTooltips
    this.tooltipService.setTooltipState(newState)
    localStorage.setItem(this.TOOLTIPS_DISMISSED_KEY, newState ? 'false' : 'true')
    
    // If tooltips are disabled, also hide welcome message
    if (!newState) {
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
