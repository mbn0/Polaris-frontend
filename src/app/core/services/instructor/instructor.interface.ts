export interface Instructor {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string;
    specialization?: string;
    courses?: string[];
    profileImage?: string;
    bio?: string;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
}

export interface InstructorResponse {
    success: boolean;
    data: Instructor | Instructor[];
    message: string;
}

export interface Section {
  sectionId: number
  instructorId: number
  students: Student[]
  assessmentVisibilities: SectionAssessmentVisibility[]
}

export interface Student {
  studentId: number
  matricNo: string
  user: {
    fullName: string
    email: string
  }
  results?: Result[]
}

export interface SectionAssessmentVisibility {
  sectionId: number
  assessmentId: number
  isVisible: boolean
  assessment: Assessment
}

export interface Assessment {
  assessmentID: number  // Keep this as is for instructor interface to match backend
  title: string
  description: string
  MaxScore: number  // PascalCase to match backend
  DueDate: string   // PascalCase to match backend
}

export interface StudentResultDto {
  studentId: number
  matricNo: string
  fullName: string
  results: ResultDto[]
  showDetails?: boolean
}

export interface ResultDto {
  AssessmentId: number  // PascalCase to match backend
  AssessmentTitle: string  // PascalCase to match backend
  Score: number  // PascalCase to match backend
  DateTaken: string  // PascalCase to match backend
}

export interface Result {
  resultId: number
  studentId: number
  assessmentId: number
  score: number
  dateTaken: string
  assessment: Assessment
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
} 