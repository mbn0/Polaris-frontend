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
  errorMessage = ""

  // Constants
  private readonly MILLER_RABIN_ROUNDS = 10
  // Adjusted for educational purposes - allow smaller primes for demonstration
  readonly MIN_PRIME_LENGTH = 6 // Minimum 6 bits for basic demonstration
  readonly RECOMMENDED_PRIME_LENGTH = 1024 // Production recommendation

  // PKCS#1 v1.5 padding constants
  private readonly BLOCK_TYPE = 0x02 // For public key operations
  private readonly PADDING_PREFIX = "0001" // For signing (type 01)
  private readonly ENCRYPTION_PREFIX = "0002" // For encryption (type 02)
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

  // Enhanced error handling
  private showError(message: string): void {
    this.errorMessage = message
    alert(message)
  }

  private clearError(): void {
    this.errorMessage = ""
  }

  // Improved Miller-Rabin primality test
  private millerRabinTest(n: bigint, k: number = this.MILLER_RABIN_ROUNDS): boolean {
    if (n <= 1n || n === 4n) return false
    if (n <= 3n) return true
    if (n % 2n === 0n) return false

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

    // Run k rounds of testing with better random number generation
    for (let i = 0; i < k; i++) {
      // Generate random witness between 2 and n-2
      // Use a more secure method for larger numbers
      let a: bigint
      if (n < 1000000n) {
        a = BigInt(Math.floor(Math.random() * (Number(n) - 4))) + 2n
      } else {
        // For larger numbers, use a simple method that's still educational
        const bits = n.toString(2).length
        const randomBits = Math.floor(Math.random() * (bits - 2)) + 2
        a = BigInt(Math.floor(Math.random() * (2 ** randomBits - 1))) + 2n
        if (a >= n - 1n) a = 2n + BigInt(Math.floor(Math.random() * 100))
      }
      if (!witnessLoop(a)) return false
    }
    return true
  }

  // Improved PKCS#1 v1.5 padding
  private pad(message: bigint, keySize: number): bigint {
    const messageBytes = this.bigintToBytes(message)
    const keySizeBytes = Math.ceil(keySize / 8)
    
    // Check if message is too long
    const maxMessageLength = keySizeBytes - 11 // Minimum padding is 11 bytes
    if (messageBytes.length > maxMessageLength) {
      throw new Error(`Message too long. Maximum length is ${maxMessageLength} bytes`)
    }

    // Create padded message: 0x00 || 0x02 || PS || 0x00 || M
    const paddingLength = keySizeBytes - messageBytes.length - 3
    if (paddingLength < 8) {
      throw new Error("Insufficient padding length")
    }

    // Generate random non-zero padding
    const padding = new Array(paddingLength).fill(0).map(() => {
      let byte = 0
      while (byte === 0) {
        byte = Math.floor(Math.random() * 255) + 1 // 1-255, never 0
      }
      return byte
    })

    // Construct the padded message
    const paddedBytes = [0x00, 0x02, ...padding, 0x00, ...messageBytes]
    return this.bytesToBigint(paddedBytes)
  }

  private unpad(paddedMessage: bigint, keySize: number): bigint {
    const paddedBytes = this.bigintToBytes(paddedMessage)
    const keySizeBytes = Math.ceil(keySize / 8)
    
    // Pad to key size if necessary
    while (paddedBytes.length < keySizeBytes) {
      paddedBytes.unshift(0)
    }

    // Verify padding format: 0x00 || 0x02 || PS || 0x00 || M
    if (paddedBytes.length < 11) {
      throw new Error("Invalid padding: message too short")
    }

    if (paddedBytes[0] !== 0x00 || paddedBytes[1] !== 0x02) {
      throw new Error("Invalid padding: incorrect header")
    }

    // Find the separator (0x00) after padding
    let separatorIndex = -1
    for (let i = 2; i < paddedBytes.length; i++) {
      if (paddedBytes[i] === 0x00) {
        separatorIndex = i
        break
      }
    }

    if (separatorIndex === -1 || separatorIndex < 10) {
      throw new Error("Invalid padding: separator not found or insufficient padding")
    }

    // Extract the message
    const messageBytes = paddedBytes.slice(separatorIndex + 1)
    return this.bytesToBigint(messageBytes)
  }

  // Helper functions for byte conversion
  private bigintToBytes(n: bigint): number[] {
    if (n === 0n) return [0]
    
    const bytes: number[] = []
    let temp = n
    while (temp > 0n) {
      bytes.unshift(Number(temp & 0xFFn))
      temp >>= 8n
    }
    return bytes
  }

  private bytesToBigint(bytes: number[]): bigint {
    let result = 0n
    for (const byte of bytes) {
      result = (result << 8n) + BigInt(byte)
    }
    return result
  }

  processInput(): void {
    this.isProcessing = true
    this.steps = []
    this.currentStep = 0
    this.clearError()

    try {
      // Enhanced input validation
      if (!this.inputP.trim() || !this.inputQ.trim() || !this.inputE.trim() || !this.inputMessage.trim()) {
        this.showError("All fields are required")
        return
      }

      // Validate numeric inputs
      let p: bigint, q: bigint, e: bigint, m: bigint
      try {
        p = BigInt(this.inputP.trim())
        q = BigInt(this.inputQ.trim())
        e = BigInt(this.inputE.trim())
        m = BigInt(this.inputMessage.trim())
      } catch (error) {
        this.showError("All inputs must be valid integers")
        return
      }

      // Validate positive numbers
      if (p <= 0n || q <= 0n || e <= 0n || m < 0n) {
        this.showError("p, q, and e must be positive; message must be non-negative")
        return
      }

      // Validate primes
      if (!this.millerRabinTest(p)) {
        this.showError(`p = ${p} is not prime. Please enter a prime number.`)
        return
      }

      if (!this.millerRabinTest(q)) {
        this.showError(`q = ${q} is not prime. Please enter a prime number.`)
        return
      }

      if (p === q) {
        this.showError("p and q must be different primes for security")
        return
      }

      // Check prime sizes
      const pBits = p.toString(2).length
      const qBits = q.toString(2).length
      
      if (pBits < this.MIN_PRIME_LENGTH || qBits < this.MIN_PRIME_LENGTH) {
        this.showError(`Primes are too small. Minimum ${this.MIN_PRIME_LENGTH} bits required.`)
        return
      }

      if (pBits < this.RECOMMENDED_PRIME_LENGTH || qBits < this.RECOMMENDED_PRIME_LENGTH) {
        console.warn(`Warning: For production use, primes should be at least ${this.RECOMMENDED_PRIME_LENGTH} bits`)
      }

      const n = this.computeModulus(p, q)
      const phi = this.computeTotient(p, q)

      // Validate e
      if (e <= 1n) {
        this.showError("Public exponent e must be greater than 1")
        return
      }

      if (e >= phi) {
        this.showError("Public exponent e must be less than φ(n)")
        return
      }

      // Check if e is odd (required for RSA)
      if (e % 2n === 0n && e !== 2n) {
        this.showError("Public exponent e should be odd (except e=2, which is rarely used)")
        return
      }

      const gcdResult = this.gcd(e, phi)
      if (gcdResult !== 1n) {
        this.showError(`e must be coprime with φ(n). gcd(e, φ(n)) = ${gcdResult}`)
        return
      }

      // Validate message size
      const keyBits = n.toString(2).length
      const maxMessageBits = keyBits - 88 // Account for PKCS#1 v1.5 padding (11 bytes = 88 bits)
      const messageBits = m === 0n ? 1 : m.toString(2).length
      
      if (messageBits > maxMessageBits) {
        this.showError(`Message too large. Maximum ${Math.floor(maxMessageBits / 8)} bytes allowed for this key size.`)
        return
      }

      if (m >= n) {
        this.showError("Message must be less than n")
        return
      }

      this.generateSteps(p, q, e, m, n, phi, keyBits)
    } catch (error) {
      this.showError(`Error processing RSA: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      this.isProcessing = false
    }
  }

  private generateSteps(p: bigint, q: bigint, e: bigint, m: bigint, n: bigint, phi: bigint, keyBits: number): void {
    // Step 1: Input validation
    this.steps.push({
      stepNumber: 1,
      title: "Input Validation",
      description: "Verify that p and q are prime numbers and e is valid",
      details: `✓ p = ${p} is prime (${p.toString(2).length} bits)\n✓ q = ${q} is prime (${q.toString(2).length} bits)\n✓ p ≠ q\n✓ e = ${e} is valid\n✓ Primality verified using Miller-Rabin test with ${this.MILLER_RABIN_ROUNDS} rounds`,
      input: `p = ${p}\nq = ${q}\ne = ${e}\nmessage = ${m}`,
      output: "✓ All inputs validated successfully",
    })

    // Step 2: Compute modulus n
    this.steps.push({
      stepNumber: 2,
      title: "Compute Modulus (n)",
      description: "Calculate n = p × q",
      details: `The modulus n has ${n.toString().length} decimal digits (${keyBits} bits)\nThis determines the key size and maximum message length`,
      input: `p = ${p}\nq = ${q}`,
      output: `n = ${n}`,
      data: { n: n.toString(), keyBits },
    })

    // Step 3: Compute totient
    this.steps.push({
      stepNumber: 3,
      title: "Compute Totient φ(n)",
      description: "Calculate φ(n) = (p-1)(q-1)",
      details: `Euler's totient function φ(n) counts integers less than n that are coprime to n\nFor RSA: φ(n) = (p-1)(q-1) = ${phi}\nThis is used to find the private exponent d`,
      input: `p-1 = ${p-1n}\nq-1 = ${q-1n}`,
      output: `φ(n) = ${phi}`,
      data: { phi: phi.toString() },
    })

    // Step 4: Verify e
    const gcdResult = this.gcd(e, phi)
    this.steps.push({
      stepNumber: 4,
      title: "Verify Public Exponent",
      description: "Confirm that gcd(e, φ(n)) = 1",
      details: `The public exponent e must be coprime with φ(n)\ngcd(${e}, ${phi}) = ${gcdResult}\n✓ e and φ(n) are coprime, so e is valid`,
      input: `e = ${e}\nφ(n) = ${phi}`,
      output: `gcd(e, φ(n)) = ${gcdResult} ✓`,
      data: { gcdResult: gcdResult.toString() },
    })

    // Step 5: Compute d
    const d = this.modInverse(e, phi)
    // Verify the computation
    const verification = (e * d) % phi
    this.steps.push({
      stepNumber: 5,
      title: "Compute Private Exponent (d)",
      description: "Find d such that e × d ≡ 1 (mod φ(n))",
      details: `Using Extended Euclidean Algorithm to find modular inverse\nd = e⁻¹ mod φ(n) = ${d}\nVerification: e × d mod φ(n) = ${verification} ✓`,
      input: `e = ${e}\nφ(n) = ${phi}`,
      output: `d = ${d}`,
      data: { d: d.toString(), verification: verification.toString() },
    })

    // Step 6: Generate key pair
    this.keyPair = { e, d, n }
    this.steps.push({
      stepNumber: 6,
      title: "RSA Key Pair Generated",
      description: "Public and private keys are ready",
      details: `✓ Public Key: (e, n) = (${e}, ${n})\n✓ Private Key: (d, n) = (${d}, ${n})\n✓ Key size: ${keyBits} bits\n✓ Security level: ${Math.floor(keyBits/2)} bits (estimated)`,
      input: `Key parameters validated`,
      output: `Public Key: (${e}, ${n})\nPrivate Key: (${d}, ${n})`,
      data: { publicKey: [e.toString(), n.toString()], privateKey: [d.toString(), n.toString()], keyBits },
    })

    // Step 7: Padding
    const paddedMessage = this.pad(m, keyBits)
    this.steps.push({
      stepNumber: 7,
      title: "Message Padding (PKCS#1 v1.5)",
      description: "Apply PKCS#1 v1.5 padding for security",
      details: `PKCS#1 v1.5 padding format: 0x00 || 0x02 || PS || 0x00 || M\n✓ Added random padding for security\n✓ Prevents certain cryptographic attacks\n✓ Padded message length: ${this.bigintToBytes(paddedMessage).length} bytes`,
      input: `Original message: ${m}`,
      output: `Padded message: ${paddedMessage}`,
      data: { originalMessage: m.toString(), paddedMessage: paddedMessage.toString() },
    })

    // Step 8: Encryption
    const ciphertext = this.modPow(paddedMessage, e, n)
    this.steps.push({
      stepNumber: 8,
      title: "Encryption",
      description: "Encrypt using public key: c = m^e mod n",
      details: `Using fast modular exponentiation algorithm\nComputing ${paddedMessage}^${e} mod ${n}\nResult: ${ciphertext}`,
      input: `Padded message: ${paddedMessage}\nPublic exponent: ${e}\nModulus: ${n}`,
      output: `Ciphertext: ${ciphertext}`,
      data: { paddedMessage: paddedMessage.toString(), publicExponent: e.toString(), ciphertext: ciphertext.toString() },
    })

    // Step 9: Decryption
    const decryptedPadded = this.modPow(ciphertext, d, n)
    const decrypted = this.unpad(decryptedPadded, keyBits)
    this.steps.push({
      stepNumber: 9,
      title: "Decryption & Unpadding",
      description: "Decrypt using private key and remove padding",
      details: `Step 1: Decrypt using private key: ${ciphertext}^${d} mod ${n} = ${decryptedPadded}\nStep 2: Remove PKCS#1 v1.5 padding\n✓ Original message recovered: ${decrypted}\n✓ Encryption/decryption cycle successful`,
      input: `Ciphertext: ${ciphertext}\nPrivate exponent: ${d}`,
      output: `Decrypted message: ${decrypted}`,
      data: { ciphertext: ciphertext.toString(), decryptedPadded: decryptedPadded.toString(), decrypted: decrypted.toString() },
    })

    // Verify the result
    if (decrypted !== m) {
      throw new Error("Decryption verification failed!")
    }
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
