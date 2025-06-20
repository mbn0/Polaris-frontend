import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { AdminService, type User, type CreateUserDto, type UpdateUserDto } from "../../core/services/admin/admin.service"

@Component({
  selector: "app-user-management",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.css"],
})
export class UserManagementComponent implements OnInit {
  users: User[] = []
  filteredUsers: User[] = []
  searchTerm = ""
  selectedRole = "All"
  showCreateModal = false
  showEditModal = false
  selectedUser: User | null = null
  loading = true
  error: string | null = null
  availableRoles = ["Student", "Instructor", "Admin"]

  newUser: CreateUserDto = {
    email: "",
    fullName: "",
    password: "",
    roles: [],
    matricNo: "",
  }

  selectedNewRole = "" // For create modal
  selectedEditRole = "" // For edit modal

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    console.log("UserManagementComponent initialized")
    this.loadUsers()
  }

  loadUsers() {
    console.log("UserManagementComponent initialized")

    this.loading = true
    this.error = null

    this.adminService.getUsers().subscribe({
      next: (users: User[]) => {
        this.users = users
        this.filterUsers()
        this.loading = false
      },
      error: (error: Error) => {
        this.error = error.message || "Failed to load users"
        this.loading = false
        console.error("Error loading users:", error)
      }
    })
  }

  filterUsers() {
    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase())
      const matchesRole = this.selectedRole === "All" || user.roles.includes(this.selectedRole)
      return matchesSearch && matchesRole
    })
  }

  onSearchChange() {
    this.filterUsers()
  }

  onRoleFilterChange() {
    this.filterUsers()
  }

  openCreateModal() {
    this.newUser = {
      email: "",
      fullName: "",
      password: "",
      roles: [],
      matricNo: "",
    }
    this.selectedNewRole = ""
    this.showCreateModal = true
  }

  closeCreateModal() {
    this.showCreateModal = false
    this.selectedNewRole = ""
  }

  openEditModal(user: User) {
    this.selectedUser = { ...user }
    this.selectedEditRole = user.roles[0] || "" // Take the first role as the selected one
    this.showEditModal = true
  }

  closeEditModal() {
    this.showEditModal = false
    this.selectedUser = null
    this.selectedEditRole = ""
  }

  hasRole(role: string, isNewUser = false): boolean {
    if (isNewUser) {
      return this.selectedNewRole === role
    }
    return this.selectedEditRole === role
  }

  setRole(role: string, isNewUser = false) {
    if (isNewUser) {
      this.selectedNewRole = role
      this.newUser.roles = [role]
    } else if (this.selectedUser) {
      this.selectedEditRole = role
      this.selectedUser.roles = [role]
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800"
      case "Instructor":
        return "bg-purple-100 text-purple-800"
      case "Student":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  createUser() {
    if (this.newUser.email && this.newUser.fullName && this.newUser.password && this.selectedNewRole) {
      this.loading = true
      this.error = null

      // Ensure roles array contains only the selected role
      this.newUser.roles = [this.selectedNewRole]

      this.adminService.createUser(this.newUser).subscribe({
        next: () => {
          this.loadUsers()
          this.closeCreateModal()
        },
        error: (error: Error) => {
          this.error = error.message || "Failed to create user"
          this.loading = false
          console.error("Error creating user:", error)
        }
      })
    }
  }

  updateUser() {
    if (this.selectedUser && this.selectedEditRole) {
      this.loading = true
      this.error = null

      const updateData: UpdateUserDto = {
        email: this.selectedUser.email,
        fullName: this.selectedUser.fullName,
        roles: [this.selectedEditRole], // Ensure roles array contains only the selected role
      }

      this.adminService.updateUser(this.selectedUser.id, updateData).subscribe({
        next: () => {
          this.loadUsers()
          this.closeEditModal()
        },
        error: (error: Error) => {
          this.error = error.message || "Failed to update user"
          this.loading = false
          console.error("Error updating user:", error)
        }
      })
    }
  }

  deleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    this.loading = true
    this.error = null

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers()
      },
      error: (error: Error) => {
        this.error = error.message || "Failed to delete user"
        this.loading = false
        console.error("Error deleting user:", error)
      }
    })
  }
}
