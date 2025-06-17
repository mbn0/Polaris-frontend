import { Component, type OnInit } from "@angular/core"
import type { Chapter } from "./chapter.model"
import { Router } from "@angular/router"
import { CommonModule, DecimalPipe } from "@angular/common"
import { AuthService } from "../auth.service"
import type { RegisterResponse } from "../auth.service"

@Component({
  selector: "app-dashboard",
  templateUrl: "./student-dashboard.component.html",
  styleUrls: ["./student-dashboard.component.css"],
  providers: [DecimalPipe],
  imports: [CommonModule]
})
export class StudentDashboardComponent implements OnInit {
  user: RegisterResponse | null = null
  selectedFilter = "All"

  chapters: Chapter[] = [
    { id: 1, title: "Introduction to Cryptography", description: "Basic concepts and definitions", topics: ["Symmetric vs Asymmetric", "Hashing", "Digital Signatures"], difficulty: "Beginner", estimatedTime: "1-2 hours", completed: false },
    { id: 2, title: "Symmetric-Key Cryptography", description: "Algorithms for encryption and decryption using a single key", topics: ["AES", "DES", "Triple DES", "Block Cipher Modes"], difficulty: "Intermediate", estimatedTime: "2-3 hours", completed: false },
    { id: 3, title: "Asymmetric-Key Cryptography", description: "Algorithms for encryption and decryption using key pairs", topics: ["RSA", "Diffie-Hellman", "ECC"], difficulty: "Intermediate", estimatedTime: "2-3 hours", completed: false },
    { id: 4, title: "Hashing Algorithms", description: "One-way functions for data integrity", topics: ["SHA-256", "SHA-3", "MD5 (deprecated)"], difficulty: "Beginner", estimatedTime: "1 hour", completed: false },
    { id: 5, title: "Digital Signatures", description: "Ensuring authenticity and integrity of digital documents", topics: ["RSA Signatures", "ECDSA", "Digital Certificates"], difficulty: "Intermediate", estimatedTime: "2 hours", completed: false },
    { id: 6, title: "Message Authentication Codes (MACs)", description: "Techniques for verifying message integrity and authenticity", topics: ["HMAC", "CMAC", "Poly1305"], difficulty: "Intermediate", estimatedTime: "2 hours", completed: false },
    { id: 7, title: "Key Exchange Protocols", description: "Methods for securely exchanging cryptographic keys", topics: ["Diffie-Hellman Key Exchange", "Elliptic-Curve Diffie-Hellman (ECDH)", "Key Derivation Functions (KDFs)"], difficulty: "Intermediate", estimatedTime: "2-3 hours", completed: false },
    { id: 8, title: "Public Key Infrastructure (PKI)", description: "Framework for managing digital certificates and public keys", topics: ["Certificate Authorities (CAs)", "Certificate Revocation Lists (CRLs)", "X.509 Certificates"], difficulty: "Advanced", estimatedTime: "3-4 hours", completed: false },
    { id: 9, title: "Cryptographic Attacks", description: "Common attacks on cryptographic systems and how to prevent them", topics: ["Brute-Force Attacks", "Dictionary Attacks", "Man-in-the-Middle Attacks", "Side-Channel Attacks"], difficulty: "Advanced", estimatedTime: "3-4 hours", completed: false },
    { id: 10, title: "Random Number Generation", description: "Importance of randomness in cryptography and methods for generating secure random numbers", topics: ["True Random Number Generators (TRNGs)", "Pseudo-Random Number Generators (PRNGs)", "Cryptographically Secure PRNGs (CSPRNGs)"], difficulty: "Intermediate", estimatedTime: "2-3 hours", completed: false },
    { id: 11, title: "Block Cipher Modes of Operation", description: "Different modes for using block ciphers to encrypt larger amounts of data", topics: ["CBC", "CTR", "GCM", "ECB (avoid)"], difficulty: "Intermediate", estimatedTime: "2-3 hours", completed: false },
    { id: 12, title: "Authenticated Encryption", description: "Combining encryption with authentication to provide both confidentiality and integrity", topics: ["AES-GCM", "ChaCha20-Poly1305"], difficulty: "Intermediate", estimatedTime: "2-3 hours", completed: false },
    { id: 13, title: "Elliptic Curve Cryptography (ECC)", description: "Cryptography based on the algebraic structure of elliptic curves over finite fields", topics: ["Elliptic Curve Digital Signature Algorithm (ECDSA)", "Elliptic Curve Diffie-Hellman (ECDH)"], difficulty: "Advanced", estimatedTime: "3-4 hours", completed: false },
    { id: 14, title: "Post-Quantum Cryptography", description: "Cryptography that is secure against attacks from quantum computers", topics: ["NIST PQC Competition", "Lattice-based Cryptography", "Code-based Cryptography", "Multivariate Cryptography", "Hash-based Signatures"], difficulty: "Advanced", estimatedTime: "4-5 hours", completed: false },
    { id: 15, title: "Zero-Knowledge Proofs", description: "Proving knowledge of a secret without revealing the secret itself", topics: ["ZK-SNARKs", "ZK-STARKs", "Sigma Protocols"], difficulty: "Advanced", estimatedTime: "3-4 hours", completed: false },
    { id: 16, title: "Homomorphic Encryption", description: "Computing on encrypted data without decryption", topics: ["Paillier Cryptosystem", "FHE Schemes", "BGV/BFV/CKKS", "Bootstrapping", "Privacy-Preserving ML"], difficulty: "Expert", estimatedTime: "3-4 hours", completed: false }
  ]

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue
  }

  setFilter(difficulty: string) {
    this.selectedFilter = difficulty
  }

  getFilteredChapters(): Chapter[] {
    if (this.selectedFilter === "All") {
      return this.chapters
    }
    return this.chapters.filter((chapter) => chapter.difficulty === this.selectedFilter)
  }

  getChaptersByDifficulty(difficulty: string): Chapter[] {
    return this.chapters.filter(chapter => chapter.difficulty === difficulty)
  }

  getDifficultyColor(difficulty: string): string {
    const colors = {
      'Beginner': '#10b981',
      'Intermediate': '#f59e0b',
      'Advanced': '#f97316',
      'Expert': '#ef4444'
    }
    return colors[difficulty as keyof typeof colors] || '#6b7280'
  }

  navigateToChapter(chapter: Chapter) {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    
    if (!chapter.locked) {
      this.router.navigate([`/Chapter${chapter.id}`])
    }
  }

  logout() {
    this.authService.logout()
    this.router.navigate(["/login"])
  }

  trackByChapterId(index: number, chapter: Chapter): number {
    return chapter.id
  }
}
