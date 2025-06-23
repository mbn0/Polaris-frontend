import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"

interface KDCMessage {
  from: string
  to: string
  content: string
  encrypted: boolean
  step: number
}

interface DHExchange {
  p: number
  g: number
  privateA: number
  privateB: number
  publicA: number
  publicB: number
  sharedSecret: number
  step: number
}

interface Certificate {
  version: string
  serialNumber: string
  issuer: string
  subject: string
  publicKey: string
  validity: string
  signature: string
  status: 'valid' | 'revoked' | 'expired'
}

interface TrustModel {
  name: string
  description: string
  advantages: string[]
  disadvantages: string[]
  structure: string
}

@Component({
  selector: "app-chapter15",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chapter15.component.html",
  styleUrls: ["./chapter15.component.css"],
})
export class Chapter15Component implements OnInit {
  // Section tracking
  currentSection = 1
  totalSections = 8
  sectionProgress = 0

  // KDC Protocol Demo
  kdcMessages: KDCMessage[] = []
  kdcStep = 0
  principalA = "Alice"
  principalB = "Bob"
  kdcNonce = ""
  sessionKey = ""
  longTermKeyA = "K_A_secret"
  longTermKeyB = "K_B_secret"

  // Needham-Schroeder Demo
  nsMessages: any[] = []
  nsStep = 0
  nsNonceA = ""
  nsNonceB = ""

  // Kerberos Demo
  kerberosStep = 0
  kerberosMessages: any[] = []
  tgt = ""
  serviceTicket = ""
  authenticator = ""

  // Diffie-Hellman Demo
  dhParams: DHExchange = {
    p: 23,
    g: 7,
    privateA: 0,
    privateB: 0,
    publicA: 0,
    publicB: 0,
    sharedSecret: 0,
    step: 0
  }
  dhCustomP = 23
  dhCustomG = 7
  dhCustomX = 3
  dhCustomY = 6

  // STS Protocol Demo
  stsStep = 0
  stsMessages: any[] = []
  stsSignatureA = ""
  stsSignatureB = ""

  // PKI Demo
  certificates: Certificate[] = [
    {
      version: "v3",
      serialNumber: "0x1A2B3C",
      issuer: "CN=Root CA, O=TrustCorp",
      subject: "CN=Intermediate CA, O=TrustCorp",
      publicKey: "RSA-2048: 30:82:01:0A...",
      validity: "2024-01-01 to 2034-01-01",
      signature: "SHA256withRSA: A1:B2:C3...",
      status: "valid"
    },
    {
      version: "v3",
      serialNumber: "0x4D5E6F",
      issuer: "CN=Intermediate CA, O=TrustCorp",
      subject: "CN=example.com, O=Example Corp",
      publicKey: "RSA-2048: 40:92:1B:0B...",
      validity: "2024-06-01 to 2025-06-01",
      signature: "SHA256withRSA: D4:E5:F6...",
      status: "valid"
    },
    {
      version: "v3",
      serialNumber: "0x7G8H9I",
      issuer: "CN=Root CA, O=TrustCorp",
      subject: "CN=revoked.example.com, O=Example Corp",
      publicKey: "RSA-2048: 70:A2:3C:4D...",
      validity: "2023-01-01 to 2025-01-01",
      signature: "SHA256withRSA: G7:H8:I9...",
      status: "revoked"
    }
  ]

  // Trust Models
  trustModels: TrustModel[] = [
    {
      name: "Hierarchical PKI",
      description: "Tree structure with root CA at top, intermediate CAs below",
      advantages: ["Clear chain of trust", "Scalable", "Well-established"],
      disadvantages: ["Single point of failure", "Root CA compromise catastrophic"],
      structure: "Tree"
    },
    {
      name: "Mesh PKI",
      description: "Multiple CAs cross-certify each other",
      advantages: ["No single point of failure", "Resilient", "Flexible"],
      disadvantages: ["Complex trust relationships", "Difficult to manage"],
      structure: "Graph"
    },
    {
      name: "Web of Trust",
      description: "Decentralized trust based on personal relationships",
      advantages: ["No central authority", "User controlled", "Democratic"],
      disadvantages: ["Difficult to scale", "Trust path complexity"],
      structure: "Network"
    }
  ]

  // Exercise tracking - removed scoring system
  exercises = [
    { id: 1, title: "Design a KDC Workflow" },
    { id: 2, title: "Implement Simple DH" },
    { id: 3, title: "Station-to-Station Simulation" },
    { id: 4, title: "Certificate Chain Validation" },
    { id: 5, title: "Revocation Scenarios" }
  ]

  // Quiz questions
  quizQuestions = [
    {
      question: "What is the main advantage of using a KDC for key distribution?",
      options: [
        "Eliminates need for public-key cryptography",
        "Provides centralized key management with shared secrets",
        "Automatically generates strong keys",
        "Prevents all replay attacks"
      ],
      correct: 1,
      explanation: "A KDC provides centralized key management where each principal shares a long-term secret with the KDC, enabling secure session key distribution."
    },
    {
      question: "In Diffie-Hellman key exchange, what makes the shared secret secure?",
      options: [
        "The prime number p is kept secret",
        "The generator g is randomly chosen",
        "The discrete logarithm problem is hard to solve",
        "The protocol uses encryption"
      ],
      correct: 2,
      explanation: "Security relies on the difficulty of the discrete logarithm problem - even knowing g^x and g^y, computing g^xy is infeasible without knowing x or y."
    },
    {
      question: "What is the primary purpose of a Certificate Revocation List (CRL)?",
      options: [
        "To list all valid certificates",
        "To provide backup copies of certificates",
        "To identify certificates that are no longer trusted",
        "To store certificate private keys"
      ],
      correct: 2,
      explanation: "A CRL lists certificates that have been revoked before their expiration date, allowing systems to check if a certificate should no longer be trusted."
    }
  ]

  currentQuiz = 0
  selectedAnswer = -1
  showQuizResult = false
  quizScore = 0

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateProgress()
    this.initializeKDC()
    this.generateDHKeys()
  }

  updateProgress() {
    this.sectionProgress = (this.currentSection / this.totalSections) * 100
  }

  nextSection() {
    if (this.currentSection < this.totalSections) {
      this.currentSection++
      this.updateProgress()
    }
  }

  prevSection() {
    if (this.currentSection > 1) {
      this.currentSection--
      this.updateProgress()
    }
  }

  goToSection(section: number) {
    this.currentSection = section
    this.updateProgress()
  }

  // KDC Protocol Implementation
  initializeKDC() {
    this.kdcMessages = []
    this.kdcStep = 0
    this.kdcNonce = this.generateNonce()
    this.sessionKey = this.generateSessionKey()
  }

  runKDCStep() {
    switch (this.kdcStep) {
      case 0:
        this.kdcMessages.push({
          from: this.principalA,
          to: "KDC",
          content: `${this.principalA}, ${this.principalB}, ${this.kdcNonce}`,
          encrypted: false,
          step: 1
        })
        break
      case 1:
        const ticket = `{${this.sessionKey}, ${this.principalA}}_${this.longTermKeyB}`
        this.kdcMessages.push({
          from: "KDC",
          to: this.principalA,
          content: `{${this.sessionKey}, ${this.principalB}, ${this.kdcNonce}}_${this.longTermKeyA} || ${ticket}`,
          encrypted: true,
          step: 2
        })
        break
      case 2:
        const decrementedNonce = (parseInt(this.kdcNonce) - 1).toString()
        this.kdcMessages.push({
          from: this.principalA,
          to: this.principalB,
          content: `Ticket || {${decrementedNonce}}_${this.sessionKey}`,
          encrypted: true,
          step: 3
        })
        break
      case 3:
        const nonceB = this.generateNonce()
        this.kdcMessages.push({
          from: this.principalB,
          to: this.principalA,
          content: `{${nonceB}}_${this.sessionKey}`,
          encrypted: true,
          step: 4
        })
        break
      case 4:
        const decrementedNonceB = (parseInt(this.kdcMessages[this.kdcMessages.length - 1].content.match(/\{(\d+)\}/)?.[1] || "0") - 1).toString()
        this.kdcMessages.push({
          from: this.principalA,
          to: this.principalB,
          content: `{${decrementedNonceB}}_${this.sessionKey}`,
          encrypted: true,
          step: 5
        })
        break
    }
    this.kdcStep++
  }

  resetKDC() {
    this.initializeKDC()
  }

  // Needham-Schroeder Protocol
  runNeedhamSchroeder() {
    this.nsMessages = []
    this.nsNonceA = this.generateNonce()
    this.nsNonceB = this.generateNonce()
    
    // Step 1: A → S
    this.nsMessages.push({
      step: 1,
      from: "Alice",
      to: "Server",
      content: `Alice, Bob, ${this.nsNonceA}`
    })
    
    // Step 2: S → A
    const sessionKey = this.generateSessionKey()
    this.nsMessages.push({
      step: 2,
      from: "Server",
      to: "Alice",
      content: `{${this.nsNonceA}, Bob, ${sessionKey}, {${sessionKey}, Alice}_K_B}_K_A`
    })
    
    // Step 3: A → B
    this.nsMessages.push({
      step: 3,
      from: "Alice",
      to: "Bob",
      content: `{${sessionKey}, Alice}_K_B`
    })
    
    // Steps 4-5: Nonce exchange
    this.nsMessages.push({
      step: 4,
      from: "Bob",
      to: "Alice",
      content: `{${this.nsNonceB}}_${sessionKey}`
    })
    
    this.nsMessages.push({
      step: 5,
      from: "Alice",
      to: "Bob",
      content: `{${parseInt(this.nsNonceB) - 1}}_${sessionKey}`
    })
  }

  // Kerberos Implementation
  runKerberosStep() {
    switch (this.kerberosStep) {
      case 0:
        // AS Exchange
        this.tgt = this.generateTicket("TGS")
        this.kerberosMessages.push({
          step: 1,
          phase: "AS Exchange",
          from: "Client",
          to: "AS",
          content: `User ID, TGS ID, timestamp`,
          response: `{Session_Key_TGS, TGS ID, timestamp, lifetime}_K_client || TGT`
        })
        break
      case 1:
        // TGS Exchange
        this.serviceTicket = this.generateTicket("Service")
        this.authenticator = this.generateAuthenticator()
        this.kerberosMessages.push({
          step: 2,
          phase: "TGS Exchange",
          from: "Client",
          to: "TGS",
          content: `Service ID, TGT, Authenticator`,
          response: `{Session_Key_Service, Service ID, timestamp}_Session_Key_TGS || Service_Ticket`
        })
        break
      case 2:
        // Client-Server
        this.kerberosMessages.push({
          step: 3,
          phase: "Client-Server",
          from: "Client",
          to: "Service",
          content: `Service_Ticket, Authenticator`,
          response: `{timestamp + 1}_Session_Key_Service`
        })
        break
    }
    this.kerberosStep++
  }

  resetKerberos() {
    this.kerberosStep = 0
    this.kerberosMessages = []
    this.tgt = ""
    this.serviceTicket = ""
    this.authenticator = ""
  }

  // Diffie-Hellman Implementation
  generateDHKeys() {
    this.dhParams.privateA = Math.floor(Math.random() * 10) + 1
    this.dhParams.privateB = Math.floor(Math.random() * 10) + 1
    this.calculateDHPublicKeys()
  }

  calculateDHPublicKeys() {
    this.dhParams.publicA = this.modPow(this.dhParams.g, this.dhParams.privateA, this.dhParams.p)
    this.dhParams.publicB = this.modPow(this.dhParams.g, this.dhParams.privateB, this.dhParams.p)
    this.dhParams.sharedSecret = this.modPow(this.dhParams.publicB, this.dhParams.privateA, this.dhParams.p)
  }

  runDHExchange() {
    this.dhParams.step = 1
    setTimeout(() => {
      this.dhParams.step = 2
      setTimeout(() => {
        this.dhParams.step = 3
        setTimeout(() => {
          this.dhParams.step = 4
        }, 1000)
      }, 1000)
    }, 1000)
  }

  customDHCalculation() {
    const publicA = this.modPow(this.dhCustomG, this.dhCustomX, this.dhCustomP)
    const publicB = this.modPow(this.dhCustomG, this.dhCustomY, this.dhCustomP)
    const secretA = this.modPow(publicB, this.dhCustomX, this.dhCustomP)
    const secretB = this.modPow(publicA, this.dhCustomY, this.dhCustomP)
    
    return {
      publicA,
      publicB,
      secretA,
      secretB,
      match: secretA === secretB
    }
  }

  // Station-to-Station Protocol
  runSTSProtocol() {
    this.stsMessages = []
    this.stsStep = 0
    
    // Step 1: DH exchange
    this.stsMessages.push({
      step: 1,
      from: "Alice",
      to: "Bob",
      content: `g^x mod p = ${this.dhParams.publicA}`
    })
    
    // Step 2: DH + signature
    this.stsSignatureB = this.generateSignature("Bob", this.dhParams.publicB.toString())
    this.stsMessages.push({
      step: 2,
      from: "Bob",
      to: "Alice",
      content: `g^y mod p = ${this.dhParams.publicB}, Sign_B(g^y, g^x)`
    })
    
    // Step 3: Alice's signature
    this.stsSignatureA = this.generateSignature("Alice", this.dhParams.publicA.toString())
    this.stsMessages.push({
      step: 3,
      from: "Alice",
      to: "Bob",
      content: `Sign_A(g^x, g^y)`
    })
    
    this.stsStep = 3
  }

  // Certificate Chain Validation - removed demo, replaced with educational content

  // Utility functions
  modPow(base: number, exponent: number, modulus: number): number {
    let result = 1
    base = base % modulus
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % modulus
      }
      exponent = Math.floor(exponent / 2)
      base = (base * base) % modulus
    }
    return result
  }

  generateNonce(): string {
    return Math.floor(Math.random() * 10000).toString()
  }

  generateSessionKey(): string {
    return `K_${Math.floor(Math.random() * 1000)}`
  }

  generateTicket(service: string): string {
    return `Ticket_${service}_${Math.floor(Math.random() * 1000)}`
  }

  generateAuthenticator(): string {
    return `Auth_${Math.floor(Math.random() * 1000)}`
  }

  generateSignature(signer: string, data: string): string {
    return `Sign_${signer}(${data.substring(0, 10)}...)`
  }

  // Quiz functionality
  selectAnswer(index: number) {
    this.selectedAnswer = index
  }

  submitQuiz() {
    if (this.selectedAnswer === this.quizQuestions[this.currentQuiz].correct) {
      this.quizScore++
    }
    this.showQuizResult = true
  }

  nextQuiz() {
    if (this.currentQuiz < this.quizQuestions.length - 1) {
      this.currentQuiz++
      this.selectedAnswer = -1
      this.showQuizResult = false
    }
  }

  resetQuiz() {
    this.currentQuiz = 0
    this.selectedAnswer = -1
    this.showQuizResult = false
    this.quizScore = 0
  }

  // Exercise completion - removed scoring functionality

  goToDashboard() {
    this.router.navigate(['/dashboard'])
  }
}
