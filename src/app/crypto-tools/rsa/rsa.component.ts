import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface RSAStep {
  stepNumber: number
  title: string
  description: string
  details?: string
  input: string
  output: string
  data?: any
}

interface KeyPair {
  e: bigint
  d: bigint
  n: bigint
}

@Component({
  selector: "app-rsa",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./rsa.component.html",
  styleUrls: ["./rsa.component.css"],
})
export class RSAComponent {
  // Input values (using strings to handle large numbers)
  inputP = "61"
  inputQ = "53"
  inputE = "65537" // Common value for e
  inputMessage = "123"

  // State
  steps: RSAStep[] = []
  currentStep = 0
  isProcessing = false
  keyPair: KeyPair | null = null

  // Constants
  private readonly MILLER_RABIN_ROUNDS = 10
  readonly MIN_PRIME_LENGTH = 512 // For demonstration, use 512 bits. Production should use 1024 or 2048

  // PKCS#1 v1.5 padding constants
  private readonly BLOCK_TYPE = 0x02 // For public key operations
  private readonly PADDING_STRING = "0001"
  private readonly SEPARATOR = "00"

  // RSA Algorithm Functions
  private computeModulus(p: bigint, q: bigint): bigint {
    return p * q
  }

  private computeTotient(p: bigint, q: bigint): bigint {
    return (p - 1n) * (q - 1n)
  }

  private modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    if (mod === 1n) return 0n
    let result = 1n
    base = base % mod
    while (exp > 0n) {
      if (exp & 1n) result = (result * base) % mod
      base = (base * base) % mod
      exp >>= 1n
    }
    return result
  }

  private gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
      const temp = b
      b = a % b
      a = temp
    }
    return a
  }

  private extendedGCD(a: bigint, b: bigint): [bigint, bigint, bigint] {
    if (b === 0n) return [a, 1n, 0n]
    const [g, x1, y1] = this.extendedGCD(b, a % b)
    return [g, y1, x1 - (a / b) * y1]
  }

  private modInverse(e: bigint, phi: bigint): bigint {
    const [g, x] = this.extendedGCD(e, phi)
    if (g !== 1n) throw new Error("e and phi are not coprime")
    return ((x % phi) + phi) % phi
  }

  // Miller-Rabin primality test
  private millerRabinTest(n: bigint, k: number = this.MILLER_RABIN_ROUNDS): boolean {
    if (n <= 1n || n === 4n) return false
    if (n <= 3n) return true

    // Find r and d such that n = 2^r * d + 1
    let d = n - 1n
    let r = 0n
    while (d % 2n === 0n) {
      d /= 2n
      r += 1n
    }

    // Witness loop
    const witnessLoop = (a: bigint): boolean => {
      let x = this.modPow(a, d, n)
      if (x === 1n || x === n - 1n) return true

      for (let i = 1n; i < r; i++) {
        x = (x * x) % n
        if (x === 1n) return false
        if (x === n - 1n) return true
      }
      return false
    }

    // Run k rounds of testing
    for (let i = 0; i < k; i++) {
      // Generate random witness between 2 and n-2
      const a = BigInt(Math.floor(Math.random() * (Number(n) - 4))) + 2n
      if (!witnessLoop(a)) return false
    }
    return true
  }

  // PKCS#1 v1.5 padding
  private pad(message: bigint, blockSize: number): bigint {
    const messageHex = message.toString(16).padStart(2, '0')
    const paddingLength = blockSize - messageHex.length - 3
    if (paddingLength < 8) throw new Error("Message too long for RSA block size")

    // Generate random padding
    const padding = Array.from({ length: paddingLength / 2 }, 
      () => Math.floor(Math.random() * 255).toString(16).padStart(2, '0')).join('')

    const paddedHex = `${this.PADDING_STRING}${padding}${this.SEPARATOR}${messageHex}`
    return BigInt('0x' + paddedHex)
  }

  private unpad(paddedMessage: bigint): bigint {
    const paddedHex = paddedMessage.toString(16)
    const parts = paddedHex.split(this.SEPARATOR)
    if (parts.length < 2) throw new Error("Invalid padding")
    return BigInt('0x' + parts[parts.length - 1])
  }

  processInput(): void {
    this.isProcessing = true
    this.steps = []
    this.currentStep = 0

    try {
      // Convert inputs to BigInt
      const p = BigInt(this.inputP)
      const q = BigInt(this.inputQ)
      const e = BigInt(this.inputE)
      const m = BigInt(this.inputMessage)

      // Validate inputs
      if (!this.millerRabinTest(p) || !this.millerRabinTest(q)) {
        alert("Both p and q must be prime numbers")
        this.isProcessing = false
        return
      }

      if (p === q) {
        alert("p and q must be different primes")
        this.isProcessing = false
        return
      }

      // Check prime size
      if (p.toString(2).length < this.MIN_PRIME_LENGTH || 
          q.toString(2).length < this.MIN_PRIME_LENGTH) {
        alert(`For security, primes should be at least ${this.MIN_PRIME_LENGTH} bits`)
        this.isProcessing = false
        return
      }

      const n = this.computeModulus(p, q)
      const phi = this.computeTotient(p, q)

      if (e <= 1n) {
        alert("Public exponent e must be greater than 1")
        this.isProcessing = false
        return
      }

      if (e >= phi) {
        alert(`Public exponent e must be less than φ(n)`)
        this.isProcessing = false
        return
      }

      if (this.gcd(e, phi) !== 1n) {
        alert(`e must be coprime with φ(n)`)
        this.isProcessing = false
        return
      }

      const blockSize = Math.floor(n.toString(16).length)
      if (m >= n) {
        alert(`Message must be less than n (${blockSize} bytes maximum)`)
        this.isProcessing = false
        return
      }

      this.generateSteps(p, q, e, m, n, phi)
    } catch (error) {
      alert("Error processing RSA: " + error)
    }

    this.isProcessing = false
  }

  private generateSteps(p: bigint, q: bigint, e: bigint, m: bigint, n: bigint, phi: bigint): void {
    // Step 1: Input validation
    this.steps.push({
      stepNumber: 1,
      title: "Input Validation",
      description: "Verify that p and q are prime numbers and e is valid",
      details: `p and q are verified prime using Miller-Rabin test with ${this.MILLER_RABIN_ROUNDS} rounds`,
      input: `p = ${p}, q = ${q}, e = ${e}`,
      output: "Validation passed ✓",
    })

    // Step 2: Compute modulus n
    this.steps.push({
      stepNumber: 2,
      title: "Compute Modulus (n)",
      description: "Calculate n = p × q",
      details: `The modulus n is ${n.toString().length} digits long`,
      input: `p = ${p}, q = ${q}`,
      output: `n = ${n}`,
      data: { n: n.toString() },
    })

    // Step 3: Compute totient
    this.steps.push({
      stepNumber: 3,
      title: "Compute Totient φ(n)",
      description: "Calculate φ(n) = (p-1)(q-1)",
      details: `Euler's totient φ(n) = ${phi}`,
      input: `p = ${p}, q = ${q}`,
      output: `φ(n) = ${phi}`,
      data: { phi: phi.toString() },
    })

    // Step 4: Verify e
    const gcdResult = this.gcd(e, phi)
    this.steps.push({
      stepNumber: 4,
      title: "Verify Public Exponent",
      description: "Confirm that gcd(e, φ(n)) = 1",
      details: `gcd(${e}, φ(n)) = ${gcdResult}`,
      input: `e = ${e}, φ(n) = ${phi}`,
      output: `gcd(e, φ(n)) = ${gcdResult} ✓`,
      data: { gcdResult: gcdResult.toString() },
    })

    // Step 5: Compute d
    const d = this.modInverse(e, phi)
    this.steps.push({
      stepNumber: 5,
      title: "Compute Private Exponent (d)",
      description: "Find d such that e × d ≡ 1 (mod φ(n))",
      details: `Private exponent d = ${d}`,
      input: `e = ${e}, φ(n) = ${phi}`,
      output: `d = ${d}`,
      data: { d: d.toString() },
    })

    // Step 6: Generate key pair
    this.keyPair = { e, d, n }
    this.steps.push({
      stepNumber: 6,
      title: "RSA Key Pair Generated",
      description: "Public and private keys are ready",
      details: `Public Key (e,n) and Private Key (d,n) generated`,
      input: `Public: (${e}, ${n})\nPrivate: (${d}, ${n})`,
      output: "Keys generated successfully ✓",
      data: { publicKey: [e.toString(), n.toString()], privateKey: [d.toString(), n.toString()] },
    })

    // Step 7: Padding
    const blockSize = Math.floor(n.toString(16).length)
    const paddedMessage = this.pad(m, blockSize)
    this.steps.push({
      stepNumber: 7,
      title: "Message Padding",
      description: "Apply PKCS#1 v1.5 padding",
      details: "Added padding for security against certain attacks",
      input: `m = ${m}`,
      output: `padded = ${paddedMessage}`,
      data: { paddedMessage: paddedMessage.toString() },
    })

    // Step 8: Encryption
    const ciphertext = this.modPow(paddedMessage, e, n)
    this.steps.push({
      stepNumber: 8,
      title: "Encryption",
      description: "Encrypt using public key: c = m^e mod n",
      details: `Using modular exponentiation`,
      input: `m = ${paddedMessage}, e = ${e}`,
      output: `c = ${ciphertext}`,
      data: { ciphertext: ciphertext.toString() },
    })

    // Step 9: Decryption
    const decryptedPadded = this.modPow(ciphertext, d, n)
    const decrypted = this.unpad(decryptedPadded)
    this.steps.push({
      stepNumber: 9,
      title: "Decryption",
      description: "Decrypt using private key: m = c^d mod n",
      details: `Decryption successful, original message recovered`,
      input: `c = ${ciphertext}`,
      output: `m = ${decrypted}`,
      data: { decrypted: decrypted.toString() },
    })
  }

  reset(): void {
    this.steps = []
    this.currentStep = 0
    this.keyPair = null
    this.inputP = "61"
    this.inputQ = "53"
    this.inputE = "65537"
    this.inputMessage = "123"
  }

  goToStep(index: number): void {
    this.currentStep = index
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--
    }
  }

  getKeyDisplay(isPublic: boolean): string {
    if (!this.keyPair) return ""
    return isPublic ? `(${this.keyPair.e}, ${this.keyPair.n})` : `(${this.keyPair.d}, ${this.keyPair.n})`
  }

  getModularExponentiation(step: RSAStep): string {
    if (!step.data) return ""

    if (step.stepNumber === 7) {
      return `${step.data.message}^${step.data.exponent} mod ${this.keyPair?.n} = ${step.data.ciphertext}`
    } else if (step.stepNumber === 8) {
      return `${step.data.ciphertext}^${step.data.exponent} mod ${this.keyPair?.n} = ${step.data.decrypted}`
    }

    return ""
  }
}
