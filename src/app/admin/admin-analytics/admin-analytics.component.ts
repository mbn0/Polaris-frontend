import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatTooltipModule } from '@angular/material/tooltip'
import { AdminService, AnalyticsData } from "../../core/services/admin/admin.service"
import { TooltipService } from "../../services/tooltip.service"
import { Subscription } from 'rxjs'

interface DashboardStats {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalSections: number
}

@Component({
  selector: "app-admin-analytics",
  standalone: true,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: "./admin-analytics.component.html",
  styleUrls: ["./admin-analytics.component.css"],
})
export class AdminAnalyticsComponent implements OnInit, OnDestroy {
  analytics: AnalyticsData = {
    userGrowth: [],
    roleDistribution: [],
    sectionStats: [],
    recentActivity: [],
  }
  stats: DashboardStats = {
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalSections: 0,
  }
  loading = true
  error: string | null = null

  // Tooltip management
  showTooltips: boolean = false
  private tooltipSubscription?: Subscription

  constructor(
    private adminService: AdminService,
    private tooltipService: TooltipService
  ) {}

  ngOnInit() {
    this.loadAnalytics()
    this.tooltipSubscription = this.tooltipService.tooltipState$.subscribe(state => {
      this.showTooltips = state
    })
  }

  ngOnDestroy() {
    if (this.tooltipSubscription) {
      this.tooltipSubscription.unsubscribe()
    }
  }

  loadAnalytics() {
    this.loading = true
    this.error = null

    // Load both analytics data and stats data from the backend
    Promise.all([
      this.adminService.getAnalytics().toPromise(),
      this.adminService.getUsers().toPromise(),
      this.adminService.getSections().toPromise(),
    ])
      .then(([analytics, users, sections]) => {
        if (!analytics || !users || !sections) {
          throw new Error("Failed to load analytics data")
        }

        this.analytics = analytics
        
        // Calculate stats
        const students = users.filter((user) => user.roles.includes("Student"))
        const instructors = users.filter((user) => user.roles.includes("Instructor"))

        this.stats = {
          totalUsers: users.length,
          totalStudents: students.length,
          totalInstructors: instructors.length,
          totalSections: sections.length,
        }

        this.loading = false
        console.log('Analytics data loaded:', analytics)
      })
      .catch((error) => {
        this.error = error.message || 'Failed to load analytics data'
        this.loading = false
        console.error('Error loading analytics:', error)
      })
  }



  getMaxUserCount(): number {
    return Math.max(...this.analytics.userGrowth.map((item) => item.users))
  }

  getBarHeight(count: number): string {
    const maxCount = this.getMaxUserCount()
    const percentage = (count / maxCount) * 100
    return `${Math.max(percentage, 10)}%` // Minimum 10% height for visibility
  }

  getTrendIcon(trend: "up" | "down" | "stable"): string {
    switch (trend) {
      case "up":
        return "📈"
      case "down":
        return "📉"
      case "stable":
        return "➡️"
      default:
        return "📊"
    }
  }

  getTrendColor(trend: "up" | "down" | "stable"): string {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      case "stable":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }
}

