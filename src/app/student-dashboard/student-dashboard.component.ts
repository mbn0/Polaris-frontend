import { Component, type OnInit } from "@angular/core"
import type { Chapter } from "./chapter.model"
import { Router } from "@angular/router"
import { CommonModule, DecimalPipe } from "@angular/common"
import { AuthService, type RegisterResponse } from "../core/services/auth/auth.service"
import { StudentService, type StudentProfile } from "../core/services/student/student.service"

// Import interfaces from student service
interface StudentAssessment {
  assessmentId: number
  title: string
  description: string
  maxScore: number
  dueDate: string
}

interface StudentSection {
  sectionId: number
  instructor: {
    instructorId: number
    userId: string
    user: {
      id: string
      fullName: string
      email: string
    }
  }
  assessmentVisibilities: {
    assessmentVisibilityId: number
    assessmentId: number
    sectionId: number
    isVisible: boolean
    assessment: StudentAssessment
  }[]
}

@Component({
  selector: "app-dashboard",
  templateUrl: "./student-dashboard.component.html",
  styleUrls: ["./student-dashboard.component.css"],
  providers: [DecimalPipe],
  imports: [CommonModule],
  standalone: true,
})
export class StudentDashboardComponent implements OnInit {
  user: RegisterResponse | null = null
  studentProfile: StudentProfile | null = null
  selectedFilter = "All"
  activeTab = "classes"
  loadingSections = false
  sectionsError: string | null = null
  currentSection: StudentSection | null = null
  studentSections: StudentSection[] = []
  
  // New properties for assessments
  loadingAssessments = false
  assessmentsError: string | null = null
  visibleAssessments: StudentAssessment[] = []

  chapters: Chapter[] = [
    {
      id: 1,
      title: "Introduction to Cryptography",
      description: "Basic concepts and definitions",
      topics: ["Symmetric vs Asymmetric", "Hashing", "Digital Signatures"],
      difficulty: "Beginner",
      estimatedTime: "1-2 hours",
      completed: false,
    },
    {
      id: 2,
      title: "Symmetric-Key Cryptography",
      description: "Algorithms for encryption and decryption using a single key",
      topics: ["AES", "DES", "Triple DES", "Block Cipher Modes"],
      difficulty: "Intermediate",
      estimatedTime: "2-3 hours",
      completed: false,
    },
    {
      id: 3,
      title: "Asymmetric-Key Cryptography",
      description: "Algorithms for encryption and decryption using key pairs",
      topics: ["RSA", "Diffie-Hellman", "ECC"],
      difficulty: "Intermediate",
      estimatedTime: "2-3 hours",
      completed: false,
    },
    {
      id: 5,
      title: "Digital Signatures",
      description: "Ensuring authenticity and integrity of digital documents",
      topics: ["RSA Signatures", "ECDSA", "Digital Certificates"],
      difficulty: "Intermediate",
      estimatedTime: "2 hours",
      completed: false,
    },
    {
      id: 6,
      title: "Message Authentication Codes (MACs)",
      description: "Techniques for verifying message integrity and authenticity",
      topics: ["HMAC", "CMAC", "Poly1305"],
      difficulty: "Intermediate",
      estimatedTime: "2 hours",
      completed: false,
    },
    {
      id: 7,
      title: "Key Exchange Protocols",
      description: "Methods for securely exchanging cryptographic keys",
      topics: [
        "Diffie-Hellman Key Exchange",
        "Elliptic-Curve Diffie-Hellman (ECDH)",
        "Key Derivation Functions (KDFs)",
      ],
      difficulty: "Intermediate",
      estimatedTime: "2-3 hours",
      completed: false,
    },
    {
      id: 8,
      title: "Public Key Infrastructure (PKI)",
      description: "Framework for managing digital certificates and public keys",
      topics: ["Certificate Authorities (CAs)", "Certificate Revocation Lists (CRLs)", "X.509 Certificates"],
      difficulty: "Advanced",
      estimatedTime: "3-4 hours",
      completed: false,
    },
    {
      id: 9,
      title: "Cryptographic Attacks",
      description: "Common attacks on cryptographic systems and how to prevent them",
      topics: ["Brute-Force Attacks", "Dictionary Attacks", "Man-in-the-Middle Attacks", "Side-Channel Attacks"],
      difficulty: "Advanced",
      estimatedTime: "3-4 hours",
      completed: false,
    },
    {
      id: 10,
      title: "Random Number Generation",
      description: "Importance of randomness in cryptography and methods for generating secure random numbers",
      topics: [
        "True Random Number Generators (TRNGs)",
        "Pseudo-Random Number Generators (PRNGs)",
        "Cryptographically Secure PRNGs (CSPRNGs)",
      ],
      difficulty: "Intermediate",
      estimatedTime: "2-3 hours",
      completed: false,
    },
    {
      id: 11,
      title: "Block Cipher Modes of Operation",
      description: "Different modes for using block ciphers to encrypt larger amounts of data",
      topics: ["CBC", "CTR", "GCM", "ECB (avoid)"],
      difficulty: "Intermediate",
      estimatedTime: "2-3 hours",
      completed: false,
    },
    {
      id: 12,
      title: "Authenticated Encryption",
      description: "Combining encryption with authentication to provide both confidentiality and integrity",
      topics: ["AES-GCM", "ChaCha20-Poly1305"],
      difficulty: "Intermediate",
      estimatedTime: "2-3 hours",
      completed: false,
    },
    {
      id: 13,
      title: "Elliptic Curve Cryptography (ECC)",
      description: "Cryptography based on the algebraic structure of elliptic curves over finite fields",
      topics: ["Elliptic Curve Digital Signature Algorithm (ECDSA)", "Elliptic Curve Diffie-Hellman (ECDH)"],
      difficulty: "Advanced",
      estimatedTime: "3-4 hours",
      completed: false,
    },
    {
      id: 14,
      title: "Post-Quantum Cryptography",
      description: "Cryptography that is secure against attacks from quantum computers",
      topics: [
        "NIST PQC Competition",
        "Lattice-based Cryptography",
        "Code-based Cryptography",
        "Multivariate Cryptography",
        "Hash-based Signatures",
      ],
      difficulty: "Advanced",
      estimatedTime: "4-5 hours",
      completed: false,
    },
    {
      id: 15,
      title: "Zero-Knowledge Proofs",
      description: "Proving knowledge of a secret without revealing the secret itself",
      topics: ["ZK-SNARKs", "ZK-STARKs", "Sigma Protocols"],
      difficulty: "Advanced",
      estimatedTime: "3-4 hours",
      completed: false,
    },
    {
      id: 16,
      title: "Homomorphic Encryption",
      description: "Computing on encrypted data without decryption",
      topics: ["Paillier Cryptosystem", "FHE Schemes", "BGV/BFV/CKKS", "Bootstrapping", "Privacy-Preserving ML"],
      difficulty: "Expert",
      estimatedTime: "3-4 hours",
      completed: false,
    },
  ]

  cryptoTools = [
    {
      id: "des",
      title: "DES Encryption",
      description: "Step-by-step Data Encryption Standard visualization with Feistel network rounds",
      icon: "lock",
      difficulty: "Intermediate",
      features: ["16 Feistel Rounds", "Key Schedule", "Permutation Tables", "Visual Network"],
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "rsa",
      title: "RSA Encryption",
      description: "Interactive RSA key generation, encryption, and decryption with mathematical visualization",
      icon: "key",
      difficulty: "Advanced",
      features: ["Key Generation", "Modular Arithmetic", "Prime Numbers", "Public/Private Keys"],
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "sha256",
      title: "SHA-256 Hashing",
      description: "Complete SHA-256 algorithm breakdown with compression function visualization",
      icon: "shield-check",
      difficulty: "Intermediate",
      features: ["Message Padding", "64 Compression Rounds", "Hash Schedule", "Bitwise Operations"],
      color: "from-green-500 to-teal-600",
    },
    {
      id: "aes",
      title: "AES Encryption",
      description: "Advanced Encryption Standard with SubBytes, ShiftRows, MixColumns, and AddRoundKey operations",
      icon: "shield",
      difficulty: "Advanced",
      features: ["SubBytes Transform", "ShiftRows Operation", "MixColumns Step", "Round Key Addition"],
      color: "from-orange-500 to-red-600",
    },
  ]

  constructor(
    private authService: AuthService,
    private studentService: StudentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue
    this.loadStudentProfile()
    this.loadCurrentSection()
  }

  loadStudentProfile(): void {
    this.studentService.getProfile().subscribe({
      next: (profile) => {
        this.studentProfile = profile
      },
      error: (error) => {
        console.error("Error loading student profile:", error)
      }
    })
  }

  loadCurrentSection(): void {
    this.loadingSections = true
    this.sectionsError = null

    this.studentService.getCurrentSection().subscribe({
      next: (section) => {
        this.currentSection = section
        this.loadingSections = false
        // Store section data
        this.currentSection = section

        // Filter out assessments that are not marked as visible for students
        if (this.currentSection) {
          this.currentSection.assessmentVisibilities = this.currentSection.assessmentVisibilities.filter(
            (av) => av.isVisible,
          )
        }
        // Load visible assessments after section is loaded
        this.loadVisibleAssessments()
      },
      error: (error) => {
        console.error("Error loading current section:", error)
        this.sectionsError = "Failed to load section data. Please try again later."
        this.loadingSections = false
      }
    })
  }

  loadVisibleAssessments(): void {
    this.loadingAssessments = true
    this.assessmentsError = null

    this.studentService.getVisibleAssessments().subscribe({
      next: (assessments) => {
        this.visibleAssessments = assessments
        this.loadingAssessments = false
      },
      error: (error) => {
        console.error("Error loading visible assessments:", error)
        this.assessmentsError = "Failed to load assessments. Please try again later."
        this.loadingAssessments = false
      }
    })
  }

  setActiveTab(tab: "sections" | "classes" | "crypto" | "assessments"): void {
    this.activeTab = tab
    if (tab === "assessments" && this.visibleAssessments.length === 0) {
      this.loadVisibleAssessments()
    }
  }

  loadStudentSections(): void {
    this.loadingSections = true
    this.sectionsError = null

    // TODO: Replace with actual API call when StudentService is ready
    setTimeout(() => {
      this.loadingSections = false
      this.studentSections = []
    }, 1000)
  }

  setFilter(difficulty: string): void {
    this.selectedFilter = difficulty
  }

  getFilteredChapters(): Chapter[] {
    if (this.selectedFilter === "All") {
      return this.chapters
    }
    return this.chapters.filter((chapter) => chapter.difficulty === this.selectedFilter)
  }

  getChaptersByDifficulty(difficulty: string): Chapter[] {
    return this.chapters.filter((chapter) => chapter.difficulty === difficulty)
  }

  getDifficultyColor(difficulty: string): string {
    const colors = {
      Beginner: "#10b981",
      Intermediate: "#f59e0b",
      Advanced: "#f97316",
      Expert: "#ef4444",
    }
    return colors[difficulty as keyof typeof colors] || "#6b7280"
  }

  navigateToChapter(chapter: Chapter): void {
    if (!this.user) {
      this.router.navigate(["/login"])
      return
    }

    if (!chapter.locked) {
      this.router.navigate([`/Chapter${chapter.id}`])
    }
  }

  navigateToCryptoTool(tool: string): void {
    // Navigate to the specific crypto tool
    this.router.navigate([`/${tool}`])
  }

  navigateToAssessment(assessment: StudentAssessment): void {
    if (!this.user) {
      this.router.navigate(["/login"])
      return
    }
    
    // Navigate to the assessment (you may need to create this route)
    this.router.navigate([`/assessment/${assessment.assessmentId}`])
  }

  logout(): void {
    this.authService.logout()
    this.router.navigate(["/login"])
  }

  trackByChapterId(_index: number, chapter: Chapter): number {
    return chapter.id
  }

  getChapterGradientClass(difficulty: string): string {
    const gradients = {
      Beginner: "from-green-400 to-emerald-500",
      Intermediate: "from-blue-400 to-indigo-500",
      Advanced: "from-purple-400 to-pink-500",
      Expert: "from-red-400 to-orange-500",
    }
    return gradients[difficulty as keyof typeof gradients] || "from-gray-400 to-gray-500"
  }

  getChapterNumberClass(id: number, difficulty: string): string {
    const baseClasses = "shadow-lg border-2 border-white/20"
    const difficultyClasses = {
      Beginner: "bg-gradient-to-br from-green-500 to-emerald-600",
      Intermediate: "bg-gradient-to-br from-blue-500 to-indigo-600",
      Advanced: "bg-gradient-to-br from-purple-500 to-pink-600",
      Expert: "bg-gradient-to-br from-red-500 to-orange-600",
    }

    const difficultyClass =
      difficultyClasses[difficulty as keyof typeof difficultyClasses] || "bg-gradient-to-br from-gray-500 to-gray-600"
    return `${baseClasses} ${difficultyClass}`
  }

  getDifficultyBadgeClass(difficulty: string): string {
    const classes = {
      Beginner: "bg-green-100 text-green-800 border border-green-200",
      Intermediate: "bg-blue-100 text-blue-800 border border-blue-200",
      Advanced: "bg-purple-100 text-purple-800 border border-purple-200",
      Expert: "bg-red-100 text-red-800 border border-red-200",
    }
    return classes[difficulty as keyof typeof classes] || "bg-gray-100 text-gray-800 border border-gray-200"
  }

  getDifficultyDotClass(difficulty: string): string {
    const classes = {
      Beginner: "bg-green-500",
      Intermediate: "bg-blue-500",
      Advanced: "bg-purple-500",
      Expert: "bg-red-500",
    }
    return classes[difficulty as keyof typeof classes] || "bg-gray-500"
  }

  getDifficultyStars(difficulty: string): number[] {
    const counts = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
    }
    const count = counts[difficulty as keyof typeof counts] || 1
    return Array(count)
      .fill(0)
      .map((_, i) => i)
  }

  getDifficultyStarClass(difficulty: string): string {
    const classes = {
      Beginner: "bg-green-400",
      Intermediate: "bg-blue-400",
      Advanced: "bg-purple-400",
      Expert: "bg-red-400",
    }
    return classes[difficulty as keyof typeof classes] || "bg-gray-400"
  }

  getDifficultyLevel(difficulty: string): string {
    const levels = {
      Beginner: "Level 1",
      Intermediate: "Level 2",
      Advanced: "Level 3",
      Expert: "Level 4",
    }
    return levels[difficulty as keyof typeof levels] || "Level 1"
  }
}
