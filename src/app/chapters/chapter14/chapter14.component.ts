import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"

interface AuthenticationFactor {
  type: "knowledge" | "possession" | "inherence"
  name: string
  examples: string[]
  security: "Low" | "Medium" | "High"
  usability: "High" | "Medium" | "Low"
}

interface ChallengeResponseDemo {
  challenge: string
  response: string
  method: string
  verified: boolean
}

interface BiometricMetrics {
  technique: string
  far: number // False Accept Rate
  frr: number // False Reject Rate
  accuracy: number
}



@Component({
  selector: "app-chapter14",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chapter14.component.html",
  styleUrls: ["./chapter14.component.css"],
})
export class Chapter14Component implements OnInit {
  currentSection = 1
  totalSections = 7

  // Authentication Factors Data
  authFactors: AuthenticationFactor[] = [
    {
      type: "knowledge",
      name: "Something You Know",
      examples: ["Passwords", "PINs", "Security Questions", "Passphrases"],
      security: "Medium",
      usability: "High",
    },
    {
      type: "possession",
      name: "Something You Have",
      examples: ["Smart Cards", "Hardware Tokens", "Mobile Phones", "USB Keys"],
      security: "High",
      usability: "Medium",
    },
    {
      type: "inherence",
      name: "Something You Are",
      examples: ["Fingerprints", "Iris Scans", "Voice Recognition", "Facial Recognition"],
      security: "High",
      usability: "Medium",
    },
  ]

  // Password Demo
  passwordInput = ""
  saltInput = ""
  hashedPassword = ""
  storedHash = ""
  loginAttempt = ""
  loginResult = ""



  // Challenge-Response Demo
  challengeResponseDemo: ChallengeResponseDemo = {
    challenge: "",
    response: "",
    method: "AES",
    verified: false,
  }
  sharedKey = "secretkey123456"

  // Biometric Metrics
  biometricData: BiometricMetrics[] = [
    { technique: "Fingerprint", far: 0.001, frr: 0.02, accuracy: 98.5 },
    { technique: "Iris Scan", far: 0.0001, frr: 0.005, accuracy: 99.7 },
    { technique: "Face Recognition", far: 0.01, frr: 0.05, accuracy: 95.0 },
    { technique: "Voice Recognition", far: 0.02, frr: 0.08, accuracy: 92.0 },
    { technique: "Keystroke Dynamics", far: 0.05, frr: 0.15, accuracy: 88.0 },
  ]



  constructor(private router: Router) {}

  ngOnInit() {
    this.generateChallenge()
  }

  // Navigation Methods
  nextSection() {
    if (this.currentSection < this.totalSections) {
      this.currentSection++
    }
  }

  prevSection() {
    if (this.currentSection > 1) {
      this.currentSection--
    }
  }

  goToSection(section: number) {
    this.currentSection = section
  }

  // Password Hashing Demo
  async hashPassword() {
    if (!this.passwordInput || !this.saltInput) return

    const combined = this.saltInput + this.passwordInput
    this.hashedPassword = await this.simpleHash(combined)
    this.storedHash = this.hashedPassword
  }

  async verifyLogin() {
    if (!this.loginAttempt || !this.storedHash) return

    const attemptHash = await this.simpleHash(this.saltInput + this.loginAttempt)
    this.loginResult = attemptHash === this.storedHash ? "SUCCESS" : "FAILED"
  }



  // Challenge-Response Demo
  generateChallenge() {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(7)
    this.challengeResponseDemo.challenge = timestamp + random
  }

  generateResponse() {
    const challenge = this.challengeResponseDemo.challenge
    const key = this.sharedKey

    switch (this.challengeResponseDemo.method) {
      case "AES":
        this.challengeResponseDemo.response = this.simpleEncrypt(challenge, key)
        break
      case "HMAC":
        this.challengeResponseDemo.response = this.simpleHMAC(challenge, key)
        break
      case "RSA":
        this.challengeResponseDemo.response = this.simpleSign(challenge)
        break
    }
  }

  verifyResponse() {
    const challenge = this.challengeResponseDemo.challenge
    const response = this.challengeResponseDemo.response
    const key = this.sharedKey

    let expected = ""
    switch (this.challengeResponseDemo.method) {
      case "AES":
        expected = this.simpleEncrypt(challenge, key)
        break
      case "HMAC":
        expected = this.simpleHMAC(challenge, key)
        break
      case "RSA":
        expected = this.simpleSign(challenge)
        break
    }

    this.challengeResponseDemo.verified = response === expected
  }

  // Biometric Analysis
  calculateROCPoint(technique: string, threshold: number): { far: number; frr: number } {
    const base = this.biometricData.find((b) => b.technique === technique)
    if (!base) return { far: 0, frr: 0 }

    // Simulate threshold adjustment
    const far = base.far * (1 - threshold)
    const frr = base.frr * threshold

    return { far, frr }
  }

  getBiometricColor(accuracy: number): string {
    if (accuracy >= 95) return "#28a745"
    if (accuracy >= 90) return "#ffc107"
    return "#dc3545"
  }



  // Utility Methods
  private async simpleHash(input: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .substring(0, 16)
  }

  private simpleHashSync(input: string): string {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, "0")
  }

  private simpleEncrypt(text: string, key: string): string {
    let result = ""
    for (let i = 0; i < text.length; i++) {
      const textChar = text.charCodeAt(i)
      const keyChar = key.charCodeAt(i % key.length)
      result += String.fromCharCode(textChar ^ keyChar)
    }
    return btoa(result)
  }

  private simpleHMAC(message: string, key: string): string {
    return this.simpleHashSync(key + message + key)
  }

  private simpleSign(message: string): string {
    return "SIG_" + this.simpleHashSync("privatekey" + message)
  }

  goToDashboard() {
    this.router.navigate(["/dashboard"])
  }
}

