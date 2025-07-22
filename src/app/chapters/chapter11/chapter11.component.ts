import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Router } from "@angular/router"
import { FormsModule } from "@angular/forms"

interface HashResult {
  algorithm: string
  input: string
  output: string
  length: number
  time: number
}

interface MACResult {
  algorithm: string
  message: string
  key: string
  tag: string
  verified: boolean
}

interface IntegrityTest {
  original: string
  modified: string
  originalHash: string
  modifiedHash: string
  tampered: boolean
}

interface CollisionDemo {
  input1: string
  input2: string
  hash1: string
  hash2: string
  collision: boolean
  attempts: number
}

@Component({
  selector: "app-chapter11",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chapter11.component.html",
  styleUrls: ["./chapter11.component.css"],
})
export class Chapter11Component implements OnInit {
  currentSection = 1
  totalSections = 9

  // Hash function demonstrations
  hashInput = "Hello, World!"
  hashResults: HashResult[] = []

  // Integrity checking
  originalMessage = "Transfer $1,000 to Account 12345"
  modifiedMessage = "Transfer $10,000 to Account 12345"
  integrityTest: IntegrityTest | null = null

  // MAC demonstrations
  macMessage = "Confidential document content"
  macKey = "secret-key-123"
  macResults: MACResult[] = []

  // HMAC specific
  hmacMessage = "Important message"
  hmacKey = "shared-secret"
  hmacResult = ""
  hmacSteps: string[] = []

  // Collision demonstration
  collisionInput1 = "message1"
  collisionInput2 = "message2"
  collisionDemo: CollisionDemo | null = null
  collisionSearching = false

  // Attack simulation
  attackScenario = "mdc" // "mdc" or "mac"
  attackMessage = "Pay $100 to Alice"
  attackModified = "Pay $1000 to Alice"
  attackKey = "secret123"
  attackResults = {
    originalMDC: "",
    modifiedMDC: "",
    originalMAC: "",
    modifiedMAC: "",
    mdcAttackSuccess: false,
    macAttackSuccess: false,
  }

  // Digital signature demo
  signatureMessage = "Contract agreement terms"
  signaturePrivateKey = "private-key-alice"
  signaturePublicKey = "public-key-alice"
  digitalSignature = ""
  signatureVerified = false

  // Performance metrics
  performanceResults = {
    md5: 0,
    sha1: 0,
    sha256: 0,
    hmac: 0,
    cmac: 0,
  }

  // Helper methods for performance display
  getPerformanceValue(index: number): string {
    return Object.values(this.performanceResults)[index].toFixed(1);
  }

  getPerformancePercentage(index: number): number {
    const values = Object.values(this.performanceResults);
    const maxValue = Math.max(...values);
    return (values[index] / maxValue) * 100;
  }

  // Hash function properties
  hashProperties = [
    {
      property: "Preimage Resistance",
      description: "Given h, infeasible to find m such that H(m) = h",
      strength: "One-way function property",
    },
    {
      property: "Second-Preimage Resistance",
      description: "Given m₁, infeasible to find m₂ ≠ m₁ with H(m₂) = H(m₁)",
      strength: "Weak collision resistance",
    },
    {
      property: "Collision Resistance",
      description: "Infeasible to find any (m₁, m₂) with H(m₁) = H(m₂)",
      strength: "Strong collision resistance",
    },
  ]

  constructor(private router: Router) {}

  ngOnInit() {
    this.computeAllHashes()
    this.testIntegrity()
    this.computeAllMACs()
    this.computeHMAC()
    this.simulateAttack()
    this.generateDigitalSignature()
    this.measurePerformance()
  }

  // Improved hash function simulation with better avalanche effect
  simpleHash(input: string, algorithm: string): string {
    const multipliers = algorithm === "md5" ? [31, 37, 41, 43] : 
                       algorithm === "sha1" ? [47, 53, 59, 61] : [67, 71, 73, 79]
    
    // Use multiple rounds for better mixing
    let hash = 0x12345678 // Non-zero initial value
    
    for (let round = 0; round < 4; round++) {
      const multiplier = multipliers[round]
      let roundHash = hash
      
      for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i)
        roundHash = ((roundHash * multiplier) ^ (char << (i % 16))) >>> 0
        roundHash = ((roundHash << 13) | (roundHash >>> 19)) >>> 0 // Rotate bits
        roundHash = (roundHash + 0x9e3779b9) >>> 0 // Add constant
      }
      
      hash = (hash ^ roundHash) >>> 0
    }
    
    // Additional mixing for better avalanche effect
    hash ^= hash >>> 16
    hash = (hash * 0x85ebca6b) >>> 0
    hash ^= hash >>> 13
    hash = (hash * 0xc2b2ae35) >>> 0
    hash ^= hash >>> 16

    const hexLength = algorithm === "md5" ? 32 : algorithm === "sha1" ? 40 : 64
    
    // Generate full-length hash by repeating and mixing
    let fullHash = ""
    let seed = hash
    
    while (fullHash.length < hexLength) {
      seed = (seed * 0x9e3779b9 + 0x6a09e667) >>> 0
      seed ^= seed >>> 16
      seed = (seed * 0x85ebca6b) >>> 0
      seed ^= seed >>> 13
      fullHash += seed.toString(16).padStart(8, "0")
    }
    
    return fullHash.substring(0, hexLength)
  }

  // Compute hashes with multiple algorithms
  computeAllHashes() {
    const algorithms = ["md5", "sha1", "sha256"]
    this.hashResults = []

    algorithms.forEach((algorithm) => {
      const startTime = performance.now()
      const hash = this.simpleHash(this.hashInput, algorithm)
      const endTime = performance.now()

      this.hashResults.push({
        algorithm: algorithm.toUpperCase(),
        input: this.hashInput,
        output: hash,
        length: hash.length * 4, // bits
        time: endTime - startTime,
      })
    })
  }

  // Test message integrity
  testIntegrity() {
    const originalHash = this.simpleHash(this.originalMessage, "sha256")
    const modifiedHash = this.simpleHash(this.modifiedMessage, "sha256")

    this.integrityTest = {
      original: this.originalMessage,
      modified: this.modifiedMessage,
      originalHash: originalHash,
      modifiedHash: modifiedHash,
      tampered: originalHash !== modifiedHash,
    }
  }

  // Compute MACs with different methods
  computeAllMACs() {
    const methods = ["HMAC-SHA256", "CMAC-AES", "CBC-MAC"]
    this.macResults = []

    methods.forEach((method) => {
      const tag = this.computeMAC(this.macMessage, this.macKey, method)

      this.macResults.push({
        algorithm: method,
        message: this.macMessage,
        key: this.macKey,
        tag: tag,
        verified: true,
      })
    })
  }

  // Improved MAC computation with proper key mixing
  computeMAC(message: string, key: string, algorithm: string): string {
    // Ensure key affects the computation significantly
    const keyHash = this.simpleHash(key, "sha256")
    const messageHash = this.simpleHash(message, "sha256")
    
    // Mix key and message hashes in a non-trivial way
    const combined = keyHash + message + messageHash + key + algorithm
    return this.simpleHash(combined, "sha256").substring(0, 16)
  }

  // HMAC computation with proper key mixing and steps
  computeHMAC() {
    const ipad = "36".repeat(32) // Simplified inner pad
    const opad = "5c".repeat(32) // Simplified outer pad

    this.hmacSteps = []
    this.hmacSteps.push(`1. Prepare key: K = "${this.hmacKey}"`)
    this.hmacSteps.push(`2. Inner hash: H((K ⊕ ipad) || M)`)
    this.hmacSteps.push(`3. Outer hash: H((K ⊕ opad) || inner_hash)`)

    // Improved key mixing - XOR key with pads more realistically
    const keyPadded = this.hmacKey.padEnd(64, '0')
    let innerKey = ""
    let outerKey = ""
    
    for (let i = 0; i < Math.min(keyPadded.length, 64); i++) {
      const keyChar = keyPadded.charCodeAt(i)
      innerKey += String.fromCharCode(keyChar ^ 0x36)
      outerKey += String.fromCharCode(keyChar ^ 0x5c)
    }

    const innerHash = this.simpleHash(innerKey + this.hmacMessage, "sha256")
    const outerHash = this.simpleHash(outerKey + innerHash, "sha256")

    this.hmacSteps.push(`4. Inner result: ${innerHash.substring(0, 16)}...`)
    this.hmacSteps.push(`5. Final HMAC: ${outerHash.substring(0, 16)}...`)

    this.hmacResult = outerHash.substring(0, 32)
  }

  // Simulate collision search
  async searchCollisions() {
    this.collisionSearching = true
    this.collisionDemo = null

    // Simulate collision search with timeout
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const hash1 = this.simpleHash(this.collisionInput1, "md5")
    const hash2 = this.simpleHash(this.collisionInput2, "md5")

    // For demo purposes, artificially create a "collision" scenario
    const collision = hash1.substring(0, 6) === hash2.substring(0, 6)

    this.collisionDemo = {
      input1: this.collisionInput1,
      input2: this.collisionInput2,
      hash1: hash1,
      hash2: hash2,
      collision: collision,
      attempts: Math.floor(Math.random() * 1000000) + 50000,
    }

    this.collisionSearching = false
  }

  // Simulate MDC vs MAC attack
  simulateAttack() {
    // Original message hashes
    this.attackResults.originalMDC = this.simpleHash(this.attackMessage, "sha256").substring(0, 16)
    this.attackResults.originalMAC = this.computeMAC(this.attackMessage, this.attackKey, "HMAC")

    // Modified message hashes
    this.attackResults.modifiedMDC = this.simpleHash(this.attackModified, "sha256").substring(0, 16)
    this.attackResults.modifiedMAC = this.computeMAC(this.attackModified, this.attackKey, "HMAC")

    // Attack success analysis
    this.attackResults.mdcAttackSuccess = true // Attacker can recompute MDC
    this.attackResults.macAttackSuccess = false // Attacker cannot compute valid MAC without key
  }

  // Generate digital signature
  generateDigitalSignature() {
    const messageHash = this.simpleHash(this.signatureMessage, "sha256")
    // Simulate signing with private key
    this.digitalSignature = this.simpleHash(messageHash + this.signaturePrivateKey, "sha256").substring(0, 32)
  }

  // Verify digital signature
  verifyDigitalSignature() {
    const messageHash = this.simpleHash(this.signatureMessage, "sha256")
    // Simulate verification with public key
    const expectedSignature = this.simpleHash(messageHash + this.signaturePrivateKey, "sha256").substring(0, 32)
    this.signatureVerified = this.digitalSignature === expectedSignature
  }

  // Measure performance
  measurePerformance() {
    const testData = "A".repeat(1000) // 1KB test data

    const startMD5 = performance.now()
    this.simpleHash(testData, "md5")
    this.performanceResults.md5 = performance.now() - startMD5

    const startSHA1 = performance.now()
    this.simpleHash(testData, "sha1")
    this.performanceResults.sha1 = performance.now() - startSHA1

    const startSHA256 = performance.now()
    this.simpleHash(testData, "sha256")
    this.performanceResults.sha256 = performance.now() - startSHA256

    const startHMAC = performance.now()
    this.computeMAC(testData, "key", "HMAC")
    this.performanceResults.hmac = performance.now() - startHMAC

    const startCMAC = performance.now()
    this.computeMAC(testData, "key", "CMAC")
    this.performanceResults.cmac = performance.now() - startCMAC
  }

  // Navigation methods
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextSection() {
    if (this.currentSection < this.totalSections) {
      this.currentSection++;
      this.scrollToTop();
    }
  }

  previousSection() {
    if (this.currentSection > 1) {
      this.currentSection--;
      this.scrollToTop();
    }
  }

  goToSection(section: number) {
    this.currentSection = section;
    this.scrollToTop();
  }

  backToDashboard() {
    this.router.navigate(["/dashboard"])
  }

  // Interactive demonstrations
  onHashInputChange() {
    this.computeAllHashes()
  }

  onIntegrityTestChange() {
    this.testIntegrity()
  }

  onMACParameterChange() {
    this.computeAllMACs()
    this.computeHMAC()
  }

  onAttackParameterChange() {
    this.simulateAttack()
  }

  onSignatureParameterChange() {
    this.generateDigitalSignature()
    this.verifyDigitalSignature()
  }

  // Utility methods
  truncateHash(hash: string, length: number): string {
    return hash.substring(0, length) + (hash.length > length ? "..." : "")
  }

  getSecurityLevel(algorithm: string): string {
    switch (algorithm.toLowerCase()) {
      case "md5":
        return "Broken"
      case "sha1":
        return "Deprecated"
      case "sha256":
        return "Secure"
      default:
        return "Unknown"
    }
  }

  getSecurityColor(algorithm: string): string {
    switch (this.getSecurityLevel(algorithm)) {
      case "Broken":
        return "text-red-600"
      case "Deprecated":
        return "text-yellow-600"
      case "Secure":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }
}