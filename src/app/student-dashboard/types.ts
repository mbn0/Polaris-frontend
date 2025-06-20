export interface StudentBrief {
  studentId: number
  fullName: string
  matricNo: string
}

export interface Assessment {
  assessmentId: number
  title: string
  description: string
  dueDate: string
  maxScore: number
}

export interface AssessmentVisibility {
  assessmentVisibilityId: number
  assessmentId: number
  sectionId: number
  isVisible: boolean
  assessment: Assessment
}

export interface Instructor {
  instructorId: number
  userId: string
  user: {
    id: string
    fullName: string
    email: string
  }
}

export interface Section {
  sectionId: number
  instructorId: number
  instructor: Instructor
  assessmentVisibilities: AssessmentVisibility[]
} 