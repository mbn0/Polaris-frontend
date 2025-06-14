import { Component, type OnInit } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { CommonModule } from '@angular/common'
import { RouterModule, RouterLink, Router } from '@angular/router'

interface KeyPair {
  publicKey: { e: number; n: number }
  privateKey: { d: number; n: number }
  p?: number
  q?: number
  phi?: number
}

interface SecurityLevel {
  level: number
  symmetric: number
  rsa: number
  ecc: number
}

interface CryptosystemComparison {
  name: string
  keySize: number
  encryptionSpeed: string
  decryptionSpeed: string
  securityBasis: string
}

@Component({
  selector: "app-chapter10",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: "./chapter10.component.html",
  styleUrls: ["./chapter10.component.css"],
})
export class Chapter10Component implements OnInit {
  currentSection = 1
  totalSections = 9

  // RSA demonstration
  rsaKeyPair: KeyPair | null = null
  rsaPlaintext = 5
  rsaCiphertext = 0
  rsaDecrypted = 0
  rsaP = 7
  rsaQ = 11
  rsaE = 13
  rsaGenerating = false

  // Rabin demonstration
  rabinP = 23
  rabinQ = 7
  rabinN = 161
  rabinPlaintext = 24
  rabinCiphertext = 0
  rabinRoots: number[] = []

  // ElGamal demonstration
  elgamalP = 23
  elgamalG = 5
  elgamalX = 6 // private key
  elgamalH = 0 // public key h = g^x mod p
  elgamalPlaintext = 10
  elgamalK = 3 // random value
  elgamalC1 = 0
  elgamalC2 = 0
  elgamalDecrypted = 0

  // Random number for something
 ran =Math.random().toString(36).substring(7)

  // Security level comparison
  securityLevels: SecurityLevel[] = [
    { level: 112, symmetric: 112, rsa: 2048, ecc: 224 },
    { level: 128, symmetric: 128, rsa: 3072, ecc: 256 },
    { level: 192, symmetric: 192, rsa: 7680, ecc: 384 },
    { level: 256, symmetric: 256, rsa: 15360, ecc: 512 },
  ]

  // Cryptosystem comparison
  cryptosystems: CryptosystemComparison[] = [
    {
      name: "RSA",
      keySize: 2048,
      encryptionSpeed: "Fast",
      decryptionSpeed: "Slow",
      securityBasis: "Integer Factorization",
    },
    {
      name: "ElGamal",
      keySize: 2048,
      encryptionSpeed: "Medium",
      decryptionSpeed: "Medium",
      securityBasis: "Discrete Logarithm",
    },
    {
      name: "ECC",
      keySize: 256,
      encryptionSpeed: "Fast",
      decryptionSpeed: "Fast",
      securityBasis: "Elliptic Curve DL",
    },
  ]

  // Digital signature demo
  signatureMessage = "Hello World"
  signatureHash = 0
  digitalSignature = 0
  signatureVerified = false

  // OAEP demonstration
  oaepPlaintext = "SECRET"
  oaepPadded = ""
  oaepRandomSeed = 12345

  // Performance metrics
  performanceResults = {
    rsa: { keyGen: 0, encrypt: 0, decrypt: 0 },
    ecc: { keyGen: 0, encrypt: 0, decrypt: 0 },
  }

  constructor(private router: Router) {}

  ngOnInit() {
    this.generateRSAKeyPair()
    this.calculateElGamalPublicKey()
    this.calculateRabinEncryption()
    this.calculateElGamalEncryption()
    this.simulateOAEP()

  }

  // RSA implementation
  generateRSAKeyPair() {
    this.rsaGenerating = true

    setTimeout(() => {
      const p = this.rsaP
      const q = this.rsaQ
      const n = p * q
      const phi = (p - 1) * (q - 1)
      const e = this.rsaE

      // Calculate d using extended Euclidean algorithm
      const d = this.modularInverse(e, phi)

      this.rsaKeyPair = {
        publicKey: { e, n },
        privateKey: { d, n },
        p,
        q,
        phi,
      }

      this.calculateRSAEncryption()
      this.rsaGenerating = false
    }, 1000)
  }

  calculateRSAEncryption() {
    if (!this.rsaKeyPair) return

    const { e, n } = this.rsaKeyPair.publicKey
    const { d } = this.rsaKeyPair.privateKey

    // Encryption: C = P^e mod n
    this.rsaCiphertext = this.modularExponentiation(this.rsaPlaintext, e, n)

    // Decryption: P = C^d mod n
    this.rsaDecrypted = this.modularExponentiation(this.rsaCiphertext, d, n)
  }

  // Rabin implementation
  calculateRabinEncryption() {
    const n = this.rabinP * this.rabinQ
    this.rabinN = n

    // Encryption: C = P^2 mod n
    this.rabinCiphertext = (this.rabinPlaintext * this.rabinPlaintext) % n

    // Calculate all four square roots
    this.rabinRoots = this.calculateSquareRoots(this.rabinCiphertext, this.rabinP, this.rabinQ)
  }

  calculateSquareRoots(c: number, p: number, q: number): number[] {
    const n = p * q

    // Simplified square root calculation (for demonstration)
    const roots: number[] = []
    for (let i = 0; i < n; i++) {
      if ((i * i) % n === c) {
        roots.push(i)
      }
    }

    return roots.slice(0, 4) // Return first 4 roots
  }

  // ElGamal implementation
  calculateElGamalPublicKey() {
    // h = g^x mod p
    this.elgamalH = this.modularExponentiation(this.elgamalG, this.elgamalX, this.elgamalP)
  }

  calculateElGamalEncryption() {
    // C1 = g^k mod p
    this.elgamalC1 = this.modularExponentiation(this.elgamalG, this.elgamalK, this.elgamalP)

    // C2 = h^k * P mod p
    const hk = this.modularExponentiation(this.elgamalH, this.elgamalK, this.elgamalP)
    this.elgamalC2 = (hk * this.elgamalPlaintext) % this.elgamalP

    // Decryption: P = C2 * (C1^x)^(-1) mod p
    const c1x = this.modularExponentiation(this.elgamalC1, this.elgamalX, this.elgamalP)
    const c1xInv = this.modularInverse(c1x, this.elgamalP)
    this.elgamalDecrypted = (this.elgamalC2 * c1xInv) % this.elgamalP
  }

  // Digital signature simulation
  generateDigitalSignature() {
    if (!this.rsaKeyPair) return

    // Simple hash function (for demonstration)
    this.signatureHash = this.simpleHash(this.signatureMessage)

    // Sign with private key: S = H^d mod n
    const { d, n } = this.rsaKeyPair.privateKey
    this.digitalSignature = this.modularExponentiation(this.signatureHash, d, n)
  }

  verifyDigitalSignature() {
    if (!this.rsaKeyPair) return

    // Verify with public key: H' = S^e mod n
    const { e, n } = this.rsaKeyPair.publicKey
    const verifiedHash = this.modularExponentiation(this.digitalSignature, e, n)

    this.signatureVerified = verifiedHash === this.signatureHash
  }

  // OAEP simulation
  simulateOAEP() {
    // Simplified OAEP demonstration
    const plaintext = this.oaepPlaintext
    const seed = this.oaepRandomSeed.toString()

    // Simulate padding with random data
    this.oaepPadded = plaintext + "_PAD_" + seed + "_" + Math.random().toString(36).substring(7)
  }

  // Performance simulation
  simulatePerformance() {
    // Simulate timing measurements
    this.performanceResults.rsa = {
      keyGen: Math.random() * 1000 + 500,
      encrypt: Math.random() * 10 + 5,
      decrypt: Math.random() * 100 + 50,
    }

    this.performanceResults.ecc = {
      keyGen: Math.random() * 100 + 50,
      encrypt: Math.random() * 5 + 2,
      decrypt: Math.random() * 5 + 2,
    }
  }

  // Utility functions
  modularExponentiation(base: number, exponent: number, modulus: number): number {
    if (modulus === 1) return 0

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

  modularInverse(a: number, m: number): number {
    // Extended Euclidean Algorithm
    const originalM = m
    let x0 = 0,
      x1 = 1

    if (m === 1) return 0

    while (a > 1) {
      const q = Math.floor(a / m)
      let t = m

      m = a % m
      a = t
      t = x0

      x0 = x1 - q * x0
      x1 = t
    }

    if (x1 < 0) x1 += originalM

    return x1
  }

  gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  simpleHash(message: string): number {
    let hash = 0
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100 // Simplified for demonstration
  }

  isPrime(n: number): boolean {
    if (n < 2) return false
    if (n === 2) return true
    if (n % 2 === 0) return false

    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false
    }
    return true
  }

  // Navigation methods
  nextSection() {
    if (this.currentSection < this.totalSections) {
      this.currentSection++
    }
  }

  previousSection() {
    if (this.currentSection > 1) {
      this.currentSection--
    }
  }

  goToSection(section: number) {
    this.currentSection = section
  }

  backToDashboard() {
    this.router.navigate(["/dashboard"])
  }

  // Interactive demonstrations
  onRSAParameterChange() {
    if (
      this.isPrime(this.rsaP) &&
      this.isPrime(this.rsaQ) &&
      this.gcd(this.rsaE, (this.rsaP - 1) * (this.rsaQ - 1)) === 1
    ) {
      this.generateRSAKeyPair()
    }
  }

  onRabinParameterChange() {
    if (this.isPrime(this.rabinP) && this.isPrime(this.rabinQ)) {
      this.calculateRabinEncryption()
    }
  }

  onElGamalParameterChange() {
    this.calculateElGamalPublicKey()
    this.calculateElGamalEncryption()
  }

  onOAEPParameterChange() {
    this.simulateOAEP()
  }
}

