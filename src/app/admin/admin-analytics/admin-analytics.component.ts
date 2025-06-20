import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { AdminService } from "../../core/services/admin/admin.service"

interface AnalyticsData {
  userGrowth: Array<{ month: string; users: number }>
  roleDistribution: Array<{ role: string; count: number; percentage: number }>
  sectionStats: Array<{ sectionId: number; studentCount: number; instructor: string }>
  recentActivity: Array<{ action: string; count: number; trend: "up" | "down" | "stable" }>
}

@Component({
  selector: "app-admin-analytics",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./admin-analytics.component.html",
  styleUrls: ["./admin-analytics.component.css"],
})
export class AdminAnalyticsComponent implements OnInit {
  analytics: AnalyticsData = {
    userGrowth: [],
    roleDistribution: [],
    sectionStats: [],
    recentActivity: [],
  }
  loading = true
  error: string | null = null

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadAnalytics()
  }

  loadAnalytics() {
    this.loading = true
    this.error = null

    // In a real application, you would make API calls to get this data
    // For now, we'll simulate loading with a timeout
    setTimeout(() => {
      this.analytics = {
        userGrowth: [
          { month: "Jan", users: 45 },
          { month: "Feb", users: 52 },
          { month: "Mar", users: 61 },
          { month: "Apr", users: 73 },
          { month: "May", users: 89 },
          { month: "Jun", users: 102 },
        ],
        roleDistribution: [
          { role: "Students", count: 120, percentage: 77 },
          { role: "Instructors", count: 15, percentage: 10 },
          { role: "Admins", count: 3, percentage: 2 },
        ],
        sectionStats: [
          { sectionId: 1, studentCount: 25, instructor: "Dr. Smith" },
          { sectionId: 2, studentCount: 22, instructor: "Prof. Johnson" },
          { sectionId: 3, studentCount: 28, instructor: "Dr. Williams" },
          { sectionId: 4, studentCount: 20, instructor: "Prof. Brown" },
        ],
        recentActivity: [
          { action: "User Registration", count: 12, trend: "up" },
          { action: "Section Creation", count: 3, trend: "up" },
          { action: "Student Assignments", count: 8, trend: "down" },
          { action: "Role Changes", count: 2, trend: "stable" },
        ],
      }
      this.loading = false
    }, 1000)
  }

  getMaxUserCount(): number {
    return Math.max(...this.analytics.userGrowth.map((item) => item.users))
  }

  getBarHeight(count: number): string {
    const maxCount = this.getMaxUserCount()
    return `${(count / maxCount) * 100}%`
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

