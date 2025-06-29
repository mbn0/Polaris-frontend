import { Component, OnInit, OnDestroy } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from "@angular/forms"
import { MatTooltipModule } from '@angular/material/tooltip'
import { AdminService, type User, type CreateUserDto, type UpdateUserDto } from "../../core/services/admin/admin.service"
import { TooltipService } from "../../services/tooltip.service"
import { Subscription } from 'rxjs'

@Component({
  selector: "app-user-management",
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTooltipModule],
  templateUrl: "./user-management.component.html",
  styleUrls: ["./user-management.component.css"],
})
export class UserManagementComponent implements OnInit, OnDestroy {
  // Tooltip management
  showTooltips: boolean = false;
  private tooltipSubscription?: Subscription;

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

  // Reactive forms
  createUserForm: FormGroup
  submitted = false

  newUser: CreateUserDto = {
    email: "",
    fullName: "",
    password: "",
    roles: [],
    matricNo: "",
  }

  selectedNewRole = "" // For create modal
  selectedEditRole = "" // For edit modal

  constructor(
    private adminService: AdminService,
    private tooltipService: TooltipService,
    private fb: FormBuilder
  ) {
    this.createUserForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/)
        ]
      ],
      confirmPassword: ['', [Validators.required]],
      role: ['', [Validators.required]],
      matricNo: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  ngOnInit() {
    console.log("UserManagementComponent initialized")
    this.tooltipSubscription = this.tooltipService.tooltipState$.subscribe(state => {
      this.showTooltips = state
    })
    this.loadUsers()
  }

  ngOnDestroy(): void {
    if (this.tooltipSubscription) {
      this.tooltipSubscription.unsubscribe();
    }
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
    this.createUserForm.reset();
    this.submitted = false;
    this.selectedNewRole = "";
    this.error = null; // Clear any existing errors
    this.showCreateModal = true;
    
    // Reset matricNo validation
    this.createUserForm.get('matricNo')?.clearValidators();
    this.createUserForm.get('matricNo')?.updateValueAndValidity();
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.selectedNewRole = "";
    this.submitted = false;
    this.createUserForm.reset();
  }

  openEditModal(user: User) {
    this.selectedUser = { ...user }
    this.selectedEditRole = user.roles[0] || "" // Take the first role as the selected one
    this.error = null // Clear any existing errors
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
      this.selectedNewRole = role;
      this.createUserForm.get('role')?.setValue(role);
      
      // Handle matricNo validation based on role
      const matricNoControl = this.createUserForm.get('matricNo');
      if (role === 'Student') {
        matricNoControl?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9]+$/)]);
      } else {
        matricNoControl?.clearValidators();
        matricNoControl?.setValue(''); // Clear value when not student
      }
      matricNoControl?.updateValueAndValidity();
    } else if (this.selectedUser) {
      this.selectedEditRole = role;
      this.selectedUser.roles = [role];
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
    this.submitted = true;
    this.error = null;

    if (this.createUserForm.valid) {
      this.loading = true;

      const formValues = this.createUserForm.value;
      const newUser: CreateUserDto = {
        email: formValues.email,
        fullName: formValues.fullName,
        password: formValues.password,
        roles: [this.selectedNewRole],
        matricNo: formValues.matricNo || ""
      };

      this.adminService.createUser(newUser).subscribe({
        next: () => {
          this.loadUsers();
          this.closeCreateModal();
        },
        error: (error: Error) => {
          this.error = error.message || "Failed to create user";
          this.loading = false;
          console.error("Error creating user:", error);
        }
      });
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.createUserForm.controls).forEach(key => {
      const control = this.createUserForm.get(key);
      control?.markAsTouched();
    });
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
    // Find the user to get their role for better confirmation message
    const user = this.users.find(u => u.id === id);
    const userRole = user?.roles?.[0] || 'user';
    
    let confirmMessage = `Are you sure you want to delete this ${userRole.toLowerCase()}?`;
    if (userRole === 'Instructor') {
      confirmMessage += "\n\nNote: Instructors with assigned sections cannot be deleted. Please reassign sections first.";
    }
    if (userRole === 'Student') {
      confirmMessage += "\n\nThis will also delete all of their assessment results.";
    }

    if (!confirm(confirmMessage)) {
      return
    }

    this.loading = true
    this.error = null

    this.adminService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers()
        // Clear any previous error messages on successful deletion
        this.error = null
      },
      error: (error: Error) => {
        this.error = error.message || "Failed to delete user"
        this.loading = false
        console.error("Error deleting user:", error)
      }
    })
  }
}
