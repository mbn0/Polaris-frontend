import { Component, OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { AdminService, Section, User, InstructorDto } from "../../core/services/admin/admin.service"

interface StudentBrief {
  userId: string
  fullName: string
  matricNo: string
}

@Component({
  selector: "app-section-management",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./section-management.component.html",
  styleUrls: ["./section-management.component.css"],
})
export class SectionManagementComponent implements OnInit {
  sections: Section[] = []
  instructors: InstructorDto[] = []
  availableStudents: StudentBrief[] = []
  loading = true
  error: string | null = null
  showCreateModal = false
  showEditModal = false
  showStudentModal = false
  selectedSection: Section | null = null

  newSection = {
    instructorUserId: "",
  }

  isSubmitting = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadSections()
    this.loadInstructors()
    this.loadAvailableStudents()
  }

  loadSections() {
    this.adminService.getSections().subscribe({
      next: (sections) => {
        this.sections = sections
      },
      error: (error) => console.error("Error loading sections:", error),
    })
  }

  loadInstructors() {
    this.adminService.getInstructors().subscribe({
      next: (instructors) => {
        console.log('Loaded instructors:', instructors);
        this.instructors = instructors;
      },
      error: (error) => {
        console.error("Error loading instructors:", error);
        this.error = "Failed to load instructors";
      },
    })
  }

  loadAvailableStudents() {
    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.availableStudents = users
          .filter((user) => user.roles.includes("Student"))
          .map((user) => ({
            userId: user.id,
            fullName: user.fullName,
            matricNo: user.email,
          }))
      },
      error: (error) => console.error("Error loading students:", error),
    })
  }

  openCreateModal() {
    this.newSection = { instructorUserId: "" }
    this.showCreateModal = true
  }

  closeCreateModal() {
    this.showCreateModal = false
    this.error = null
    this.newSection = { instructorUserId: "" }
  }

  openEditModal(section: Section) {
    this.selectedSection = { ...section }
    this.showEditModal = true
  }

  closeEditModal() {
    this.showEditModal = false
    this.selectedSection = null
  }

  openStudentModal(section: Section) {
    this.selectedSection = section
    this.showStudentModal = true
  }

  closeStudentModal() {
    this.showStudentModal = false
    this.selectedSection = null
  }

  createSection() {
    if (!this.newSection.instructorUserId) {
      this.error = "Please select an instructor";
      return;
    }

    // Verify instructor exists in our list
    console.log('Selected instructor ID:', this.newSection.instructorUserId);
    console.log('Available instructors:', this.instructors);
    const instructorExists = this.instructors.some(i => i.userId === this.newSection.instructorUserId);
    if (!instructorExists) {
      this.error = "Selected instructor is not valid";
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const payload = {
      instructorUserId: this.newSection.instructorUserId
    };

    console.log('Creating section with payload:', payload);

    this.adminService.createSection(payload).subscribe({
      next: (response) => {
        console.log('Section created successfully:', response);
        this.loadSections();
        this.closeCreateModal();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error("Error creating section:", error);
        this.error = error.message || "Failed to create section. Please try again.";
        this.isSubmitting = false;
      },
    });
  }

  updateSection() {
    if (this.selectedSection) {
      this.adminService
        .updateSection(this.selectedSection.sectionId, {
          instructorUserId: this.selectedSection.instructorId,
        })
        .subscribe({
          next: () => {
            this.loadSections()
            this.closeEditModal()
          },
          error: (error) => console.error("Error updating section:", error),
        })
    }
  }

  deleteSection(sectionId: number) {
    if (confirm("Are you sure you want to delete this section?")) {
      this.adminService.deleteSection(sectionId).subscribe({
        next: () => {
          this.loadSections()
        },
        error: (error) => console.error("Error deleting section:", error),
      })
    }
  }

  addStudentToSection(userId: string) {
    if (this.selectedSection) {
      this.adminService.addStudentToSection(this.selectedSection.sectionId, userId).subscribe({
        next: () => {
          this.loadSections()
          this.closeStudentModal()
        },
        error: (error) => console.error("Error adding student to section:", error),
      })
    }
  }

  removeStudentFromSection(userId: string) {
    if (this.selectedSection) {
      this.adminService.removeStudentFromSection(this.selectedSection.sectionId, userId).subscribe({
        next: () => {
          this.loadSections()
        },
        error: (error) => console.error("Error removing student from section:", error),
      })
    }
  }

  getInstructorName(instructorId: string): string {
    const instructor = this.instructors.find((i) => i.userId === instructorId)
    return instructor ? instructor.fullName : "Unknown"
  }

  getUnassignedStudents(): StudentBrief[] {
    const assignedUserIds = this.sections.flatMap((s) => s.students.map((st) => st.userId))
    return this.availableStudents.filter((student) => !assignedUserIds.includes(student.userId))
  }
}