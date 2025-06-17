import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { AuthService, RegisterResponse } from "../../auth.service"
import { AdminService } from "../../admin.service"
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
    AdminAnalyticsComponent
  ],
  templateUrl: "./admin-dashboard.component.html",
  styleUrls: ["./admin-dashboard.component.css"],
})
export class AdminDashboardComponent implements OnInit {
  activeTab = "overview"
  user: RegisterResponse | null = null
  loading = true
  error: string | null = null

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
    private router: Router,
  ) {}

  ngOnInit() {
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
}
