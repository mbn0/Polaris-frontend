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
  assessmentID: number
  title: string
  description: string
  maxScore: number
  dueDate: string
}

export interface StudentResultDto {
  studentId: number
  matricNo: string
  fullName: string
  results: ResultDto[]
  showDetails?: boolean
}

export interface ResultDto {
  assessmentId: number
  assessmentTitle: string
  score: number
  dateTaken: string
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