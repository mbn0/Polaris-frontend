import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"

interface HomomorphicDemo {
  scheme: string
  operation: string
  input1: number
  input2: number
  encrypted1: string
  encrypted2: string
  result: string
  decrypted: number
}

interface FHEParameters {
  polyDegree: number
  modulus: bigint
  noiseLevel: number
  securityLevel: number
}

@Component({
  selector: "app-chapter16",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chapter16.component.html",
  styleUrls: ["./chapter16.component.css"],
})
export class Chapter16Component implements OnInit {
  // Section tracking
  currentSection = 1
  totalSections = 11
  sectionTitles = [
    "Why Homomorphic Encryption?",
    "Algebraic Homomorphism",
    "Partially Homomorphic Encryption",
    "Key PHE Examples",
    "Somewhat Homomorphic Encryption",
    "Fully Homomorphic Encryption",
    "Gentry's Blueprint",
    "Practical FHE Families",
    "Performance & Parameter Selection",
    "Applications & Use Cases",
    "Active Learning & Exercises",
  ]

  // Interactive demonstrations
  paillierDemo: HomomorphicDemo = {
    scheme: "Paillier",
    operation: "addition",
    input1: 5,
    input2: 7,
    encrypted1: "",
    encrypted2: "",
    result: "",
    decrypted: 0,
  }

  rsaDemo: HomomorphicDemo = {
    scheme: "RSA",
    operation: "multiplication",
    input1: 3,
    input2: 4,
    encrypted1: "",
    encrypted2: "",
    result: "",
    decrypted: 0,
  }

  elgamalDemo: HomomorphicDemo = {
    scheme: "ElGamal",
    operation: "multiplication",
    input1: 2,
    input2: 6,
    encrypted1: "",
    encrypted2: "",
    result: "",
    decrypted: 0,
  }

  // Paillier parameters
  paillierN = 143n // Small example: p=11, q=13
  paillierG = 144n
  paillierLambda = 60n // lcm(p-1, q-1)
  paillierMu = 107n // Corrected: μ = L(g^λ mod n²)^(-1) mod n

  // RSA parameters for demo
  rsaN = 143n // p=11, q=13
  rsaE = 7n
  rsaD = 103n

  // ElGamal parameters
  elgamalP = 23n
  elgamalG = 5n
  elgamalX = 6n // Private key
  elgamalY = 8n // Public key = g^x mod p

  // FHE comparison data
  fheSchemes = [
    {
      name: "BGV",
      securityLevel: 128,
      keySize: "~10 MB",
      bootstrapTime: "2-5 minutes",
      dataType: "Integer",
      applications: ["Secure voting", "Private statistics"],
    },
    {
      name: "BFV",
      securityLevel: 128,
      keySize: "~8 MB",
      bootstrapTime: "1-3 minutes",
      dataType: "Integer",
      applications: ["Database queries", "Secure aggregation"],
    },
    {
      name: "CKKS",
      securityLevel: 128,
      keySize: "~12 MB",
      bootstrapTime: "3-7 minutes",
      dataType: "Approximate real",
      applications: ["Machine learning", "Signal processing"],
    },
  ]

  // Circuit depth simulation
  circuitDepth = 1
  maxDepth = 10
  noiseLevel = 10
  maxNoise = 100

  // Applications showcase
  applications = [
    {
      name: "Secure Data Aggregation",
      description: "Sum encrypted votes or statistics without revealing individual values",
      example: "Hospital data: Enc(patients₁) + Enc(patients₂) = Enc(total_patients)",
      complexity: "Low",
      schemes: ["Paillier", "BGV"],
    },
    {
      name: "Encrypted Database Queries",
      description: "Search and filter encrypted databases without decryption",
      example: "SELECT SUM(salary) WHERE department='IT' on encrypted payroll",
      complexity: "Medium",
      schemes: ["BFV", "BGV"],
    },
    {
      name: "Privacy-Preserving ML",
      description: "Train models or make predictions on encrypted data",
      example: "Linear regression: y = w₁x₁ + w₂x₂ + b on encrypted features",
      complexity: "High",
      schemes: ["CKKS", "BFV"],
    },
    {
      name: "Cloud Offloading",
      description: "Perform sensitive computations in untrusted cloud environments",
      example: "Financial risk analysis on encrypted portfolio data",
      complexity: "Very High",
      schemes: ["BGV", "CKKS"],
    },
  ]

  // Exercise tracking
  exercises = [
    {
      id: 1,
      title: "Paillier Summation Demo",
      description: "Implement encrypted addition using Paillier cryptosystem",
      completed: false,
      difficulty: "Medium",
    },
    {
      id: 2,
      title: "RSA Multiplication Attack",
      description: "Demonstrate semantic security break via homomorphic property",
      completed: false,
      difficulty: "Medium",
    },
    {
      id: 3,
      title: "Build a Toy SHE",
      description: "Design simple SHE supporting one multiplication",
      completed: false,
      difficulty: "Hard",
    },
    {
      id: 4,
      title: "FHE Parameter Tuning",
      description: "Experiment with noise budgets and operation limits",
      completed: false,
      difficulty: "Hard",
    },
    {
      id: 5,
      title: "Encrypted ML Inference",
      description: "Run linear regression on CKKS-encrypted data",
      completed: false,
      difficulty: "Very Hard",
    },
  ]

  // Quiz questions
  quizQuestions = [
    {
      question: "What is the key advantage of homomorphic encryption?",
      options: [
        "Faster encryption than traditional methods",
        "Computation on encrypted data without decryption",
        "Smaller ciphertext size",
        "Better resistance to quantum attacks",
      ],
      correct: 1,
      explanation: "Homomorphic encryption allows computation directly on ciphertexts, enabling secure outsourcing.",
    },
    {
      question: "Which operation does Paillier cryptosystem support homomorphically?",
      options: ["Multiplication only", "Addition only", "Both addition and multiplication", "Neither"],
      correct: 1,
      explanation: "Paillier is additively homomorphic: Enc(m₁) × Enc(m₂) = Enc(m₁ + m₂).",
    },
    {
      question: "What was Gentry's key insight for achieving FHE?",
      options: [
        "Using larger key sizes",
        "Bootstrapping to refresh noise",
        "Quantum-resistant algorithms",
        "Parallel processing",
      ],
      correct: 1,
      explanation: "Bootstrapping allows homomorphic evaluation of the decryption circuit to reduce noise.",
    },
    {
      question: "Which FHE scheme is best suited for machine learning applications?",
      options: ["BGV", "BFV", "CKKS", "Paillier"],
      correct: 2,
      explanation: "CKKS supports approximate arithmetic on real numbers, ideal for ML computations.",
    },
  ]

  currentQuiz = 0
  selectedAnswer = -1
  showExplanation = false
  quizScore = 0

  constructor(private router: Router) {}

  ngOnInit() {
    this.runPaillierDemo()
    this.runRSADemo()
    this.runElGamalDemo()
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Navigation methods
  nextSection() {
    if (this.currentSection < this.totalSections) {
      this.currentSection++;
      this.scrollToTop();
    }
  }

  prevSection() {
    if (this.currentSection > 1) {
      this.currentSection--;
      this.scrollToTop();
    }
  }

  goToSection(section: number) {
    this.currentSection = section;
    this.scrollToTop();
  }

  // Paillier homomorphic encryption demo
  runPaillierDemo() {
    const m1 = BigInt(this.paillierDemo.input1)
    const m2 = BigInt(this.paillierDemo.input2)

    // Encrypt m1 and m2
    const r1 = 2n // Random value for encryption
    const r2 = 3n

    const c1 = this.paillierEncrypt(m1, r1)
    const c2 = this.paillierEncrypt(m2, r2)

    // Homomorphic addition: c1 * c2 mod n²
    const cResult = (c1 * c2) % (this.paillierN * this.paillierN)

    // Decrypt result
    const decrypted = this.paillierDecrypt(cResult)

    this.paillierDemo.encrypted1 = c1.toString()
    this.paillierDemo.encrypted2 = c2.toString()
    this.paillierDemo.result = cResult.toString()
    this.paillierDemo.decrypted = Number(decrypted)
  }

  paillierEncrypt(m: bigint, r: bigint): bigint {
    const n2 = this.paillierN * this.paillierN
    return (this.modPow(this.paillierG, m, n2) * this.modPow(r, this.paillierN, n2)) % n2
  }

  paillierDecrypt(c: bigint): bigint {
    const n2 = this.paillierN * this.paillierN
    const u = this.modPow(c, this.paillierLambda, n2)
    const l = (u - 1n) / this.paillierN
    return (l * this.paillierMu) % this.paillierN
  }

  // RSA homomorphic multiplication demo
  runRSADemo() {
    const m1 = BigInt(this.rsaDemo.input1)
    const m2 = BigInt(this.rsaDemo.input2)

    // Encrypt m1 and m2
    const c1 = this.modPow(m1, this.rsaE, this.rsaN)
    const c2 = this.modPow(m2, this.rsaE, this.rsaN)

    // Homomorphic multiplication: c1 * c2 mod n
    const cResult = (c1 * c2) % this.rsaN

    // Decrypt result
    const decrypted = this.modPow(cResult, this.rsaD, this.rsaN)

    this.rsaDemo.encrypted1 = c1.toString()
    this.rsaDemo.encrypted2 = c2.toString()
    this.rsaDemo.result = cResult.toString()
    this.rsaDemo.decrypted = Number(decrypted)
  }

  // ElGamal homomorphic multiplication demo
  runElGamalDemo() {
    const m1 = BigInt(this.elgamalDemo.input1)
    const m2 = BigInt(this.elgamalDemo.input2)

    // Encrypt m1 and m2
    const r1 = 3n
    const r2 = 4n

    const c1_1 = this.modPow(this.elgamalG, r1, this.elgamalP)
    const c1_2 = (m1 * this.modPow(this.elgamalY, r1, this.elgamalP)) % this.elgamalP

    const c2_1 = this.modPow(this.elgamalG, r2, this.elgamalP)
    const c2_2 = (m2 * this.modPow(this.elgamalY, r2, this.elgamalP)) % this.elgamalP

    // Homomorphic multiplication
    const cResult_1 = (c1_1 * c2_1) % this.elgamalP
    const cResult_2 = (c1_2 * c2_2) % this.elgamalP

    // Decrypt result
    const s = this.modPow(cResult_1, this.elgamalX, this.elgamalP)
    const sInv = this.modInverse(s, this.elgamalP)
    const decrypted = (cResult_2 * sInv) % this.elgamalP

    this.elgamalDemo.encrypted1 = `(${c1_1}, ${c1_2})`
    this.elgamalDemo.encrypted2 = `(${c2_1}, ${c2_2})`
    this.elgamalDemo.result = `(${cResult_1}, ${cResult_2})`
    this.elgamalDemo.decrypted = Number(decrypted)
  }

  // Circuit depth simulation
  simulateCircuitDepth() {
    // Simulate noise growth with circuit depth
    this.noiseLevel = Math.min(this.maxNoise, 10 + (this.circuitDepth - 1) * 8)
  }

  increaseDepth() {
    if (this.circuitDepth < this.maxDepth) {
      this.circuitDepth++
      this.simulateCircuitDepth()
    }
  }

  decreaseDepth() {
    if (this.circuitDepth > 1) {
      this.circuitDepth--
      this.simulateCircuitDepth()
    }
  }

  resetCircuit() {
    this.circuitDepth = 1
    this.noiseLevel = 10
  }

  // Bootstrap simulation
  bootstrap() {
    this.noiseLevel = 10 // Reset noise after bootstrapping
  }

  // Utility functions
  modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let result = 1n
    base = base % mod
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        result = (result * base) % mod
      }
      exp = exp >> 1n
      base = (base * base) % mod
    }
    return result
  }

  modInverse(a: bigint, m: bigint): bigint {
    const extendedGCD = (a: bigint, b: bigint): [bigint, bigint, bigint] => {
      if (a === 0n) return [b, 0n, 1n]
      const [gcd, x1, y1] = extendedGCD(b % a, a)
      const x = y1 - (b / a) * x1
      const y = x1
      return [gcd, x, y]
    }

    const [gcd, x] = extendedGCD(a % m, m)
    if (gcd !== 1n) throw new Error("Modular inverse does not exist")
    return ((x % m) + m) % m
  }

  // Exercise methods
  toggleExercise(id: number) {
    const exercise = this.exercises.find((e) => e.id === id)
    if (exercise) {
      exercise.completed = !exercise.completed
    }
  }

  getCompletedExercises(): number {
    return this.exercises.filter((e) => e.completed).length
  }

  // Quiz methods
  selectAnswer(index: number) {
    this.selectedAnswer = index
  }

  submitAnswer() {
    if (this.selectedAnswer === -1) return

    this.showExplanation = true
    if (this.selectedAnswer === this.quizQuestions[this.currentQuiz].correct) {
      this.quizScore++
    }
  }

  nextQuestion() {
    if (this.currentQuiz < this.quizQuestions.length - 1) {
      this.currentQuiz++
      this.selectedAnswer = -1
      this.showExplanation = false
    }
  }

  resetQuiz() {
    this.currentQuiz = 0
    this.selectedAnswer = -1
    this.showExplanation = false
    this.quizScore = 0
  }

  // Progress tracking
  getProgress(): number {
    return Math.round((this.currentSection / this.totalSections) * 100)
  }

  // Navigation
  goToDashboard() {
    this.router.navigate(["/dashboard"])
  }

  goToNextChapter() {
    // This would be the final chapter or assessment
    this.router.navigate(["/final-assessment"])
  }
}
